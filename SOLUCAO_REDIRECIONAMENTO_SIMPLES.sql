-- SOLUÇÃO SIMPLES PARA REDIRECIONAMENTO ADMIN
-- Execute este script no Supabase SQL Editor

-- 1. Verificar usuário atual
SELECT 'VERIFICAR_USUARIO' as status, id, email, role 
FROM auth.users 
WHERE email = 'entregasobral@gmail.com';

-- 2. Verificar profile atual
SELECT 'VERIFICAR_PROFILE' as status, id, role, status_disponibilidade 
FROM profiles 
WHERE id IN (SELECT id FROM auth.users WHERE email = 'entregasobral@gmail.com');

-- 3. Forçar atualização do profile para admin
UPDATE profiles 
SET role = 'admin', 
    status_disponibilidade = 'disponivel_sistema',
    updated_at = NOW()
WHERE id IN (SELECT id FROM auth.users WHERE email = 'entregasobral@gmail.com');

-- 4. Se não existir profile, criar um
INSERT INTO profiles (id, role, status_disponibilidade, created_at, updated_at)
SELECT id, 'admin', 'disponivel_sistema', NOW(), NOW()
FROM auth.users 
WHERE email = 'entregasobral@gmail.com'
AND NOT EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.users.id);

-- 5. Verificar se user_roles existe e atualizar
UPDATE user_roles 
SET role = 'admin', updated_at = NOW()
WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'entregasobral@gmail.com');

-- 6. Se não existir user_role, criar um
INSERT INTO user_roles (user_id, role, created_at, updated_at)
SELECT id, 'admin', NOW(), NOW()
FROM auth.users 
WHERE email = 'entregasobral@gmail.com'
AND NOT EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.users.id);

-- 7. Verificação final
SELECT 
    'RESULTADO_FINAL' as status,
    au.id,
    au.email,
    p.role as profile_role,
    ur.role as user_role,
    'ADMIN_CONFIGURADO' as resultado
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
LEFT JOIN user_roles ur ON au.id = ur.user_id
WHERE au.email = 'entregasobral@gmail.com';