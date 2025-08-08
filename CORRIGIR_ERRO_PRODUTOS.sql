-- Script para corrigir erros ao salvar produtos

-- 1. Verificar se o usuário matutaria tem empresa corretamente configurada
SELECT 'Verificando configuração do usuário matutaria:' as info;

-- Verificar usuário
SELECT 
    'USUÁRIO' as tipo,
    u.id,
    u.email,
    u.email_confirmed_at IS NOT NULL as email_confirmado
FROM auth.users u 
WHERE u.email = 'matutaria@gmail.com';

-- Verificar profile
SELECT 
    'PROFILE' as tipo,
    p.id,
    p.role,
    u.email
FROM profiles p
JOIN auth.users u ON u.id = p.id
WHERE u.email = 'matutaria@gmail.com';

-- Verificar empresa
SELECT 
    'EMPRESA' as tipo,
    e.id,
    e.nome,
    e.status,
    e.profile_id
FROM empresas e
JOIN profiles p ON p.id = e.profile_id
JOIN auth.users u ON u.id = p.id
WHERE u.email = 'matutaria@gmail.com';

-- 2. Se não existir empresa, criar uma
INSERT INTO empresas (
    profile_id,
    nome,
    endereco,
    telefone,
    status,
    configuracoes
)
SELECT 
    p.id,
    'Matutaria Delivery',
    'Endereço da Matutaria',
    '(11) 99999-9999',
    'ativo',
    '{
        "aceita_pedidos": true,
        "tempo_entrega_min": 30,
        "tempo_entrega_max": 60,
        "taxa_entrega": 5.00,
        "valor_minimo_pedido": 20.00
    }'::jsonb
FROM profiles p
JOIN auth.users u ON u.id = p.id
WHERE u.email = 'matutaria@gmail.com'
AND NOT EXISTS (
    SELECT 1 FROM empresas e WHERE e.profile_id = p.id
);

-- 3. Verificar se a inserção funcionou
SELECT 'Verificando empresa após inserção:' as info;
SELECT 
    e.id,
    e.nome,
    e.status,
    u.email
FROM empresas e
JOIN profiles p ON p.id = e.profile_id
JOIN auth.users u ON u.id = p.id
WHERE u.email = 'matutaria@gmail.com';

-- 4. Testar inserção de produto
SELECT 'Testando inserção de produto:' as info;

-- Inserir produto de teste
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
    'Pizza Margherita Teste',
    'Pizza com molho de tomate, mussarela e manjericão',
    25.90,
    'Pizza',
    true,
    35
FROM empresas e
JOIN profiles p ON p.id = e.profile_id
JOIN auth.users u ON u.id = p.id
WHERE u.email = 'matutaria@gmail.com'
AND NOT EXISTS (
    SELECT 1 FROM produtos pr 
    WHERE pr.empresa_id = e.id 
    AND pr.nome = 'Pizza Margherita Teste'
);

-- 5. Verificar produtos criados
SELECT 'Produtos criados:' as info;
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

-- 6. Verificar políticas RLS
SELECT 'Políticas RLS para produtos:' as info;
SELECT 
    policyname,
    cmd,
    permissive,
    qual
FROM pg_policies 
WHERE tablename = 'produtos';

SELECT 'Script executado com sucesso!' as resultado;