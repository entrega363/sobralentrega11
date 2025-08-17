-- =====================================================
-- CRIAR DADOS COMPLETOS DE EXEMPLO
-- =====================================================
-- Execute este script para criar usuários e dados de exemplo

-- =====================================================
-- 1. CRIAR USUÁRIO ADMIN
-- =====================================================

-- Criar profile admin (usando UUID genérico)
INSERT INTO profiles (id, role) 
VALUES ('00000000-0000-0000-0000-000000000001', 'admin') 
ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- =====================================================
-- 2. CRIAR USUÁRIOS DE EXEMPLO
-- =====================================================

-- Profile para empresa
INSERT INTO profiles (id, role) 
VALUES ('00000000-0000-0000-0000-000000000002', 'empresa') 
ON CONFLICT (id) DO NOTHING;

-- Profile para entregador
INSERT INTO profiles (id, role) 
VALUES ('00000000-0000-0000-0000-000000000003', 'entregador') 
ON CONFLICT (id) DO NOTHING;

-- Profile para consumidor
INSERT INTO profiles (id, role) 
VALUES ('00000000-0000-0000-0000-000000000004', 'consumidor') 
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 3. CRIAR EMPRESA DE EXEMPLO
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
) VALUES (
  '10000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002',
  'Matutaria Delivery',
  '12.345.678/0001-90',
  'Restaurante',
  'aprovada',
  '{
    "rua": "Rua das Flores, 123",
    "bairro": "Centro",
    "cidade": "Fortaleza",
    "estado": "CE",
    "cep": "60000-000",
    "numero": "123",
    "complemento": "Loja A"
  }',
  '{
    "telefone": "(85) 99999-9999",
    "email": "contato@matutaria.com",
    "whatsapp": "(85) 99999-9999"
  }',
  '{
    "horario_funcionamento": {
      "segunda": {"abertura": "08:00", "fechamento": "22:00"},
      "terca": {"abertura": "08:00", "fechamento": "22:00"},
      "quarta": {"abertura": "08:00", "fechamento": "22:00"},
      "quinta": {"abertura": "08:00", "fechamento": "22:00"},
      "sexta": {"abertura": "08:00", "fechamento": "23:00"},
      "sabado": {"abertura": "08:00", "fechamento": "23:00"},
      "domingo": {"abertura": "10:00", "fechamento": "22:00"}
    },
    "taxa_entrega": 5.00,
    "tempo_preparo_medio": 30,
    "pedido_minimo": 15.00
  }'
) ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 4. CRIAR ENTREGADOR DE EXEMPLO
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
) VALUES (
  '20000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000003',
  'João Silva',
  '123.456.789-00',
  '{
    "rua": "Rua dos Entregadores, 456",
    "bairro": "Aldeota",
    "cidade": "Fortaleza",
    "estado": "CE",
    "cep": "60150-000"
  }',
  '{
    "telefone": "(85) 98888-8888",
    "email": "joao.entregador@email.com"
  }',
  '{
    "tipo": "moto",
    "marca": "Honda",
    "modelo": "CG 160",
    "placa": "ABC-1234",
    "cor": "Vermelha"
  }',
  'aprovado'
) ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 5. CRIAR CONSUMIDOR DE EXEMPLO
-- =====================================================

INSERT INTO consumidores (
  id,
  profile_id,
  nome,
  cpf,
  endereco,
  contato
) VALUES (
  '30000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000004',
  'Maria Santos',
  '987.654.321-00',
  '{
    "rua": "Rua dos Consumidores, 789",
    "bairro": "Meireles",
    "cidade": "Fortaleza",
    "estado": "CE",
    "cep": "60165-000",
    "numero": "789",
    "complemento": "Apt 101"
  }',
  '{
    "telefone": "(85) 97777-7777",
    "email": "maria.consumidora@email.com"
  }'
) ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 6. CRIAR PRODUTOS DE EXEMPLO
-- =====================================================

