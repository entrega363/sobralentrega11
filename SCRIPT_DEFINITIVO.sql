-- =====================================================
-- SCRIPT DEFINITIVO - CRIAR CONTAS ESPECÍFICAS
-- =====================================================
-- Este script é 100% seguro e pode ser executado múltiplas vezes

-- =====================================================
-- VERIFICAR E ATUALIZAR USUÁRIOS EXISTENTES
-- =====================================================

-- Primeiro, vamos apenas verificar quais usuários já existem
SELECT 'VERIFICANDO USUÁRIOS EXISTENTES:' as status;

-- Mostrar usuários que já existem
SELECT 
    u.email,
    CASE WHEN p.id IS NOT NULL THEN p.role ELSE 'SEM PROFILE' END as role_atual,
    u.email_confirmed_at IS NOT NULL as email_confirmado
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.email IN ('entregasobral@gmail.com', 'produtojssuporte@gmail.com', 'appmasterbase44@gmail.com', 'matutaria@gmail.com')
ORDER BY u.email;

-- =====================================================
-- ATUALIZAR/CRIAR PROFILES PARA USUÁRIOS EXISTENTES
-- =====================================================

-- Atualizar role do administrador
UPDATE profiles 
SET role = 'admin' 
WHERE id IN (SELECT id FROM auth.users WHERE email = 'entregasobral@gmail.com');

-- Se não existe profile para admin, criar
INSERT INTO profiles (id, role)
SELECT id, 'admin' 
FROM auth.users 
WHERE email = 'entregasobral@gmail.com' 
AND id NOT IN (SELECT id FROM profiles WHERE id IS NOT NULL)
ON CONFLICT (id) DO NOTHING;

-- Atualizar role da empresa
UPDATE profiles 
SET role = 'empresa' 
WHERE id IN (SELECT id FROM auth.users WHERE email = 'produtojssuporte@gmail.com');

-- Se não existe profile para empresa, criar
INSERT INTO profiles (id, role)
SELECT id, 'empresa' 
FROM auth.users 
WHERE email = 'produtojssuporte@gmail.com' 
AND id NOT IN (SELECT id FROM profiles WHERE id IS NOT NULL)
ON CONFLICT (id) DO NOTHING;

-- Atualizar role do entregador
UPDATE profiles 
SET role = 'entregador' 
WHERE id IN (SELECT id FROM auth.users WHERE email = 'appmasterbase44@gmail.com');

-- Se não existe profile para entregador, criar
INSERT INTO profiles (id, role)
SELECT id, 'entregador' 
FROM auth.users 
WHERE email = 'appmasterbase44@gmail.com' 
AND id NOT IN (SELECT id FROM profiles WHERE id IS NOT NULL)
ON CONFLICT (id) DO NOTHING;

-- Atualizar role do consumidor
UPDATE profiles 
SET role = 'consumidor' 
WHERE id IN (SELECT id FROM auth.users WHERE email = 'matutaria@gmail.com');

-- Se não existe profile para consumidor, criar
INSERT INTO profiles (id, role)
SELECT id, 'consumidor' 
FROM auth.users 
WHERE email = 'matutaria@gmail.com' 
AND id NOT IN (SELECT id FROM profiles WHERE id IS NOT NULL)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- CRIAR EMPRESA MATUTARIA (SE NÃO EXISTIR)
-- =====================================================

INSERT INTO empresas (
    id, profile_id, nome, cnpj, categoria, status, endereco, contato, configuracoes
)
SELECT 
    gen_random_uuid(),
    u.id,
    'Matutaria Delivery',
    '12.345.678/0001-90',
    'Restaurante',
    'aprovada',
    '{"rua": "Rua das Flores, 123", "bairro": "Centro", "cidade": "Sobral", "estado": "CE", "cep": "62000-000"}',
    '{"telefone": "(88) 99999-9999", "email": "produtojssuporte@gmail.com"}',
    '{"taxa_entrega": 5.00, "tempo_preparo_medio": 30, "pedido_minimo": 15.00}'
FROM auth.users u
WHERE u.email = 'produtojssuporte@gmail.com'
AND NOT EXISTS (SELECT 1 FROM empresas WHERE profile_id = u.id);

-- =====================================================
-- CRIAR ENTREGADOR (SE NÃO EXISTIR)
-- =====================================================

INSERT INTO entregadores (
    id, profile_id, nome, cpf, endereco, contato, veiculo, status
)
SELECT 
    gen_random_uuid(),
    u.id,
    'João Entregador Sobral',
    '123.456.789-00',
    '{"rua": "Rua dos Entregadores, 456", "bairro": "Dom Expedito", "cidade": "Sobral", "estado": "CE"}',
    '{"telefone": "(88) 98888-8888", "email": "appmasterbase44@gmail.com"}',
    '{"tipo": "moto", "marca": "Honda", "modelo": "CG 160", "placa": "ABC-1234"}',
    'aprovado'
