-- CORRIGIR ROLE DO USUÁRIO ENTREGADOR
-- Execute este script no Supabase SQL Editor

-- Email: appmasterbase44@gmail.com
-- Senha: tenderbr0
-- Role CORRETA: entregador (estava como consumidor)

-- 1. Verificar situação atual do usuário
SELECT 
    'SITUACAO_ATUAL_ENTREGADOR' as status,
    au.id,
    au.email,
    au.raw_user_meta_data->>'role' as role_meta,
    p.role as profile_role,
    ur.role as user_role_role
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
LEFT JOIN user_roles ur ON au.id = ur.user_id
WHERE au.email = 'appmasterbase44@gmail.com';

-- 2. Corrigir role no auth.users (raw_user_meta_data)
UPDATE auth.users 
SET raw_user_meta_data = '{"role": "entregador"}'
WHERE email = 'appmasterbase44@gmail.com';

-- 3. Corrigir role na tabela profiles
DO $$
DECLARE
    user_uuid UUID;
BEGIN
    -- Pegar o ID do usuário
    SELECT id INTO user_uuid FROM auth.users WHERE email = 'appmasterbase44@gmail.com';
    
    -- Verificar se a tabela profiles existe
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
        RAISE NOTICE 'Tabela profiles existe - corrigindo role para entregador';
        
        -- Atualizar ou inserir profile com role entregador
        INSERT INTO profiles (id, role) 
        VALUES (user_uuid, 'entregador')
        ON CONFLICT (id) 
        DO UPDATE SET role = 'entregador';
        
        RAISE NOTICE 'Profile corrigido para entregador';
        
    ELSE
        RAISE NOTICE 'Tabela profiles NÃO existe';
    END IF;
    
    -- Verificar se a tabela user_roles existe
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_roles') THEN
        RAISE NOTICE 'Tabela user_roles existe - corrigindo role para entregador';
        
        -- Atualizar ou inserir user_role
        INSERT INTO user_roles (user_id, role) 
        VALUES (user_uuid, 'entregador')
        ON CONFLICT (user_id) 
        DO UPDATE SET role = 'entregador';
        
        RAISE NOTICE 'User_role corrigido para entregador';
        
    ELSE
        RAISE NOTICE 'Tabela user_roles NÃO existe';
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Erro: %', SQLERRM;
END $$;

-- 4. Verificar se a correção funcionou
SELECT 
    'RESULTADO_APOS_CORRECAO' as status,
    au.id,
    au.email,
    au.raw_user_meta_data->>'role' as role_meta,
    p.role as profile_role,
    ur.role as user_role_role
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
LEFT JOIN user_roles ur ON au.id = ur.user_id
WHERE au.email = 'appmasterbase44@gmail.com';

-- 5. Mostrar todos os usuários por role para confirmação
SELECT 
    'USUARIOS_POR_ROLE' as info,
    CASE 
        WHEN p.role IS NOT NULL THEN p.role::text
        WHEN ur.role IS NOT NULL THEN ur.role::text
        ELSE au.raw_user_meta_data->>'role'
    END as role_final,
    au.email,
    au.email_confirmed_at IS NOT NULL as confirmado
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
LEFT JOIN user_roles ur ON au.id = ur.user_id
ORDER BY role_final, au.email;

-- 6. Verificar especificamente os entregadores
SELECT 
    'ENTREGADORES_CADASTRADOS' as tipo,
    au.email,
    p.role as profile_role,
    ur.role as user_role_role,
    au.raw_user_meta_data->>'role' as meta_role
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
LEFT JOIN user_roles ur ON au.id = ur.user_id
WHERE p.role = 'entregador' 
   OR ur.role = 'entregador' 
   OR au.raw_user_meta_data->>'role' = 'entregador';