-- Lanches
INSERT INTO produtos (
  id,
  empresa_id,
  nome,
  descricao,
  preco,
  categoria,
  imagem_url,
  disponivel,
  tempo_preparacao,
  ingredientes,
  observacoes
) VALUES 
(
  '40000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000001',
  'Hambúrguer Artesanal',
  'Hambúrguer com carne bovina 180g, queijo cheddar, alface, tomate, cebola roxa e molho especial da casa',
  25.90,
  'Lanches',
  'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
  true,
  20,
  ARRAY['Pão brioche', 'Carne bovina 180g', 'Queijo cheddar', 'Alface', 'Tomate', 'Cebola roxa', 'Molho especial'],
  'Ponto da carne: ao ponto (pode ser alterado)'
),
(
  '40000000-0000-0000-0000-000000000002',
  '10000000-0000-0000-0000-000000000001',
  'Cheeseburger Duplo',
  'Dois hambúrgueres bovinos, queijo cheddar duplo, picles, cebola e molho especial',
  32.90,
  'Lanches',
  'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400',
  true,
  25,
  ARRAY['Pão brioche', '2x Carne bovina 120g', '2x Queijo cheddar', 'Picles', 'Cebola', 'Molho especial'],
  'Lanche generoso para quem tem fome'
),
(
  '40000000-0000-0000-0000-000000000003',
  '10000000-0000-0000-0000-000000000001',
  'Hambúrguer Vegetariano',
  'Hambúrguer de grão-de-bico e quinoa, queijo vegano, alface, tomate e molho tahine',
  22.90,
  'Lanches',
  'https://images.unsplash.com/photo-1525059696034-4967a729002e?w=400',
  true,
  18,
  ARRAY['Pão integral', 'Hambúrguer vegetal', 'Queijo vegano', 'Alface', 'Tomate', 'Molho tahine'],
  'Opção vegana deliciosa'
);

-- Pizzas
INSERT INTO produtos (
  id,
  empresa_id,
  nome,
  descricao,
  preco,
  categoria,
  imagem_url,
  disponivel,
  tempo_preparacao,
  ingredientes,
  observacoes
) VALUES 
(
  '40000000-0000-0000-0000-000000000004',
  '10000000-0000-0000-0000-000000000001',
  'Pizza Margherita',
  'Pizza tradicional com molho de tomate, mussarela de búfala, manjericão fresco e azeite extravirgem',
  35.00,
  'Pizzas',
  'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400',
  true,
  30,
  ARRAY['Massa artesanal', 'Molho de tomate', 'Mussarela de búfala', 'Manjericão fresco', 'Azeite extravirgem'],
  'Tamanho: 35cm (8 fatias)'
),
(
  '40000000-0000-0000-0000-000000000005',
  '10000000-0000-0000-0000-000000000001',
  'Pizza Pepperoni',
  'Pizza com molho de tomate, mussarela, pepperoni e orégano',
  42.00,
  'Pizzas',
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400',
  true,
  30,
  ARRAY['Massa artesanal', 'Molho de tomate', 'Mussarela', 'Pepperoni', 'Orégano'],
  'Clássica e saborosa'
),
(
  '40000000-0000-0000-0000-000000000006',
  '10000000-0000-0000-0000-000000000001',
  'Pizza Quatro Queijos',
  'Pizza com mussarela, gorgonzola, parmesão, provolone e orégano',
  45.00,
  'Pizzas',
  'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400',
  true,
  32,
  ARRAY['Massa artesanal', 'Mussarela', 'Gorgonzola', 'Parmesão', 'Provolone', 'Orégano'],
  'Para os amantes de queijo'
);

-- Bebidas
INSERT INTO produtos (
  id,
  empresa_id,
  nome,
  descricao,
  preco,
  categoria,
  imagem_url,
  disponivel,
  tempo_preparacao,
  ingredientes,
  observacoes
) VALUES 
(
  '40000000-0000-0000-0000-000000000007',
  '10000000-0000-0000-0000-000000000001',
  'Coca-Cola Lata',
  'Refrigerante Coca-Cola 350ml gelado',
  5.00,
  'Bebidas',
  'https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=400',
  true,
  2,
  ARRAY['Coca-Cola 350ml'],
  'Sempre gelada'
),
(
  '40000000-0000-0000-0000-000000000008',
  '10000000-0000-0000-0000-000000000001',
  'Suco de Laranja Natural',
  'Suco de laranja natural 500ml, sem açúcar adicionado',
  8.00,
  'Bebidas',
  'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400',
  true,
  5,
  ARRAY['Laranja natural', 'Gelo'],
  'Feito na hora'
),
(
  '40000000-0000-0000-0000-000000000009',
  '10000000-0000-0000-0000-000000000001',
  'Água Mineral',
  'Água mineral sem gás 500ml',
  3.00,
  'Bebidas',
  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400',
  true,
  1,
  ARRAY['Água mineral 500ml'],
  'Sempre gelada'
);

