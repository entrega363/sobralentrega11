-- VERIFICAR ESTRUTURA DA TABELA EMPRESAS E LOGIN MATUTARIA
-- Execute este script no Supabase SQL Editor

-- 1. Verificar estrutura da tabela empresas
SELECT 
    '1. ESTRUTURA EMPRESAS:' as etapa,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'empresas' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Verificar se o usuário matutaria existe
SELECT 
    '2. USUÁRIO MATUTARIA:' as etapa,
    CASE WHEN COUNT(*) > 0 THEN '✅ Existe' ELSE '❌ Não existe' END as status,
    COUNT(*) as total
FROM auth.users 
WHERE email = 'matutaria@gmail.com';

-- 3. Detalhes do usuário matutaria
SELECT 
    '3. DETALHES USUÁRIO:' as etapa,
    u.id,
    u.email,
    u.email_confirmed_at IS NOT NULL as confirmado,
    u.encrypted_password IS NOT NULL as tem_senha
FROM auth.users u
WHERE u.email = 'matutaria@gmail.com';

-- 4. Verificar se existe empresa com nome Matutaria
SELECT 
    '4. EMPRESA MATUTARIA:' as etapa,
    CASE WHEN COUNT(*) > 0 THEN '✅ Existe' ELSE '❌ Não existe' END as status,
    COUNT(*) as total
FROM empresas 
WHERE nome ILIKE '%matutaria%';

-- 5. Detalhes da empresa Matutaria
SELECT 
    '5. DETALHES EMPRESA:' as etapa,
    e.*
FROM empresas e
WHERE e.nome ILIKE '%matutaria%';

-- 6. Teste de senha
SELECT 
    '6. TESTE SENHA:' as etapa,
    CASE 
        WHEN u.encrypted_password = crypt('tenderbr0', u.encrypted_password) THEN '✅ Senha correta'
        ELSE '❌ Senha incorreta'
    END as resultado
FROM auth.users u
WHERE u.email = 'matutaria@gmail.com';