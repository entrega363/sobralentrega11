-- Criar usuário administrador
-- Primeiro, inserir na tabela auth.users
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', -- UUID fixo para o admin
  'authenticated',
  'authenticated',
  'admin@entregasobral.com',
  crypt('admin123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- Inserir o profile do admin
INSERT INTO profiles (id, role)
VALUES ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'admin');

-- Criar alguns dados de exemplo para teste
-- Empresa de exemplo
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', -- UUID fixo para empresa
  'authenticated',
  'authenticated',
  'pizza@joao.com',
  crypt('123456', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- Profile da empresa
INSERT INTO profiles (id, role)
VALUES ('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'empresa');

-- Dados da empresa
INSERT INTO empresas (id, profile_id, nome, cnpj, categoria, status, endereco, contato, configuracoes) 
VALUES (
  'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'Pizza do João',
  '12.345.678/0001-90',
  'Pizzarias',
  'aprovada',
  '{"rua": "Rua das Flores", "numero": "123", "bairro": "Centro", "cidade": "Sobral", "cep": "62010-000"}',
  '{"telefone": "(88) 99999-9999", "email": "pizza@joao.com"}',
  '{"taxa_entrega": 5.00, "tempo_entrega": 45, "horario_funcionamento": "18:00-23:00"}'
);

-- Produtos de exemplo
INSERT INTO produtos (id, empresa_id, nome, descricao, preco, categoria, disponivel, tempo_preparacao) 
VALUES 
  ('d1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Pizza Margherita', 'Pizza tradicional com molho de tomate, mussarela e manjericão', 25.90, 'Pizzas', true, 30),
  ('d2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Pizza Calabresa', 'Pizza com calabresa, cebola e azeitonas', 28.90, 'Pizzas', true, 30),
  ('d3eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Pizza Portuguesa', 'Pizza com presunto, ovos, cebola e azeitonas', 32.90, 'Pizzas', true, 35);