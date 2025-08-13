-- Script simplificado para criar empresa de teste
-- Execute no Supabase SQL Editor

-- 1. Verificar se o usuário já existe
SELECT id, email FROM auth.users WHERE email = 'matutaria@gmail.com';

-- 2. Se o usuário existe, vamos garantir que tem o perfil correto
-- Primeiro, vamos buscar o ID do usuário
DO $$
DECLARE
    user_uuid UUID;
    empresa_uuid UUID;
BEGIN
    -- Buscar o ID do usuário
    SELECT id INTO user_uuid FROM auth.users WHERE email = 'matutaria@gmail.com';
    
    IF user_uuid IS NOT NULL THEN
        -- Atualizar ou criar perfil
        INSERT INTO profiles (
            id, email, nome, telefone, role, ativo, created_at, updated_at
        ) VALUES (
            user_uuid,
            'matutaria@gmail.com',
            'Matutaria Delivery',
            '(85) 99999-9999',
            'empresa',
            true,
            NOW(),
            NOW()
        ) ON CONFLICT (id) DO UPDATE SET
            nome = EXCLUDED.nome,
            role = 'empresa',
            ativo = true,
            updated_at = NOW();

        -- Criar ou atualizar empresa
        INSERT INTO empresas (
            id, user_id, nome, cnpj, telefone, endereco, cidade, estado, cep,
            descricao, categoria, horario_funcionamento, taxa_entrega,
            tempo_entrega_min, tempo_entrega_max, ativo, created_at, updated_at
        ) VALUES (
            gen_random_uuid(),
            user_uuid,
            'Matutaria Delivery',
            '12.345.678/0001-90',
            '(85) 99999-9999',
            'Rua das Flores, 123',
            'Sobral',
            'CE',
            '62010-000',
            'Restaurante especializado em comida caseira',
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
            ativo = true,
            updated_at = NOW()
        RETURNING id INTO empresa_uuid;

        -- Atualizar perfil com empresa_id
        UPDATE profiles 
        SET empresa_id = (SELECT id FROM empresas WHERE user_id = user_uuid),
            updated_at = NOW()
        WHERE id = user_uuid;

        RAISE NOTICE 'Perfil de empresa atualizado com sucesso para: %', 'matutaria@gmail.com';
    ELSE
        RAISE NOTICE 'Usuário não encontrado: %', 'matutaria@gmail.com';
        RAISE NOTICE 'Por favor, primeiro registre-se no sistema através da interface web';
    END IF;
END $$;

-- 3. Verificar resultado
SELECT 
    u.email,
    p.nome as profile_nome,
    p.role,
    p.ativo as profile_ativo,
    e.nome as empresa_nome,
    e.ativo as empresa_ativo,
    p.empresa_id
FROM auth.users u
JOIN profiles p ON u.id = p.id
LEFT JOIN empresas e ON p.empresa_id = e.id
WHERE u.email = 'matutaria@gmail.com';