-- SCRIPT SUPER SIMPLES PARA CRIAR ADMIN
-- Execute linha por linha no Supabase SQL Editor

-- 1. Limpar dados existentes
DELETE FROM admins WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'entregasobral@gmail.com');
DELETE FROM user_roles WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'entregasobral@gmail.com');
DELETE FROM auth.users WHERE email = 'entregasobral@gmail.com';

-- 2. Criar usuário na auth.users
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

-- 3. Inserir role
INSERT INTO user_roles (user_id, role, created_at, updated_at)
SELECT id, 'admin', NOW(), NOW()
FROM auth.users 
WHERE email = 'entregasobral@gmail.com';

-- 4. Inserir perfil admin
INSERT INTO admins (user_id, nome, email, telefone, created_at, updated_at)
SELECT id, 'Administrador Sistema', 'entregasobral@gmail.com', '(88) 99999-9999', NOW(), NOW()
FROM auth.users 
WHERE email = 'entregasobral@gmail.com';

-- 5. Verificar se foi criado
SELECT 
    au.email,
    ur.role,
    a.nome,
    'SUCESSO' as status
FROM auth.users au
JOIN user_roles ur ON au.id = ur.user_id
JOIN admins a ON au.id = a.user_id
WHERE au.email = 'entregasobral@gmail.com';