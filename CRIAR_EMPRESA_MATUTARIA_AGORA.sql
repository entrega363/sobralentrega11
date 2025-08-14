-- CRIAR EMPRESA MATUTARIA PARA RESOLVER O LOGIN
-- Execute este script no Supabase SQL Editor

-- 1. Primeiro, vamos verificar se o usuário existe
SELECT 
    '1. VERIFICAR USUÁRIO:' as etapa,
    u.id,
    u.email
FROM auth.users u
WHERE u.email = 'matutaria@gmail.com';

-- 2. Criar a empresa Matutaria vinculada ao usuário
INSERT INTO empresas (
    nome,
    email,
    telefone,
    endereco,
    ativo,
    created_at,
    updated_at
) 
SELECT 
    'Matutaria',
    'matutaria@gmail.com',
    '(11) 99999-9999',
    'Rua da Matutaria, 123',
    true,
    NOW(),
    NOW()
WHERE EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'matutaria@gmail.com'
)
AND NOT EXISTS (
    SELECT 1 FROM empresas WHERE nome = 'Matutaria'
);

-- 3. Verificar se a empresa foi criada
SELECT 
    '3. EMPRESA CRIADA:' as etapa,
    e.id,
    e.nome,
    e.email,
    e.ativo
FROM empresas e
WHERE e.nome = 'Matutaria';

-- 4. Verificar se existe tabela profiles
SELECT 
    '4. VERIFICAR PROFILES:' as etapa,
    CASE WHEN COUNT(*) > 0 THEN '✅ Tabela existe' ELSE '❌ Tabela não existe' END as status
FROM information_schema.tables 
WHERE table_name = 'profiles' AND table_schema = 'public';

-- 5. Se a tabela profiles existir, criar o perfil
INSERT INTO profiles (
    id,
    role
)
SELECT 
    u.id,
    'empresa'
FROM auth.users u
WHERE u.email = 'matutaria@gmail.com'
AND EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'profiles' AND table_schema = 'public'
)
AND NOT EXISTS (
    SELECT 1 FROM profiles WHERE id = u.id
);

-- 6. Verificar o resultado final
SELECT 
    '6. RESULTADO FINAL:' as etapa,
    'Usuário: ' || u.email as info,
    'Empresa: ' || COALESCE(e.nome, 'NÃO ENCONTRADA') as empresa_info
FROM auth.users u
LEFT JOIN empresas e ON e.nome = 'Matutaria'
WHERE u.email = 'matutaria@gmail.com';