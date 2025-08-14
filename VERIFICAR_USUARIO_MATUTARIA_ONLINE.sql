-- Script para verificar o usuário matutaria@gmail.com no ambiente online
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se o usuário existe na tabela auth.users
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at,
    updated_at,
    user_metadata,
    raw_user_meta_data
FROM auth.users 
WHERE email = 'matutaria@gmail.com';

-- 2. Verificar se existe profile para este usuário
SELECT 
    p.id,
    p.role,
    p.created_at,
    p.updated_at
FROM profiles p
JOIN auth.users u ON u.id = p.id
WHERE u.email = 'matutaria@gmail.com';

-- 3. Verificar se existe empresa para este usuário
SELECT 
    e.id,
    e.nome,
    e.cnpj,
    e.status,
    e.created_at
FROM empresas e
JOIN profiles p ON p.id = e.profile_id
JOIN auth.users u ON u.id = p.id
WHERE u.email = 'matutaria@gmail.com';

-- 4. Verificar todas as informações juntas
SELECT 
    u.id as user_id,
    u.email,
    u.email_confirmed_at,
    p.role,
    e.id as empresa_id,
    e.nome as empresa_nome,
    e.status as empresa_status
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
LEFT JOIN empresas e ON e.profile_id = p.id
WHERE u.email = 'matutaria@gmail.com';