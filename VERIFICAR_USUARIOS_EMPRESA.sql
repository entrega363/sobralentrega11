-- VERIFICAR SE EXISTEM USUÁRIOS DE EMPRESA CADASTRADOS
-- Execute este script no Supabase SQL Editor

-- 1. Verificar todos os usuários por role
SELECT 
    'USUARIOS_POR_ROLE' as status,
    p.role,
    COUNT(*) as total_usuarios
FROM profiles p
GROUP BY p.role
ORDER BY p.role;

-- 2. Listar todos os usuários de empresa
SELECT 
    'USUARIOS_EMPRESA' as status,
    au.id,
    au.email,
    p.role,
    p.status_disponibilidade,
    au.email_confirmed_at IS NOT NULL as email_confirmado,
    au.created_at
FROM auth.users au
JOIN profiles p ON au.id = p.id
WHERE p.role = 'empresa'
ORDER BY au.created_at DESC;

-- 3. Verificar se existe a tabela empresas e seus dados
SELECT 
    'DADOS_EMPRESAS' as status,
    e.id,
    e.nome,
    e.email,
    e.telefone,
    e.endereco,
    e.created_at
FROM empresas e
ORDER BY e.created_at DESC;

-- 4. Verificar usuários que podem ser empresas (por email ou padrão)
SELECT 
    'POSSIVEIS_EMPRESAS' as status,
    au.id,
    au.email,
    p.role as role_atual,
    CASE 
        WHEN au.email LIKE '%empresa%' THEN 'Possível empresa (email)'
        WHEN au.email LIKE '%@gmail.com' AND p.role != 'admin' THEN 'Possível empresa (gmail)'
        WHEN au.email LIKE '%matutaria%' THEN 'Matutaria (empresa conhecida)'
        ELSE 'Verificar manualmente'
    END as sugestao
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE au.email != 'entregasobral@gmail.com'
ORDER BY au.created_at DESC;

-- 5. Verificar se há usuários sem role definido
SELECT 
    'USUARIOS_SEM_ROLE' as status,
    au.id,
    au.email,
    au.created_at,
    'PRECISA_DEFINIR_ROLE' as acao_necessaria
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.role IS NULL
ORDER BY au.created_at DESC;

-- 6. Resumo geral do banco
SELECT 
    'RESUMO_GERAL' as status,
    (SELECT COUNT(*) FROM auth.users) as total_usuarios_auth,
    (SELECT COUNT(*) FROM profiles) as total_profiles,
    (SELECT COUNT(*) FROM profiles WHERE role = 'admin') as total_admins,
    (SELECT COUNT(*) FROM profiles WHERE role = 'empresa') as total_empresas,
    (SELECT COUNT(*) FROM profiles WHERE role = 'entregador') as total_entregadores,
    (SELECT COUNT(*) FROM profiles WHERE role = 'consumidor') as total_consumidores;