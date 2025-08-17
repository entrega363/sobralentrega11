-- Script para corrigir o login do administrador
-- Execute este script no Supabase SQL Editor

-- 1. Primeiro, vamos verificar se o usuário existe
DO $$
DECLARE
    admin_user_id UUID;
    user_exists BOOLEAN := FALSE;
BEGIN
    -- Verificar se o usuário já existe
    SELECT id INTO admin_user_id 
    FROM auth.users 
    WHERE email = 'entregasobral@gmail.com';
    
    IF admin_user_id IS NOT NULL THEN
        user_exists := TRUE;
        RAISE NOTICE 'Usuário encontrado com ID: %', admin_user_id;
    ELSE
        RAISE NOTICE 'Usuário não encontrado, será criado';
    END IF;
    
    -- Se o usuário não existe, criar
    IF NOT user_exists THEN
        -- Inserir na tabela auth.users
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
            'entregasobral@gmail.com',
            crypt('tenderbr0', gen_salt('bf')),
            NOW(),
            NOW(),
            NOW(),
            '{"provider": "email", "providers": ["email"]}',
            '{"role": "admin"}',
            NOW(),
            NOW(),
            '',
            '',
            '',
            ''
        );
        
        -- Pegar o ID do usuário recém-criado
        SELECT id INTO admin_user_id 
        FROM auth.users 
        WHERE email = 'entregasobral@gmail.com';
        
        RAISE NOTICE 'Usuário criado com ID: %', admin_user_id;
    END IF;
    
    -- Garantir que existe na tabela user_roles
    INSERT INTO user_roles (user_id, role, created_at, updated_at)
    VALUES (admin_user_id, 'admin', NOW(), NOW())
    ON CONFLICT (user_id) DO UPDATE SET
        role = 'admin',
        updated_at = NOW();
    
    -- Garantir que existe na tabela admins
    INSERT INTO admins (
        user_id,
        nome,
        email,
        telefone,
        created_at,
        updated_at
    ) VALUES (
        admin_user_id,
        'Administrador Sistema',
        'entregasobral@gmail.com',
        '(88) 99999-9999',
        NOW(),
        NOW()
    ) ON CONFLICT (user_id) DO UPDATE SET
        nome = 'Administrador Sistema',
        email = 'entregasobral@gmail.com',
        telefone = '(88) 99999-9999',
        updated_at = NOW();
    
    -- Atualizar metadados do usuário
    UPDATE auth.users 
    SET 
        raw_user_meta_data = '{"role": "admin"}',
        user_metadata = '{"role": "admin"}',
        email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
        updated_at = NOW()
    WHERE id = admin_user_id;
    
    RAISE NOTICE 'Usuário admin configurado com sucesso!';
    
END $$;

-- 2. Verificar se tudo foi criado corretamente
SELECT 
    'Verificação Final' as status,
    au.email,
    ur.role,
    a.nome,
    au.email_confirmed_at IS NOT NULL as email_confirmado,
    au.raw_user_meta_data,
    au.user_metadata
FROM auth.users au
LEFT JOIN user_roles ur ON au.id = ur.user_id
LEFT JOIN admins a ON au.id = a.user_id
WHERE au.email = 'entregasobral@gmail.com';

-- 3. Garantir que as políticas RLS estão corretas
-- Recriar políticas para admins se necessário
DROP POLICY IF EXISTS "Admins can view all data" ON user_roles;
CREATE POLICY "Admins can view all data" ON user_roles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- 4. Atualizar função handle_new_user para garantir que funciona
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_role TEXT;
BEGIN
    -- Extrair role dos metadados
    user_role := COALESCE(
        NEW.raw_user_meta_data->>'role',
        NEW.user_metadata->>'role',
        'consumidor'
    );
    
    -- Inserir na tabela user_roles
    INSERT INTO user_roles (user_id, role)
    VALUES (NEW.id, user_role)
    ON CONFLICT (user_id) DO UPDATE SET
        role = user_role,
        updated_at = NOW();
    
    -- Criar perfil baseado no role
    CASE user_role
        WHEN 'admin' THEN
            INSERT INTO admins (user_id, nome, email)
            VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'nome', 'Admin'), NEW.email)
            ON CONFLICT (user_id) DO NOTHING;
        WHEN 'empresa' THEN
            INSERT INTO empresas (user_id, nome, email)
            VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'nome', 'Empresa'), NEW.email)
            ON CONFLICT (user_id) DO NOTHING;
        WHEN 'entregador' THEN
            INSERT INTO entregadores (user_id, nome, email)
            VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'nome', 'Entregador'), NEW.email)
            ON CONFLICT (user_id) DO NOTHING;
        ELSE
            INSERT INTO consumidores (user_id, nome, email)
            VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'nome', 'Consumidor'), NEW.email)
            ON CONFLICT (user_id) DO NOTHING;
    END CASE;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recriar o trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

RAISE NOTICE 'Script executado com sucesso! Tente fazer login agora.';