-- Acompanhamentos
INSERT INTO produtos (
  id,
  empresa_id,
  nome,
  descricao,
  preco,
  categoria,
  imagem_url,
  disponivel,
  tempo_preparacao,
  ingredientes,
  observacoes
) VALUES 
(
  '40000000-0000-0000-0000-000000000010',
  '10000000-0000-0000-0000-000000000001',
  'Batata Frita',
  'Porção de batata frita crocante com sal e orégano',
  12.00,
  'Acompanhamentos',
  'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400',
  true,
  15,
  ARRAY['Batata', 'Óleo', 'Sal', 'Orégano'],
  'Porção individual'
),
(
  '40000000-0000-0000-0000-000000000011',
  '10000000-0000-0000-0000-000000000001',
  'Onion Rings',
  'Anéis de cebola empanados e fritos, crocantes por fora e macios por dentro',
  15.00,
  'Acompanhamentos',
  'https://images.unsplash.com/photo-1639024471283-03518883512d?w=400',
  true,
  12,
  ARRAY['Cebola', 'Farinha de trigo', 'Temperos', 'Óleo'],
  'Acompanha molho especial'
);

-- =====================================================
-- 7. CRIAR GARÇOM DE EXEMPLO
-- =====================================================

INSERT INTO garcons (
  id,
  empresa_id,
  nome,
  usuario,
  senha_hash,
  ativo,
  permissoes
) VALUES (
  '50000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000001',
  'Carlos Garçom',
  'carlos.garcom',
  '$2b$10$example.hash.here.for.password123',
  true,
  '{
    "criar_pedidos": true,
    "editar_pedidos": true,
    "cancelar_pedidos": false,
    "ver_relatorios": false
  }'
) ON CONFLICT (usuario) DO NOTHING;

-- =====================================================
-- 8. CRIAR PEDIDO DE EXEMPLO
-- =====================================================

-- Primeiro criar o pedido
INSERT INTO pedidos (
  id,
  consumidor_id,
  status,
  total,
  endereco_entrega,
  observacoes,
  forma_pagamento,
  tipo_entrega,
  entregador_id,
  tipo_pedido
) VALUES (
  '60000000-0000-0000-0000-000000000001',
  '30000000-0000-0000-0000-000000000001',
  'entregue',
  45.90,
  '{
    "rua": "Rua dos Consumidores, 789",
    "bairro": "Meireles",
    "cidade": "Fortaleza",
    "estado": "CE",
    "cep": "60165-000",
    "numero": "789",
    "complemento": "Apt 101",
    "referencia": "Próximo ao shopping"
  }',
  'Sem cebola no hambúrguer, por favor',
  'Cartão de Crédito',
  'sistema',
  '20000000-0000-0000-0000-000000000001',
  'delivery'
) ON CONFLICT (id) DO NOTHING;

-- Depois criar os itens do pedido
INSERT INTO pedido_itens (
  id,
  pedido_id,
  produto_id,
  empresa_id,
  quantidade,
  preco_unitario,
  observacoes
) VALUES 
(
  '70000000-0000-0000-0000-000000000001',
  '60000000-0000-0000-0000-000000000001',
  '40000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000001',
  1,
  25.90,
  'Sem cebola'
),
(
  '70000000-0000-0000-0000-000000000002',
  '60000000-0000-0000-0000-000000000001',
  '40000000-0000-0000-0000-000000000010',
  '10000000-0000-0000-0000-000000000001',
  1,
  12.00,
  null
),
(
  '70000000-0000-0000-0000-000000000003',
  '60000000-0000-0000-0000-000000000001',
  '40000000-0000-0000-0000-000000000007',
  '10000000-0000-0000-0000-000000000001',
  1,
  5.00,
  null
),
(
  '70000000-0000-0000-0000-000000000004',
  '60000000-0000-0000-0000-000000000001',
  '40000000-0000-0000-0000-000000000009',
  '10000000-0000-0000-0000-000000000001',
  1,
  3.00,
  null
) ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 9. CRIAR AVALIAÇÃO DE EXEMPLO
-- =====================================================

