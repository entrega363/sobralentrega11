-- CORRIGIR POLÍTICAS RLS E ENUM

-- 1. Primeiro, vamos ver quais políticas existem na tabela empresas
SELECT 'Políticas existentes na tabela empresas:' as info;
SELECT 
    policyname,
    cmd,
    permissive,
    qual
FROM pg_policies 
WHERE tablename = 'empresas';

-- 2. Remover todas as políticas da tabela empresas temporariamente
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    -- Buscar todas as políticas da tabela empresas
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'empresas'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON empresas', policy_record.policyname);
        RAISE NOTICE 'Política removida: %', policy_record.policyname;
    END LOOP;
END $$;

-- 3. Desabilitar RLS temporariamente
ALTER TABLE empresas DISABLE ROW LEVEL SECURITY;

-- 4. Agora alterar a coluna status para text
ALTER TABLE empresas ALTER COLUMN status TYPE text;

-- 5. Dropar o enum se existir
DROP TYPE IF EXISTS empresa_status CASCADE;

-- 6. Criar o enum novamente
CREATE TYPE empresa_status AS ENUM ('ativo', 'inativo', 'suspenso');

-- 7. Alterar a coluna de volta para usar o enum
ALTER TABLE empresas ALTER COLUMN status TYPE empresa_status USING status::empresa_status;

-- 8. Definir valor padrão
ALTER TABLE empresas ALTER COLUMN status SET DEFAULT 'ativo'::empresa_status;

-- 9. Reabilitar RLS
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;

-- 10. Recriar políticas básicas para empresas
CREATE POLICY "Empresas podem ver seus próprios dados" ON empresas
FOR SELECT USING (profile_id = auth.uid());

CREATE POLICY "Empresas podem atualizar seus próprios dados" ON empresas
FOR UPDATE USING (profile_id = auth.uid());

-- 11. Configurar o usuário matutaria
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

-- 12. Configurar políticas RLS para produtos
DO $$
BEGIN
    -- Habilitar RLS na tabela produtos se não estiver
    ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
    
    -- Remover políticas existentes de produtos
    DROP POLICY IF EXISTS "Empresas podem ver seus produtos" ON produtos;
    DROP POLICY IF EXISTS "Empresas podem inserir produtos" ON produtos;
    DROP POLICY IF EXISTS "Empresas podem atualizar seus produtos" ON produtos;
    DROP POLICY IF EXISTS "Empresas podem excluir seus produtos" ON produtos;
    
    -- Recriar políticas para produtos
    CREATE POLICY "Empresas podem ver seus produtos" ON produtos
    FOR SELECT USING (
        empresa_id IN (
            SELECT e.id FROM empresas e
            WHERE e.profile_id = auth.uid()
        )
    );
    
    CREATE POLICY "Empresas podem inserir produtos" ON produtos
    FOR INSERT WITH CHECK (
        empresa_id IN (
            SELECT e.id FROM empresas e
            WHERE e.profile_id = auth.uid()
        )
    );
    
    CREATE POLICY "Empresas podem atualizar seus produtos" ON produtos
    FOR UPDATE USING (
        empresa_id IN (
            SELECT e.id FROM empresas e
            WHERE e.profile_id = auth.uid()
        )
    );
    
    CREATE POLICY "Empresas podem excluir seus produtos" ON produtos
    FOR DELETE USING (
        empresa_id IN (
            SELECT e.id FROM empresas e
            WHERE e.profile_id = auth.uid()
        )
    );
    
    RAISE NOTICE 'Políticas RLS para produtos criadas com sucesso';
END $$;

-- 13. Verificar configuração final
SELECT 'VERIFICAÇÃO FINAL:' as info;

SELECT 
    'USUÁRIO' as tipo,
    u.id::text,
    u.email,
    (u.email_confirmed_at IS NOT NULL)::text as email_confirmado
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
    e.status::text
FROM empresas e
JOIN profiles p ON p.id = e.profile_id
JOIN auth.users u ON u.id = p.id
WHERE u.email = 'matutaria@gmail.com';

-- 14. Inserir produto de teste
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
    'Pizza Margherita (Teste RLS)',
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
    AND pr.nome = 'Pizza Margherita (Teste RLS)'
);

-- 15. Verificar produtos criados
SELECT 'PRODUTOS CRIADOS:' as info;
SELECT 
    pr.id,
    pr.nome,
    pr.preco,
    pr.categoria,
    pr.disponivel,
    pr.created_at,
    e.nome as empresa_nome,
    e.status as empresa_status
FROM produtos pr
JOIN empresas e ON e.id = pr.empresa_id
JOIN profiles p ON p.id = e.profile_id
JOIN auth.users u ON u.id = p.id
WHERE u.email = 'matutaria@gmail.com'
ORDER BY pr.created_at DESC;

-- 16. Verificar políticas finais
SELECT 'POLÍTICAS FINAIS:' as info;
SELECT 
    tablename,
    policyname,
    cmd
FROM pg_policies 
WHERE tablename IN ('empresas', 'produtos')
ORDER BY tablename, policyname;

SELECT 'SCRIPT EXECUTADO COM SUCESSO! Problema das políticas RLS resolvido.' as resultado;