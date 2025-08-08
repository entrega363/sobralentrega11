-- EXECUTE ESTE SCRIPT NO SUPABASE AGORA PARA CORRIGIR O USUÁRIO MATUTARIA

-- 1. Verificar estado atual
SELECT 'ANTES DA CORREÇÃO:' as status;
SELECT 
    p.email,
    p.role,
    p.nome,
    CASE 
        WHEN e.profile_id IS NOT NULL THEN 'SIM'
        ELSE 'NÃO'
    END as tem_registro_empresa,
    CASE 
        WHEN c.profile_id IS NOT NULL THEN 'SIM'
        ELSE 'NÃO'
    END as tem_registro_consumidor
FROM profiles p 
LEFT JOIN empresas e ON e.profile_id = p.id
LEFT JOIN consumidores c ON c.profile_id = p.id
WHERE p.email = 'matutaria@gmail.com';

-- 2. CORRIGIR O ROLE
UPDATE profiles 
SET 
    role = 'empresa',
    updated_at = NOW()
WHERE email = 'matutaria@gmail.com';

-- 3. REMOVER REGISTRO INCORRETO DE CONSUMIDOR
DELETE FROM consumidores 
WHERE profile_id IN (
    SELECT id FROM profiles WHERE email = 'matutaria@gmail.com'
);

-- 4. GARANTIR REGISTRO NA TABELA EMPRESAS
DO $$
DECLARE
    user_id UUID;
BEGIN
    -- Buscar o ID do usuário
    SELECT id INTO user_id FROM profiles WHERE email = 'matutaria@gmail.com';
    
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
    p.email,
    p.role,
    p.nome,
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
FROM profiles p 
LEFT JOIN empresas e ON e.profile_id = p.id
LEFT JOIN consumidores c ON c.profile_id = p.id
WHERE p.email = 'matutaria@gmail.com';

-- 6. Verificar se a função handle_new_user está funcionando corretamente
SELECT 'VERIFICANDO FUNÇÃO handle_new_user:' as status;
SELECT routine_name, routine_definition 
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user';