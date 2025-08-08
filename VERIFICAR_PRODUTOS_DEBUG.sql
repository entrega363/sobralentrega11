-- Script para verificar e debugar problemas com produtos

-- 1. Verificar se a tabela produtos existe
SELECT 'Verificando tabela produtos:' as info;
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'produtos'
ORDER BY ordinal_position;

-- 2. Verificar se o usuário matutaria tem empresa
SELECT 'Verificando empresa do usuário:' as info;
SELECT 
    u.email,
    p.role,
    e.id as empresa_id,
    e.nome as empresa_nome,
    e.status as empresa_status
FROM auth.users u
JOIN profiles p ON p.id = u.id
LEFT JOIN empresas e ON e.profile_id = p.id
WHERE u.email = 'matutaria@gmail.com';

-- 3. Verificar produtos existentes
SELECT 'Produtos existentes:' as info;
SELECT 
    pr.id,
    pr.nome,
    pr.preco,
    pr.categoria,
    pr.disponivel,
    e.nome as empresa_nome
FROM produtos pr
JOIN empresas e ON e.id = pr.empresa_id
JOIN profiles p ON p.id = e.profile_id
JOIN auth.users u ON u.id = p.id
WHERE u.email = 'matutaria@gmail.com';

-- 4. Verificar políticas RLS para produtos
SELECT 'Políticas RLS para produtos:' as info;
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'produtos';

-- 5. Testar inserção manual (para debug)
SELECT 'Testando inserção manual:' as info;
-- Esta query só funcionará se executada por um usuário autenticado
-- INSERT INTO produtos (empresa_id, nome, descricao, preco, categoria, disponivel, tempo_preparacao)
-- SELECT e.id, 'Produto Teste', 'Descrição teste', 10.50, 'Teste', true, 15
-- FROM empresas e
-- JOIN profiles p ON p.id = e.profile_id
-- JOIN auth.users u ON u.id = p.id
-- WHERE u.email = 'matutaria@gmail.com';

SELECT 'Script de verificação concluído' as resultado;