FROM auth.users u
WHERE u.email = 'appmasterbase44@gmail.com'
AND NOT EXISTS (SELECT 1 FROM entregadores WHERE profile_id = u.id);

-- =====================================================
-- CRIAR CONSUMIDOR (SE NÃO EXISTIR)
-- =====================================================

INSERT INTO consumidores (
    id, profile_id, nome, cpf, endereco, contato
)
SELECT 
    gen_random_uuid(),
    u.id,
    'Cliente Matutaria',
    '987.654.321-00',
    '{"rua": "Rua dos Consumidores, 789", "bairro": "Centro", "cidade": "Sobral", "estado": "CE"}',
    '{"telefone": "(88) 97777-7777", "email": "matutaria@gmail.com"}'
FROM auth.users u
WHERE u.email = 'matutaria@gmail.com'
AND NOT EXISTS (SELECT 1 FROM consumidores WHERE profile_id = u.id);

-- =====================================================
-- CRIAR PRODUTOS (SE NÃO EXISTIREM)
-- =====================================================

-- Criar produtos básicos se não existirem
INSERT INTO produtos (empresa_id, nome, descricao, preco, categoria, disponivel, tempo_preparacao)
SELECT 
    e.id, 'Hambúrguer Artesanal', 'Hambúrguer com carne bovina, queijo e salada', 25.90, 'Lanches', true, 20
FROM empresas e 
WHERE e.nome = 'Matutaria Delivery'
AND NOT EXISTS (SELECT 1 FROM produtos WHERE empresa_id = e.id AND nome = 'Hambúrguer Artesanal');

INSERT INTO produtos (empresa_id, nome, descricao, preco, categoria, disponivel, tempo_preparacao)
SELECT 
    e.id, 'Pizza Margherita', 'Pizza com molho de tomate e mussarela', 35.00, 'Pizzas', true, 30
FROM empresas e 
WHERE e.nome = 'Matutaria Delivery'
AND NOT EXISTS (SELECT 1 FROM produtos WHERE empresa_id = e.id AND nome = 'Pizza Margherita');

INSERT INTO produtos (empresa_id, nome, descricao, preco, categoria, disponivel, tempo_preparacao)
SELECT 
    e.id, 'Coca-Cola Lata', 'Refrigerante Coca-Cola 350ml', 5.00, 'Bebidas', true, 2
FROM empresas e 
WHERE e.nome = 'Matutaria Delivery'
AND NOT EXISTS (SELECT 1 FROM produtos WHERE empresa_id = e.id AND nome = 'Coca-Cola Lata');

INSERT INTO produtos (empresa_id, nome, descricao, preco, categoria, disponivel, tempo_preparacao)
SELECT 
    e.id, 'Batata Frita', 'Porção de batata frita crocante', 12.00, 'Acompanhamentos', true, 15
FROM empresas e 
WHERE e.nome = 'Matutaria Delivery'
AND NOT EXISTS (SELECT 1 FROM produtos WHERE empresa_id = e.id AND nome = 'Batata Frita');

INSERT INTO produtos (empresa_id, nome, descricao, preco, categoria, disponivel, tempo_preparacao)
SELECT 
    e.id, 'Pudim de Leite', 'Pudim de leite condensado', 8.00, 'Sobremesas', true, 5
FROM empresas e 
WHERE e.nome = 'Matutaria Delivery'
AND NOT EXISTS (SELECT 1 FROM produtos WHERE empresa_id = e.id AND nome = 'Pudim de Leite');

-- =====================================================
-- VERIFICAR RESULTADO FINAL
-- =====================================================

SELECT 'RESULTADO FINAL:' as status;

-- Mostrar todos os usuários com seus roles
SELECT 
    p.role, 
    u.email,
    CASE 
        WHEN p.role = 'admin' THEN 'Administrador Sistema'
        WHEN p.role = 'empresa' THEN 'Matutaria Delivery'
        WHEN p.role = 'entregador' THEN 'João Entregador Sobral'
        WHEN p.role = 'consumidor' THEN 'Cliente Matutaria'
    END as nome,
    u.email_confirmed_at IS NOT NULL as email_confirmado
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email IN ('entregasobral@gmail.com', 'produtojssuporte@gmail.com', 'appmasterbase44@gmail.com', 'matutaria@gmail.com')
ORDER BY p.role;

-- Mostrar produtos criados
SELECT 'PRODUTOS DISPONÍVEIS:' as status;
SELECT nome, categoria, preco, disponivel 
FROM produtos 
WHERE empresa_id IN (SELECT id FROM empresas WHERE nome = 'Matutaria Delivery')
ORDER BY categoria, nome;

-- Mostrar credenciais
SELECT '
🔑 CREDENCIAIS PARA LOGIN:

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

✅ Sistema configurado e pronto para uso!
' as credenciais;