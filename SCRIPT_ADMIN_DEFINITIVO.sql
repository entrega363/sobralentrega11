-- SCRIPT DEFINITIVO PARA CRIAR ADMIN
-- Execute este script no Supabase SQL Editor

-- 1. Criar tabela admins se não existir
CREATE TABLE IF NOT EXISTS admins (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Criar tabela user_roles se não existir
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'empresa', 'entregador', 'consumidor')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Limpar dados existentes do usuário admin
DELETE FROM admins WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'entregasobral@gmail.com');
DELETE FROM user_roles WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'entregasobral@gmail.com');
DELETE FROM auth.users WHERE email = 'entregasobral@gmail.com';

-- 4. Criar usuário admin na auth.users
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
    gen_random_uuid(),
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

-- 5. Inserir role do admin
INSERT INTO user_roles (user_id, role, created_at, updated_at)
SELECT id, 'admin', NOW(), NOW()
FROM auth.users 
WHERE email = 'entregasobral@gmail.com';

-- 6. Inserir perfil admin
INSERT INTO admins (user_id, nome, email, telefone, created_at, updated_at)
SELECT id, 'Administrador Sistema', 'entregasobral@gmail.com', '(88) 99999-9999', NOW(), NOW()
FROM auth.users 
WHERE email = 'entregasobral@gmail.com';

-- 7. Verificar se existe tabela profiles, se não, criar
DO $$
BEGIN
    -- Verificar se profiles é uma tabela
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'profiles') THEN
        -- Se é tabela, inserir/atualizar o registro
        INSERT INTO profiles (id, email, role, nome, telefone, created_at, updated_at)
        SELECT 
            au.id, 
            au.email, 
            'admin', 
            'Administrador Sistema', 
            '(88) 99999-9999', 
            NOW(), 
            NOW()
        FROM auth.users au 
        WHERE au.email = 'entregasobral@gmail.com'
        ON CONFLICT (id) DO UPDATE SET
            role = 'admin',
            nome = 'Administrador Sistema',
            telefone = '(88) 99999-9999',
            updated_at = NOW();
    ELSE
        -- Se não existe, criar como view
        CREATE VIEW profiles AS
        SELECT 
            au.id,
            au.email,
            au.created_at,
            au.updated_at,
            COALESCE(ur.role, 'consumidor') as role,
            COALESCE(a.nome, 'Usuario') as nome,
            COALESCE(a.telefone, NULL) as telefone
        FROM auth.users au
        LEFT JOIN user_roles ur ON au.id = ur.user_id
        LEFT JOIN admins a ON au.id = a.user_id AND ur.role = 'admin';
    END IF;
END $$;

-- 8. Habilitar RLS nas tabelas
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- 9. Criar políticas RLS básicas
DROP POLICY IF EXISTS "Users can view their own role" ON user_roles;
CREATE POLICY "Users can view their own role" ON user_roles
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all roles" ON user_roles;
CREATE POLICY "Admins can view all roles" ON user_roles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Users can view their own admin profile" ON admins;
CREATE POLICY "Users can view their own admin profile" ON admins
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all admin profiles" ON admins;
CREATE POLICY "Admins can view all admin profiles" ON admins
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- 10. Verificar se tudo foi criado corretamente
SELECT 
    'ADMIN_CRIADO_COM_SUCESSO' as status,
    au.id,
    au.email,
    ur.role,
    a.nome,
    au.email_confirmed_at IS NOT NULL as email_confirmado
FROM auth.users au
JOIN user_roles ur ON au.id = ur.user_id
JOIN admins a ON au.id = a.user_id
WHERE au.email = 'entregasobral@gmail.com';