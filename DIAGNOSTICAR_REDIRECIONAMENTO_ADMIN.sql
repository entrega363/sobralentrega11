-- DIAGNOSTICAR PROBLEMA DE REDIRECIONAMENTO ADMIN
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se o usuário admin existe e tem o profile correto
SELECT 
    'USUARIO_ADMIN_VERIFICACAO' as status,
    au.id,
    au.email,
    au.email_confirmed_at IS NOT NULL as email_confirmado,
    p.role as profile_role,
    p.status_disponibilidade,
    ur.role as user_role_table,
    p.created_at as profile_created,
    p.updated_at as profile_updated
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
LEFT JOIN user_roles ur ON au.id = ur.user_id
WHERE au.email = 'entregasobral@gmail.com';

-- 2. Verificar se há algum problema com RLS nas tabelas
SELECT 
    'VERIFICAR_RLS_PROFILES' as status,
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'profiles';

-- 3. Verificar políticas RLS da tabela profiles
SELECT 
    'POLITICAS_RLS_PROFILES' as status,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'profiles';

-- 4. Testar se conseguimos acessar o profile diretamente
SELECT 
    'TESTE_ACESSO_PROFILE' as status,
    COUNT(*) as total_profiles
FROM profiles;

-- 5. Verificar se há algum trigger ou função que pode estar interferindo
SELECT 
    'TRIGGERS_PROFILES' as status,
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'profiles';

-- 6. Verificar se o usuário admin tem permissões corretas
SELECT 
    'PERMISSOES_ADMIN' as status,
    au.id,
    au.email,
    au.role as auth_role,
    au.aud,
    au.raw_app_meta_data,
    au.raw_user_meta_data
FROM auth.users au
WHERE au.email = 'entregasobral@gmail.com';

-- 7. Tentar criar/atualizar o profile do admin se necessário
INSERT INTO profiles (id, role, status_disponibilidade, created_at, updated_at)
SELECT 
    au.id, 
    'admin', 
    'disponivel_sistema', 
    NOW(), 
    NOW()
FROM auth.users au 
WHERE au.email = 'entregasobral@gmail.com'
ON CONFLICT (id) 
DO UPDATE SET 
    role = 'admin',
    status_disponibilidade = 'disponivel_sistema',
    updated_at = NOW();

-- 8. Verificação final após possível correção
SELECT 
    'VERIFICACAO_FINAL_ADMIN' as status,
    au.id,
    au.email,
    p.role,
    p.status_disponibilidade,
    ur.role as user_role,
    'PROFILE_CORRIGIDO' as resultado
FROM auth.users au
JOIN profiles p ON au.id = p.id
LEFT JOIN user_roles ur ON au.id = ur.user_id
WHERE au.email = 'entregasobral@gmail.com';