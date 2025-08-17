-- =====================================================
-- LISTAR TODOS OS USUÁRIOS CADASTRADOS NO BANCO
-- =====================================================
-- IMPORTANTE: As senhas são criptografadas e não podem ser recuperadas

-- =====================================================
-- USUÁRIOS DA TABELA AUTH.USERS
-- =====================================================

SELECT 'TODOS OS USUÁRIOS CADASTRADOS:' as info;

SELECT 
    u.id,
    u.email,
    u.created_at as data_criacao,
    u.email_confirmed_at IS NOT NULL as email_confirmado,
    u.last_sign_in_at as ultimo_login,
    CASE 
        WHEN p.role IS NOT NULL THEN p.role 
        ELSE 'SEM ROLE' 
    END as role,
    CASE 
        WHEN p.role = 'admin' THEN 'Administrador do Sistema'
        WHEN p.role = 'empresa' THEN COALESCE(e.nome, 'Empresa')
        WHEN p.role = 'entregador' THEN COALESCE(ent.nome, 'Entregador')
        WHEN p.role = 'consumidor' THEN COALESCE(c.nome, 'Consumidor')
        ELSE 'Usuário sem perfil'
    END as nome_completo,
    -- Senha é criptografada, não pode ser mostrada
    CASE 
        WHEN u.encrypted_password IS NOT NULL THEN 'SENHA DEFINIDA (CRIPTOGRAFADA)'
        ELSE 'SEM SENHA'
    END as status_senha
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
LEFT JOIN empresas e ON p.id = e.profile_id
LEFT JOIN entregadores ent ON p.id = ent.profile_id
LEFT JOIN consumidores c ON p.id = c.profile_id
ORDER BY u.created_at DESC;

-- =====================================================
-- USUÁRIOS ESPECÍFICOS COM CREDENCIAIS CONHECIDAS
-- =====================================================

SELECT 'USUÁRIOS COM CREDENCIAIS CONHECIDAS:' as info;

SELECT 
    u.email,
    CASE 
        WHEN p.role IS NOT NULL THEN p.role 
        ELSE 'SEM ROLE' 
    END as role,
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
-- ESTATÍSTICAS DOS USUÁRIOS
-- =====================================================

SELECT 'ESTATÍSTICAS:' as info;

-- Total de usuários
SELECT 'Total de usuários cadastrados:' as estatistica, COUNT(*) as quantidade
FROM auth.users
UNION ALL
-- Usuários com email confirmado
SELECT 'Usuários com email confirmado:', COUNT(*)
FROM auth.users 
WHERE email_confirmed_at IS NOT NULL
UNION ALL
-- Usuários por role
SELECT CONCAT('Usuários com role "', COALESCE(p.role, 'SEM ROLE'), '":'), COUNT(*)
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
GROUP BY p.role
ORDER BY estatistica;

-- =====================================================
-- DETALHES COMPLETOS DOS PERFIS
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
WHERE p.role = 'admin'

UNION ALL

-- Empresas
SELECT 
    'EMPRESA' as tipo,
    u.email,
    u.created_at,
    COALESCE(e.nome, 'Nome não definido') as nome
FROM auth.users u
JOIN profiles p ON u.id = p.id
LEFT JOIN empresas e ON p.id = e.profile_id
WHERE p.role = 'empresa'

UNION ALL

-- Entregadores
SELECT 
    'ENTREGADOR' as tipo,
    u.email,
    u.created_at,
    COALESCE(ent.nome, 'Nome não definido') as nome
FROM auth.users u
JOIN profiles p ON u.id = p.id
LEFT JOIN entregadores ent ON p.id = ent.profile_id
WHERE p.role = 'entregador'

UNION ALL

-- Consumidores
SELECT 
    'CONSUMIDOR' as tipo,
    u.email,
    u.created_at,
    COALESCE(c.nome, 'Nome não definido') as nome
FROM auth.users u
JOIN profiles p ON u.id = p.id
LEFT JOIN consumidores c ON p.id = c.profile_id
WHERE p.role = 'consumidor'

ORDER BY tipo, email;

-- =====================================================
-- CREDENCIAIS PARA LOGIN (CONHECIDAS)
-- =====================================================

SELECT '
🔑 CREDENCIAIS CONHECIDAS PARA LOGIN:

👨‍💼 ADMINISTRADOR:
   Email: entregasobral@gmail.com
   Senha: tenderbr0
   
🏢 EMPRESA:
   Email: produtojssuporte@gmail.com
   Senha: tenderbr0
   
🏍️ ENTREGADOR:
   Email: appmasterbase44@gmail.com
   Senha: tenderbr0
   
👤 CONSUMIDOR:
   Email: matutaria@gmail.com
   Senha: tenderbr0

⚠️  IMPORTANTE:
- As senhas no banco são criptografadas e não podem ser recuperadas
- Apenas as senhas definidas pelos scripts são conhecidas
- Outros usuários podem ter senhas diferentes

📊 TOTAL DE USUÁRIOS: ' || (SELECT COUNT(*) FROM auth.users) || '
✅ USUÁRIOS ATIVOS: ' || (SELECT COUNT(*) FROM auth.users WHERE email_confirmed_at IS NOT NULL) || '
' as credenciais_e_estatisticas;