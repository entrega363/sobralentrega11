-- ========================================
-- COLE E EXECUTE ESTE CÓDIGO NO SUPABASE
-- ========================================
-- Vá em: Dashboard > SQL Editor > New Query
-- Cole este código e clique em "Run"

-- 1. PRIMEIRO: Verificar se a coluna 'nome' existe na tabela profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS nome TEXT;

-- 2. CORRIGIR O USUÁRIO matutaria@gmail.com
UPDATE profiles 
SET 
  role = 'empresa'
FROM auth.users au
WHERE profiles.id = au.id 
  AND au.email = 'matutaria@gmail.com';

-- 3. CRIAR REGISTRO NA TABELA EMPRESAS
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

-- 4. REMOVER DA TABELA CONSUMIDORES SE EXISTIR
DELETE FROM consumidores 
WHERE profile_id IN (
  SELECT id FROM auth.users WHERE email = 'matutaria@gmail.com'
);

-- 5. VERIFICAR SE DEU CERTO
SELECT 
  au.email,
  p.role as current_role,
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