INSERT INTO avaliacoes (
  id,
  pedido_id,
  consumidor_id,
  empresa_id,
  entregador_id,
  avaliador_id,
  avaliador_nome,
  avaliado_id,
  avaliado_nome,
  tipo_avaliacao,
  nota_empresa,
  nota_entregador,
  nota_geral,
  nota_qualidade,
  nota_atendimento,
  nota_pontualidade,
  nota_embalagem,
  comentario_empresa,
  comentario_entregador,
  comentario,
  pontos_positivos,
  pontos_negativos
) VALUES (
  '80000000-0000-0000-0000-000000000001',
  '60000000-0000-0000-0000-000000000001',
  '30000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000001',
  '20000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000004',
  'Maria Santos',
  '00000000-0000-0000-0000-000000000002',
  'Matutaria Delivery',
  'empresa',
  5,
  5,
  5,
  5,
  5,
  4,
  5,
  'Comida excelente, hambúrguer muito saboroso!',
  'Entregador muito educado e pontual',
  'Experiência perfeita, recomendo muito!',
  ARRAY['Comida deliciosa', 'Entrega rápida', 'Atendimento excelente', 'Embalagem caprichada'],
  ARRAY['Nada a reclamar']
) ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 10. VERIFICAR DADOS CRIADOS
-- =====================================================

-- Verificar profiles criados
SELECT 'PROFILES CRIADOS:' as info;
SELECT p.id, p.role, 
  CASE 
    WHEN p.role = 'admin' THEN 'Administrador'
    WHEN p.role = 'empresa' THEN e.nome
    WHEN p.role = 'entregador' THEN ent.nome
    WHEN p.role = 'consumidor' THEN c.nome
  END as nome
FROM profiles p
LEFT JOIN empresas e ON p.id = e.profile_id
LEFT JOIN entregadores ent ON p.id = ent.profile_id
LEFT JOIN consumidores c ON p.id = c.profile_id
ORDER BY p.role;

-- Verificar produtos criados
SELECT 'PRODUTOS CRIADOS:' as info;
SELECT nome, categoria, preco, disponivel 
FROM produtos 
ORDER BY categoria, nome;

-- Verificar pedido criado
SELECT 'PEDIDO CRIADO:' as info;
SELECT p.id, p.status, p.total, 
       c.nome as consumidor,
       e.nome as entregador
FROM pedidos p
JOIN consumidores cons ON p.consumidor_id = cons.id
JOIN entregadores e ON p.entregador_id = e.id
JOIN profiles c ON cons.profile_id = c.id;

-- Verificar itens do pedido
SELECT 'ITENS DO PEDIDO:' as info;
SELECT pr.nome, pi.quantidade, pi.preco_unitario, 
       (pi.quantidade * pi.preco_unitario) as subtotal
FROM pedido_itens pi
JOIN produtos pr ON pi.produto_id = pr.id
ORDER BY pr.nome;

-- =====================================================
-- DADOS CRIADOS COM SUCESSO!
-- =====================================================
/*
RESUMO DO QUE FOI CRIADO:

✅ 1 Usuário Admin
✅ 1 Empresa (Matutaria Delivery) - aprovada
✅ 1 Entregador (João Silva) - aprovado  
✅ 1 Consumidor (Maria Santos)
✅ 11 Produtos variados (lanches, pizzas, bebidas, acompanhamentos)
✅ 1 Garçom (Carlos Garçom)
✅ 1 Pedido completo com 4 itens - entregue
✅ 1 Avaliação 5 estrelas

CREDENCIAIS DE TESTE:
- Admin: ID 00000000-0000-0000-0000-000000000001
- Empresa: ID 00000000-0000-0000-0000-000000000002
- Entregador: ID 00000000-0000-0000-0000-000000000003
- Consumidor: ID 00000000-0000-0000-0000-000000000004

AGORA SEU SISTEMA ESTÁ PRONTO PARA TESTES!
*/