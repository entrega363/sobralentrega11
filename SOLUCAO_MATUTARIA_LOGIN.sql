-- Solução definitiva para o login da Matutaria
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se o usuário existe
SELECT 
    'Status atual:' as info,
    u.id,
    u.email,
    u.email_confirmed_at,
    u.encrypted_password IS NOT NULL as tem_senha,
    p.role,
    p.nome,
    e.nome as empresa_nome
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
LEFT JOIN empresas e ON p.empresa_id = e.id
WHERE u.email = 'matutaria@gmail.com';

-- 2. Se o usuário não existe, criar um novo
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
) 
SELECT 
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'matutaria@gmail.com',
    crypt('tenderbr0', gen_salt('bf')), -- Senha: tenderbr0
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"role": "empresa", "nome": "Matutaria Delivery"}',
    NOW(),
    NOW(),
    '',
    ''
WHERE NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'matutaria@gmail.com'
);

-- 3. Se o usuário existe mas não tem senha, atualizar
UPDATE auth.users 
SET 
    encrypted_password = crypt('tenderbr0', gen_salt('bf')),
    email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
    raw_user_meta_data = '{"role": "empresa", "nome": "Matutaria Delivery"}',
    updated_at = NOW()
WHERE email = 'matutaria@gmail.com' 
AND (encrypted_password IS NULL OR email_confirmed_at IS NULL);

-- 4. Garantir que o perfil existe e está correto
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
    'Matutaria Delivery',
    '(85) 99999-9999',
    'empresa',
    true,
    NOW(),
    NOW()
FROM auth.users u
WHERE u.email = 'matutaria@gmail.com'
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    nome = 'Matutaria Delivery',
    telefone = '(85) 99999-9999',
    role = 'empresa',
    ativo = true,
    updated_at = NOW();

-- 5. Garantir que a empresa existe
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
    'Matutaria Delivery',
    '12.345.678/0001-90',
    '(85) 99999-9999',
    'Rua das Flores, 123, Centro',
    'Sobral',
    'CE',
    '62010-000',
    'Restaurante especializado em comida caseira e delivery',
    'restaurante',
    '{"segunda": "08:00-22:00", "terca": "08:00-22:00", "quarta": "08:00-22:00", "quinta": "08:00-22:00", "sexta": "08:00-22:00", "sabado": "08:00-22:00", "domingo": "08:00-20:00"}',
    5.00,
    30,
    60,
    true,
    NOW(),
    NOW()
FROM auth.users u
WHERE u.email = 'matutaria@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET
    nome = 'Matutaria Delivery',
    telefone = '(85) 99999-9999',
    endereco = 'Rua das Flores, 123, Centro',
    cidade = 'Sobral',
    estado = 'CE',
    cep = '62010-000',
    descricao = 'Restaurante especializado em comida caseira e delivery',
    ativo = true,
    updated_at = NOW();

-- 6. Atualizar perfil com empresa_id
UPDATE profiles 
SET 
    empresa_id = (
        SELECT e.id 
        FROM empresas e 
        JOIN auth.users u ON e.user_id = u.id 
        WHERE u.email = 'matutaria@gmail.com'
        LIMIT 1
    ),
    updated_at = NOW()
WHERE id = (SELECT id FROM auth.users WHERE email = 'matutaria@gmail.com');

-- 7. Criar produtos se não existirem
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
        ('Salada Caesar', 'Salada com alface americana, croutons, parmesão e molho caesar', '25.90', 'salada', 10),
        ('Refrigerante Lata', 'Refrigerante gelado 350ml', '5.00', 'bebida', 2),
        ('Suco Natural', 'Suco natural de frutas da estação', '8.90', 'bebida', 5),
        ('Batata Frita', 'Porção de batata frita crocante', '12.90', 'acompanhamento', 8),
        ('Água Mineral', 'Água mineral 500ml', '3.00', 'bebida', 1)
) AS produto(nome, descricao, preco, categoria, tempo_preparo)
WHERE u.email = 'matutaria@gmail.com'
ON CONFLICT DO NOTHING;

-- 8. Verificar resultado final
SELECT 
    '🎉 CONTA CONFIGURADA COM SUCESSO!' as status,
    u.email,
    'Email confirmado: ' || CASE WHEN u.email_confirmed_at IS NOT NULL THEN 'SIM' ELSE 'NÃO' END as confirmacao,
    'Perfil: ' || p.role as perfil,
    'Empresa: ' || e.nome as empresa,
    'Produtos: ' || (SELECT COUNT(*) FROM produtos WHERE empresa_id = e.id) as produtos,
    '📧 Email: matutaria@gmail.com' as login_email,
    '🔑 Senha: tenderbr0' as login_senha
FROM auth.users u
JOIN profiles p ON u.id = p.id
JOIN empresas e ON p.empresa_id = e.id
WHERE u.email = 'matutaria@gmail.com';

-- 9. Instruções finais
SELECT 
    '📋 INSTRUÇÕES DE LOGIN:' as titulo,
    '1. Acesse: https://delivery2-hidizya34-entregasobrals-projects.vercel.app/login' as passo1,
    '2. Email: matutaria@gmail.com' as passo2,
    '3. Senha: tenderbr0' as passo3,
    '4. Clique em "Entrar"' as passo4,
    '✅ Você será redirecionado para o dashboard da empresa' as resultado;