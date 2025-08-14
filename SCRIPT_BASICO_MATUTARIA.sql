-- SCRIPT BÁSICO PARA VERIFICAR LOGIN DA MATUTARIA
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se o usuário existe
SELECT 
    '1. USUÁRIO:' as etapa,
    CASE WHEN COUNT(*) > 0 THEN '✅ Existe' ELSE '❌ Não existe' END as status
FROM auth.users 
WHERE email = 'matutaria@gmail.com';

-- 2. Detalhes do usuário
SELECT 
    '2. DETALHES:' as etapa,
    u.id,
    u.email,
    u.email_confirmed_at IS NOT NULL as confirmado,
    u.encrypted_password IS NOT NULL as tem_senha
FROM auth.users u
WHERE u.email = 'matutaria@gmail.com';

-- 3. Teste de senha
SELECT 
    '3. SENHA:' as etapa,
    CASE 
        WHEN u.encrypted_password = crypt('tenderbr0', u.encrypted_password) THEN '✅ Correta'
        ELSE '❌ Incorreta'
    END as resultado
FROM auth.users u
WHERE u.email = 'matutaria@gmail.com';

-- 4. Verificar se existe tabela profiles
SELECT 
    '4. TABELA PROFILES:' as etapa,
    CASE WHEN COUNT(*) > 0 THEN '✅ Existe' ELSE '❌ Não existe' END as status
FROM information_schema.tables 
WHERE table_name = 'profiles' AND table_schema = 'public';

-- 5. Verificar se existe tabela empresas
SELECT 
    '5. TABELA EMPRESAS:' as etapa,
    CASE WHEN COUNT(*) > 0 THEN '✅ Existe' ELSE '❌ Não existe' END as status
FROM information_schema.tables 
WHERE table_name = 'empresas' AND table_schema = 'public';