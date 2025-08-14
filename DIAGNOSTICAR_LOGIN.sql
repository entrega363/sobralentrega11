-- ========================================
-- DIAGNOSTICAR PROBLEMA DE LOGIN
-- ========================================

-- Verificar se os usuários existem na tabela auth.users
SELECT 
    'USUÁRIOS NA TABELA AUTH.USERS:' as titulo,
    '' as separador;

SELECT 
    email,
    id,
    email_confirmed_at,
    created_at,
    CASE 
        WHEN encrypted_password IS NOT NULL THEN 'TEM SENHA'
        ELSE 'SEM SENHA'
    END as senha_status
FROM auth.users 
WHERE email IN (
    'teste.consumidor@gmail.com',
    'teste.empresa@gmail.com',
    'teste.entregador@gmail.com'
)
ORDER BY email;

-- Verificar profiles
SELECT 
    '' as separador,
    'PROFILES CRIADOS:' as titulo,
    '' as separador2;

SELECT 
    p.id,
    p.role,
    u.email
FROM profiles p
JOIN auth.users u ON u.id = p.id
WHERE u.email IN (
    'teste.consumidor@gmail.com',
    'teste.empresa@gmail.com',
    'teste.entregador@gmail.com'
)
ORDER BY u.email;

-- Verificar dados específicos de cada tipo
SELECT 
    '' as separador,
    'DADOS ESPECÍFICOS:' as titulo,
    '' as separador2;

-- Consumidores
SELECT 
    'CONSUMIDOR' as tipo,
    u.email,
    c.nome,
    c.status
FROM auth.users u
JOIN profiles p ON p.id = u.id
JOIN consumidores c ON c.profile_id = u.id
WHERE u.email = 'teste.consumidor@gmail.com';

-- Empresas
SELECT 
    'EMPRESA' as tipo,
    u.email,
    e.nome,
    e.status
FROM auth.users u
JOIN profiles p ON p.id = u.id
JOIN empresas e ON e.profile_id = u.id
WHERE u.email = 'teste.empresa@gmail.com';

-- Entregadores
SELECT 
    'ENTREGADOR' as tipo,
    u.email,
    ent.nome,
    ent.status
FROM auth.users u
JOIN profiles p ON p.id = u.id
JOIN entregadores ent ON ent.profile_id = u.id
WHERE u.email = 'teste.entregador@gmail.com';

-- Testar se a senha está funcionando
SELECT 
    '' as separador,
    'TESTE DE SENHA:' as titulo,
    '' as separador2;

SELECT 
    email,
    CASE 
        WHEN encrypted_password = crypt('123456', encrypted_password) THEN 'SENHA CORRETA'
        ELSE 'SENHA INCORRETA'
    END as teste_senha
FROM auth.users 
WHERE email IN (
    'teste.consumidor@gmail.com',
    'teste.empresa@gmail.com',
    'teste.entregador@gmail.com'
);