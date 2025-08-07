-- Adicionar dados de exemplo para o dashboard

-- Inserir empresas de exemplo diretamente (sem criar usuários auth)
INSERT INTO empresas (profile_id, nome, cnpj, categoria, status, endereco, contato, configuracoes) 
VALUES 
  ('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Pizza do João', '12.345.678/0001-90', 'Pizzarias', 'aprovada', '{"rua": "Rua das Flores", "numero": "123", "bairro": "Centro", "cidade": "Sobral", "cep": "62010-000"}', '{"telefone": "(88) 99999-9999", "email": "pizza@joao.com"}', '{"taxa_entrega": 5.00, "tempo_entrega": 45, "horario_funcionamento": "18:00-23:00"}'),
  ('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Burguer King Sobral', '98.765.432/0001-10', 'Hamburgueria', 'pendente', '{"rua": "Av. Principal", "numero": "789", "bairro": "Centro", "cidade": "Sobral", "cep": "62010-200"}', '{"telefone": "(88) 77777-7777", "email": "burguer@teste.com"}', '{"taxa_entrega": 8.00, "tempo_entrega": 30, "horario_funcionamento": "11:00-23:00"}'),
  ('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Açaí da Praia', '11.222.333/0001-44', 'Açaiterias', 'aprovada', '{"rua": "Rua da Praia", "numero": "100", "bairro": "Centro", "cidade": "Sobral", "cep": "62010-300"}', '{"telefone": "(88) 66666-6666", "email": "acai@praia.com"}', '{"taxa_entrega": 3.00, "tempo_entrega": 20, "horario_funcionamento": "14:00-22:00"}');

-- Inserir consumidores de exemplo
INSERT INTO consumidores (profile_id, nome, cpf, endereco, contato) 
VALUES 
  ('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'João Silva', '123.456.789-00', '{"rua": "Rua das Palmeiras", "numero": "456", "bairro": "Centro", "cidade": "Sobral", "cep": "62010-100"}', '{"telefone": "(88) 88888-8888", "email": "cliente@teste.com"}'),
  ('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Maria Santos', '987.654.321-00', '{"rua": "Av. Central", "numero": "789", "bairro": "Centro", "cidade": "Sobral", "cep": "62010-400"}', '{"telefone": "(88) 55555-5555", "email": "maria@teste.com"}');