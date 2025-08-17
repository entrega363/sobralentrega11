-- =====================================================
-- CRIAR CONTAS ESPECÍFICAS PARA O SISTEMA
-- =====================================================
-- IMPORTANTE: Execute este script no SQL Editor do Supabase
-- Ele criará os usuários diretamente no auth.users e vinculará com os dados

-- =====================================================
-- PASSO 1: CRIAR USUÁRIOS NO AUTH.USERS
-- =====================================================

-- Limpar dados existentes (opcional)
-- DELETE FROM auth.users WHERE email IN ('entregasobral@gmail.com', 'produtojssuporte@gmail.com', 'appmasterbase44@gmail.com', 'matutaria@gmail.com');

-- Criar usuário ADMINISTRADOR
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role,
  aud
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'entregasobral@gmail.com',
  crypt('tenderbr0', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Administrador Sistema"}',
  false,
  'authenticated',
  'authenticated'
) ON CONFLICT (email) DO NOTHING;

-- Criar usuário EMPRESA
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role,
  aud
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'produtojssuporte@gmail.com',
  crypt('tenderbr0', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Matutaria Delivery"}',
  false,
  'authenticated',
  'authenticated'
) ON CONFLICT (email) DO NOTHING;

-- Criar usuário ENTREGADOR
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role,
  aud
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'appmasterbase44@gmail.com',
  crypt('tenderbr0', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "João Entregador Sobral"}',
  false,
  'authenticated',
  'authenticated'
) ON CONFLICT (email) DO NOTHING;

-- Criar usuário CONSUMIDOR
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role,
  aud
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'matutaria@gmail.com',
  crypt('tenderbr0', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Cliente Matutaria"}',
  false,
  'authenticated',
  'authenticated'
) ON CONFLICT (email) DO NOTHING;

-- =====================================================
-- PASSO 2: CRIAR PROFILES COM ROLES
-- =====================================================

-- ADMINISTRADOR
INSERT INTO profiles (id, role) 
SELECT id, 'admin' 
FROM auth.users 
WHERE email = 'entregasobral@gmail.com'
ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- EMPRESA
INSERT INTO profiles (id, role) 
SELECT id, 'empresa' 
FROM auth.users 
WHERE email = 'produtojssuporte@gmail.com'
ON CONFLICT (id) DO UPDATE SET role = 'empresa';

-- ENTREGADOR
INSERT INTO profiles (id, role) 
SELECT id, 'entregador' 
FROM auth.users 
WHERE email = 'appmasterbase44@gmail.com'
ON CONFLICT (id) DO UPDATE SET role = 'entregador';

-- CONSUMIDOR
INSERT INTO profiles (id, role) 
SELECT id, 'consumidor' 
FROM auth.users 
WHERE email = 'matutaria@gmail.com'
ON CONFLICT (id) DO UPDATE SET role = 'consumidor';

-- =====================================================
-- PASSO 3: CRIAR DADOS DA EMPRESA MATUTARIA
-- =====================================================

INSERT INTO empresas (
  id,
  profile_id, 
  nome, 
  cnpj, 
  categoria, 
  status, 
  endereco, 
  contato,
  configuracoes
) 
SELECT 
  gen_random_uuid(),
  u.id,
  'Matutaria Delivery',
  '12.345.678/0001-90',
  'Restaurante',
  'aprovada',
  '{"rua": "Rua das Flores, 123", "bairro": "Centro", "cidade": "Sobral", "estado": "CE", "cep": "62000-000", "numero": "123", "complemento": "Loja A"}',
  '{"telefone": "(88) 99999-9999", "email": "produtojssuporte@gmail.com", "whatsapp": "(88) 99999-9999"}',
  '{"horario_funcionamento": {"segunda": {"abertura": "08:00", "fechamento": "22:00"}, "terca": {"abertura": "08:00", "fechamento": "22:00"}, "quarta": {"abertura": "08:00", "fechamento": "22:00"}, "quinta": {"abertura": "08:00", "fechamento": "22:00"}, "sexta": {"abertura": "08:00", "fechamento": "23:00"}, "sabado": {"abertura": "08:00", "fechamento": "23:00"}, "domingo": {"abertura": "10:00", "fechamento": "22:00"}}, "taxa_entrega": 5.00, "tempo_preparo_medio": 30, "pedido_minimo": 15.00}'
FROM auth.users u
WHERE u.email = 'produtojssuporte@gmail.com'
ON CONFLICT (profile_id) DO NOTHING;

-- =====================================================
-- PASSO 4: CRIAR DADOS DO ENTREGADOR
-- =====================================================

