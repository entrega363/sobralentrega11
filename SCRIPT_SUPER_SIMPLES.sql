-- SCRIPT SUPER SIMPLES - COPIE ESTE
-- Execute no Supabase SQL Editor

-- Limpar dados existentes
DELETE FROM empresas WHERE profile_id IN (
    SELECT id FROM profiles WHERE id IN (
        SELECT id FROM auth.users WHERE email = 'matutaria@gmail.com'
    )
);

DELETE FROM profiles WHERE id IN (
    SELECT id FROM auth.users WHERE email = 'matutaria@gmail.com'
);

DELETE FROM auth.users WHERE email = 'matutaria@gmail.com';

-- Criar usuário
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
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'authenticated',
    'authenticated',
    'matutaria@gmail.com',
    crypt('123456', gen_salt('bf')),
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

-- Criar profile
INSERT INTO profiles (id, role) VALUES ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'empresa');

-- Criar empresa
INSERT INTO empresas (
    id,
    profile_id,
    nome,
    cnpj,
    categoria,
    status,
    endereco,
    contato
) VALUES (
    '1d984249-79dc-4256-9e84-9c3a7f9a67d9',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'Matutaria',
    '12345678000199',
    'Alimentação',
    'aprovada',
    '{"rua": "Rua Principal", "numero": "123", "bairro": "Centro", "cidade": "Sobral", "cep": "62000-000"}',
    '{"telefone": "(88) 99999-9999", "email": "matutaria@gmail.com"}'
);

-- Verificar resultado
SELECT 'SUCESSO! Login criado' as resultado, u.email, p.role, e.nome 
FROM auth.users u
JOIN profiles p ON p.id = u.id
JOIN empresas e ON e.profile_id = p.id
WHERE u.email = 'matutaria@gmail.com';