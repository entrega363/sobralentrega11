-- ========================================
-- SOLUÇÃO DRÁSTICA - RECRIAR USUÁRIO
-- ========================================

-- 1. BACKUP DOS DADOS ATUAIS
SELECT 
  au.id as user_id,
  au.email,
  au.encrypted_password,
  au.email_confirmed_at,
  au.created_at,
  au.raw_user_meta_data
FROM auth.users au
WHERE au.email = 'matutaria@gmail.com';

-- 2. DELETAR TUDO RELACIONADO AO USUÁRIO
DELETE FROM empresas WHERE profile_id IN (SELECT id FROM auth.users WHERE email = 'matutaria@gmail.com');
DELETE FROM consumidores WHERE profile_id IN (SELECT id FROM auth.users WHERE email = 'matutaria@gmail.com');
DELETE FROM profiles WHERE id IN (SELECT id FROM auth.users WHERE email = 'matutaria@gmail.com');
DELETE FROM auth.sessions WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'matutaria@gmail.com');

-- 3. ATUALIZAR OS METADADOS DO USUÁRIO
UPDATE auth.users 
SET raw_user_meta_data = '{
  "role": "empresa",
  "nome": "Empresa Matutaria"
}'::jsonb
WHERE email = 'matutaria@gmail.com';

-- 4. RECRIAR PROFILE
INSERT INTO profiles (id, role, nome)
SELECT 
  id,
  'empresa',
  'Empresa Matutaria'
FROM auth.users 
WHERE email = 'matutaria@gmail.com';

-- 5. RECRIAR EMPRESA
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
  id,
  'Empresa Matutaria',
  '00.000.000/0001-00',
  'Restaurante',
  'Responsável',
  '(88) 99999-9999',
  '{"rua": "Rua Principal", "numero": "123", "bairro": "Centro", "cidade": "Sobral", "cep": "62000-000"}'::jsonb,
  'aprovada'
FROM auth.users 
WHERE email = 'matutaria@gmail.com';

-- 6. VERIFICAR RESULTADO FINAL
SELECT 
  au.email,
  au.raw_user_meta_data->>'role' as metadata_role,
  p.role as profile_role,
  e.nome as empresa_nome,
  e.status as empresa_status
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
LEFT JOIN empresas e ON au.id = e.profile_id
WHERE au.email = 'matutaria@gmail.com';