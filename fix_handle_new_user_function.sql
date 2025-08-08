-- Script para corrigir a função handle_new_user definitivamente
-- Execute este script no SQL Editor do Supabase

-- Remover o trigger existente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Recriar a função com melhor tratamento
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role TEXT;
  user_name TEXT;
BEGIN
  -- Extrair role dos metadados, padrão para consumidor
  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'consumidor');
  user_name := COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email);
  
  -- Inserir profile
  INSERT INTO public.profiles (id, role, nome)
  VALUES (NEW.id, user_role, user_name);
  
  -- Criar registro específico baseado no role
  IF user_role = 'empresa' THEN
    INSERT INTO public.empresas (
      profile_id,
      nome,
      cnpj,
      categoria,
      responsavel,
      telefone,
      endereco,
      status
    ) VALUES (
      NEW.id,
      user_name,
      COALESCE(NEW.raw_user_meta_data->>'cnpj', '00.000.000/0001-00'),
      COALESCE(NEW.raw_user_meta_data->>'categoria', 'Restaurante'),
      COALESCE(NEW.raw_user_meta_data->>'responsavel', user_name),
      COALESCE(NEW.raw_user_meta_data->>'telefone', '(88) 99999-9999'),
      COALESCE(
        (NEW.raw_user_meta_data->>'endereco')::jsonb, 
        '{"rua": "Rua Principal", "numero": "123", "bairro": "Centro", "cidade": "Sobral", "cep": "62000-000"}'::jsonb
      ),
      'pendente'
    );
    
  ELSIF user_role = 'entregador' THEN
    INSERT INTO public.entregadores (
      profile_id,
      nome,
      cpf,
      telefone,
      veiculo,
      endereco,
      status
    ) VALUES (
      NEW.id,
      user_name,
      COALESCE(NEW.raw_user_meta_data->>'cpf', '000.000.000-00'),
      COALESCE(NEW.raw_user_meta_data->>'telefone', '(88) 99999-9999'),
      COALESCE(
        (NEW.raw_user_meta_data->>'veiculo')::jsonb,
        '{"tipo": "Moto", "placa": "ABC-1234", "modelo": "Honda CG"}'::jsonb
      ),
      COALESCE(
        (NEW.raw_user_meta_data->>'endereco')::jsonb,
        '{"rua": "Rua Principal", "numero": "123", "bairro": "Centro", "cidade": "Sobral", "cep": "62000-000"}'::jsonb
      ),
      'pendente'
    );
    
  ELSE -- consumidor (padrão)
    INSERT INTO public.consumidores (
      profile_id,
      nome,
      telefone,
      endereco
    ) VALUES (
      NEW.id,
      user_name,
      COALESCE(NEW.raw_user_meta_data->>'telefone', '(88) 99999-9999'),
      COALESCE(
        (NEW.raw_user_meta_data->>'endereco')::jsonb,
        '{"rua": "Rua Principal", "numero": "123", "bairro": "Centro", "cidade": "Sobral", "cep": "62000-000"}'::jsonb
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recriar o trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Testar a função (opcional - apenas para verificar se não há erros de sintaxe)
SELECT 'Função handle_new_user() atualizada com sucesso!' as status;