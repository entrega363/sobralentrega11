-- DIAGNÓSTICO COMPLETO DO SISTEMA DE LOGIN
-- Execute este script no Supabase para verificar o estado atual

-- 1. Verificar usuários na tabela auth.users
SELECT 
    'AUTH USERS' as tabela,
    id,
    email,
    email_confirmed_at,
    created_at,
    updated_at,
    last_sign_in_at
FROM auth.users 
ORDER BY created_at DESC;

-- 2. Verificar profiles
SELECT 
    'PROFILES' as tabela,
    id,
    email,
    role,
    nome,
    created_at
FROM profiles 
ORDER BY created_at DESC;

-- 3. Verificar se há usuários órfãos (auth sem profile)
SELECT 
    'USUARIOS ORFAOS' as status,
    au.id,
    au.email,
    'SEM PROFILE' as problema
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- 4. Verificar se há profiles órfãos (profile sem auth)
SELECT 
    'PROFILES ORFAOS' as status,
    p.id,
    p.email,
    'SEM AUTH USER' as problema
FROM profiles p
LEFT JOIN auth.users au ON p.id = au.id
WHERE au.id IS NULL;

-- 5. Verificar empresas
SELECT 
    'EMPRESAS' as tabela,
    e.id,
    e.nome,
    e.email,
    p.role as profile_role
FROM empresas e
LEFT JOIN profiles p ON e.user_id = p.id
ORDER BY e.created_at DESC;

-- 6. Verificar função handle_new_user
SELECT 
    'FUNCAO HANDLE_NEW_USER' as status,
    proname as nome_funcao,
    prosrc as codigo_funcao
FROM pg_proc 
WHERE proname = 'handle_new_user';

-- 7. Verificar triggers
SELECT 
    'TRIGGERS' as status,
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name LIKE '%user%' OR trigger_name LIKE '%profile%';

-- 8. Verificar políticas RLS
SELECT 
    'POLITICAS RLS' as status,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN ('profiles', 'empresas')
ORDER BY tablename, policyname;