-- Script para corrigir problemas de autenticação da empresa
-- Execute no Supabase SQL Editor

-- 1. Verificar usuários existentes
SELECT 
    u.id,
    u.email,
    u.email_confirmed_at,
    u.raw_user_meta_data,
    p.role,
    p.nome,
    p.empresa_id,
    e.nome as empresa_nome
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
LEFT JOIN empresas e ON p.empresa_id = e.id
WHERE u.email = 'matutaria@gmail.com';

-- 2. Se o usuário existe mas não tem perfil correto, vamos corrigir
DO $$
DECLARE
    user_record RECORD;
    empresa_id_var UUID;
BEGIN
    -- Buscar o usuário
    SELECT u.id, u.email, u.email_confirmed_at 
    INTO user_record 
    FROM auth.users u 
    WHERE u.email = 'matutaria@gmail.com';
    
    IF user_record.id IS NOT NULL THEN
        RAISE NOTICE 'Usuário encontrado: %', user_record.email;
        
        -- Garantir que o email está confirmado
        UPDATE auth.users 
        SET email_confirmed_at = COALESCE(email_confirmed_at, NOW())
        WHERE id = user_record.id;
        
        -- Criar/atualizar perfil
        INSERT INTO profiles (
            id, email, nome, telefone, role, ativo, created_at, updated_at
        ) VALUES (
            user_record.id,
            user_record.email,
            'Matutaria Delivery',
            '(85) 99999-9999',
            'empresa',
            true,
            NOW(),
            NOW()
        ) ON CONFLICT (id) DO UPDATE SET
            email = EXCLUDED.email,
            nome = EXCLUDED.nome,
            telefone = EXCLUDED.telefone,
            role = 'empresa',
            ativo = true,
            updated_at = NOW();
        
        -- Criar/atualizar empresa
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
        ) VALUES (
            gen_random_uuid(),
            user_record.id,
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
        ) ON CONFLICT (user_id) DO UPDATE SET
            nome = EXCLUDED.nome,
            telefone = EXCLUDED.telefone,
            endereco = EXCLUDED.endereco,
            cidade = EXCLUDED.cidade,
            estado = EXCLUDED.estado,
            cep = EXCLUDED.cep,
            descricao = EXCLUDED.descricao,
            ativo = true,
            updated_at = NOW()
        RETURNING id INTO empresa_id_var;
        
        -- Atualizar perfil com empresa_id
        UPDATE profiles 
        SET empresa_id = (
            SELECT id FROM empresas WHERE user_id = user_record.id LIMIT 1
        ),
        updated_at = NOW()
        WHERE id = user_record.id;
        
        RAISE NOTICE 'Perfil de empresa configurado com sucesso!';
        
    ELSE
        RAISE NOTICE 'Usuário não encontrado. Você precisa se registrar primeiro através da interface web.';
    END IF;
END $$;

-- 3. Criar alguns produtos de exemplo se não existirem
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
WHERE e.user_id = (SELECT id FROM auth.users WHERE email = 'matutaria@gmail.com')
ON CONFLICT DO NOTHING;

-- 4. Verificar resultado final
SELECT 
    'RESULTADO FINAL:' as status,
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
WHERE u.email = 'matutaria@gmail.com';

-- 5. Mostrar instruções de login
SELECT 
    'INSTRUÇÕES DE LOGIN:' as info,
    'Email: matutaria@gmail.com' as email,
    'Senha: (use a senha que você definiu ao se registrar)' as senha,
    'Se esqueceu a senha, use a opção "Esqueceu sua senha?" na tela de login' as dica;