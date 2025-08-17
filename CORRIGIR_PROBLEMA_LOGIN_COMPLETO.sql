-- Script completo para corrigir o problema de login do administrador
-- Execute este script no Supabase SQL Editor

-- 1. Primeiro, vamos criar/atualizar a view profiles se não existir
DROP VIEW IF EXISTS profiles;
CREATE VIEW profiles AS
SELECT 
    au.id,
    au.email,
    au.created_at,
    au.updated_at,
    COALESCE(
        ur.role,
        au.raw_user_meta_data->>'role',
        au.user_metadata->>'role',
        'consumidor'
    ) as role,
    CASE 
        WHEN ur.role = 'admin' THEN a.nome
        WHEN ur.role = 'empresa' THEN e.nome
        WHEN ur.role = 'entregador' THEN ent.nome
        WHEN ur.role = 'consumidor' THEN c.nome
        ELSE 'Usuário'
    END as nome,
    CASE 
        WHEN ur.role = 'admin' THEN a.telefone
        WHEN ur.role = 'empresa' THEN e.telefone
        WHEN ur.role = 'entregador' THEN ent.telefone
        WHEN ur.role = 'consumidor' THEN c.telefone
        ELSE NULL
    END as telefone
FROM auth.users au
LEFT JOIN user_roles ur ON au.id = ur.user_id
LEFT JOIN admins a ON au.id = a.user_id AND ur.role = 'admin'
LEFT JOIN empresas e ON au.id = e.user_id AND ur.role = 'empresa'
LEFT JOIN entregadores ent ON au.id = ent.user_id AND ur.role = 'entregador'
LEFT JOIN consumidores c ON au.id = c.user_id AND ur.role = 'consumidor';

-- 2. Garantir que o usuário admin existe e está correto
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
        
        -- Criar o usuário se não existir
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
    
    -- Atualizar metadados do usuário para garantir consistência
    UPDATE auth.users 
    SET 
        raw_user_meta_data = jsonb_build_object('role', 'admin'),
        user_metadata = jsonb_build_object('role', 'admin'),
        email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
        updated_at = NOW()
    WHERE id = admin_user_id;
    
    RAISE NOTICE 'Usuário admin configurado com sucesso!';
    
END $$;

-- 3. Criar políticas RLS para a view profiles
ALTER VIEW profiles SET (security_invoker = true);

-- 4. Garantir que as políticas estão corretas
DROP POLICY IF EXISTS "Users can view their own profile" ON user_roles;
CREATE POLICY "Users can view their own profile" ON user_roles
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all profiles" ON user_roles;
CREATE POLICY "Admins can view all profiles" ON user_roles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- 5. Verificar se tudo está funcionando
SELECT 
    'Verificação Final - Usuário Admin' as status,
    p.id,
    p.email,
    p.role,
    p.nome,
    au.email_confirmed_at IS NOT NULL as email_confirmado
FROM profiles p
JOIN auth.users au ON p.id = au.id
WHERE p.email = 'entregasobral@gmail.com';

-- 6. Criar função para debug de login
CREATE OR REPLACE FUNCTION debug_user_login(user_email TEXT)
RETURNS TABLE(
    user_id UUID,
    email TEXT,
    role TEXT,
    nome TEXT,
    email_confirmed BOOLEAN,
    has_user_role BOOLEAN,
    has_profile BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        au.id as user_id,
        au.email,
        COALESCE(ur.role, 'sem_role') as role,
        COALESCE(p.nome, 'sem_nome') as nome,
        au.email_confirmed_at IS NOT NULL as email_confirmed,
        ur.user_id IS NOT NULL as has_user_role,
        p.id IS NOT NULL as has_profile
    FROM auth.users au
    LEFT JOIN user_roles ur ON au.id = ur.user_id
    LEFT JOIN profiles p ON au.id = p.id
    WHERE au.email = user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Testar a função de debug
SELECT * FROM debug_user_login('entregasobral@gmail.com');

RAISE NOTICE 'Script executado com sucesso! O usuário admin deve conseguir fazer login agora.';