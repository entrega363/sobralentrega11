-- Script para testar registro de empresa
-- Execute no Supabase SQL Editor

-- 1. Limpar dados existentes se houver
DELETE FROM produtos WHERE empresa_id IN (
    SELECT id FROM empresas WHERE user_id IN (
        SELECT id FROM auth.users WHERE email = 'teste@matutaria.com'
    )
);

DELETE FROM empresas WHERE user_id IN (
    SELECT id FROM auth.users WHERE email = 'teste@matutaria.com'
);

DELETE FROM profiles WHERE id IN (
    SELECT id FROM auth.users WHERE email = 'teste@matutaria.com'
);

DELETE FROM auth.users WHERE email = 'teste@matutaria.com';

-- 2. Criar usuário de teste (simulando o que o Supabase Auth faria)
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'teste@matutaria.com',
    crypt('123456789', gen_salt('bf')),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"role": "empresa", "nome": "Matutaria Teste"}',
    NOW(),
    NOW(),
    '',
    ''
);

-- 3. Verificar se o trigger criou o perfil automaticamente
SELECT 
    u.id,
    u.email,
    u.email_confirmed_at,
    u.raw_user_meta_data,
    p.id as profile_id,
    p.role,
    p.nome
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.email = 'teste@matutaria.com';

-- 4. Se não criou automaticamente, vamos criar manualmente
INSERT INTO profiles (
    id,
    email,
    nome,
    telefone,
    role,
    ativo,
    created_at,
    updated_at
)
SELECT 
    u.id,
    u.email,
    'Matutaria Teste',
    '(85) 99999-9999',
    'empresa',
    true,
    NOW(),
    NOW()
FROM auth.users u
WHERE u.email = 'teste@matutaria.com'
ON CONFLICT (id) DO UPDATE SET
    role = 'empresa',
    nome = 'Matutaria Teste',
    ativo = true,
    updated_at = NOW();

-- 5. Criar empresa
INSERT INTO empresas (
    id,
    user_id,
    nome,
    cnpj,
    telefone,
    endereco,
    cidade,
    estado,
    cep,
    descricao,
    categoria,
    horario_funcionamento,
    taxa_entrega,
    tempo_entrega_min,
    tempo_entrega_max,
    ativo,
    created_at,
    updated_at
)
SELECT 
    gen_random_uuid(),
    u.id,
    'Matutaria Teste',
    '12.345.678/0001-90',
    '(85) 99999-9999',
    'Rua das Flores, 123, Centro',
    'Sobral',
    'CE',
    '62010-000',
    'Restaurante de teste para desenvolvimento',
    'restaurante',
    '{"segunda": "08:00-22:00", "terca": "08:00-22:00", "quarta": "08:00-22:00", "quinta": "08:00-22:00", "sexta": "08:00-22:00", "sabado": "08:00-22:00", "domingo": "08:00-20:00"}',
    5.00,
    30,
    60,
    true,
    NOW(),
    NOW()
FROM auth.users u
WHERE u.email = 'teste@matutaria.com';

-- 6. Atualizar perfil com empresa_id
UPDATE profiles 
SET empresa_id = (
    SELECT e.id 
    FROM empresas e 
    JOIN auth.users u ON e.user_id = u.id 
    WHERE u.email = 'teste@matutaria.com'
),
updated_at = NOW()
WHERE id = (SELECT id FROM auth.users WHERE email = 'teste@matutaria.com');

-- 7. Criar produtos de exemplo
INSERT INTO produtos (
    id,
    empresa_id,
    nome,
    descricao,
    preco,
    categoria,
    disponivel,
    tempo_preparo,
    created_at,
    updated_at
)
SELECT 
    gen_random_uuid(),
    e.id,
    produto.nome,
    produto.descricao,
    produto.preco::DECIMAL(10,2),
    produto.categoria,
    true,
    produto.tempo_preparo,
    NOW(),
    NOW()
FROM empresas e
JOIN auth.users u ON e.user_id = u.id
CROSS JOIN (
    VALUES 
        ('Pizza Margherita', 'Pizza tradicional com molho de tomate, mussarela e manjericão', '35.90', 'pizza', 25),
        ('Hambúrguer Artesanal', 'Hambúrguer 180g com queijo, alface, tomate e batata frita', '28.50', 'lanche', 15),
        ('Lasanha Bolonhesa', 'Lasanha tradicional com molho bolonhesa e queijo', '45.90', 'prato-principal', 35),
        ('Refrigerante Lata', 'Refrigerante gelado 350ml', '5.00', 'bebida', 2)
) AS produto(nome, descricao, preco, categoria, tempo_preparo)
WHERE u.email = 'teste@matutaria.com';

-- 8. Verificar resultado final
SELECT 
    '=== CONTA DE TESTE CRIADA ===' as status,
    u.email,
    u.email_confirmed_at IS NOT NULL as email_confirmado,
    p.nome as profile_nome,
    p.role,
    p.ativo as profile_ativo,
    e.nome as empresa_nome,
    e.ativo as empresa_ativo,
    (SELECT COUNT(*) FROM produtos WHERE empresa_id = e.id) as total_produtos
FROM auth.users u
JOIN profiles p ON u.id = p.id
LEFT JOIN empresas e ON p.empresa_id = e.id
WHERE u.email = 'teste@matutaria.com';

-- 9. Instruções de login
SELECT 
    'DADOS PARA LOGIN:' as info,
    'Email: teste@matutaria.com' as email,
    'Senha: 123456789' as senha,
    'URL: https://delivery2-hidizya34-entregasobrals-projects.vercel.app/login' as url;