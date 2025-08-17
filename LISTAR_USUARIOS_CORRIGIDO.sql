-- =====================================================
-- LISTAR TODOS OS USUÁRIOS - VERSÃO CORRIGIDA
-- =====================================================
-- Script corrigido para funcionar com os tipos do Supabase

-- =====================================================
-- PRIMEIRO: VERIFICAR USUÁRIOS EXISTENTES
-- =====================================================

SELECT 'VERIFICANDO USUÁRIOS EXISTENTES:' as status;

-- Mostrar usuários que já existem
SELECT 
    u.email,
    COALESCE(p.role::text, 'SEM PROFILE') as role_atual,
    u.email_confirmed_at IS NOT NULL as email_confirmado
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.email IN ('entregasobral@gmail.com', 'produtojssuporte@gmail.com', 'appmasterbase44@gmail.com', 'matutaria@gmail.com')
ORDER BY u.email;

-- =====================================================
-- TODOS OS USUÁRIOS CADASTRADOS
-- =====================================================

SELECT 'TODOS OS USUÁRIOS CADASTRADOS:' as info;

SELECT 
    u.id,
    u.email,
    u.created_at as data_criacao,
    u.email_confirmed_at IS NOT NULL as email_confirmado,
    u.last_sign_in_at as ultimo_login,
    COALESCE(p.role::text, 'SEM PROFILE') as role,
    CASE 
        WHEN p.role = 'admin' THEN 'Administrador do Sistema'
        WHEN p.role = 'empresa' THEN COALESCE(e.nome, 'Empresa')
        WHEN p.role = 'entregador' THEN COALESCE(ent.nome, 'Entregador')
        WHEN p.role = 'consumidor' THEN COALESCE(c.nome, 'Consumidor')
        ELSE 'Usuário sem perfil'
    END as nome_completo,
    -- Senha é criptografada, não pode ser mostrada
    CASE 
        WHEN u.encrypted_password IS NOT NULL THEN 'SENHA DEFINIDA'
        ELSE 'SEM SENHA'
    END as status_senha
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
LEFT JOIN empresas e ON p.id = e.profile_id
LEFT JOIN entregadores ent ON p.id = ent.profile_id
LEFT JOIN consumidores c ON p.id = c.profile_id
ORDER BY u.created_at DESC;

-- =====================================================
-- USUÁRIOS COM CREDENCIAIS CONHECIDAS
-- =====================================================

SELECT 'USUÁRIOS COM CREDENCIAIS CONHECIDAS:' as info;

SELECT 
    u.email,
    COALESCE(p.role::text, 'SEM PROFILE') as role,
    CASE 
        WHEN u.email = 'entregasobral@gmail.com' THEN 'tenderbr0'
        WHEN u.email = 'produtojssuporte@gmail.com' THEN 'tenderbr0'
        WHEN u.email = 'appmasterbase44@gmail.com' THEN 'tenderbr0'
        WHEN u.email = 'matutaria@gmail.com' THEN 'tenderbr0'
        ELSE 'SENHA DESCONHECIDA'
    END as senha_conhecida,
    u.email_confirmed_at IS NOT NULL as pode_fazer_login
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.email IN (
    'entregasobral@gmail.com', 
    'produtojssuporte@gmail.com', 
    'appmasterbase44@gmail.com', 
    'matutaria@gmail.com'
)
ORDER BY u.email;

-- =====================================================
-- ESTATÍSTICAS SIMPLES
-- =====================================================

SELECT 'ESTATÍSTICAS:' as info;

-- Total de usuários
SELECT COUNT(*) as total_usuarios FROM auth.users;

-- Usuários com email confirmado
SELECT COUNT(*) as usuarios_confirmados 
FROM auth.users 
WHERE email_confirmed_at IS NOT NULL;

-- Usuários por role
SELECT 
    COALESCE(p.role::text, 'SEM PROFILE') as role,
    COUNT(*) as quantidade
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
GROUP BY p.role
ORDER BY quantidade DESC;

-- =====================================================
-- DETALHES DOS PERFIS POR TIPO
-- =====================================================

SELECT 'DETALHES DOS PERFIS:' as info;

-- Administradores
SELECT 
    'ADMIN' as tipo,
    u.email,
    u.created_at,
    'Administrador do Sistema' as nome
FROM auth.users u
JOIN profiles p ON u.id = p.id
WHERE p.role = 'admin';

-- Empresas
SELECT 
    'EMPRESA' as tipo,
    u.email,
    u.created_at,
    COALESCE(e.nome, 'Nome não definido') as nome
FROM auth.users u
JOIN profiles p ON u.id = p.id
LEFT JOIN empresas e ON p.id = e.profile_id
WHERE p.role = 'empresa';

-- Entregadores
SELECT 
    'ENTREGADOR' as tipo,
    u.email,
    u.created_at,
    COALESCE(ent.nome, 'Nome não definido') as nome
FROM auth.users u
JOIN profiles p ON u.id = p.id
LEFT JOIN entregadores ent ON p.id = ent.profile_id
WHERE p.role = 'entregador';

-- Consumidores
SELECT 
    'CONSUMIDOR' as tipo,
    u.email,
    u.created_at,
    COALESCE(c.nome, 'Nome não definido') as nome
FROM auth.users u
JOIN profiles p ON u.id = p.id
LEFT JOIN consumidores c ON p.id = c.profile_id
WHERE p.role = 'consumidor';

-- =====================================================
-- RESUMO FINAL
-- =====================================================

SELECT 'RESUMO FINAL:' as info;

SELECT 
    (SELECT COUNT(*) FROM auth.users) as total_usuarios,
    (SELECT COUNT(*) FROM auth.users WHERE email_confirmed_at IS NOT NULL) as usuarios_ativos,
    (SELECT COUNT(*) FROM profiles WHERE role = 'admin') as administradores,
    (SELECT COUNT(*) FROM profiles WHERE role = 'empresa') as empresas,
    (SELECT COUNT(*) FROM profiles WHERE role = 'entregador') as entregadores,
    (SELECT COUNT(*) FROM profiles WHERE role = 'consumidor') as consumidores;