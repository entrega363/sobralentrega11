-- CORRIGIR ROLE DO USUÁRIO EMPRESA
-- Execute este script no Supabase SQL Editor

-- 1. Primeiro, vamos ver o ID do usuário criado
SELECT 
    'USUARIO_ATUAL' as status,
    id,
    email,
    raw_user_meta_data->>'role' as role_meta
FROM auth.users 
WHERE email = 'produtojssuporte@gmail.com';

-- 2. Verificar se existe tabela profiles e seus dados
DO $$
DECLARE
    user_uuid UUID;
BEGIN
    -- Pegar o ID do usuário
    SELECT id INTO user_uuid FROM auth.users WHERE email = 'produtojssuporte@gmail.com';
    
    -- Verificar se a tabela profiles existe
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
        RAISE NOTICE 'Tabela profiles existe';
        
        -- Verificar se já existe um profile para este usuário
        IF EXISTS (SELECT 1 FROM profiles WHERE id = user_uuid) THEN
            RAISE NOTICE 'Profile já existe - atualizando...';
            -- Atualizar o profile existente
            UPDATE profiles 
            SET role = 'empresa', 
                status_disponibilidade = 'ativo',
                updated_at = NOW()
            WHERE id = user_uuid;
        ELSE
            RAISE NOTICE 'Profile não existe - criando...';
            -- Criar novo profile
            INSERT INTO profiles (
                id,
                role,
                status_disponibilidade,
                created_at,
                updated_at
            ) VALUES (
                user_uuid,
                'empresa',
                'ativo',
                NOW(),
                NOW()
            );
        END IF;
    ELSE
        RAISE NOTICE 'Tabela profiles NÃO existe';
    END IF;
    
    -- Verificar se a tabela user_roles existe
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_roles') THEN
        RAISE NOTICE 'Tabela user_roles existe';
        
        -- Verificar se já existe um user_role para este usuário
        IF EXISTS (SELECT 1 FROM user_roles WHERE user_id = user_uuid) THEN
            RAISE NOTICE 'User_role já existe - atualizando...';
            -- Atualizar o user_role existente
            UPDATE user_roles 
            SET role = 'empresa',
                updated_at = NOW()
            WHERE user_id = user_uuid;
        ELSE
            RAISE NOTICE 'User_role não existe - criando...';
            -- Criar novo user_role
            INSERT INTO user_roles (
                user_id,
                role,
                created_at,
                updated_at
            ) VALUES (
                user_uuid,
                'empresa',
                NOW(),
                NOW()
            );
        END IF;
    ELSE
        RAISE NOTICE 'Tabela user_roles NÃO existe';
    END IF;
END $$;

-- 3. Verificar o resultado final
SELECT 
    'VERIFICACAO_FINAL' as status,
    au.id,
    au.email,
    au.raw_user_meta_data->>'role' as role_meta,
    p.role as profile_role,
    ur.role as user_role_role
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
LEFT JOIN user_roles ur ON au.id = ur.user_id
WHERE au.email = 'produtojssuporte@gmail.com';

-- 4. Mostrar estrutura das tabelas para debug
SELECT 
    'ESTRUTURA_PROFILES' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

SELECT 
    'ESTRUTURA_USER_ROLES' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_roles'
ORDER BY ordinal_position;