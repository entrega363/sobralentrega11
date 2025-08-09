-- Script para debugar o perfil do entregador
-- Execute este script no Supabase SQL Editor

-- 1. Verificar o usuário na tabela auth.users
SELECT 
    id,
    email,
    raw_user_meta_data,
    created_at
FROM auth.users 
WHERE email = 'entregasobrald@gmail.com';

-- 2. Verificar o perfil na tabela profiles
SELECT 
    p.id,
    u.email,
    p.role,
    p.created_at,
    p.updated_at
FROM profiles p
JOIN auth.users u ON u.id = p.id
WHERE u.email = 'entregasobrald@gmail.com';

-- 3. Verificar se existe na tabela entregadores
SELECT 
    e.*,
    u.email,
    p.role
FROM entregadores e
JOIN profiles p ON p.id = e.profile_id
JOIN auth.users u ON u.id = p.id
WHERE u.email = 'entregasobrald@gmail.com';

-- 4. Se o role estiver errado, corrigir
UPDATE profiles 
SET 
    role = 'entregador',
    updated_at = NOW()
WHERE id IN (
    SELECT u.id 
    FROM auth.users u 
    WHERE u.email = 'entregasobrald@gmail.com'
) 
AND role != 'entregador';

-- 5. Se não existir na tabela entregadores, criar
DO $$
DECLARE
    profile_uuid UUID;
BEGIN
    -- Buscar o profile_id
    SELECT u.id INTO profile_uuid 
    FROM auth.users u
    WHERE u.email = 'entregasobrald@gmail.com';
    
    -- Se encontrou o profile e não existe entregador, criar
    IF profile_uuid IS NOT NULL AND NOT EXISTS (
        SELECT 1 FROM entregadores WHERE profile_id = profile_uuid
    ) THEN
        INSERT INTO entregadores (
            profile_id,
            nome,
            cpf,
            contato,
            veiculo,
            endereco,
            status
        ) VALUES (
            profile_uuid,
            'Entregador Sobral',
            '00000000000',
            '{"telefone": "", "cnh": ""}',
            '{"tipo": "moto", "placa": "", "modelo": ""}',
            '{"rua": "", "numero": "", "bairro": "", "cidade": "Sobral", "cep": ""}',
            'ativo'
        );
        
        RAISE NOTICE 'Entregador criado para profile_id: %', profile_uuid;
    END IF;
END $$;

-- 6. Verificar o resultado final
SELECT 
    p.id as profile_id,
    u.email,
    p.role,
    e.id as entregador_id,
    e.nome as entregador_nome,
    e.status,
    e.contato,
    e.veiculo,
    e.endereco
FROM profiles p
JOIN auth.users u ON u.id = p.id
LEFT JOIN entregadores e ON e.profile_id = p.id
WHERE u.email = 'entregasobrald@gmail.com';