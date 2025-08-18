-- CRIAR USUÁRIO DE EMPRESA BÁSICO - SÓ O ESSENCIAL
-- Execute este script no Supabase SQL Editor

-- Email: produtojssuporte@gmail.com
-- Senha: tenderbr0
-- Role: empresa

-- 1. Limpar usuário existente
DELETE FROM auth.users WHERE email = 'produtojssuporte@gmail.com';

-- 2. Criar usuário básico na tabela auth.users
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
    'produtojssuporte@gmail.com',
    crypt('tenderbr0', gen_salt('bf')),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"role": "empresa"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
);

-- 3. Verificar se o usuário foi criado
SELECT 
    'USUARIO_CRIADO_COM_SUCESSO' as status,
    id,
    email,
    email_confirmed_at IS NOT NULL as email_confirmado,
    raw_user_meta_data->>'role' as role_definida,
    created_at
FROM auth.users 
WHERE email = 'produtojssuporte@gmail.com';

-- 4. Mostrar todos os usuários
SELECT 
    'LISTA_USUARIOS' as tipo,
    email,
    raw_user_meta_data->>'role' as role,
    email_confirmed_at IS NOT NULL as confirmado
FROM auth.users 
ORDER BY created_at DESC
LIMIT 5;