-- SCRIPT PARA VERIFICAR SE O LOGIN ESTÁ FUNCIONANDO
-- Execute após executar o script de correção

-- 1. Verificar usuários criados
SELECT 
    'USUARIOS AUTH' as tabela,
    email,
    encrypted_password IS NOT NULL as tem_senha,
    email_confirmed_at IS NOT NULL as email_confirmado,
    created_at
FROM auth.users 
WHERE email IN (
    'admin@matutaria.com',
    'matutaria@delivery.com', 
    'consumidor@teste.com',
    'entregador@teste.com',
    'empresa@teste.com'
)
ORDER BY email;

-- 2. Verificar profiles
SELECT 
    'PROFILES' as tabela,
    email,
    role,
    nome,
    created_at
FROM profiles 
WHERE email IN (
    'admin@matutaria.com',
    'matutaria@delivery.com', 
    'consumidor@teste.com',
    'entregador@teste.com',
    'empresa@teste.com'
)
ORDER BY email;

-- 3. Verificar empresas
SELECT 
    'EMPRESAS' as tabela,
    e.nome,
    e.email,
    p.role
FROM empresas e
JOIN profiles p ON e.user_id = p.id
WHERE e.email IN (
    'matutaria@delivery.com',
    'empresa@teste.com'
)
ORDER BY e.email;

-- 4. Testar validação de senhas
SELECT 
    'TESTE SENHAS' as teste,
    email,
    CASE 
        WHEN email = 'admin@matutaria.com' THEN 
            crypt('admin123456', encrypted_password) = encrypted_password
        WHEN email = 'matutaria@delivery.com' THEN 
            crypt('matutaria123', encrypted_password) = encrypted_password
        ELSE 
            crypt('teste123456', encrypted_password) = encrypted_password
    END as senha_correta
FROM auth.users 
WHERE email IN (
    'admin@matutaria.com',
    'matutaria@delivery.com', 
    'consumidor@teste.com',
    'entregador@teste.com',
    'empresa@teste.com'
)
ORDER BY email;

-- 5. Verificar integridade dos dados
SELECT 
    'INTEGRIDADE' as teste,
    COUNT(DISTINCT au.id) as usuarios_auth,
    COUNT(DISTINCT p.id) as profiles,
    COUNT(DISTINCT e.user_id) as empresas,
    CASE 
        WHEN COUNT(DISTINCT au.id) = COUNT(DISTINCT p.id) THEN 'OK'
        ELSE 'ERRO: Usuarios sem profile'
    END as status_profiles
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
LEFT JOIN empresas e ON au.id = e.user_id
WHERE au.email IN (
    'admin@matutaria.com',
    'matutaria@delivery.com', 
    'consumidor@teste.com',
    'entregador@teste.com',
    'empresa@teste.com'
);