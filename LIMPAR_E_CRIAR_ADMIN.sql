-- SCRIPT PARA LIMPAR E CRIAR ADMIN
-- Execute este script no Supabase SQL Editor

-- 1. FORÇAR LIMPEZA COMPLETA (desabilitar RLS temporariamente se necessário)
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE admins DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles DISABLE ROW LEVEL SECURITY;

-- 2. Limpar TODOS os dados relacionados ao email (forçado)
DELETE FROM profiles WHERE id IN (SELECT id FROM auth.users WHERE email = 'entregasobral@gmail.com');
DELETE FROM admins WHERE email = 'entregasobral@gmail.com';
DELETE FROM user_roles WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'entregasobral@gmail.com');

-- 3. Limpar da auth.users por último
DELETE FROM auth.users WHERE email = 'entregasobral@gmail.com';

-- 4. Criar tabelas se não existirem
CREATE TABLE IF NOT EXISTS admins (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'empresa', 'entregador', 'consumidor')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Criar usuário admin na auth.users
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

-- 6. Pegar o ID do usuário criado
DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    SELECT id INTO admin_user_id FROM auth.users WHERE email = 'entregasobral@gmail.com';
    
    -- Inserir na user_roles
    INSERT INTO user_roles (user_id, role, created_at, updated_at)
    VALUES (admin_user_id, 'admin', NOW(), NOW());
    
    -- Inserir na admins
    INSERT INTO admins (user_id, nome, email, telefone, created_at, updated_at)
    VALUES (admin_user_id, 'Administrador Sistema', 'entregasobral@gmail.com', '(88) 99999-9999', NOW(), NOW());
    
    -- Inserir na profiles
    INSERT INTO profiles (id, role, status_disponibilidade, created_at, updated_at)
    VALUES (admin_user_id, 'admin', 'disponivel_sistema', NOW(), NOW());
    
END $$;

-- 7. Reabilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- 8. Criar políticas básicas
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

-- 9. Verificar se tudo foi criado
SELECT 
    'ADMIN_CRIADO_COM_SUCESSO' as status,
    au.id,
    au.email,
    ur.role,
    a.nome,
    p.status_disponibilidade,
    au.email_confirmed_at IS NOT NULL as email_confirmado
FROM auth.users au
JOIN user_roles ur ON au.id = ur.user_id
JOIN admins a ON au.id = a.user_id
JOIN profiles p ON au.id = p.id
WHERE au.email = 'entregasobral@gmail.com';