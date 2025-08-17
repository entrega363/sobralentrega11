-- CORRIGIR PROBLEMA DA TABELA USER_ROLES
-- Execute este script no Supabase SQL Editor

-- 1. Primeiro, vamos criar a tabela user_roles se ela não existir
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'empresa', 'entregador', 'consumidor')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Verificar se a tabela foi criada
SELECT 'TABELA_USER_ROLES_CRIADA' as status, 
       COUNT(*) as total_registros 
FROM user_roles;

-- 3. Agora vamos inserir o role do admin se ele existir
INSERT INTO user_roles (user_id, role, created_at, updated_at)
SELECT id, 'admin', NOW(), NOW()
FROM auth.users 
WHERE email = 'entregasobral@gmail.com'
AND NOT EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.users.id
);

-- 4. Verificar se o admin foi inserido corretamente
SELECT 
    'ADMIN_ROLE_VERIFICADO' as status,
    au.id,
    au.email,
    ur.role,
    au.email_confirmed_at IS NOT NULL as email_confirmado
FROM auth.users au
LEFT JOIN user_roles ur ON au.id = ur.user_id
WHERE au.email = 'entregasobral@gmail.com';

-- 5. Se não existir o usuário admin, vamos criá-lo completo
DO $$
BEGIN
    -- Verificar se o usuário admin existe
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'entregasobral@gmail.com') THEN
        -- Criar usuário admin
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
            updated_at
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            'b5b5b5b5-b5b5-b5b5-b5b5-b5b5b5b5b5b5',
            'authenticated',
            'authenticated',
            'entregasobral@gmail.com',
            crypt('tenderbr0', gen_salt('bf')),
            NOW(),
            '{"provider": "email", "providers": ["email"]}',
            '{"role": "admin"}',
            NOW(),
            NOW()
        );
        
        -- Inserir role
        INSERT INTO user_roles (user_id, role)
        VALUES ('b5b5b5b5-b5b5-b5b5-b5b5-b5b5b5b5b5b5', 'admin');
        
        -- Inserir profile
        INSERT INTO profiles (id, role, status_disponibilidade)
        VALUES ('b5b5b5b5-b5b5-b5b5-b5b5-b5b5b5b5b5b5', 'admin', 'disponivel_sistema');
        
        RAISE NOTICE 'Admin criado com sucesso!';
    ELSE
        RAISE NOTICE 'Admin já existe!';
    END IF;
END $$;

-- 6. Verificação final
SELECT 
    'VERIFICACAO_FINAL' as status,
    au.id,
    au.email,
    ur.role,
    p.status_disponibilidade,
    au.email_confirmed_at IS NOT NULL as email_confirmado
FROM auth.users au
LEFT JOIN user_roles ur ON au.id = ur.user_id
LEFT JOIN profiles p ON au.id = p.id
WHERE au.email = 'entregasobral@gmail.com';