-- ========================================
-- VERIFICAR E CORRIGIR LOGIN DOS USUÁRIOS
-- ========================================

-- Verificar se os usuários existem
SELECT 'VERIFICANDO USUÁRIOS CRIADOS:' as status;
SELECT 
    u.email,
    u.email_confirmed_at,
    u.encrypted_password IS NOT NULL as tem_senha,
    p.role
FROM auth.users u 
LEFT JOIN profiles p ON p.id = u.id 
WHERE u.email IN (
    'teste.consumidor@gmail.com',
    'teste.empresa@gmail.com', 
    'teste.entregador@gmail.com'
)
ORDER BY u.email;

-- Atualizar senhas com método correto
UPDATE auth.users 
SET 
    encrypted_password = crypt('123456', gen_salt('bf')),
    email_confirmed_at = NOW(),
    updated_at = NOW()
WHERE email IN (
    'teste.consumidor@gmail.com',
    'teste.empresa@gmail.com',
    'teste.entregador@gmail.com'
);

-- Verificar novamente
SELECT 'APÓS CORREÇÃO:' as status;
SELECT 
    u.email,
    u.email_confirmed_at IS NOT NULL as email_confirmado,
    u.encrypted_password IS NOT NULL as tem_senha,
    p.role
FROM auth.users u 
LEFT JOIN profiles p ON p.id = u.id 
WHERE u.email IN (
    'teste.consumidor@gmail.com',
    'teste.empresa@gmail.com',
    'teste.entregador@gmail.com'
)
ORDER BY u.email;

SELECT 'CREDENCIAIS CORRIGIDAS! Tente fazer login agora.' as resultado;