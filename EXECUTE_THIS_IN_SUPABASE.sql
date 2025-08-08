-- ========================================
-- EXECUTE ESTE SCRIPT NO PAINEL DO SUPABASE
-- ========================================
-- Vá em: Dashboard > SQL Editor > New Query
-- Cole este código e clique em "Run"

-- 1. CORRIGIR O USUÁRIO ESPECÍFICO matutaria@gmail.com
UPDATE profiles 
SET 
  role = 'empresa',
  nome = 'Empresa Matutaria'
FROM auth.users au
WHERE profiles.id = au.id 
  AND au.email = 'matutaria@gmail.com';

-- 2. CRIAR REGISTRO NA TABELA EMPRESAS
INSERT INTO empresas (
  profile_id,
  nome,
  cnpj,
  categoria,
  responsavel,
  telefone,
  endereco,
  status
)
SELECT 
  au.id,
  'Empresa Matutaria',
  '00.000.000/0001-00',
  'Restaurante',
  'Responsável',
  '(88) 99999-9999',
  '{"rua": "Rua Principal", "numero": "123", "bairro": "Centro", "cidade": "Sobral", "cep": "62000-000"}'::jsonb,
  'aprovada'
FROM auth.users au
WHERE au.email = 'matutaria@gmail.com'
  AND NOT EXISTS (SELECT 1 FROM empresas WHERE profile_id = au.id);

-- 3. REMOVER DA TABELA CONSUMIDORES SE EXISTIR
DELETE FROM consumidores 
WHERE profile_id IN (
  SELECT id FROM auth.users WHERE email = 'matutaria@gmail.com'
);

-- 4. CORRIGIR A FUNÇÃO PARA FUTUROS USUÁRIOS
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role TEXT;
  user_name TEXT;
BEGIN
  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'consumidor');
  user_name := COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email);
  
  INSERT INTO public.profiles (id, role, nome)
  VALUES (NEW.id, user_role, user_name);
  
  IF user_role = 'empresa' THEN
    INSERT INTO public.empresas (
      profile_id, nome, cnpj, categoria, responsavel, telefone, endereco, status
    ) VALUES (
      NEW.id, user_name,
      COALESCE(NEW.raw_user_meta_data->>'cnpj', '00.000.000/0001-00'),
      COALESCE(NEW.raw_user_meta_data->>'categoria', 'Restaurante'),
      COALESCE(NEW.raw_user_meta_data->>'responsavel', user_name),
      COALESCE(NEW.raw_user_meta_data->>'telefone', '(88) 99999-9999'),
      COALESCE((NEW.raw_user_meta_data->>'endereco')::jsonb, '{"rua": "Rua Principal", "numero": "123", "bairro": "Centro", "cidade": "Sobral", "cep": "62000-000"}'::jsonb),
      'pendente'
    );
  ELSIF user_role = 'entregador' THEN
    INSERT INTO public.entregadores (
      profile_id, nome, cpf, telefone, veiculo, endereco, status
    ) VALUES (
      NEW.id, user_name,
      COALESCE(NEW.raw_user_meta_data->>'cpf', '000.000.000-00'),
      COALESCE(NEW.raw_user_meta_data->>'telefone', '(88) 99999-9999'),
      COALESCE((NEW.raw_user_meta_data->>'veiculo')::jsonb, '{"tipo": "Moto", "placa": "ABC-1234", "modelo": "Honda CG"}'::jsonb),
      COALESCE((NEW.raw_user_meta_data->>'endereco')::jsonb, '{"rua": "Rua Principal", "numero": "123", "bairro": "Centro", "cidade": "Sobral", "cep": "62000-000"}'::jsonb),
      'pendente'
    );
  ELSE
    INSERT INTO public.consumidores (
      profile_id, nome, telefone, endereco
    ) VALUES (
      NEW.id, user_name,
      COALESCE(NEW.raw_user_meta_data->>'telefone', '(88) 99999-9999'),
      COALESCE((NEW.raw_user_meta_data->>'endereco')::jsonb, '{"rua": "Rua Principal", "numero": "123", "bairro": "Centro", "cidade": "Sobral", "cep": "62000-000"}'::jsonb)
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. VERIFICAR SE A CORREÇÃO FOI APLICADA
SELECT 
  au.email,
  p.role as current_role,
  p.nome,
  CASE 
    WHEN p.role = 'empresa' THEN (SELECT COUNT(*) FROM empresas WHERE profile_id = au.id)
    ELSE 0
  END as has_empresa_record
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE au.email = 'matutaria@gmail.com';

-- Se tudo deu certo, você deve ver:
-- email: matutaria@gmail.com
-- current_role: empresa  
-- has_empresa_record: 1