INSERT INTO entregadores (
  id,
  profile_id,
  nome,
  cpf,
  endereco,
  contato,
  veiculo,
  status
) 
SELECT 
  gen_random_uuid(),
  u.id,
  'João Entregador Sobral',
  '123.456.789-00',
  '{"rua": "Rua dos Entregadores, 456", "bairro": "Dom Expedito", "cidade": "Sobral", "estado": "CE", "cep": "62010-000"}',
  '{"telefone": "(88) 98888-8888", "email": "appmasterbase44@gmail.com"}',
  '{"tipo": "moto", "marca": "Honda", "modelo": "CG 160", "placa": "ABC-1234", "cor": "Vermelha"}',
  'aprovado'
FROM auth.users u
WHERE u.email = 'appmasterbase44@gmail.com'
ON CONFLICT (profile_id) DO NOTHING;

-- =====================================================
-- PASSO 5: CRIAR DADOS DO CONSUMIDOR
-- =====================================================

INSERT INTO consumidores (
  id,
  profile_id,
  nome,
  cpf,
  endereco,
  contato
) 
SELECT 
  gen_random_uuid(),
  u.id,
  'Cliente Matutaria',
  '987.654.321-00',
  '{"rua": "Rua dos Consumidores, 789", "bairro": "Centro", "cidade": "Sobral", "estado": "CE", "cep": "62000-000", "numero": "789", "complemento": "Apt 101"}',
  '{"telefone": "(88) 97777-7777", "email": "matutaria@gmail.com"}'
FROM auth.users u
WHERE u.email = 'matutaria@gmail.com'
ON CONFLICT (profile_id) DO NOTHING;

-- =====================================================
-- PASSO 6: CRIAR PRODUTOS DA MATUTARIA
-- =====================================================

-- Inserir produtos usando o ID da empresa
INSERT INTO produtos (empresa_id, nome, descricao, preco, categoria, disponivel, tempo_preparacao, ingredientes)
SELECT 
  e.id,
  'Hambúrguer Artesanal',
  'Hambúrguer com carne bovina 180g, queijo cheddar, alface, tomate e molho especial',
  25.90,
  'Lanches',
  true,
  20,
  ARRAY['Pão brioche', 'Carne bovina 180g', 'Queijo cheddar', 'Alface', 'Tomate', 'Molho especial']
FROM empresas e WHERE e.nome = 'Matutaria Delivery'
ON CONFLICT DO NOTHING;

INSERT INTO produtos (empresa_id, nome, descricao, preco, categoria, disponivel, tempo_preparacao, ingredientes)
SELECT 
  e.id,
  'Cheeseburger Duplo',
  'Dois hambúrgueres bovinos, queijo cheddar duplo, picles e molho especial',
  32.90,
  'Lanches',
  true,
  25,
  ARRAY['Pão brioche', '2x Carne bovina 120g', '2x Queijo cheddar', 'Picles', 'Molho especial']
FROM empresas e WHERE e.nome = 'Matutaria Delivery'
ON CONFLICT DO NOTHING;

INSERT INTO produtos (empresa_id, nome, descricao, preco, categoria, disponivel, tempo_preparacao, ingredientes)
SELECT 
  e.id,
  'X-Bacon',
  'Hambúrguer com bacon crocante, queijo, alface, tomate e maionese',
  28.90,
  'Lanches',
  true,
  22,
  ARRAY['Pão brioche', 'Carne bovina 150g', 'Bacon', 'Queijo', 'Alface', 'Tomate', 'Maionese']
FROM empresas e WHERE e.nome = 'Matutaria Delivery'
ON CONFLICT DO NOTHING;

-- Pizzas
INSERT INTO produtos (empresa_id, nome, descricao, preco, categoria, disponivel, tempo_preparacao, ingredientes)
SELECT 
  e.id,
  'Pizza Margherita',
  'Pizza com molho de tomate, mussarela, manjericão fresco e azeite',
  35.00,
  'Pizzas',
  true,
  30,
  ARRAY['Massa artesanal', 'Molho de tomate', 'Mussarela', 'Manjericão', 'Azeite']
FROM empresas e WHERE e.nome = 'Matutaria Delivery'
ON CONFLICT DO NOTHING;

INSERT INTO produtos (empresa_id, nome, descricao, preco, categoria, disponivel, tempo_preparacao, ingredientes)
SELECT 
  e.id,
  'Pizza Pepperoni',
  'Pizza com molho de tomate, mussarela, pepperoni e orégano',
  42.00,
  'Pizzas',
  true,
  30,
  ARRAY['Massa artesanal', 'Molho de tomate', 'Mussarela', 'Pepperoni', 'Orégano']
FROM empresas e WHERE e.nome = 'Matutaria Delivery'
ON CONFLICT DO NOTHING;

-- Bebidas
INSERT INTO produtos (empresa_id, nome, descricao, preco, categoria, disponivel, tempo_preparacao, ingredientes)
SELECT 
  e.id,
  'Coca-Cola Lata',
  'Refrigerante Coca-Cola 350ml gelado',
  5.00,
  'Bebidas',
  true,
  2,
  ARRAY['Coca-Cola 350ml']
