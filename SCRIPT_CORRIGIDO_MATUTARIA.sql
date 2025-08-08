-- SCRIPT CORRIGIDO PARA CORRIGIR O USUÁRIO MATUTARIA
-- A tabela profiles não tem coluna email, precisamos usar auth.users

-- 1. Verificar estado atual do usuário
SELECT 'ANTES DA CORREÇÃO:' as status;
SELECT 
    u.email,
    p.id as profile_id,
    p.role,
    CASE 
        WHEN e.profile_id IS NOT NULL THEN 'SIM'
        ELSE 'NÃO'
    END as tem_registro_empresa,
    CASE 
        WHEN c.profile_id IS NOT NULL THEN 'SIM'
        ELSE 'NÃO'
    END as tem_registro_consumidor
FROM auth.users u
JOIN profiles p ON p.id = u.id
LEFT JOIN empresas e ON e.profile_id = p.id
LEFT JOIN consumidores c ON c.profile_id = p.id
WHERE u.email = 'matutaria@gmail.com';

-- 2. CORRIGIR O ROLE
UPDATE profiles 
SET 
    role = 'empresa',
    updated_at = NOW()
WHERE id IN (
    SELECT u.id FROM auth.users u WHERE u.email = 'matutaria@gmail.com'
);

-- 3. REMOVER REGISTRO INCORRETO DE CONSUMIDOR
DELETE FROM consumidores 
WHERE profile_id IN (
    SELECT u.id FROM auth.users u WHERE u.email = 'matutaria@gmail.com'
);

-- 4. GARANTIR REGISTRO NA TABELA EMPRESAS
DO $$
DECLARE
    user_id UUID;
BEGIN
    -- Buscar o ID do usuário
    SELECT u.id INTO user_id 
    FROM auth.users u 
    WHERE u.email = 'matutaria@gmail.com';
    
    -- Inserir na tabela empresas se não existir
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
        user_id,
        'Matutaria',
        '00.000.000/0001-00',
        'restaurante',
        'Responsável',
        '(85) 99999-9999',
        'Sobral, CE',
        'ativo',
        NOW(),
        NOW()
    WHERE NOT EXISTS (
        SELECT 1 FROM empresas WHERE profile_id = user_id
    );
END $$;

-- 5. Verificar resultado final
SELECT 'DEPOIS DA CORREÇÃO:' as status;
SELECT 
    u.email,
    p.role,
    e.nome as empresa_nome,
    e.status as empresa_status,
    CASE 
        WHEN e.profile_id IS NOT NULL THEN 'SIM'
        ELSE 'NÃO'
    END as tem_registro_empresa,
    CASE 
        WHEN c.profile_id IS NOT NULL THEN 'SIM'
        ELSE 'NÃO'
    END as tem_registro_consumidor
FROM auth.users u
JOIN profiles p ON p.id = u.id
LEFT JOIN empresas e ON e.profile_id = p.id
LEFT JOIN consumidores c ON c.profile_id = p.id
WHERE u.email = 'matutaria@gmail.com';