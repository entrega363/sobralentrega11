-- =====================================================
-- CRIAR CONTAS ESPECÍFICAS - VERSÃO FINAL
-- =====================================================
-- IMPORTANTE: Execute este script no SQL Editor do Supabase

-- =====================================================
-- PASSO 1: VERIFICAR E CRIAR USUÁRIOS
-- =====================================================

DO $$
DECLARE
    admin_id UUID;
    empresa_id UUID;
    entregador_id UUID;
    consumidor_id UUID;
    user_exists BOOLEAN;
BEGIN
    -- Verificar se usuário ADMINISTRADOR já existe
    SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = 'entregasobral@gmail.com') INTO user_exists;
    
    IF NOT user_exists THEN
        admin_id := gen_random_uuid();
        INSERT INTO auth.users (
            id, instance_id, email, encrypted_password, email_confirmed_at,
            created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
            is_super_admin, role, aud
        ) VALUES (
            admin_id, '00000000-0000-0000-0000-000000000000', 'entregasobral@gmail.com',
            crypt('tenderbr0', gen_salt('bf')), now(), now(), now(),
            '{"provider": "email", "providers": ["email"]}',
            '{"name": "Administrador Sistema"}', false, 'authenticated', 'authenticated'
        );
        INSERT INTO profiles (id, role) VALUES (admin_id, 'admin');
        RAISE NOTICE 'Usuário ADMINISTRADOR criado com sucesso!';
    ELSE
        SELECT id INTO admin_id FROM auth.users WHERE email = 'entregasobral@gmail.com';
        INSERT INTO profiles (id, role) VALUES (admin_id, 'admin') ON CONFLICT (id) DO UPDATE SET role = 'admin';
        RAISE NOTICE 'Usuário ADMINISTRADOR já existe - role atualizado!';
    END IF;

    -- Verificar se usuário EMPRESA já existe
    SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = 'produtojssuporte@gmail.com') INTO user_exists;
    
    IF NOT user_exists THEN
        empresa_id := gen_random_uuid();
        INSERT INTO auth.users (
            id, instance_id, email, encrypted_password, email_confirmed_at,
            created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
            is_super_admin, role, aud
        ) VALUES (
            empresa_id, '00000000-0000-0000-0000-000000000000', 'produtojssuporte@gmail.com',
            crypt('tenderbr0', gen_salt('bf')), now(), now(), now(),
            '{"provider": "email", "providers": ["email"]}',
            '{"name": "Matutaria Delivery"}', false, 'authenticated', 'authenticated'
        );
        INSERT INTO profiles (id, role) VALUES (empresa_id, 'empresa');
        RAISE NOTICE 'Usuário EMPRESA criado com sucesso!';
    ELSE
        SELECT id INTO empresa_id FROM auth.users WHERE email = 'produtojssuporte@gmail.com';
        INSERT INTO profiles (id, role) VALUES (empresa_id, 'empresa') ON CONFLICT (id) DO UPDATE SET role = 'empresa';
        RAISE NOTICE 'Usuário EMPRESA já existe - role atualizado!';
    END IF;

    -- Verificar se usuário ENTREGADOR já existe
    SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = 'appmasterbase44@gmail.com') INTO user_exists;
    
    IF NOT user_exists THEN
        entregador_id := gen_random_uuid();
        INSERT INTO auth.users (
            id, instance_id, email, encrypted_password, email_confirmed_at,
            created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
            is_super_admin, role, aud
        ) VALUES (
            entregador_id, '00000000-0000-0000-0000-000000000000', 'appmasterbase44@gmail.com',
            crypt('tenderbr0', gen_salt('bf')), now(), now(), now(),
            '{"provider": "email", "providers": ["email"]}',
            '{"name": "João Entregador Sobral"}', false, 'authenticated', 'authenticated'
        );
        INSERT INTO profiles (id, role) VALUES (entregador_id, 'entregador');
        RAISE NOTICE 'Usuário ENTREGADOR criado com sucesso!';
    ELSE
        SELECT id INTO entregador_id FROM auth.users WHERE email = 'appmasterbase44@gmail.com';
        INSERT INTO profiles (id, role) VALUES (entregador_id, 'entregador') ON CONFLICT (id) DO UPDATE SET role = 'entregador';
        RAISE NOTICE 'Usuário ENTREGADOR já existe - role atualizado!';
    END IF;

    -- Verificar se usuário CONSUMIDOR já existe
    SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = 'matutaria@gmail.com') INTO user_exists;
    
    IF NOT user_exists THEN
        consumidor_id := gen_random_uuid();
        INSERT INTO auth.users (
            id, instance_id, email, encrypted_password, email_confirmed_at,
            created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
            is_super_admin, role, aud
        ) VALUES (
            consumidor_id, '00000000-0000-0000-0000-000000000000', 'matutaria@gmail.com',
            crypt('tenderbr0', gen_salt('bf')), now(), now(), now(),
            '{"provider": "email", "providers": ["email"]}',
            '{"name": "Cliente Matutaria"}', false, 'authenticated', 'authenticated'
        );
        INSERT INTO profiles (id, role) VALUES (consumidor_id, 'consumidor');
        RAISE NOTICE 'Usuário CONSUMIDOR criado com sucesso!';
    ELSE
        SELECT id INTO consumidor_id FROM auth.users WHERE email = 'matutaria@gmail.com';
        INSERT INTO profiles (id, role) VALUES (consumidor_id, 'consumidor') ON CONFLICT (id) DO UPDATE SET role = 'consumidor';
        RAISE NOTICE 'Usuário CONSUMIDOR já existe - role atualizado!';
    END IF;

    -- Criar empresa se não existir
    IF NOT EXISTS(SELECT 1 FROM empresas WHERE profile_id = empresa_id) THEN
        INSERT INTO empresas (
            id, profile_id, nome, cnpj, categoria, status, endereco, contato, configuracoes
        ) VALUES (
            gen_random_uuid(), empresa_id, 'Matutaria Delivery', '12.345.678/0001-90',
            'Restaurante', 'aprovada',
            '{"rua": "Rua das Flores, 123", "bairro": "Centro", "cidade": "Sobral", "estado": "CE", "cep": "62000-000"}',
            '{"telefone": "(88) 99999-9999", "email": "produtojssuporte@gmail.com"}',
            '{"taxa_entrega": 5.00, "tempo_preparo_medio": 30, "pedido_minimo": 15.00}'
        );
        RAISE NOTICE 'Empresa Matutaria criada com sucesso!';
    ELSE
        RAISE NOTICE 'Empresa Matutaria já existe!';
    END IF;

    -- Criar entregador se não existir
    IF NOT EXISTS(SELECT 1 FROM entregadores WHERE profile_id = entregador_id) THEN
        INSERT INTO entregadores (
            id, profile_id, nome, cpf, endereco, contato, veiculo, status
        ) VALUES (
            gen_random_uuid(), entregador_id, 'João Entregador Sobral', '123.456.789-00',
            '{"rua": "Rua dos Entregadores, 456", "bairro": "Dom Expedito", "cidade": "Sobral", "estado": "CE"}',
            '{"telefone": "(88) 98888-8888", "email": "appmasterbase44@gmail.com"}',
            '{"tipo": "moto", "marca": "Honda", "modelo": "CG 160", "placa": "ABC-1234"}',
            'aprovado'
        );
        RAISE NOTICE 'Entregador criado com sucesso!';
    ELSE
        RAISE NOTICE 'Entregador já existe!';
    END IF;

    -- Criar consumidor se não existir
    IF NOT EXISTS(SELECT 1 FROM consumidores WHERE profile_id = consumidor_id) THEN
        INSERT INTO consumidores (
            id, profile_id, nome, cpf, endereco, contato
        ) VALUES (
            gen_random_uuid(), consumidor_id, 'Cliente Matutaria', '987.654.321-00',
            '{"rua": "Rua dos Consumidores, 789", "bairro": "Centro", "cidade": "Sobral", "estado": "CE"}',
            '{"telefone": "(88) 97777-7777", "email": "matutaria@gmail.com"}'
        );
        RAISE NOTICE 'Consumidor criado com sucesso!';
    ELSE
        RAISE NOTICE 'Consumidor já existe!';
    END IF;

    -- Criar produtos se não existirem
    IF NOT EXISTS(SELECT 1 FROM produtos WHERE empresa_id IN (SELECT id FROM empresas WHERE nome = 'Matutaria Delivery')) THEN
        INSERT INTO produtos (empresa_id, nome, descricao, preco, categoria, disponivel, tempo_preparacao)
        SELECT 
            e.id, 'Hambúrguer Artesanal', 'Hambúrguer com carne bovina, queijo e salada', 25.90, 'Lanches', true, 20
        FROM empresas e WHERE e.nome = 'Matutaria Delivery';

        INSERT INTO produtos (empresa_id, nome, descricao, preco, categoria, disponivel, tempo_preparacao)
        SELECT 
            e.id, 'Pizza Margherita', 'Pizza com molho de tomate e mussarela', 35.00, 'Pizzas', true, 30
        FROM empresas e WHERE e.nome = 'Matutaria Delivery';

        INSERT INTO produtos (empresa_id, nome, descricao, preco, categoria, disponivel, tempo_preparacao)
        SELECT 
            e.id, 'Coca-Cola Lata', 'Refrigerante Coca-Cola 350ml', 5.00, 'Bebidas', true, 2
        FROM empresas e WHERE e.nome = 'Matutaria Delivery';

        INSERT INTO produtos (empresa_id, nome, descricao, preco, categoria, disponivel, tempo_preparacao)
        SELECT 
            e.id, 'Batata Frita', 'Porção de batata frita crocante', 12.00, 'Acompanhamentos', true, 15
        FROM empresas e WHERE e.nome = 'Matutaria Delivery';

        INSERT INTO produtos (empresa_id, nome, descricao, preco, categoria, disponivel, tempo_preparacao)
        SELECT 
            e.id, 'Pudim de Leite', 'Pudim de leite condensado', 8.00, 'Sobremesas', true, 5
        FROM empresas e WHERE e.nome = 'Matutaria Delivery';

        RAISE NOTICE 'Produtos criados com sucesso!';
    ELSE
        RAISE NOTICE 'Produtos já existem!';
    END IF;

END $$;

-- =====================================================
-- PASSO 2: VERIFICAR RESULTADOS
-- =====================================================

-- Verificar usuários criados
SELECT 'USUÁRIOS CRIADOS:' as info;
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

-- Verificar produtos criados
SELECT 'PRODUTOS CRIADOS:' as info;
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

✅ Sistema 100% funcional!
' as credenciais;