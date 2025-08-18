-- CRIAR USUÁRIO DE EMPRESA PARA TESTE - VERSÃO SIMPLES
-- Execute este script no Supabase SQL Editor

-- Email: produtojssuporte@gmail.com
-- Senha: tenderbr0
-- Role: empresa

-- 1. Primeiro, vamos limpar qualquer usuário existente com este email
DELETE FROM auth.users WHERE email = 'produtojssuporte@gmail.com';

-- 2. Criar usuário na tabela auth.users
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
    'e1e1e1e1-e1e1-e1e1-e1e1-e1e1e1e1e1e1',
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

-- 3. Criar profile para o usuário (se a tabela existir)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
        INSERT INTO profiles (
            id,
            role,
            status_disponibilidade,
            created_at,
            updated_at
        ) VALUES (
            'e1e1e1e1-e1e1-e1e1-e1e1-e1e1e1e1e1e1',
            'empresa',
            'ativo',
            NOW(),
            NOW()
        );
    END IF;
END $$;

-- 4. Criar entrada na tabela user_roles (se existir)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_roles') THEN
        INSERT INTO user_roles (
            user_id,
            role,
            created_at,
            updated_at
        ) VALUES (
            'e1e1e1e1-e1e1-e1e1-e1e1-e1e1e1e1e1e1',
            'empresa',
            NOW(),
            NOW()
        );
    END IF;
END $$;

-- 5. Criar dados da empresa na tabela empresas (se existir)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'empresas') THEN
        INSERT INTO empresas (
            id,
            user_id,
            nome,
            email,
            telefone,
            endereco,
            cnpj,
            descricao,
            horario_funcionamento,
            taxa_entrega,
            tempo_entrega_min,
            tempo_entrega_max,
            status,
            created_at,
            updated_at
        ) VALUES (
            'e1e1e1e1-e1e1-e1e1-e1e1-e1e1e1e1e1e1',
            'e1e1e1e1-e1e1-e1e1-e1e1-e1e1e1e1e1e1',
            'Produto JS Suporte',
            'produtojssuporte@gmail.com',
            '(85) 99999-9999',
            'Rua Teste, 123 - Centro, Sobral - CE',
            '12.345.678/0001-90',
            'Empresa de teste para desenvolvimento',
            '{"segunda": "08:00-18:00", "terca": "08:00-18:00", "quarta": "08:00-18:00", "quinta": "08:00-18:00", "sexta": "08:00-18:00", "sabado": "08:00-14:00", "domingo": "fechado"}',
            5.00,
            30,
            60,
            'ativo',
            NOW(),
            NOW()
        );
    END IF;
END $$;

-- 6. Verificar se o usuário foi criado corretamente
SELECT 
    'USUARIO_EMPRESA_CRIADO' as status,
    au.id,
    au.email,
    au.email_confirmed_at IS NOT NULL as email_confirmado,
    au.raw_user_meta_data->>'role' as user_meta_role
FROM auth.users au
WHERE au.email = 'produtojssuporte@gmail.com';

-- 7. Verificar se existem as tabelas relacionadas e mostrar dados
DO $$
BEGIN
    -- Verificar profiles
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
        RAISE NOTICE 'Tabela profiles existe - verificando dados...';
        PERFORM * FROM profiles WHERE id = 'e1e1e1e1-e1e1-e1e1-e1e1-e1e1e1e1e1e1';
    ELSE
        RAISE NOTICE 'Tabela profiles NÃO existe';
    END IF;
    
    -- Verificar user_roles
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_roles') THEN
        RAISE NOTICE 'Tabela user_roles existe - verificando dados...';
        PERFORM * FROM user_roles WHERE user_id = 'e1e1e1e1-e1e1-e1e1-e1e1-e1e1e1e1e1e1';
    ELSE
        RAISE NOTICE 'Tabela user_roles NÃO existe';
    END IF;
    
    -- Verificar empresas
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'empresas') THEN
        RAISE NOTICE 'Tabela empresas existe - verificando dados...';
        PERFORM * FROM empresas WHERE user_id = 'e1e1e1e1-e1e1-e1e1-e1e1-e1e1e1e1e1e1';
    ELSE
        RAISE NOTICE 'Tabela empresas NÃO existe';
    END IF;
END $$;

-- 8. Listar todos os usuários para confirmação
SELECT 
    'TODOS_USUARIOS' as status,
    au.email,
    au.email_confirmed_at IS NOT NULL as confirmado,
    au.raw_user_meta_data->>'role' as role_meta
FROM auth.users au
ORDER BY au.created_at DESC
LIMIT 10;