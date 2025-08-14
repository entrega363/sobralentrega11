-- DIAGNÓSTICO DO PROBLEMA DE CADASTRO DE EMPRESA

-- 1. Verificar se a função handle_new_user existe e está funcionando
SELECT 
    proname as function_name,
    prosrc as function_body
FROM pg_proc 
WHERE proname = 'handle_new_user';

-- 2. Verificar se o trigger existe
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- 3. Verificar estrutura da tabela profiles
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- 4. Verificar estrutura da tabela empresas
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'empresas' 
ORDER BY ordinal_position;

-- 5. Verificar se há usuários recentes com problemas
SELECT 
    u.id,
    u.email,
    u.created_at as user_created,
    p.id as profile_id,
    p.role,
    p.created_at as profile_created
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.created_at > NOW() - INTERVAL '1 day'
ORDER BY u.created_at DESC
LIMIT 10;

-- 6. Verificar se há empresas sem profile_id
SELECT 
    e.id,
    e.nome,
    e.cnpj,
    e.profile_id,
    p.role
FROM empresas e
LEFT JOIN profiles p ON e.profile_id = p.id
WHERE e.created_at > NOW() - INTERVAL '1 day'
ORDER BY e.created_at DESC;

-- 7. Verificar logs de erro (se disponível)
-- Esta query pode não funcionar dependendo das permissões
SELECT * FROM pg_stat_activity WHERE state = 'active';