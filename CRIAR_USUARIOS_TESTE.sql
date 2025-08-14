-- ========================================
-- SCRIPT PARA CRIAR USUÁRIOS DE TESTE
-- ========================================
-- Este script cria 3 usuários de teste:
-- 1. Consumidor: teste.consumidor@gmail.com / 123456
-- 2. Empresa: teste.empresa@gmail.com / 123456  
-- 3. Entregador: teste.entregador@gmail.com / 123456

-- Limpar usuários de teste existentes (se houver)
DELETE FROM consumidores WHERE profile_id IN (
    SELECT id FROM profiles WHERE id IN (
        SELECT id FROM auth.users WHERE email IN (
            'teste.consumidor@gmail.com',
            'teste.empresa@gmail.com', 
            'teste.entregador@gmail.com'
        )
    )
);

DELETE FROM entregadores WHERE profile_id IN (
    SELECT id FROM profiles WHERE id IN (
        SELECT id FROM auth.users WHERE email IN (
            'teste.consumidor@gmail.com',
            'teste.empresa@gmail.com',
            'teste.entregador@gmail.com'
        )
    )
);

DELETE FROM empresas WHERE profile_id IN (
    SELECT id FROM profiles WHERE id IN (
        SELECT id FROM auth.users WHERE email IN (
            'teste.consumidor@gmail.com',
            'teste.empresa@gmail.com',
            'teste.entregador@gmail.com'
        )
    )
);

DELETE FROM profiles WHERE id IN (
    SELECT id FROM auth.users WHERE email IN (
        'teste.consumidor@gmail.com',
        'teste.empresa@gmail.com',
        'teste.entregador@gmail.com'
    )
);

DELETE FROM auth.users WHERE email IN (
    'teste.consumidor@gmail.com',
    'teste.empresa@gmail.com',
    'teste.entregador@gmail.com'
);

-- ========================================
-- 1. CRIAR USUÁRIO CONSUMIDOR
-- ========================================

-- Criar usuário auth
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
    'c1111111-1111-1111-1111-111111111111',
    'authenticated',
    'authenticated',
    'teste.consumidor@gmail.com',
    crypt('123456', gen_salt('bf')),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"role": "consumidor"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
);

-- Criar profile
INSERT INTO profiles (id, role) VALUES (
    'c1111111-1111-1111-1111-111111111111',
    'consumidor'
);

-- Criar consumidor
INSERT INTO consumidores (
    id,
    profile_id,
    nome,
    telefone,
    endereco,
    status
) VALUES (
    'c1111111-2222-3333-4444-555555555555',
    'c1111111-1111-1111-1111-111111111111',
    'João Silva (Teste)',
    '(88) 91111-1111',
    '{"rua": "Rua do Consumidor", "numero": "123", "bairro": "Centro", "cidade": "Sobral", "cep": "62000-001"}',
    'ativo'
);

-- ========================================
-- 2. CRIAR USUÁRIO EMPRESA
-- ========================================

-- Criar usuário auth
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
    'e2222222-2222-2222-2222-222222222222',
    'authenticated',
    'authenticated',
    'teste.empresa@gmail.com',
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
INSERT INTO profiles (id, role) VALUES (
    'e2222222-2222-2222-2222-222222222222',
    'empresa'
);

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
    'e2222222-3333-4444-5555-666666666666',
    'e2222222-2222-2222-2222-222222222222',
    'Restaurante Teste Ltda',
    '11222333000144',
    'Alimentação',
    'aprovada',
    '{"rua": "Rua da Empresa", "numero": "456", "bairro": "Centro", "cidade": "Sobral", "cep": "62000-002"}',
    '{"telefone": "(88) 92222-2222", "email": "teste.empresa@gmail.com"}'
);

-- ========================================
-- 3. CRIAR USUÁRIO ENTREGADOR
-- ========================================

-- Criar usuário auth
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
    'd3333333-3333-3333-3333-333333333333',
    'authenticated',
    'authenticated',
    'teste.entregador@gmail.com',
    crypt('123456', gen_salt('bf')),
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

-- Criar profile
INSERT INTO profiles (id, role) VALUES (
    'd3333333-3333-3333-3333-333333333333',
    'entregador'
);

-- Criar entregador
INSERT INTO entregadores (
    id,
    profile_id,
    nome,
    telefone,
    veiculo,
    status,
    disponivel
) VALUES (
    'd3333333-4444-5555-6666-777777777777',
    'd3333333-3333-3333-3333-333333333333',
    'Carlos Santos (Teste)',
    '(88) 93333-3333',
    '{"tipo": "moto", "placa": "ABC-1234", "modelo": "Honda CG 160"}',
    'aprovado',
    true
);

-- ========================================
-- VERIFICAR CRIAÇÃO DOS USUÁRIOS
-- ========================================

SELECT 
    'USUÁRIOS DE TESTE CRIADOS COM SUCESSO!' as resultado,
    '' as separador;

-- Verificar Consumidor
SELECT 
    'CONSUMIDOR' as tipo,
    u.email,
    p.role,
    c.nome,
    c.status
FROM auth.users u 
JOIN profiles p ON p.id = u.id 
JOIN consumidores c ON c.profile_id = p.id 
WHERE u.email = 'teste.consumidor@gmail.com';

-- Verificar Empresa
SELECT 
    'EMPRESA' as tipo,
    u.email,
    p.role,
    e.nome,
    e.status
FROM auth.users u 
JOIN profiles p ON p.id = u.id 
JOIN empresas e ON e.profile_id = p.id 
WHERE u.email = 'teste.empresa@gmail.com';

-- Verificar Entregador
SELECT 
    'ENTREGADOR' as tipo,
    u.email,
    p.role,
    ent.nome,
    ent.status
FROM auth.users u 
JOIN profiles p ON p.id = u.id 
JOIN entregadores ent ON ent.profile_id = p.id 
WHERE u.email = 'teste.entregador@gmail.com';

-- ========================================
-- RESUMO FINAL
-- ========================================

SELECT 
    '========================================' as linha,
    'CREDENCIAIS DE TESTE CRIADAS:' as titulo,
    '' as espaco,
    '1. CONSUMIDOR:' as consumidor_titulo,
    '   Email: teste.consumidor@gmail.com' as consumidor_email,
    '   Senha: 123456' as consumidor_senha,
    '   Nome: João Silva (Teste)' as consumidor_nome,
    '' as espaco2,
    '2. EMPRESA:' as empresa_titulo,
    '   Email: teste.empresa@gmail.com' as empresa_email,
    '   Senha: 123456' as empresa_senha,
    '   Nome: Restaurante Teste Ltda' as empresa_nome,
    '' as espaco3,
    '3. ENTREGADOR:' as entregador_titulo,
    '   Email: teste.entregador@gmail.com' as entregador_email,
    '   Senha: 123456' as entregador_senha,
    '   Nome: Carlos Santos (Teste)' as entregador_nome,
    '========================================' as linha_final;