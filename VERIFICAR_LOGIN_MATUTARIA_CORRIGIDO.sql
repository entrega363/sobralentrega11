-- SCRIPT CORRIGIDO PARA VERIFICAR O STATUS DO LOGIN DA MATUTARIA
-- Execute este script no Supabase SQL Editor para diagnosticar o problema

-- 1. Verificar se o usuário existe na tabela auth.users
SELECT 
    '1. VERIFICAÇÃO AUTH.USERS:' as etapa,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ Usuário existe'
        ELSE '❌ Usuário NÃO existe'
    END as status,
    COUNT(*) as total_usuarios
FROM auth.users 
WHERE email = 'matutaria@gmail.com';

-- 2. Verificar detalhes do usuário
SELECT 
    '2. DETALHES DO USUÁRIO:' as etapa,
    u.id,
    u.email,
    u.email_confirmed_at IS NOT NULL as email_confirmado,
    u.encrypted_password IS NOT NULL as tem_senha,
    u.raw_user_meta_data,
    u.created_at
FROM auth.users u
WHERE u.email = 'matutaria@gmail.com';

-- 3. Verificar perfil
SELECT 
    '3. VERIFICAÇÃO PERFIL:' as etapa,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ Perfil existe'
        ELSE '❌ Perfil NÃO existe'
    END as status,
    COUNT(*) as total_perfis
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email = 'matutaria@gmail.com';

-- 4. Verificar detalhes do perfil (sem a coluna nome que não existe)
SELECT 
    '4. DETALHES DO PERFIL:' as etapa,
    p.id,
    p.email,
    p.role,
    p.ativo,
    p.empresa_id IS NOT NULL as tem_empresa_id
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email = 'matutaria@gmail.com';

-- 5. Verificar empresa
SELECT 
    '5. VERIFICAÇÃO EMPRESA:' as etapa,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ Empresa existe'
        ELSE '❌ Empresa NÃO existe'
    END as status,
    COUNT(*) as total_empresas
FROM empresas e
JOIN auth.users u ON e.user_id = u.id
WHERE u.email = 'matutaria@gmail.com';

-- 6. Verificar detalhes da empresa
SELECT 
    '6. DETALHES DA EMPRESA:' as etapa,
    e.id,
    e.nome,
    e.ativo,
    e.user_id
FROM empresas e
JOIN auth.users u ON e.user_id = u.id
WHERE u.email = 'matutaria@gmail.com';

-- 7. Testar senha (simulação)
SELECT 
    '7. TESTE DE SENHA:' as etapa,
    u.email,
    CASE 
        WHEN u.encrypted_password = crypt('tenderbr0', u.encrypted_password) THEN '✅ Senha CORRETA'
        ELSE '❌ Senha INCORRETA'
    END as teste_senha
FROM auth.users u
WHERE u.email = 'matutaria@gmail.com';

-- 8. Verificar estrutura da tabela profiles (para debug)
SELECT 
    '8. ESTRUTURA PROFILES:' as etapa,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 9. Resumo final
SELECT 
    '9. RESUMO DIAGNÓSTICO:' as etapa,
    CASE 
        WHEN u.id IS NULL THEN '❌ PROBLEMA: Usuário não existe'
        WHEN u.encrypted_password IS NULL THEN '❌ PROBLEMA: Usuário sem senha'
        WHEN u.email_confirmed_at IS NULL THEN '❌ PROBLEMA: Email não confirmado'
        WHEN p.id IS NULL THEN '❌ PROBLEMA: Perfil não existe'
        WHEN p.role != 'empresa' THEN '❌ PROBLEMA: Role incorreto'
        WHEN p.ativo = false THEN '❌ PROBLEMA: Perfil inativo'
        WHEN e.id IS NULL THEN '❌ PROBLEMA: Empresa não existe'
        WHEN e.ativo = false THEN '❌ PROBLEMA: Empresa inativa'
        ELSE '✅ TUDO OK - Login deve funcionar'
    END as diagnostico
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
LEFT JOIN empresas e ON p.empresa_id = e.id
WHERE u.email = 'matutaria@gmail.com'
UNION ALL
SELECT 
    '9. RESUMO DIAGNÓSTICO:' as etapa,
    '❌ PROBLEMA: Usuário não existe na base de dados' as diagnostico
WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'matutaria@gmail.com');