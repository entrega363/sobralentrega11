-- CORRIGIR ROLE DO USUÁRIO EMPRESA - VERSÃO SIMPLES
-- Execute este script no Supabase SQL Editor

-- 1. Verificar o usuário atual
SELECT 
    'USUARIO_ATUAL' as status,
    id,
    email,
    raw_user_meta_data->>'role' as role_meta
FROM auth.users 
WHERE email = 'produtojssuporte@gmail.com';

-- 2. Verificar se existe constraint na tabela profiles
SELECT 
    'CONSTRAINTS_PROFILES' as info,
    constraint_name,
    constraint_type,
    check_clause
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.check_constraints cc ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'profiles' AND tc.constraint_type = 'CHECK';

-- 3. Verificar valores únicos na coluna status_disponibilidade
SELECT 
    'VALORES_STATUS_DISPONIBILIDADE' as info,
    status_disponibilidade,
    COUNT(*) as quantidade
FROM profiles 
GROUP BY status_disponibilidade;

-- 4. Verificar valores únicos na coluna role
SELECT 
    'VALORES_ROLE' as info,
    role,
    COUNT(*) as quantidade
FROM profiles 
GROUP BY role;

-- 5. Tentar criar profile com valores mais simples
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
            RAISE NOTICE 'Profile já existe - tentando atualizar apenas a role...';
            -- Atualizar apenas a role
            UPDATE profiles 
            SET role = 'empresa',
                updated_at = NOW()
            WHERE id = user_uuid;
        ELSE
            RAISE NOTICE 'Profile não existe - criando com valores mínimos...';
            -- Criar novo profile apenas com campos obrigatórios
            INSERT INTO profiles (
                id,
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
        RAISE NOTICE 'Tabela profiles NÃO existe';
    END IF;
END $$;

-- 6. Verificar o resultado
SELECT 
    'RESULTADO_FINAL' as status,
    au.id,
    au.email,
    au.raw_user_meta_data->>'role' as role_meta,
    p.role as profile_role,
    p.status_disponibilidade
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE au.email = 'produtojssuporte@gmail.com';