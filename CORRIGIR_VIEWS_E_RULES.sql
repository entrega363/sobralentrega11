-- CORRIGIR VIEWS E RULES QUE DEPENDEM DAS COLUNAS

-- 1. Primeiro, vamos ver todas as views existentes
SELECT 'Views existentes:' as info;
SELECT 
    schemaname,
    viewname,
    definition
FROM pg_views 
WHERE schemaname = 'public'
ORDER BY viewname;

-- 2. Verificar rules existentes
SELECT 'Rules existentes:' as info;
SELECT 
    schemaname,
    tablename,
    rulename,
    definition
FROM pg_rules 
WHERE schemaname = 'public'
ORDER BY tablename, rulename;

-- 3. Remover views que podem depender das colunas status
DO $$
DECLARE
    view_record RECORD;
BEGIN
    -- Buscar todas as views que podem conter referências às colunas status
    FOR view_record IN 
        SELECT viewname 
        FROM pg_views 
        WHERE schemaname = 'public'
        AND (definition ILIKE '%status%' OR viewname ILIKE '%produto%' OR viewname ILIKE '%empresa%')
    LOOP
        EXECUTE format('DROP VIEW IF EXISTS %I CASCADE', view_record.viewname);
        RAISE NOTICE 'View removida: %', view_record.viewname;
    END LOOP;
END $$;

-- 4. Remover rules que podem depender das colunas
DO $$
DECLARE
    rule_record RECORD;
BEGIN
    FOR rule_record IN 
        SELECT tablename, rulename 
        FROM pg_rules 
        WHERE schemaname = 'public'
        AND definition ILIKE '%status%'
    LOOP
        EXECUTE format('DROP RULE IF EXISTS %I ON %I', rule_record.rulename, rule_record.tablename);
        RAISE NOTICE 'Rule removida: % na tabela %', rule_record.rulename, rule_record.tablename;
    END LOOP;
END $$;

-- 5. Remover TODAS as políticas das tabelas empresas e produtos
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    -- Remover políticas da tabela empresas
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'empresas'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON empresas', policy_record.policyname);
        RAISE NOTICE 'Política removida de empresas: %', policy_record.policyname;
    END LOOP;
    
    -- Remover políticas da tabela produtos
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'produtos'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON produtos', policy_record.policyname);
        RAISE NOTICE 'Política removida de produtos: %', policy_record.policyname;
    END LOOP;
END $$;

-- 6. Desabilitar RLS temporariamente
ALTER TABLE empresas DISABLE ROW LEVEL SECURITY;
ALTER TABLE produtos DISABLE ROW LEVEL SECURITY;

-- 7. Verificar e remover coluna status da tabela produtos se existir
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'produtos' AND column_name = 'status'
    ) THEN
        ALTER TABLE produtos DROP COLUMN status CASCADE;
        RAISE NOTICE 'Coluna status removida da tabela produtos';
    END IF;
END $$;

-- 8. Alterar coluna status da tabela empresas
ALTER TABLE empresas ALTER COLUMN status TYPE text;

-- 9. Dropar enums existentes
DROP TYPE IF EXISTS empresa_status CASCADE;
DROP TYPE IF EXISTS produto_status CASCADE;

-- 10. Criar enum para empresas
CREATE TYPE empresa_status AS ENUM ('ativo', 'inativo', 'suspenso');

-- 11. Primeiro, corrigir valores inválidos na coluna status
UPDATE empresas SET status = 'ativo' WHERE status NOT IN ('ativo', 'inativo', 'suspenso');

-- 12. Alterar coluna empresas para usar o enum
ALTER TABLE empresas ALTER COLUMN status TYPE empresa_status USING status::empresa_status;
ALTER TABLE empresas ALTER COLUMN status SET DEFAULT 'ativo'::empresa_status;

-- 13. Reabilitar RLS
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;

-- 14. Recriar políticas básicas
-- Políticas para empresas
CREATE POLICY "Empresas podem ver seus próprios dados" ON empresas
FOR SELECT USING (profile_id = auth.uid());

CREATE POLICY "Empresas podem atualizar seus próprios dados" ON empresas
FOR UPDATE USING (profile_id = auth.uid());

-- Políticas para produtos
CREATE POLICY "Empresas podem ver seus produtos" ON produtos
FOR SELECT USING (
    empresa_id IN (
        SELECT id FROM empresas WHERE profile_id = auth.uid()
    )
);

CREATE POLICY "Empresas podem inserir produtos" ON produtos
FOR INSERT WITH CHECK (
    empresa_id IN (
        SELECT id FROM empresas WHERE profile_id = auth.uid()
    )
);

CREATE POLICY "Empresas podem atualizar seus produtos" ON produtos
FOR UPDATE USING (
    empresa_id IN (
        SELECT id FROM empresas WHERE profile_id = auth.uid()
    )
);

CREATE POLICY "Empresas podem excluir seus produtos" ON produtos
FOR DELETE USING (
    empresa_id IN (
        SELECT id FROM empresas WHERE profile_id = auth.uid()
    )
);

-- 15. Configurar o usuário matutaria
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

-- 16. Recriar view básica para produtos (se necessário)
CREATE OR REPLACE VIEW view_produtos_publicos AS
SELECT 
    p.id,
    p.nome,
    p.descricao,
    p.preco,
    p.categoria,
    p.disponivel,
    p.tempo_preparacao,
    p.imagem_url,
    e.nome as empresa_nome,
    e.endereco as empresa_endereco,
    e.telefone as empresa_telefone
FROM produtos p
JOIN empresas e ON e.id = p.empresa_id
WHERE p.disponivel = true 
AND e.status = 'ativo';

-- 17. Verificar configuração final
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

-- 18. Inserir produto de teste
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
    'Pizza Margherita (Teste Views)',
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
    AND pr.nome = 'Pizza Margherita (Teste Views)'
);

-- 19. Verificar produtos criados
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

-- 20. Verificar views recriadas
SELECT 'VIEWS FINAIS:' as info;
SELECT 
    viewname,
    'Recriada' as status
FROM pg_views 
WHERE schemaname = 'public'
ORDER BY viewname;

SELECT 'SCRIPT EXECUTADO COM SUCESSO! Views e rules foram corrigidas.' as resultado;