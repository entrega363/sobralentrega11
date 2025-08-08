-- Corrigir problema com enum empresa_status

-- 1. Primeiro, vamos verificar quais valores são válidos para o enum
SELECT 'Valores válidos para empresa_status:' as info;
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = (
    SELECT oid 
    FROM pg_type 
    WHERE typname = 'empresa_status'
);

-- 2. Se o enum não existir ou não tiver os valores corretos, vamos criar/corrigir
DO $$
BEGIN
    -- Verificar se o tipo enum existe
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'empresa_status') THEN
        -- Criar o enum se não existir
        CREATE TYPE empresa_status AS ENUM ('ativo', 'inativo', 'suspenso');
        RAISE NOTICE 'Enum empresa_status criado com valores: ativo, inativo, suspenso';
    ELSE
        -- Se existir, verificar se tem o valor 'ativo'
        IF NOT EXISTS (
            SELECT 1 FROM pg_enum 
            WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'empresa_status')
            AND enumlabel = 'ativo'
        ) THEN
            -- Adicionar o valor 'ativo' se não existir
            ALTER TYPE empresa_status ADD VALUE 'ativo';
            RAISE NOTICE 'Valor ativo adicionado ao enum empresa_status';
        END IF;
        
        -- Verificar se tem o valor 'inativo'
        IF NOT EXISTS (
            SELECT 1 FROM pg_enum 
            WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'empresa_status')
            AND enumlabel = 'inativo'
        ) THEN
            ALTER TYPE empresa_status ADD VALUE 'inativo';
            RAISE NOTICE 'Valor inativo adicionado ao enum empresa_status';
        END IF;
        
        -- Verificar se tem o valor 'suspenso'
        IF NOT EXISTS (
            SELECT 1 FROM pg_enum 
            WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'empresa_status')
            AND enumlabel = 'suspenso'
        ) THEN
            ALTER TYPE empresa_status ADD VALUE 'suspenso';
            RAISE NOTICE 'Valor suspenso adicionado ao enum empresa_status';
        END IF;
    END IF;
END $$;

-- 3. Verificar se a coluna status na tabela empresas usa o enum correto
DO $$
BEGIN
    -- Verificar se a tabela empresas existe
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'empresas') THEN
        -- Verificar se a coluna status existe e seu tipo
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'empresas' AND column_name = 'status'
        ) THEN
            -- Se a coluna existe mas não é do tipo correto, alterar
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'empresas' 
                AND column_name = 'status' 
                AND data_type = 'USER-DEFINED'
                AND udt_name = 'empresa_status'
            ) THEN
                -- Alterar o tipo da coluna para usar o enum
                ALTER TABLE empresas ALTER COLUMN status TYPE empresa_status USING status::empresa_status;
                RAISE NOTICE 'Coluna status alterada para usar o enum empresa_status';
            END IF;
        ELSE
            -- Se a coluna não existe, criar
            ALTER TABLE empresas ADD COLUMN status empresa_status DEFAULT 'ativo';
            RAISE NOTICE 'Coluna status criada na tabela empresas';
        END IF;
    END IF;
END $$;

-- 4. Agora executar a correção do usuário matutaria
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
            'ativo'::empresa_status,  -- Usar cast explícito
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
        SET status = 'ativo'::empresa_status, updated_at = NOW()
        WHERE profile_id = user_id;
    END IF;
    
    RAISE NOTICE 'Configuração do usuário matutaria concluída!';
END $$;

-- 5. Verificar configuração final
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

SELECT 'SCRIPT EXECUTADO COM SUCESSO! O problema do enum foi corrigido.' as resultado;