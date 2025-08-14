-- SCRIPT SIMPLES PARA VERIFICAR LOGIN DA MATUTARIA
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

-- 3. Verificar perfil
SELECT 
    '3. PERFIL:' as etapa,
    CASE WHEN COUNT(*) > 0 THEN '✅ Existe' ELSE '❌ Não existe' END as status
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email = 'matutaria@gmail.com';

-- 4. Detalhes do perfil
SELECT 
    '4. PERFIL DETALHES:' as etapa,
    p.id,
    p.role
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email = 'matutaria@gmail.com';

-- 5. Verificar empresa
SELECT 
    '5. EMPRESA:' as etapa,
    CASE WHEN COUNT(*) > 0 THEN '✅ Existe' ELSE '❌ Não existe' END as status
FROM empresas e
JOIN auth.users u ON e.user_id = u.id
WHERE u.email = 'matutaria@gmail.com';

-- 6. Detalhes da empresa
SELECT 
    '6. EMPRESA DETALHES:' as etapa,
    e.id,
    e.nome,
    e.ativo
FROM empresas e
JOIN auth.users u ON e.user_id = u.id
WHERE u.email = 'matutaria@gmail.com';

-- 7. Teste de senha
SELECT 
    '7. SENHA:' as etapa,
    CASE 
        WHEN u.encrypted_password = crypt('tenderbr0', u.encrypted_password) THEN '✅ Correta'
        ELSE '❌ Incorreta'
    END as resultado
FROM auth.users u
WHERE u.email = 'matutaria@gmail.com';