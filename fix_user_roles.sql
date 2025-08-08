-- Script para corrigir o problema de roles dos usuários
-- Execute este script no SQL Editor do Supabase

-- 1. Primeiro, vamos corrigir a função handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role, nome)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'role', 'consumidor'),
    COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email)
  );
  
  -- Create specific role record based on user type
  IF (NEW.raw_user_meta_data->>'role') = 'empresa' THEN
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
      NEW.raw_user_meta_data->>'nome',
      NEW.raw_user_meta_data->>'cnpj',
      NEW.raw_user_meta_data->>'categoria',
      NEW.raw_user_meta_data->>'responsavel',
      NEW.raw_user_meta_data->>'telefone',
      (NEW.raw_user_meta_data->>'endereco')::jsonb,
      'pendente'
    );
  ELSIF (NEW.raw_user_meta_data->>'role') = 'entregador' THEN
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
      NEW.raw_user_meta_data->>'nome',
      NEW.raw_user_meta_data->>'cpf',
      NEW.raw_user_meta_data->>'telefone',
      (NEW.raw_user_meta_data->>'veiculo')::jsonb,
      (NEW.raw_user_meta_data->>'endereco')::jsonb,
      'pendente'
    );
  ELSIF (NEW.raw_user_meta_data->>'role') = 'consumidor' THEN
    INSERT INTO public.consumidores (
      profile_id,
      nome,
      telefone,
      endereco
    ) VALUES (
      NEW.id,
      NEW.raw_user_meta_data->>'nome',
      NEW.raw_user_meta_data->>'telefone',
      (NEW.raw_user_meta_data->>'endereco')::jsonb
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Agora vamos corrigir os usuários existentes que foram cadastrados incorretamente
-- Primeiro, vamos ver quais usuários temos com role incorreto

-- Verificar usuários com metadata de empresa mas profile de consumidor
SELECT 
  au.id,
  au.email,
  au.raw_user_meta_data->>'role' as intended_role,
  p.role as current_role,
  au.raw_user_meta_data->>'nome' as nome
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE au.raw_user_meta_data->>'role' != p.role
   OR (au.raw_user_meta_data->>'role' IS NOT NULL AND p.role IS NULL);

-- 3. Corrigir profiles com role incorreto
UPDATE profiles 
SET role = au.raw_user_meta_data->>'role',
    nome = COALESCE(au.raw_user_meta_data->>'nome', au.email)
FROM auth.users au
WHERE profiles.id = au.id 
  AND au.raw_user_meta_data->>'role' IS NOT NULL
  AND profiles.role != au.raw_user_meta_data->>'role';

-- 4. Criar registros nas tabelas específicas para usuários que não têm
-- Para empresas
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
  au.raw_user_meta_data->>'nome',
  au.raw_user_meta_data->>'cnpj',
  au.raw_user_meta_data->>'categoria',
  au.raw_user_meta_data->>'responsavel',
  au.raw_user_meta_data->>'telefone',
  (au.raw_user_meta_data->>'endereco')::jsonb,
  'pendente'
FROM auth.users au
JOIN profiles p ON au.id = p.id
WHERE p.role = 'empresa'
  AND NOT EXISTS (SELECT 1 FROM empresas WHERE profile_id = au.id);

-- Para entregadores
INSERT INTO entregadores (
  profile_id,
  nome,
  cpf,
  telefone,
  veiculo,
  endereco,
  status
)
SELECT 
  au.id,
  au.raw_user_meta_data->>'nome',
  au.raw_user_meta_data->>'cpf',
  au.raw_user_meta_data->>'telefone',
  (au.raw_user_meta_data->>'veiculo')::jsonb,
  (au.raw_user_meta_data->>'endereco')::jsonb,
  'pendente'
FROM auth.users au
JOIN profiles p ON au.id = p.id
WHERE p.role = 'entregador'
  AND NOT EXISTS (SELECT 1 FROM entregadores WHERE profile_id = au.id);

-- Para consumidores
INSERT INTO consumidores (
  profile_id,
  nome,
  telefone,
  endereco
)
SELECT 
  au.id,
  au.raw_user_meta_data->>'nome',
  au.raw_user_meta_data->>'telefone',
  (au.raw_user_meta_data->>'endereco')::jsonb
FROM auth.users au
JOIN profiles p ON au.id = p.id
WHERE p.role = 'consumidor'
  AND NOT EXISTS (SELECT 1 FROM consumidores WHERE profile_id = au.id);

-- 5. Verificar se tudo foi corrigido
SELECT 
  au.email,
  au.raw_user_meta_data->>'role' as intended_role,
  p.role as current_role,
  CASE 
    WHEN p.role = 'empresa' THEN (SELECT COUNT(*) FROM empresas WHERE profile_id = au.id)
    WHEN p.role = 'entregador' THEN (SELECT COUNT(*) FROM entregadores WHERE profile_id = au.id)
    WHEN p.role = 'consumidor' THEN (SELECT COUNT(*) FROM consumidores WHERE profile_id = au.id)
    ELSE 0
  END as has_specific_record
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
ORDER BY au.created_at DESC;