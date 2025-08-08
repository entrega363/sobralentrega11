-- Script para corrigir definitivamente o usuário matutaria@gmail.com
-- Este script vai garantir que o usuário seja reconhecido como empresa

-- 1. Primeiro, vamos verificar o estado atual do usuário
SELECT 
    'Estado atual do usuário:' as info,
    p.id,
    p.email,
    p.role,
    p.nome,
    p.created_at,
    p.updated_at
FROM profiles p 
WHERE p.email = 'matutaria@gmail.com';

-- 2. Verificar se existe registro na tabela empresas
SELECT 
    'Registro na tabela empresas:' as info,
    e.*
FROM empresas e
JOIN profiles p ON e.profile_id = p.id
WHERE p.email = 'matutaria@gmail.com';

-- 3. Verificar se existe registro na tabela consumidores (não deveria existir)
SELECT 
    'Registro na tabela consumidores (deve estar vazio):' as info,
    c.*
FROM consumidores c
JOIN profiles p ON c.profile_id = p.id
WHERE p.email = 'matutaria@gmail.com';

-- 4. CORREÇÃO: Atualizar o role para empresa
UPDATE profiles 
SET 
    role = 'empresa',
    updated_at = NOW()
WHERE email = 'matutaria@gmail.com';

-- 5. CORREÇÃO: Remover qualquer registro incorreto da tabela consumidores
DELETE FROM consumidores 
WHERE profile_id IN (
    SELECT id FROM profiles WHERE email = 'matutaria@gmail.com'
);

-- 6. CORREÇÃO: Garantir que existe registro na tabela empresas
INSERT INTO empresas (
    profile_id,
    nome,
    cnpj,
    categoria,
    responsavel,
    telefone,
    endereco,
    status,
    created_at,
    updated_at
)
SELECT 
    p.id,
    COALESCE(p.nome, 'Matutaria'),
    '00.000.000/0001-00', -- CNPJ placeholder
    'restaurante',
    'Responsável',
    '(85) 99999-9999',
    'Sobral, CE',
    'ativo',
    NOW(),
    NOW()
FROM profiles p
WHERE p.email = 'matutaria@gmail.com'
AND NOT EXISTS (
    SELECT 1 FROM empresas e WHERE e.profile_id = p.id
);

-- 7. Verificar o resultado final
SELECT 
    'Estado final do usuário:' as info,
    p.id,
    p.email,
    p.role,
    p.nome,
    e.nome as empresa_nome,
    e.status as empresa_status
FROM profiles p 
LEFT JOIN empresas e ON e.profile_id = p.id
WHERE p.email = 'matutaria@gmail.com';

-- 8. Limpar qualquer cache que possa estar interferindo
-- (Isso será feito no frontend)