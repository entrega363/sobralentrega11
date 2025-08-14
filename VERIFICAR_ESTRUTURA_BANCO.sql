-- ========================================
-- VERIFICAR ESTRUTURA DO BANCO DE DADOS
-- ========================================

-- Verificar se as tabelas principais existem
SELECT 
    'TABELAS EXISTENTES:' as status,
    '' as separador;

SELECT 
    table_name,
    'EXISTS' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'profiles',
    'empresas', 
    'entregadores',
    'consumidores',
    'produtos',
    'pedidos'
)
ORDER BY table_name;

-- Verificar se os tipos ENUM existem
SELECT 
    '' as separador,
    'TIPOS ENUM EXISTENTES:' as status,
    '' as separador2;

SELECT 
    typname as enum_name,
    'EXISTS' as status
FROM pg_type 
WHERE typname IN (
    'user_role',
    'empresa_status', 
    'entregador_status',
    'pedido_status',
    'tipo_entrega'
)
ORDER BY typname;

-- Contar registros nas tabelas principais
SELECT 
    '' as separador,
    'CONTAGEM DE REGISTROS:' as status,
    '' as separador2;

SELECT 'auth.users' as tabela, COUNT(*) as total FROM auth.users
UNION ALL
SELECT 'profiles' as tabela, COUNT(*) as total FROM profiles
UNION ALL  
SELECT 'empresas' as tabela, COUNT(*) as total FROM empresas
UNION ALL
SELECT 'entregadores' as tabela, COUNT(*) as total FROM entregadores
UNION ALL
SELECT 'consumidores' as tabela, COUNT(*) as total FROM consumidores
UNION ALL
SELECT 'produtos' as tabela, COUNT(*) as total FROM produtos
UNION ALL
SELECT 'pedidos' as tabela, COUNT(*) as total FROM pedidos;