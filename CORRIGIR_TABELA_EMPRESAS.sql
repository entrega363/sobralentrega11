-- ========================================
-- CORRIGIR ESTRUTURA DA TABELA EMPRESAS
-- ========================================

-- 1. PRIMEIRO: Verificar a estrutura atual da tabela empresas
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'empresas' 
ORDER BY ordinal_position;

-- 2. ADICIONAR COLUNAS QUE PODEM ESTAR FALTANDO
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS responsavel TEXT;
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS telefone TEXT;

-- 3. CORRIGIR O USUÁRIO matutaria@gmail.com
UPDATE profiles 
SET role = 'empresa'
FROM auth.users au
WHERE profiles.id = au.id 
  AND au.email = 'matutaria@gmail.com';

-- 4. CRIAR REGISTRO NA TABELA EMPRESAS (VERSÃO SIMPLIFICADA)
INSERT INTO empresas (
  profile_id,
  nome,
  status
)
SELECT 
  au.id,
  'Empresa Matutaria',
  'aprovada'
FROM auth.users au
WHERE au.email = 'matutaria@gmail.com'
  AND NOT EXISTS (SELECT 1 FROM empresas WHERE profile_id = au.id);

-- 5. ATUALIZAR CAMPOS ADICIONAIS SE AS COLUNAS EXISTIREM
UPDATE empresas 
SET 
  responsavel = 'Responsável',
  telefone = '(88) 99999-9999'
WHERE profile_id IN (
  SELECT id FROM auth.users WHERE email = 'matutaria@gmail.com'
);

-- 6. REMOVER DA TABELA CONSUMIDORES
DELETE FROM consumidores 
WHERE profile_id IN (
  SELECT id FROM auth.users WHERE email = 'matutaria@gmail.com'
);

-- 7. LIMPAR SESSÕES (FORÇAR LOGOUT)
DELETE FROM auth.sessions 
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'matutaria@gmail.com'
);

-- 8. VERIFICAR RESULTADO FINAL
SELECT 
  au.email,
  p.role as profile_role,
  e.nome as empresa_nome,
  e.status as empresa_status,
  (SELECT COUNT(*) FROM consumidores WHERE profile_id = au.id) as consumidor_count
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
LEFT JOIN empresas e ON au.id = e.profile_id
WHERE au.email = 'matutaria@gmail.com';