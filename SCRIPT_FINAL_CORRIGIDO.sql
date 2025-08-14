-- SCRIPT FINAL CORRIGIDO PARA CRIAR EMPRESA MATUTARIA
-- Execute este script no Supabase SQL Editor

-- 1. Ver estrutura da tabela empresas
SELECT 
    '1. ESTRUTURA EMPRESAS:' as etapa,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'empresas' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Verificar usuário
SELECT 
    '2. USUÁRIO:' as etapa,
    u.id,
    u.email
FROM auth.users u
WHERE u.email = 'matutaria@gmail.com';

-- 3. Criar empresa apenas com nome (sintaxe corrigida)
INSERT INTO empresas (nome) 
SELECT 'Matutaria'
WHERE NOT EXISTS (
    SELECT 1 FROM empresas WHERE nome = 'Matutaria'
);

-- 4. Verificar se criou
SELECT 
    '4. EMPRESA CRIADA:' as etapa,
    *
FROM empresas 
WHERE nome = 'Matutaria';