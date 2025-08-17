-- SOLUÇÃO SIMPLES PARA LOGIN DO ADMIN
-- Execute este script no Supabase SQL Editor

-- 1. Deletar usuário existente se houver problemas
DELETE FROM admins WHERE user_id IN (
    SELECT id FROM auth.users WHERE email = 'entregasobral@gmail.com'
);
DELETE FROM user_roles WHERE user_id IN (
    SELECT id FROM auth.users WHERE email = 'entregasobral@gmail.com'
);
DELETE FROM auth.users WHERE email = 'entregasobral@gmail.com';

-- 2. Criar usuário admin do zero
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
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'entregasobral@gmail.com',
    crypt('tenderbr0', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"role": "admin"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
);

-- 3. Pegar o ID do usuário criado
DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    SELECT id INTO admin_user_id 
    FROM auth.users 
    WHERE email = 'entregasobral@gmail.com';
    
    -- Inserir na user_roles
    INSERT INTO user_roles (user_id, role, created_at, updated_at)
    VALUES (admin_user_id, 'admin', NOW(), NOW());
    
    -- Inserir na admins
    INSERT INTO admins (
        user_id,
        nome,
        email,
        telefone,
        created_at,
        updated_at
    ) VALUES (
        admin_user_id,
        'Administrador Sistema',
        'entregasobral@gmail.com',
        '(88) 99999-9999',
        NOW(),
        NOW()
    );
    
    RAISE NOTICE 'Admin criado com sucesso! ID: %', admin_user_id;
END $$;

-- 4. Verificar se foi criado corretamente
SELECT 
    'VERIFICAÇÃO FINAL' as status,
    au.id,
    au.email,
    ur.role,
    a.nome,
    au.email_confirmed_at IS NOT NULL as email_confirmado
FROM auth.users au
JOIN user_roles ur ON au.id = ur.user_id
JOIN admins a ON au.id = a.user_id
WHERE au.email = 'entregasobral@gmail.com';

-- 5. Garantir que a view profiles existe
CREATE OR REPLACE VIEW profiles AS
SELECT 
    au.id,
    au.email,
    au.created_at,
    au.updated_at,
    COALESCE(ur.role, 'consumidor') as role,
    CASE 
        WHEN ur.role = 'admin' THEN a.nome
        WHEN ur.role = 'empresa' THEN e.nome
        WHEN ur.role = 'entregador' THEN ent.nome
        WHEN ur.role = 'consumidor' THEN c.nome
        ELSE 'Usuário'
    END as nome,
    CASE 
        WHEN ur.role = 'admin' THEN a.telefone
        WHEN ur.role = 'empresa' THEN e.telefone
        WHEN ur.role = 'entregador' THEN ent.telefone
        WHEN ur.role = 'consumidor' THEN c.telefone
        ELSE NULL
    END as telefone
FROM auth.users au
LEFT JOIN user_roles ur ON au.id = ur.user_id
LEFT JOIN admins a ON au.id = a.user_id AND ur.role = 'admin'
LEFT JOIN empresas e ON au.id = e.user_id AND ur.role = 'empresa'
LEFT JOIN entregadores ent ON au.id = ent.user_id AND ur.role = 'entregador'
LEFT JOIN consumidores c ON au.id = c.user_id AND ur.role = 'consumidor';

-- 6. Testar a view
SELECT * FROM profiles WHERE email = 'entregasobral@gmail.com';

RAISE NOTICE '✅ SCRIPT EXECUTADO COM SUCESSO!';
RAISE NOTICE '📧 Email: entregasobral@gmail.com';
RAISE NOTICE '🔑 Senha: tenderbr0';
RAISE NOTICE '🚀 Tente fazer login agora!';