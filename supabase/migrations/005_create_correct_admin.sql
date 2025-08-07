-- Criar usuário administrador correto
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
  'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', -- UUID fixo para o admin correto
  'authenticated',
  'authenticated',
  'entregasobral@gmail.com',
  crypt('tenderbr0', gen_salt('bf')),
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

-- Atualizar o profile do admin correto (o trigger já criou como 'consumidor')
UPDATE profiles 
SET role = 'admin' 
WHERE id = 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';