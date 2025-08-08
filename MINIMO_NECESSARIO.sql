-- MÍNIMO NECESSÁRIO PARA FUNCIONAR
-- Sem complicações, apenas o essencial

-- 1. Desabilitar RLS em tudo (para evitar problemas de permissão)
ALTER TABLE IF EXISTS profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS empresas DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS produtos DISABLE ROW LEVEL SECURITY;

-- 2. Buscar o ID do usuário matutaria
DO $$
DECLARE
    user_id uuid;
BEGIN
    SELECT id INTO user_id FROM auth.users WHERE email = 'matutaria@gmail.com';
    
    IF user_id IS NULL THEN
        RAISE EXCEPTION 'Usuário matutaria@gmail.com não encontrado';
    END IF;
    
    RAISE NOTICE 'Usuário encontrado: %', user_id;
    
    -- 3. Garantir que existe um registro na tabela profiles
    INSERT INTO profiles (id) VALUES (user_id) ON CONFLICT (id) DO NOTHING;
    
    -- 4. Garantir que existe um registro na tabela empresas
    INSERT INTO empresas (profile_id, nome) 
    VALUES (user_id, 'Matutaria Delivery') 
    ON CONFLICT (profile_id) DO UPDATE SET nome = 'Matutaria Delivery';
    
    RAISE NOTICE 'Profile e empresa configurados';
END $$;

-- 5. Criar uma política RLS que permite TUDO (temporariamente)
DROP POLICY IF EXISTS "allow_all" ON produtos;
CREATE POLICY "allow_all" ON produtos FOR ALL USING (true) WITH CHECK (true);

-- 6. Reabilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;

-- 7. Testar inserção direta de produto
INSERT INTO produtos (empresa_id, nome, preco, categoria, disponivel)
SELECT 
    e.id,
    'Produto Teste Direto',
    20.00,
    'Teste',
    true
FROM empresas e
WHERE e.profile_id = (SELECT id FROM auth.users WHERE email = 'matutaria@gmail.com')
ON CONFLICT DO NOTHING;

-- 8. Verificar se funcionou
SELECT 'RESULTADO:' as status;
SELECT 
    p.nome as produto,
    e.nome as empresa,
    u.email as usuario
FROM produtos p
JOIN empresas e ON e.id = p.empresa_id
JOIN auth.users u ON u.id = e.profile_id
WHERE u.email = 'matutaria@gmail.com'
AND p.nome = 'Produto Teste Direto';

SELECT 'Se apareceu um produto acima, FUNCIONOU! Agora teste na interface.' as resultado;