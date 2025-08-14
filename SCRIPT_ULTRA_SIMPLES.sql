-- Limpar dados existentes
DELETE FROM consumidores WHERE profile_id IN (
    SELECT id FROM auth.users WHERE email IN (
        'teste.consumidor@gmail.com',
        'teste.empresa@gmail.com',
        'teste.entregador@gmail.com'
    )
);

DELETE FROM entregadores WHERE profile_id IN (
    SELECT id FROM auth.users WHERE email IN (
        'teste.consumidor@gmail.com',
        'teste.empresa@gmail.com',
        'teste.entregador@gmail.com'
    )
);

DELETE FROM empresas WHERE profile_id IN (
    SELECT id FROM auth.users WHERE email IN (
        'teste.consumidor@gmail.com',
        'teste.empresa@gmail.com',
        'teste.entregador@gmail.com'
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

-- CRIAR CONSUMIDOR
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token) VALUES ('00000000-0000-0000-0000-000000000000', 'c1111111-1111-1111-1111-111111111111', 'authenticated', 'authenticated', 'teste.consumidor@gmail.com', crypt('123456', gen_salt('bf')), NOW(), '{"provider": "email", "providers": ["email"]}', '{"role": "consumidor"}', NOW(), NOW(), '', '', '', '');

INSERT INTO profiles (id, role) VALUES ('c1111111-1111-1111-1111-111111111111', 'consumidor');

INSERT INTO consumidores (id, profile_id, nome, telefone, endereco, status) VALUES ('c1111111-2222-3333-4444-555555555555', 'c1111111-1111-1111-1111-111111111111', 'João Silva (Teste)', '(88) 91111-1111', '{"rua": "Rua do Consumidor", "numero": "123", "bairro": "Centro", "cidade": "Sobral", "cep": "62000-001"}', 'ativo');

-- CRIAR EMPRESA
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token) VALUES ('00000000-0000-0000-0000-000000000000', 'e2222222-2222-2222-2222-222222222222', 'authenticated', 'authenticated', 'teste.empresa@gmail.com', crypt('123456', gen_salt('bf')), NOW(), '{"provider": "email", "providers": ["email"]}', '{"role": "empresa"}', NOW(), NOW(), '', '', '', '');

INSERT INTO profiles (id, role) VALUES ('e2222222-2222-2222-2222-222222222222', 'empresa');

INSERT INTO empresas (id, profile_id, nome, cnpj, categoria, status, endereco, contato) VALUES ('e2222222-3333-4444-5555-666666666666', 'e2222222-2222-2222-2222-222222222222', 'Restaurante Teste Ltda', '11222333000144', 'Alimentação', 'aprovada', '{"rua": "Rua da Empresa", "numero": "456", "bairro": "Centro", "cidade": "Sobral", "cep": "62000-002"}', '{"telefone": "(88) 92222-2222", "email": "teste.empresa@gmail.com"}');

-- CRIAR ENTREGADOR
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token) VALUES ('00000000-0000-0000-0000-000000000000', 'd3333333-3333-3333-3333-333333333333', 'authenticated', 'authenticated', 'teste.entregador@gmail.com', crypt('123456', gen_salt('bf')), NOW(), '{"provider": "email", "providers": ["email"]}', '{"role": "entregador"}', NOW(), NOW(), '', '', '', '');

INSERT INTO profiles (id, role) VALUES ('d3333333-3333-3333-3333-333333333333', 'entregador');

INSERT INTO entregadores (id, profile_id, nome, telefone, veiculo, status, disponivel) VALUES ('d3333333-4444-5555-6666-777777777777', 'd3333333-3333-3333-3333-333333333333', 'Carlos Santos (Teste)', '(88) 93333-3333', '{"tipo": "moto", "placa": "ABC-1234", "modelo": "Honda CG 160"}', 'aprovado', true);

-- VERIFICAR
SELECT 'SUCESSO!' as resultado;
SELECT 'CONSUMIDOR' as tipo, u.email, c.nome FROM auth.users u JOIN consumidores c ON c.profile_id = u.id WHERE u.email = 'teste.consumidor@gmail.com';
SELECT 'EMPRESA' as tipo, u.email, e.nome FROM auth.users u JOIN empresas e ON e.profile_id = u.id WHERE u.email = 'teste.empresa@gmail.com';
SELECT 'ENTREGADOR' as tipo, u.email, ent.nome FROM auth.users u JOIN entregadores ent ON ent.profile_id = u.id WHERE u.email = 'teste.entregador@gmail.com';