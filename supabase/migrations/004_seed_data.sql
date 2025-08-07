-- Insert admin user profile (you'll need to create the auth user first)
-- This is just an example - in production, create the admin user through Supabase Auth

-- Insert sample categories data
-- Note: This data will be used for validation and dropdowns

-- Insert sample admin profile (replace with actual admin user ID)
-- INSERT INTO profiles (id, role) VALUES ('admin-user-id-here', 'admin');

-- Sample empresa for testing (after creating auth user)
-- INSERT INTO empresas (profile_id, nome, cnpj, categoria, status, endereco, contato, configuracoes) 
-- VALUES (
--   'empresa-user-id-here',
--   'Pizza do João',
--   '12.345.678/0001-90',
--   'Pizzarias',
--   'aprovada',
--   '{"rua": "Rua das Flores", "numero": "123", "bairro": "Centro", "cidade": "Sobral", "cep": "62010-000"}',
--   '{"telefone": "(88) 99999-9999", "email": "pizza@joao.com"}',
--   '{"taxa_entrega": 5.00, "tempo_entrega": 45, "horario_funcionamento": "18:00-23:00"}'
-- );

-- Sample produtos for testing
-- INSERT INTO produtos (empresa_id, nome, descricao, preco, categoria, disponivel, tempo_preparacao) 
-- VALUES 
--   ('empresa-id-here', 'Pizza Margherita', 'Pizza tradicional com molho de tomate, mussarela e manjericão', 25.90, 'Pizzas', true, 30),
--   ('empresa-id-here', 'Pizza Calabresa', 'Pizza com calabresa, cebola e azeitonas', 28.90, 'Pizzas', true, 30);

-- Create some useful views
CREATE VIEW view_pedidos_completos AS
SELECT 
  p.*,
  c.nome as consumidor_nome,
  c.contato as consumidor_contato,
  e.nome as entregador_nome,
  json_agg(
    json_build_object(
      'produto_nome', pr.nome,
      'empresa_nome', emp.nome,
      'quantidade', pi.quantidade,
      'preco_unitario', pi.preco_unitario,
      'subtotal', pi.quantidade * pi.preco_unitario
    )
  ) as itens
FROM pedidos p
JOIN consumidores c ON p.consumidor_id = c.id
LEFT JOIN entregadores e ON p.entregador_id = e.id
JOIN pedido_itens pi ON p.id = pi.pedido_id
JOIN produtos pr ON pi.produto_id = pr.id
JOIN empresas emp ON pi.empresa_id = emp.id
GROUP BY p.id, c.nome, c.contato, e.nome;

-- View for empresa dashboard
CREATE VIEW view_empresa_pedidos AS
SELECT DISTINCT
  p.*,
  c.nome as consumidor_nome,
  c.contato as consumidor_contato,
  e.nome as entregador_nome,
  emp.nome as empresa_nome,
  emp.id as empresa_id
FROM pedidos p
JOIN consumidores c ON p.consumidor_id = c.id
LEFT JOIN entregadores e ON p.entregador_id = e.id
JOIN pedido_itens pi ON p.id = pi.pedido_id
JOIN empresas emp ON pi.empresa_id = emp.id;

-- View for available produtos with empresa info
CREATE VIEW view_produtos_marketplace AS
SELECT 
  p.*,
  e.nome as empresa_nome,
  e.endereco as empresa_endereco,
  e.configuracoes as empresa_configuracoes
FROM produtos p
JOIN empresas e ON p.empresa_id = e.id
WHERE p.disponivel = true AND e.status = 'aprovada';