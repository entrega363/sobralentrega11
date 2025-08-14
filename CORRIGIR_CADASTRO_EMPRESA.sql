-- CORREÇÃO DO PROBLEMA DE CADASTRO DE EMPRESA

-- 1. Recriar a função handle_new_user com melhor tratamento de erro
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Inserir profile com role padrão
  INSERT INTO public.profiles (id, role, email, nome, telefone, created_at, updated_at)
  VALUES (
    NEW.id, 
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'consumidor'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'telefone', ''),
    NOW(),
    NOW()
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log do erro (em produção, você pode querer usar uma tabela de log)
    RAISE LOG 'Erro ao criar profile para usuário %: %', NEW.id, SQLERRM;
    RETURN NEW; -- Continua mesmo com erro para não bloquear o cadastro
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Recriar o trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Adicionar campos que podem estar faltando na tabela profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS email VARCHAR,
ADD COLUMN IF NOT EXISTS nome VARCHAR,
ADD COLUMN IF NOT EXISTS telefone VARCHAR;

-- 4. Criar função para cadastro de empresa com melhor tratamento
CREATE OR REPLACE FUNCTION public.create_empresa_profile(
  user_id UUID,
  empresa_data JSONB
) RETURNS JSONB AS $$
DECLARE
  result JSONB;
  empresa_id UUID;
BEGIN
  -- Atualizar o profile com role empresa
  UPDATE profiles 
  SET 
    role = 'empresa',
    nome = empresa_data->>'nome',
    telefone = empresa_data->>'telefone',
    updated_at = NOW()
  WHERE id = user_id;
  
  -- Criar registro na tabela empresas
  INSERT INTO empresas (
    profile_id,
    nome,
    cnpj,
    categoria,
    responsavel,
    telefone,
    endereco,
    status,
    created_at,
    updated_at
  ) VALUES (
    user_id,
    empresa_data->>'nome',
    empresa_data->>'cnpj',
    empresa_data->>'categoria',
    empresa_data->>'responsavel',
    empresa_data->>'telefone',
    empresa_data->'endereco',
    'pendente',
    NOW(),
    NOW()
  ) RETURNING id INTO empresa_id;
  
  -- Retornar resultado
  SELECT jsonb_build_object(
    'success', true,
    'empresa_id', empresa_id,
    'message', 'Empresa criada com sucesso'
  ) INTO result;
  
  RETURN result;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Retornar erro detalhado
    SELECT jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'error_code', SQLSTATE
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Garantir que a tabela empresas tem a estrutura correta
ALTER TABLE empresas 
ADD COLUMN IF NOT EXISTS responsavel VARCHAR,
ADD COLUMN IF NOT EXISTS telefone VARCHAR;

-- 6. Atualizar campos JSONB para ter estrutura padrão
UPDATE empresas 
SET 
  endereco = COALESCE(endereco, '{}'::jsonb),
  contato = COALESCE(contato, '{}'::jsonb),
  configuracoes = COALESCE(configuracoes, '{}'::jsonb)
WHERE endereco IS NULL OR contato IS NULL OR configuracoes IS NULL;

-- 7. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_empresas_cnpj ON empresas(cnpj);

-- 8. Verificar e corrigir permissões RLS (se necessário)
-- Estas políticas serão aplicadas no próximo script de RLS