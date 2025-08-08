-- SOLUÇÃO COMPLETA PARA PROBLEMAS COM PRODUTOS

-- 1. Verificar e corrigir usuário matutaria
DO $$
DECLARE
    user_id uuid;
    profile_exists boolean;
    empresa_exists boolean;
BEGIN
    -- Buscar ID do usuário
    SELECT id INTO user_id 
    FROM auth.users 
    WHERE email = 'matutaria@gmail.com';
    
    IF user_id IS NULL THEN
        RAISE NOTICE 'ERRO: Usuário matutaria@gmail.com não encontrado!';
        RETURN;
    END IF;
    
    RAISE NOTICE 'Usuário encontrado: %', user_id;
    
    -- Verificar se profile existe
    SELECT EXISTS(SELECT 1 FROM profiles WHERE id = user_id) INTO profile_exists;
    
    IF NOT profile_exists THEN
        RAISE NOTICE 'Criando profile para o usuário...';
        INSERT INTO profiles (id, role, created_at, updated_at)
        VALUES (user_id, 'empresa', NOW(), NOW());
    ELSE
        RAISE NOTICE 'Profile já existe, verificando role...';
        UPDATE profiles 
        SET role = 'empresa', updated_at = NOW()
        WHERE id = user_id AND role != 'empresa';
    END IF;
    
    -- Verificar se empresa existe
    SELECT EXISTS(SELECT 1 FROM empresas WHERE profile_id = user_id) INTO empresa_exists;
    
    IF NOT empresa_exists THEN
        RAISE NOTICE 'Criando empresa para o usuário...';
        INSERT INTO empresas (
            profile_id,
            nome,
            endereco,
            telefone,
            status,
            configuracoes,
            created_at,
            updated_at
        ) VALUES (
            user_id,
            'Matutaria Delivery',
            'Rua das Flores, 123 - Centro',
            '(11) 99999-9999',
            'ativo',
            '{
                "aceita_pedidos": true,
                "tempo_entrega_min": 30,
                "tempo_entrega_max": 60,
                "taxa_entrega": 5.00,
                "valor_minimo_pedido": 20.00,
                "horario_funcionamento": {
                    "segunda": {"inicio": "18:00", "fim": "23:00"},
                    "terca": {"inicio": "18:00", "fim": "23:00"},
                    "quarta": {"inicio": "18:00", "fim": "23:00"},
                    "quinta": {"inicio": "18:00", "fim": "23:00"},
                    "sexta": {"inicio": "18:00", "fim": "23:00"},
                    "sabado": {"inicio": "18:00", "fim": "23:00"},
                    "domingo": {"inicio": "18:00", "fim": "23:00"}
                }
            }'::jsonb,
            NOW(),
            NOW()
        );
    ELSE
        RAISE NOTICE 'Empresa já existe, atualizando status...';
        UPDATE empresas 
        SET status = 'ativo', updated_at = NOW()
        WHERE profile_id = user_id;
    END IF;
    
    RAISE NOTICE 'Configuração do usuário matutaria concluída!';
END $$;

-- 2. Verificar estrutura da tabela produtos
SELECT 'ESTRUTURA DA TABELA PRODUTOS:' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'produtos'
ORDER BY ordinal_position;

-- 3. Verificar políticas RLS
SELECT 'POLÍTICAS RLS PRODUTOS:' as info;
SELECT 
    policyname,
    cmd,
    permissive,
    qual
FROM pg_policies 
WHERE tablename = 'produtos';

