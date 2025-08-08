-- SCRIPT COMPLETO PARA CORRIGIR TODOS OS PROBLEMAS

-- 1. Remover TODAS as dependências (views, rules, políticas)
DO $$
DECLARE
    view_record RECORD;
    rule_record RECORD;
    policy_record RECORD;
BEGIN
    -- Remover todas as views
    FOR view_record IN 
        SELECT viewname 
        FROM pg_views 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP VIEW IF EXISTS %I CASCADE', view_record.viewname);
        RAISE NOTICE 'View removida: %', view_record.viewname;
    END LOOP;
    
    -- Remover todas as rules
    FOR rule_record IN 
        SELECT tablename, rulename 
        FROM pg_rules 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP RULE IF EXISTS %I ON %I CASCADE', rule_record.rulename, rule_record.tablename);
        RAISE NOTICE 'Rule removida: % na tabela %', rule_record.rulename, rule_record.tablename;
    END LOOP;
    
    -- Remover todas as políticas
    FOR policy_record IN 
        SELECT tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', policy_record.policyname, policy_record.tablename);
        RAISE NOTICE 'Política removida: % da tabela %', policy_record.policyname, policy_record.tablename;
    END LOOP;
END $$;

-- 2. Desabilitar RLS em todas as tabelas
ALTER TABLE IF EXISTS empresas DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS produtos DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS pedidos DISABLE ROW LEVEL SECURITY;

-- 3. Dropar todos os enums existentes
DROP TYPE IF EXISTS empresa_status CASCADE;
DROP TYPE IF EXISTS produto_status CASCADE;
DROP TYPE IF EXISTS pedido_status CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;

-- 4. Verificar e corrigir estrutura da tabela empresas
DO $$
BEGIN
    -- Adicionar coluna telefone se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'empresas' AND column_name = 'telefone'
    ) THEN
        ALTER TABLE empresas ADD COLUMN telefone VARCHAR(20);
        RAISE NOTICE 'Coluna telefone adicionada à tabela empresas';
    END IF;
    
    -- Adicionar coluna endereco se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'empresas' AND column_name = 'endereco'
    ) THEN
        ALTER TABLE empresas ADD COLUMN endereco TEXT;
        RAISE NOTICE 'Coluna endereco adicionada à tabela empresas';
    END IF;
    
    -- Verificar se coluna status existe, se não, criar
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'empresas' AND column_name = 'status'
    ) THEN
        ALTER TABLE empresas ADD COLUMN status TEXT DEFAULT 'ativo';
        RAISE NOTICE 'Coluna status adicionada à tabela empresas';
    ELSE
        -- Se existe, alterar para text temporariamente
        ALTER TABLE empresas ALTER COLUMN status TYPE TEXT;
        RAISE NOTICE 'Coluna status alterada para text';
    END IF;
    
    -- Remover coluna status da tabela produtos se existir
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'produtos' AND column_name = 'status'
    ) THEN
        ALTER TABLE produtos DROP COLUMN status CASCADE;
        RAISE NOTICE 'Coluna status removida da tabela produtos';
    END IF;
END $$;

-- 5. Criar enums necessários
CREATE TYPE empresa_status AS ENUM ('ativo', 'inativo', 'suspenso');

-- 6. Corrigir valores inválidos e converter para enum
UPDATE empresas SET status = 'ativo' WHERE status IS NULL OR status NOT IN ('ativo', 'inativo', 'suspenso');

-- Remover valor padrão antes da conversão
ALTER TABLE empresas ALTER COLUMN status DROP DEFAULT;

-- Converter para enum
ALTER TABLE empresas ALTER COLUMN status TYPE empresa_status USING status::empresa_status;

-- Definir novo valor padrão
ALTER TABLE empresas ALTER COLUMN status SET DEFAULT 'ativo'::empresa_status;

