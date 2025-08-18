-- CRIAR USUÁRIO ENTREGADOR PARA TESTE
-- Execute este script no Supabase SQL Editor

-- Email: appmasterbase44@gmail.com
-- Senha: tenderbr0
-- Role: entregador

-- 1. Limpar usuário existente
DELETE FROM auth.users WHERE email = 'appmasterbase44@gmail.com';

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
    'appmasterbase44@gmail.com',
    crypt('tenderbr0', gen_salt('bf')),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"role": "entregador"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
);

-- 3. Criar profile para entregador
DO $$
DECLARE
    user_uuid UUID;
BEGIN
    -- Pegar o ID do usuário
    SELECT id INTO user_uuid FROM auth.users WHERE email = 'appmasterbase44@gmail.com';
    
    -- Verificar se a tabela profiles existe
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
        RAISE NOTICE 'Tabela profiles existe - criando profile entregador';
        
        -- Criar profile com role entregador
        INSERT INTO profiles (id, role) VALUES (user_uuid, 'entregador');
        RAISE NOTICE 'Profile criado com role entregador';
        
    ELSE
        RAISE NOTICE 'Tabela profiles NÃO existe';
    END IF;
    
    -- Verificar se a tabela user_roles existe
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_roles') THEN
        RAISE NOTICE 'Tabela user_roles existe - criando user_role entregador';
        
        -- Criar user_role
        INSERT INTO user_roles (user_id, role) VALUES (user_uuid, 'entregador');
        RAISE NOTICE 'User_role criado com role entregador';
        
    ELSE
        RAISE NOTICE 'Tabela user_roles NÃO existe';
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Erro: %', SQLERRM;
END $$;

-- 4. Verificar se o usuário foi criado
SELECT 
    'USUARIO_ENTREGADOR_CRIADO' as status,
    id,
    email,
    email_confirmed_at IS NOT NULL as email_confirmado,
    raw_user_meta_data->>'role' as role_definida,
    created_at
FROM auth.users 
WHERE email = 'appmasterbase44@gmail.com';

-- 5. Verificar o resultado final com joins
SELECT 
    'RESULTADO_FINAL_ENTREGADOR' as status,
    au.id,
    au.email,
    au.raw_user_meta_data->>'role' as role_meta,
    p.role as profile_role,
    ur.role as user_role_role
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
LEFT JOIN user_roles ur ON au.id = ur.user_id
WHERE au.email = 'appmasterbase44@gmail.com';

-- 6. Mostrar todos os usuários para confirmação
SELECT 
    'TODOS_USUARIOS' as tipo,
    email,
    raw_user_meta_data->>'role' as role,
    email_confirmed_at IS NOT NULL as confirmado
FROM auth.users 
ORDER BY created_at DESC
LIMIT 5;