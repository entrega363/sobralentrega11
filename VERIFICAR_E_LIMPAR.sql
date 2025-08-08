-- ========================================
-- VERIFICAR E LIMPAR CACHE/SESSÃO
-- ========================================

-- 1. VERIFICAR O STATUS ATUAL DO USUÁRIO
SELECT 
  au.id,
  au.email,
  au.raw_user_meta_data,
  p.role as profile_role,
  p.nome as profile_nome,
  (SELECT COUNT(*) FROM empresas WHERE profile_id = au.id) as empresa_count,
  (SELECT COUNT(*) FROM consumidores WHERE profile_id = au.id) as consumidor_count
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE au.email = 'matutaria@gmail.com';

-- 2. FORÇAR ATUALIZAÇÃO DOS METADADOS DO USUÁRIO
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"empresa"'::jsonb
)
WHERE email = 'matutaria@gmail.com';

-- 3. GARANTIR QUE O PROFILE ESTÁ CORRETO
UPDATE profiles 
SET role = 'empresa'
FROM auth.users au
WHERE profiles.id = au.id 
  AND au.email = 'matutaria@gmail.com';

-- 4. LIMPAR TODAS AS SESSÕES DO USUÁRIO (FORÇAR LOGOUT)
DELETE FROM auth.sessions 
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'matutaria@gmail.com'
);

-- 5. VERIFICAR NOVAMENTE
SELECT 
  au.email,
  au.raw_user_meta_data->>'role' as metadata_role,
  p.role as profile_role,
  (SELECT COUNT(*) FROM empresas WHERE profile_id = au.id) as empresa_record,
  (SELECT COUNT(*) FROM consumidores WHERE profile_id = au.id) as consumidor_record
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE au.email = 'matutaria@gmail.com';

-- RESULTADO ESPERADO:
-- email: matutaria@gmail.com
-- metadata_role: empresa
-- profile_role: empresa  
-- empresa_record: 1
-- consumidor_record: 0