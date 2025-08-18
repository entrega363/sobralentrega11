-- CORRIGIR ROLE DO USUÁRIO EMPRESA - VERSÃO FINAL
-- Execute este script no Supabase SQL Editor

-- 1. Verificar o usuário atual
SELECT 
    'USUARIO_ATUAL' as status,
    id,
    email,
    raw_user_meta_data->>'role' as role_meta
FROM auth.users 
WHERE email = 'produtojssuporte@gmail.com';

-- 2. Tentar criar profile com valores básicos
DO $$
DECLARE
    user_uuid UUID;
BEGIN
    -- Pegar o ID do usuário
    SELECT id INTO user_uuid FROM auth.users WHERE email = 'produtojssuporte@gmail.com';
    
    -- Verificar se a tabela profiles existe
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
        RAISE NOTICE 'Tabela profiles existe';
        
        -- Tentar deletar profile existente primeiro
        DELETE FROM profiles WHERE id = user_uuid;
        RAISE NOTICE 'Profile anterior removido (se existia)';
        
        -- Criar novo profile apenas com role
        INSERT INTO profiles (id, role) VALUES (user_uuid, 'empresa');
        RAISE NOTICE 'Profile criado com role empresa';
        
    ELSE
        RAISE NOTICE 'Tabela profiles NÃO existe';
    END IF;
    
    -- Verificar se a tabela user_roles existe
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_roles') THEN
        RAISE NOTICE 'Tabela user_roles existe';
        
        -- Tentar deletar user_role existente primeiro
        DELETE FROM user_roles WHERE user_id = user_uuid;
        RAISE NOTICE 'User_role anterior removido (se existia)';
        
        -- Criar novo user_role
        INSERT INTO user_roles (user_id, role) VALUES (user_uuid, 'empresa');
        RAISE NOTICE 'User_role criado com role empresa';
        
    ELSE
        RAISE NOTICE 'Tabela user_roles NÃO existe';
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Erro: %', SQLERRM;
END $$;

-- 3. Verificar o resultado final
SELECT 
    'RESULTADO_FINAL' as status,
    au.id,
    au.email,
    au.raw_user_meta_data->>'role' as role_meta,
    p.role as profile_role,
    ur.role as user_role_role
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
LEFT JOIN user_roles ur ON au.id = ur.user_id
WHERE au.email = 'produtojssuporte@gmail.com';

-- 4. Mostrar todos os profiles existentes para comparação
SELECT 
    'PROFILES_EXISTENTES' as info,
    role,
    COUNT(*) as quantidade
FROM profiles 
GROUP BY role
ORDER BY role;