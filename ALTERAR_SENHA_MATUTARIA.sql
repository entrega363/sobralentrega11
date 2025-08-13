-- Script para alterar apenas a senha da conta matutaria@gmail.com
-- Execute no Supabase SQL Editor

-- Alterar a senha para 'tenderbr0'
UPDATE auth.users 
SET 
    encrypted_password = crypt('tenderbr0', gen_salt('bf')),
    updated_at = NOW()
WHERE email = 'matutaria@gmail.com';

-- Verificar se a alteração foi feita
SELECT 
    '✅ SENHA ALTERADA COM SUCESSO!' as status,
    email,
    'Nova senha: tenderbr0' as nova_senha,
    'Última atualização: ' || updated_at as ultima_atualizacao
FROM auth.users 
WHERE email = 'matutaria@gmail.com';

-- Instruções de login
SELECT 
    '📋 DADOS DE LOGIN ATUALIZADOS:' as titulo,
    '📧 Email: matutaria@gmail.com' as email,
    '🔑 Senha: tenderbr0' as senha,
    '🌐 URL: https://delivery2-hidizya34-entregasobrals-projects.vercel.app/login' as url;