-- 4. Criar política RLS se não existir
DO $$
BEGIN
    -- Política para empresas verem apenas seus produtos
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'produtos' 
        AND policyname = 'Empresas podem ver seus produtos'
    ) THEN
        CREATE POLICY "Empresas podem ver seus produtos" ON produtos
        FOR SELECT USING (
            empresa_id IN (
                SELECT e.id FROM empresas e
                JOIN profiles p ON p.id = e.profile_id
                WHERE p.id = auth.uid()
            )
        );
        RAISE NOTICE 'Política SELECT criada para produtos';
    END IF;
    
    -- Política para empresas inserirem produtos
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'produtos' 
        AND policyname = 'Empresas podem inserir produtos'
    ) THEN
        CREATE POLICY "Empresas podem inserir produtos" ON produtos
        FOR INSERT WITH CHECK (
            empresa_id IN (
                SELECT e.id FROM empresas e
                JOIN profiles p ON p.id = e.profile_id
                WHERE p.id = auth.uid()
            )
        );
        RAISE NOTICE 'Política INSERT criada para produtos';
    END IF;
    
    -- Política para empresas atualizarem produtos
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'produtos' 
        AND policyname = 'Empresas podem atualizar seus produtos'
    ) THEN
        CREATE POLICY "Empresas podem atualizar seus produtos" ON produtos
        FOR UPDATE USING (
            empresa_id IN (
                SELECT e.id FROM empresas e
                JOIN profiles p ON p.id = e.profile_id
                WHERE p.id = auth.uid()
            )
        );
        RAISE NOTICE 'Política UPDATE criada para produtos';
    END IF;
    
    -- Política para empresas excluírem produtos
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'produtos' 
        AND policyname = 'Empresas podem excluir seus produtos'
    ) THEN
        CREATE POLICY "Empresas podem excluir seus produtos" ON produtos
        FOR DELETE USING (
            empresa_id IN (
                SELECT e.id FROM empresas e
                JOIN profiles p ON p.id = e.profile_id
                WHERE p.id = auth.uid()
            )
        );
        RAISE NOTICE 'Política DELETE criada para produtos';
    END IF;
END $$;

-- 5. Verificar configuração final
SELECT 'VERIFICAÇÃO FINAL:' as info;

SELECT 
    'USUÁRIO' as tipo,
    u.id,
    u.email,
    u.email_confirmed_at IS NOT NULL as email_confirmado
FROM auth.users u 
WHERE u.email = 'matutaria@gmail.com'

UNION ALL

SELECT 
    'PROFILE' as tipo,
    p.id::text,
    p.role,
    p.created_at::text
FROM profiles p
JOIN auth.users u ON u.id = p.id
WHERE u.email = 'matutaria@gmail.com'

UNION ALL

SELECT 
    'EMPRESA' as tipo,
    e.id::text,
    e.nome,
    e.status
FROM empresas e
JOIN profiles p ON p.id = e.profile_id
JOIN auth.users u ON u.id = p.id
WHERE u.email = 'matutaria@gmail.com';

-- 6. Inserir produto de teste
INSERT INTO produtos (
    empresa_id,
    nome,
    descricao,
    preco,
    categoria,
    disponivel,
    tempo_preparacao
)
SELECT 
    e.id,
    'Pizza Margherita (Teste)',
    'Pizza com molho de tomate, mussarela e manjericão fresco',
    28.90,
    'Pizza',
    true,
    35
FROM empresas e
JOIN profiles p ON p.id = e.profile_id
JOIN auth.users u ON u.id = p.id
WHERE u.email = 'matutaria@gmail.com'
AND NOT EXISTS (
    SELECT 1 FROM produtos pr 
    WHERE pr.empresa_id = e.id 
    AND pr.nome = 'Pizza Margherita (Teste)'
);

-- 7. Verificar produtos criados
SELECT 'PRODUTOS CRIADOS:' as info;
SELECT 
    pr.id,
    pr.nome,
    pr.preco,
    pr.categoria,
    pr.disponivel,
    pr.created_at,
    e.nome as empresa_nome
FROM produtos pr
JOIN empresas e ON e.id = pr.empresa_id
JOIN profiles p ON p.id = e.profile_id
JOIN auth.users u ON u.id = p.id
WHERE u.email = 'matutaria@gmail.com'
ORDER BY pr.created_at DESC;

SELECT 'SCRIPT EXECUTADO COM SUCESSO! Agora tente criar um produto pela interface.' as resultado;