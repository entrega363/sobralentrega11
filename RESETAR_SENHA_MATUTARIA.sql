-- Script para resetar a senha do usuário matutaria@gmail.com
-- Execute este script no Supabase SQL Editor

-- IMPORTANTE: Este script vai definir uma nova senha para o usuário
-- Nova senha será: "123456"

-- 1. Primeiro, vamos verificar se o usuário existe
DO $$
DECLARE
    user_id_var UUID;
    profile_exists BOOLEAN := FALSE;
    empresa_exists BOOLEAN := FALSE;
BEGIN
    -- Verificar se o usuário existe
    SELECT id INTO user_id_var 
    FROM auth.users 
    WHERE email = 'matutaria@gmail.com';
    
    IF user_id_var IS NULL THEN
        RAISE NOTICE 'Usuário matutaria@gmail.com não encontrado. Criando...';
        
        -- Criar usuário se não existir
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            recovery_sent_at,
            last_sign_in_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            confirmation_token,
            email_change,
            email_change_token_new,
            recovery_token
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            gen_random_uuid(),
            'authenticated',
            'authenticated',
            'matutaria@gmail.com',
            crypt('123456', gen_salt('bf')),
            NOW(),
            NOW(),
            NOW(),
            '{"provider": "email", "providers": ["email"]}',
            '{"role": "empresa"}',
            NOW(),
            NOW(),
            '',
            '',
            '',
            ''
        ) RETURNING id INTO user_id_var;
        
        RAISE NOTICE 'Usuário criado com ID: %', user_id_var;
    ELSE
        RAISE NOTICE 'Usuário encontrado com ID: %', user_id_var;
        
        -- Atualizar senha do usuário existente
        UPDATE auth.users 
        SET 
            encrypted_password = crypt('123456', gen_salt('bf')),
            email_confirmed_at = NOW(),
            updated_at = NOW(),
            raw_user_meta_data = '{"role": "empresa"}'
        WHERE id = user_id_var;
        
        RAISE NOTICE 'Senha atualizada para o usuário';
    END IF;
    
    -- Verificar se existe profile
    SELECT EXISTS(SELECT 1 FROM profiles WHERE id = user_id_var) INTO profile_exists;
    
    IF NOT profile_exists THEN
        RAISE NOTICE 'Criando profile para o usuário...';
        INSERT INTO profiles (id, role, created_at, updated_at)
        VALUES (user_id_var, 'empresa', NOW(), NOW());
        RAISE NOTICE 'Profile criado';
    ELSE
        RAISE NOTICE 'Profile já existe';
        -- Garantir que o role está correto
        UPDATE profiles SET role = 'empresa', updated_at = NOW() WHERE id = user_id_var;
    END IF;
    
    -- Verificar se existe empresa
    SELECT EXISTS(SELECT 1 FROM empresas WHERE profile_id = user_id_var) INTO empresa_exists;
    
    IF NOT empresa_exists THEN
        RAISE NOTICE 'Criando empresa para o usuário...';
        INSERT INTO empresas (
            id,
            profile_id,
            nome,
            cnpj,
            categoria,
            status,
            endereco,
            contato,
            configuracoes,
            created_at,
            updated_at
        ) VALUES (
            '1d984249-79dc-4256-9e84-9c3a7f9a67d9',
            user_id_var,
            'Matutaria',
            '12345678000199',
            'Alimentação',
            'aprovada',
            '{"rua": "Rua Principal", "numero": "123", "bairro": "Centro", "cidade": "Sobral", "cep": "62000-000"}',
            '{"telefone": "(88) 99999-9999", "email": "matutaria@gmail.com"}',
            '{"taxa_entrega": 5.00, "tempo_entrega": 30, "horario_funcionamento": "08:00-18:00"}',
            NOW(),
            NOW()
        );
        RAISE NOTICE 'Empresa Matutaria criada';
    ELSE
        RAISE NOTICE 'Empresa já existe';
        -- Garantir que o status está aprovado
        UPDATE empresas 
        SET status = 'aprovada', updated_at = NOW() 
        WHERE profile_id = user_id_var;
    END IF;
    
    RAISE NOTICE '=== CONFIGURAÇÃO CONCLUÍDA ===';
    RAISE NOTICE 'Email: matutaria@gmail.com';
    RAISE NOTICE 'Senha: 123456';
    RAISE NOTICE 'Role: empresa';
    RAISE NOTICE 'Status: aprovada';
    
END $$;