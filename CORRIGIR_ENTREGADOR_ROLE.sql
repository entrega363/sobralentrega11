-- Script para corrigir o role do entregador
-- Execute este script no Supabase SQL Editor

-- Primeiro, vamos verificar o usuário
SELECT 
    p.id,
    u.email,
    p.role,
    e.id as entregador_id,
    e.nome as entregador_nome
FROM profiles p
JOIN auth.users u ON u.id = p.id
LEFT JOIN entregadores e ON e.profile_id = p.id
WHERE u.email = 'entregasobrald@gmail.com';

-- Atualizar o role do perfil para 'entregador'
UPDATE profiles 
SET role = 'entregador'
WHERE id IN (
    SELECT u.id 
    FROM auth.users u 
    WHERE u.email = 'entregasobrald@gmail.com'
);

-- Verificar se existe registro na tabela entregadores
-- Se não existir, vamos criar
INSERT INTO entregadores (
    profile_id,
    nome,
    cpf,
    contato,
    veiculo,
    endereco,
    status
)
SELECT 
    u.id,
    'Entregador Sobral',
    '00000000000', -- CPF temporário
    '{"telefone": "", "cnh": ""}',
    '{"tipo": "moto", "placa": "", "modelo": ""}',
    '{"rua": "", "numero": "", "bairro": "", "cidade": "Sobral", "cep": ""}',
    'ativo'
FROM auth.users u
WHERE u.email = 'entregasobrald@gmail.com'
AND NOT EXISTS (
    SELECT 1 FROM entregadores e WHERE e.profile_id = u.id
);

-- Verificar o resultado final
SELECT 
    p.id,
    u.email,
    p.role,
    e.id as entregador_id,
    e.nome as entregador_nome,
    e.status
FROM profiles p
JOIN auth.users u ON u.id = p.id
LEFT JOIN entregadores e ON e.profile_id = p.id
WHERE u.email = 'entregasobrald@gmail.com';