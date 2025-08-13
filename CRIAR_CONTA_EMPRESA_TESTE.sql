-- Script para criar conta de empresa de teste
-- Execute este script no Supabase SQL Editor

-- 1. Primeiro, vamos verificar se já existe uma conta com este email
SELECT id, email, role FROM auth.users WHERE email = 'matutaria@gmail.com';

-- 2. Se não existir, vamos criar uma conta de empresa de teste
-- Nota: Este script deve ser executado no Supabase SQL Editor

-- Inserir usuário na tabela auth.users (simulando registro via Supabase Auth)
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
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'matutaria@gmail.com',
  crypt('123456789', gen_salt('bf')), -- Senha: 123456789
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
) ON CONFLICT (email) DO NOTHING;

-- 3. Criar perfil de empresa
INSERT INTO profiles (
  id,
  email,
  nome,
  telefone,
  role,
  ativo,
  created_at,
  updated_at
) 
SELECT 
  u.id,
  u.email,
  'Matutaria Delivery',
  '(85) 99999-9999',
  'empresa',
  true,
  NOW(),
  NOW()
FROM auth.users u 
WHERE u.email = 'matutaria@gmail.com'
ON CONFLICT (id) DO UPDATE SET
  nome = EXCLUDED.nome,
  telefone = EXCLUDED.telefone,
  role = EXCLUDED.role,
  ativo = EXCLUDED.ativo,
  updated_at = NOW();

-- 4. Criar registro na tabela empresas
INSERT INTO empresas (
  id,
  user_id,
  nome,
  cnpj,
  telefone,
  endereco,
  cidade,
  estado,
  cep,
  descricao,
  categoria,
  horario_funcionamento,
  taxa_entrega,
  tempo_entrega_min,
  tempo_entrega_max,
  ativo,
  created_at,
  updated_at
)
SELECT 
  gen_random_uuid(),
  u.id,
  'Matutaria Delivery',
  '12.345.678/0001-90',
  '(85) 99999-9999',
  'Rua das Flores, 123',
  'Sobral',
  'CE',
  '62010-000',
  'Restaurante especializado em comida caseira e lanches',
  'restaurante',
  '{"segunda": "08:00-22:00", "terca": "08:00-22:00", "quarta": "08:00-22:00", "quinta": "08:00-22:00", "sexta": "08:00-22:00", "sabado": "08:00-22:00", "domingo": "08:00-20:00"}',
  5.00,
  30,
  60,
  true,
  NOW(),
  NOW()
FROM auth.users u 
WHERE u.email = 'matutaria@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET
  nome = EXCLUDED.nome,
  telefone = EXCLUDED.telefone,
  endereco = EXCLUDED.endereco,
  updated_at = NOW();

-- 5. Atualizar o perfil com o empresa_id
UPDATE profiles 
SET empresa_id = e.id,
    updated_at = NOW()
FROM empresas e
JOIN auth.users u ON e.user_id = u.id
WHERE profiles.id = u.id 
AND u.email = 'matutaria@gmail.com';

-- 6. Verificar se tudo foi criado corretamente
SELECT 
  u.email,
  p.nome as profile_nome,
  p.role,
  p.ativo as profile_ativo,
  e.nome as empresa_nome,
  e.ativo as empresa_ativo
FROM auth.users u
JOIN profiles p ON u.id = p.id
LEFT JOIN empresas e ON p.empresa_id = e.id
WHERE u.email = 'matutaria@gmail.com';

-- 7. Criar alguns produtos de exemplo para a empresa
INSERT INTO produtos (
  id,
  empresa_id,
  nome,
  descricao,
  preco,
  categoria,
  disponivel,
  tempo_preparo,
  created_at,
  updated_at
)
SELECT 
  gen_random_uuid(),
  e.id,
  produto.nome,
  produto.descricao,
  produto.preco,
  produto.categoria,
  true,
  produto.tempo_preparo,
  NOW(),
  NOW()
FROM empresas e
CROSS JOIN (
  VALUES 
    ('Pizza Margherita', 'Pizza tradicional com molho de tomate, mussarela e manjericão', 35.90, 'pizza', 25),
    ('Hambúrguer Artesanal', 'Hambúrguer 180g com queijo, alface, tomate e batata frita', 28.50, 'lanche', 15),
    ('Lasanha Bolonhesa', 'Lasanha tradicional com molho bolonhesa e queijo', 45.90, 'prato-principal', 35),
    ('Salada Caesar', 'Salada com alface americana, croutons, parmesão e molho caesar', 25.90, 'salada', 10),
    ('Refrigerante Lata', 'Refrigerante gelado 350ml', 5.00, 'bebida', 2),
    ('Suco Natural', 'Suco natural de frutas da estação', 8.90, 'bebida', 5)
) AS produto(nome, descricao, preco, categoria, tempo_preparo)
WHERE e.user_id = (SELECT id FROM auth.users WHERE email = 'matutaria@gmail.com')
ON CONFLICT DO NOTHING;

-- Mensagem de sucesso
SELECT 'Conta de empresa criada com sucesso!' as resultado,
       'Email: matutaria@gmail.com' as email,
       'Senha: 123456789' as senha;