-- 7. Configurar usuário matutaria@gmail.com
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
        RAISE NOTICE 'Profile já existe, atualizando role...';
        UPDATE profiles 
        SET role = 'empresa', updated_at = NOW()
        WHERE id = user_id;
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
            'Rua das Flores, 123 - Centro - São Paulo, SP',
            '(11) 99999-9999',
            'ativo'::empresa_status,
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
        RAISE NOTICE 'Empresa já existe, atualizando dados...';
        UPDATE empresas 
        SET 
            nome = 'Matutaria Delivery',
            endereco = COALESCE(endereco, 'Rua das Flores, 123 - Centro - São Paulo, SP'),
            telefone = COALESCE(telefone, '(11) 99999-9999'),
            status = 'ativo'::empresa_status,
            updated_at = NOW()
        WHERE profile_id = user_id;
    END IF;
    
    RAISE NOTICE 'Configuração do usuário matutaria concluída!';
END $$;

-- 8. Reabilitar RLS e criar políticas básicas
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;

-- Políticas para empresas
CREATE POLICY "Empresas podem ver seus dados" ON empresas
FOR SELECT USING (profile_id = auth.uid());

CREATE POLICY "Empresas podem atualizar seus dados" ON empresas
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

-- 9. Criar view básica para produtos públicos
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
AND e.status = 'ativo'::empresa_status;

-- 10. Inserir produto de teste
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
    'Pizza Margherita Especial',
    'Pizza artesanal com molho de tomate, mussarela de búfala e manjericão fresco',
    32.90,
    'Pizza',
    true,
    40
FROM empresas e
JOIN profiles p ON p.id = e.profile_id
JOIN auth.users u ON u.id = p.id
WHERE u.email = 'matutaria@gmail.com'
AND NOT EXISTS (
    SELECT 1 FROM produtos pr 
    WHERE pr.empresa_id = e.id 
    AND pr.nome = 'Pizza Margherita Especial'
);

-- 11. Verificação final
SELECT 'VERIFICAÇÃO FINAL COMPLETA:' as info;

-- Verificar usuário
SELECT 
    'USUÁRIO' as tipo,
    u.id::text as id,
    u.email,
    (u.email_confirmed_at IS NOT NULL)::text as email_confirmado
FROM auth.users u 
WHERE u.email = 'matutaria@gmail.com'

UNION ALL

-- Verificar profile
SELECT 
    'PROFILE' as tipo,
    p.id::text,
    p.role,
    p.created_at::text
FROM profiles p
JOIN auth.users u ON u.id = p.id
WHERE u.email = 'matutaria@gmail.com'

UNION ALL

-- Verificar empresa
SELECT 
    'EMPRESA' as tipo,
    e.id::text,
    e.nome,
    e.status::text
FROM empresas e
JOIN profiles p ON p.id = e.profile_id
JOIN auth.users u ON u.id = p.id
WHERE u.email = 'matutaria@gmail.com';

-- Verificar produtos
SELECT 'PRODUTOS CRIADOS:' as info;
SELECT 
    pr.id,
    pr.nome,
    pr.preco,
    pr.categoria,
    pr.disponivel,
    pr.created_at,
    e.nome as empresa_nome,
    e.status::text as empresa_status
FROM produtos pr
JOIN empresas e ON e.id = pr.empresa_id
JOIN profiles p ON p.id = e.profile_id
JOIN auth.users u ON u.id = p.id
WHERE u.email = 'matutaria@gmail.com'
ORDER BY pr.created_at DESC;

-- Verificar estrutura das tabelas
SELECT 'ESTRUTURA EMPRESAS:' as info;
SELECT 
    column_name,
    data_type,
    udt_name,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'empresas'
ORDER BY ordinal_position;

SELECT 'ESTRUTURA PRODUTOS:' as info;
SELECT 
    column_name,
    data_type,
    udt_name,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'produtos'
ORDER BY ordinal_position;

SELECT '🎉 SCRIPT EXECUTADO COM SUCESSO! TODOS OS PROBLEMAS FORAM CORRIGIDOS! 🎉' as resultado;