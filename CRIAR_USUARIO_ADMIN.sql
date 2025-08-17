-- =====================================================
-- CRIAR USUÁRIO ADMIN
-- =====================================================
-- Execute este script após criar o usuário no Supabase Auth

-- PASSO 1: Primeiro crie um usuário no Supabase Auth Dashboard
-- Vá em Authentication > Users > Add User
-- Email: admin@matutaria.com
-- Senha: sua-senha-aqui
-- Copie o UUID do usuário criado

-- PASSO 2: Execute este comando substituindo o UUID
-- Substitua 'SEU-UUID-AQUI' pelo UUID real do usuário criado
INSERT INTO profiles (id, role) 
VALUES ('SEU-UUID-AQUI', 'admin') 
ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- EXEMPLO (substitua pelo UUID real):
-- INSERT INTO profiles (id, role) 
-- VALUES ('12345678-1234-1234-1234-123456789012', 'admin') 
-- ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- =====================================================
-- VERIFICAR SE FOI CRIADO
-- =====================================================
-- Execute este comando para verificar:
SELECT p.id, p.role, u.email 
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE p.role = 'admin';

-- =====================================================
-- CRIAR DADOS DE EXEMPLO (OPCIONAL)
-- =====================================================

-- Exemplo de empresa (substitua os UUIDs pelos reais)
/*
INSERT INTO empresas (profile_id, nome, cnpj, categoria, status, endereco, contato) 
VALUES (
  'uuid-do-usuario-empresa',
  'Matutaria Delivery',
  '12.345.678/0001-90',
  'Restaurante',
  'aprovada',
  '{"rua": "Rua das Flores, 123", "cidade": "Fortaleza", "cep": "60000-000", "bairro": "Centro"}',
  '{"telefone": "(85) 99999-9999", "email": "contato@matutaria.com"}'
);
*/

-- Exemplo de produtos (substitua o UUID da empresa)
/*
INSERT INTO produtos (empresa_id, nome, descricao, preco, categoria, disponivel, tempo_preparacao) 
VALUES 
  ('uuid-da-empresa', 'Hambúrguer Artesanal', 'Hambúrguer com carne 180g, queijo, alface e tomate', 25.90, 'Lanches', true, 20),
  ('uuid-da-empresa', 'Pizza Margherita', 'Pizza tradicional com molho de tomate, mussarela e manjericão', 35.00, 'Pizzas', true, 30),
  ('uuid-da-empresa', 'Refrigerante Lata', 'Coca-Cola 350ml', 5.00, 'Bebidas', true, 2),
  ('uuid-da-empresa', 'Batata Frita', 'Porção de batata frita crocante', 12.00, 'Acompanhamentos', true, 15);
*/

-- =====================================================
-- INSTRUÇÕES DE USO
-- =====================================================
/*
COMO USAR:

1. Vá para o Supabase Dashboard
2. Authentication > Users > Add User
3. Crie um usuário com email e senha
4. Copie o UUID do usuário
5. Substitua 'SEU-UUID-AQUI' pelo UUID real
6. Execute o comando INSERT INTO profiles
7. Verifique com o comando SELECT

PRONTO! Agora você tem um usuário admin funcionando.
*/