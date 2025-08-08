-- Script para corrigir usuário específico matutaria@gmail.com
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar o usuário atual e seus metadados
SELECT 
  au.id,
  au.email,
  au.raw_user_meta_data,
  au.raw_user_meta_data->>'role' as intended_role,
  p.role as current_role,
  p.nome
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE au.email = 'matutaria@gmail.com';

-- 2. Atualizar o profile para empresa
UPDATE profiles 
SET 
  role = 'empresa',
  nome = COALESCE(au.raw_user_meta_data->>'nome', 'Empresa Matutaria')
FROM auth.users au
WHERE profiles.id = au.id 
  AND au.email = 'matutaria@gmail.com';

-- 3. Criar registro na tabela empresas se não existir
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
  COALESCE(au.raw_user_meta_data->>'nome', 'Empresa Matutaria'),
  COALESCE(au.raw_user_meta_data->>'cnpj', '00.000.000/0001-00'),
  COALESCE(au.raw_user_meta_data->>'categoria', 'Restaurante'),
  COALESCE(au.raw_user_meta_data->>'responsavel', 'Responsável'),
  COALESCE(au.raw_user_meta_data->>'telefone', '(88) 99999-9999'),
  COALESCE((au.raw_user_meta_data->>'endereco')::jsonb, '{"rua": "Rua Principal", "numero": "123", "bairro": "Centro", "cidade": "Sobral", "cep": "62000-000"}'::jsonb),
  'aprovada'
FROM auth.users au
WHERE au.email = 'matutaria@gmail.com'
  AND NOT EXISTS (SELECT 1 FROM empresas WHERE profile_id = au.id);

-- 4. Remover registro da tabela consumidores se existir
DELETE FROM consumidores 
WHERE profile_id IN (
  SELECT id FROM auth.users WHERE email = 'matutaria@gmail.com'
);

-- 5. Verificar se a correção foi aplicada
SELECT 
  au.email,
  p.role as current_role,
  p.nome,
  CASE 
    WHEN p.role = 'empresa' THEN (SELECT COUNT(*) FROM empresas WHERE profile_id = au.id)
    WHEN p.role = 'entregador' THEN (SELECT COUNT(*) FROM entregadores WHERE profile_id = au.id)
    WHEN p.role = 'consumidor' THEN (SELECT COUNT(*) FROM consumidores WHERE profile_id = au.id)
    ELSE 0
  END as has_specific_record
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE au.email = 'matutaria@gmail.com';