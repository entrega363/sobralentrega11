-- SCRIPT ALTERNATIVO: USAR SUPABASE AUTH API
-- Se o script anterior não funcionar, use este método

-- 1. Primeiro, limpar dados existentes
DELETE FROM empresas WHERE user_id IN (
    SELECT id FROM auth.users WHERE email IN (
        'admin@matutaria.com',
        'matutaria@delivery.com', 
        'consumidor@teste.com',
        'entregador@teste.com',
        'empresa@teste.com'
    )
);

DELETE FROM profiles WHERE id IN (
    SELECT id FROM auth.users WHERE email IN (
        'admin@matutaria.com',
        'matutaria@delivery.com', 
        'consumidor@teste.com',
        'entregador@teste.com',
        'empresa@teste.com'
    )
);

-- 2. Usar a função auth.users para criar usuários
-- ADMIN
SELECT auth.users(
    'admin@matutaria.com',
    'admin123456',
    '{"role": "admin", "nome": "Administrador"}'::jsonb
);

-- MATUTARIA
SELECT auth.users(
    'matutaria@delivery.com',
    'matutaria123',
    '{"role": "empresa", "nome": "Matutaria Delivery"}'::jsonb
);

-- CONSUMIDOR
SELECT auth.users(
    'consumidor@teste.com',
    'teste123456',
    '{"role": "consumidor", "nome": "Consumidor Teste"}'::jsonb
);

-- ENTREGADOR
SELECT auth.users(
    'entregador@teste.com',
    'teste123456',
    '{"role": "entregador", "nome": "Entregador Teste"}'::jsonb
);

-- EMPRESA
SELECT auth.users(
    'empresa@teste.com',
    'teste123456',
    '{"role": "empresa", "nome": "Empresa Teste"}'::jsonb
);

-- 3. Verificar se foram criados
SELECT 
    email,
    raw_user_meta_data->>'role' as role,
    raw_user_meta_data->>'nome' as nome,
    email_confirmed_at IS NOT NULL as confirmado
FROM auth.users 
WHERE email IN (
    'admin@matutaria.com',
    'matutaria@delivery.com', 
    'consumidor@teste.com',
    'entregador@teste.com',
    'empresa@teste.com'
);