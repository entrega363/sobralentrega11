-- Script DEFINITIVO para corrigir o login do matutaria@gmail.com
-- Execute este script no Supabase SQL Editor

-- PASSO 1: Deletar dados existentes (se houver problemas)
DELETE FROM empresas WHERE profile_id IN (
    SELECT id FROM profiles WHERE id IN (
        SELECT id FROM auth.users WHERE email = 'matutaria@gmail.com'
    )
);

DELETE FROM profiles WHERE id IN (
    SELECT id FROM auth.users WHERE email = 'matutaria@gmail.com'
);

DELETE FROM auth.users WHERE email = 'matutaria@gmail.com';

-- PASSO 2: Criar usuário do zero
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
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
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'authenticated',
    'authenticated',
    'matutaria@gmail.com',
    crypt('123456', gen_salt('bf')),
    NOW(),
    NOW(),
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

-- PASSO 3: Criar profile
INSERT INTO profiles (
    id,
    role,
    created_at,
    updated_at
) VALUES (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'empresa',
    NOW(),
    NOW()
);

-- PASSO 4: Criar empresa
INSERT INTO empresas (
    id,
    profile_id,
    nome,
    cnpj,
    categoria,
    status,
    endereco,
    contato,
    configuracoes,
    created_at,
    updated_at
) VALUES (
    '1d984249-79dc-4256-9e84-9c3a7f9a67d9',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'Matutaria',
    '12345678000199',
    'Alimentação',
    'aprovada',
    '{"rua": "Rua Principal", "numero": "123", "bairro": "Centro", "cidade": "Sobral", "cep": "62000-000"}',
    '{"telefone": "(88) 99999-9999", "email": "matutaria@gmail.com"}',
    '{"taxa_entrega": 5.00, "tempo_entrega": 30, "horario_funcionamento": "08:00-18:00"}',
    NOW(),
    NOW()
);

-- PASSO 5: Verificar se tudo foi criado corretamente
SELECT 
    'USUÁRIO CRIADO' as status,
    u.id as user_id,
    u.email,
    u.email_confirmed_at,
    p.role,
    e.id as empresa_id,
    e.nome as empresa_nome,
    e.status as empresa_status
FROM auth.users u
JOIN profiles p ON p.id = u.id
JOIN empresas e ON e.profile_id = p.id
WHERE u.email = 'matutaria@gmail.com';

-- Mensagem final
SELECT 
    '=== LOGIN CONFIGURADO ===' as resultado,
    'Email: matutaria@gmail.com' as email,
    'Senha: 123456' as senha,
    'Role: empresa' as role,
    'Status: aprovada' as status;