-- Diagnóstico completo do login do administrador
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se o usuário existe na tabela auth.users
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_user_meta_data,
    user_metadata
FROM auth.users 
WHERE email = 'entregasobral@gmail.com';

-- 2. Verificar se existe na tabela user_roles
SELECT 
    ur.user_id,
    ur.role,
    ur.created_at,
    au.email
FROM user_roles ur
JOIN auth.users au ON ur.user_id = au.id
WHERE au.email = 'entregasobral@gmail.com';

-- 3. Verificar todas as tabelas relacionadas
SELECT 'admins' as tabela, COUNT(*) as total FROM admins;
SELECT 'empresas' as tabela, COUNT(*) as total FROM empresas;
SELECT 'entregadores' as tabela, COUNT(*) as total FROM entregadores;
SELECT 'consumidores' as tabela, COUNT(*) as total FROM consumidores;

-- 4. Verificar se existe perfil de admin
SELECT 
    a.*,
    au.email
FROM admins a
JOIN auth.users au ON a.user_id = au.id
WHERE au.email = 'entregasobral@gmail.com';

-- 5. Listar todos os usuários admin existentes
SELECT 
    au.email,
    ur.role,
    a.nome,
    au.created_at
FROM auth.users au
LEFT JOIN user_roles ur ON au.id = ur.user_id
LEFT JOIN admins a ON au.id = a.user_id
WHERE ur.role = 'admin' OR au.email = 'entregasobral@gmail.com'
ORDER BY au.created_at DESC;