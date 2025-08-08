-- Diagnóstico completo para o usuário matutaria@gmail.com

-- 1. Verificar se o usuário existe
SELECT 'USUÁRIO:' as secao;
SELECT 
    id,
    email,
    created_at,
    email_confirmed_at,
    last_sign_in_at
FROM auth.users 
WHERE email = 'matutaria@gmail.com';

-- 2. Verificar profile do usuário
SELECT 'PROFILE:' as secao;
SELECT 
    p.id,
    p.role,
    p.created_at,
    u.email
FROM profiles p
JOIN auth.users u ON u.id = p.id
WHERE u.email = 'matutaria@gmail.com';

-- 3. Verificar empresa vinculada
SELECT 'EMPRESA:' as secao;
SELECT 
    e.id,
    e.nome,
    e.status,
    e.profile_id,
    e.created_at,
    u.email
FROM empresas e
JOIN profiles p ON p.id = e.profile_id
JOIN auth.users u ON u.id = p.id
WHERE u.email = 'matutaria@gmail.com';

-- 4. Verificar produtos existentes
SELECT 'PRODUTOS EXISTENTES:' as secao;
SELECT 
    pr.id,
    pr.nome,
    pr.preco,
    pr.categoria,
    pr.disponivel,
    pr.empresa_id,
    pr.created_at
FROM produtos pr
JOIN empresas e ON e.id = pr.empresa_id
JOIN profiles p ON p.id = e.profile_id
JOIN auth.users u ON u.id = p.id
WHERE u.email = 'matutaria@gmail.com';

-- 5. Verificar estrutura da tabela produtos
SELECT 'ESTRUTURA TABELA PRODUTOS:' as secao;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'produtos'
ORDER BY ordinal_position;

-- 6. Verificar políticas RLS
SELECT 'POLÍTICAS RLS PRODUTOS:' as secao;
SELECT 
    policyname,
    cmd,
    permissive,
    roles,
    qual
FROM pg_policies 
WHERE tablename = 'produtos';

-- 7. Teste de inserção (comentado para segurança)
SELECT 'TESTE DE INSERÇÃO:' as secao;
/*
-- Descomente para testar inserção manual
INSERT INTO produtos (
    empresa_id, 
    nome, 
    descricao, 
    preco, 
    categoria, 
    disponivel, 
    tempo_preparacao
)
SELECT 
    e.id,
    'Produto Teste Debug',
    'Produto criado para teste de debug',
    15.99,
    'Teste',
    true,
    20
FROM empresas e
JOIN profiles p ON p.id = e.profile_id
JOIN auth.users u ON u.id = p.id
WHERE u.email = 'matutaria@gmail.com'
RETURNING *;
*/

SELECT 'Para testar inserção, descomente o código acima' as instrucao;

-- 8. Verificar permissões do usuário atual
SELECT 'USUÁRIO ATUAL:' as secao;
SELECT current_user, session_user;

-- 9. Verificar se RLS está ativo
SELECT 'RLS STATUS:' as secao;
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'produtos';