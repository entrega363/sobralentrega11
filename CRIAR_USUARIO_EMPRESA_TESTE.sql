-- CRIAR USUÁRIO DE EMPRESA PARA TESTE
-- Execute este script no Supabase SQL Editor

-- Email: produtojssuporte@gmail.com
-- Senha: tenderbr0
-- Role: empresa

-- 1. Criar usuário na tabela auth.users
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
) ON CONFLICT (email) DO UPDATE SET
    encrypted_password = crypt('tenderbr0', gen_salt('bf')),
    email_confirmed_at = NOW(),
    updated_at = NOW();

-- 2. Criar profile para o usuário
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
) ON CONFLICT (id) DO UPDATE SET
    role = 'empresa',
    status_disponibilidade = 'ativo',
    updated_at = NOW();

-- 3. Criar entrada na tabela user_roles (se existir)
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
) ON CONFLICT (user_id) DO UPDATE SET
    role = 'empresa',
    updated_at = NOW();

-- 4. Criar dados da empresa na tabela empresas (se existir)
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
) ON CONFLICT (user_id) DO UPDATE SET
    nome = 'Produto JS Suporte',
    email = 'produtojssuporte@gmail.com',
    telefone = '(85) 99999-9999',
    endereco = 'Rua Teste, 123 - Centro, Sobral - CE',
    updated_at = NOW();

-- 5. Verificar se o usuário foi criado corretamente
SELECT 
    'USUARIO_EMPRESA_CRIADO' as status,
    au.id,
    au.email,
    au.email_confirmed_at IS NOT NULL as email_confirmado,
    p.role as profile_role,
    p.status_disponibilidade,
    ur.role as user_role,
    e.nome as nome_empresa,
    e.status as status_empresa
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
LEFT JOIN user_roles ur ON au.id = ur.user_id
LEFT JOIN empresas e ON au.id = e.user_id
WHERE au.email = 'produtojssuporte@gmail.com';

-- 6. Listar todos os usuários para confirmação
SELECT 
    'TODOS_USUARIOS' as status,
    au.email,
    p.role,
    au.email_confirmed_at IS NOT NULL as confirmado
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
ORDER BY au.created_at DESC;