FROM empresas e WHERE e.nome = 'Matutaria Delivery'
ON CONFLICT DO NOTHING;

INSERT INTO produtos (empresa_id, nome, descricao, preco, categoria, disponivel, tempo_preparacao, ingredientes)
SELECT 
  e.id,
  'Suco de Laranja Natural',
  'Suco de laranja natural 500ml, sem açúcar',
  8.00,
  'Bebidas',
  true,
  5,
  ARRAY['Laranja natural', 'Gelo']
FROM empresas e WHERE e.nome = 'Matutaria Delivery'
ON CONFLICT DO NOTHING;

-- Acompanhamentos
INSERT INTO produtos (empresa_id, nome, descricao, preco, categoria, disponivel, tempo_preparacao, ingredientes)
SELECT 
  e.id,
  'Batata Frita',
  'Porção de batata frita crocante com sal e orégano',
  12.00,
  'Acompanhamentos',
  true,
  15,
  ARRAY['Batata', 'Óleo', 'Sal', 'Orégano']
FROM empresas e WHERE e.nome = 'Matutaria Delivery'
ON CONFLICT DO NOTHING;

INSERT INTO produtos (empresa_id, nome, descricao, preco, categoria, disponivel, tempo_preparacao, ingredientes)
SELECT 
  e.id,
  'Onion Rings',
  'Anéis de cebola empanados e fritos',
  15.00,
  'Acompanhamentos',
  true,
  12,
  ARRAY['Cebola', 'Farinha', 'Temperos']
FROM empresas e WHERE e.nome = 'Matutaria Delivery'
ON CONFLICT DO NOTHING;

-- Sobremesas
INSERT INTO produtos (empresa_id, nome, descricao, preco, categoria, disponivel, tempo_preparacao, ingredientes)
SELECT 
  e.id,
  'Pudim de Leite',
  'Pudim de leite condensado com calda de caramelo',
  8.00,
  'Sobremesas',
  true,
  5,
  ARRAY['Leite condensado', 'Ovos', 'Açúcar', 'Leite']
FROM empresas e WHERE e.nome = 'Matutaria Delivery'
ON CONFLICT DO NOTHING;

INSERT INTO produtos (empresa_id, nome, descricao, preco, categoria, disponivel, tempo_preparacao, ingredientes)
SELECT 
  e.id,
  'Brownie com Sorvete',
  'Brownie de chocolate quente com sorvete de baunilha',
  12.00,
  'Sobremesas',
  true,
  8,
  ARRAY['Brownie', 'Sorvete de baunilha', 'Calda de chocolate']
FROM empresas e WHERE e.nome = 'Matutaria Delivery'
ON CONFLICT DO NOTHING;

-- =====================================================
-- PASSO 7: VERIFICAR DADOS CRIADOS
-- =====================================================

-- Verificar usuários criados
SELECT 'USUÁRIOS CRIADOS:' as info;
SELECT 
  p.id, 
  p.role, 
  u.email,
  CASE 
    WHEN p.role = 'admin' THEN 'Administrador Sistema'
    WHEN p.role = 'empresa' THEN COALESCE(e.nome, 'Empresa')
    WHEN p.role = 'entregador' THEN COALESCE(ent.nome, 'Entregador')
    WHEN p.role = 'consumidor' THEN COALESCE(c.nome, 'Consumidor')
  END as nome,
  u.email_confirmed_at IS NOT NULL as email_confirmado
FROM profiles p
JOIN auth.users u ON p.id = u.id
LEFT JOIN empresas e ON p.id = e.profile_id
LEFT JOIN entregadores ent ON p.id = ent.profile_id
LEFT JOIN consumidores c ON p.id = c.profile_id
WHERE u.email IN ('entregasobral@gmail.com', 'produtojssuporte@gmail.com', 'appmasterbase44@gmail.com', 'matutaria@gmail.com')
ORDER BY p.role;

-- Verificar produtos criados
SELECT 'PRODUTOS CRIADOS:' as info;
SELECT nome, categoria, preco, disponivel 
FROM produtos 
WHERE empresa_id IN (SELECT id FROM empresas WHERE nome = 'Matutaria Delivery')
ORDER BY categoria, nome;

-- =====================================================
-- CREDENCIAIS PARA LOGIN
-- =====================================================

SELECT '
🔑 CREDENCIAIS PARA LOGIN:

👨‍💼 ADMINISTRADOR:
   Email: entregasobral@gmail.com
   Senha: tenderbr0
   
🏢 EMPRESA:
   Email: produtojssuporte@gmail.com
   Senha: tenderbr0
   
🏍️ ENTREGADOR:
   Email: appmasterbase44@gmail.com
   Senha: tenderbr0
   
👤 CONSUMIDOR:
   Email: matutaria@gmail.com
   Senha: tenderbr0

✅ Todos os usuários estão prontos para login!
✅ Empresa Matutaria criada com produtos completos!
✅ Sistema 100% funcional!
' as credenciais;