-- CORREÇÃO DEFINITIVA DO SISTEMA DE LOGIN
-- Execute este script no Supabase para corrigir todos os problemas

-- 1. LIMPAR DADOS INCONSISTENTES
DELETE FROM empresas WHERE user_id NOT IN (SELECT id FROM auth.users);
DELETE FROM profiles WHERE id NOT IN (SELECT id FROM auth.users);

-- 2. RECRIAR FUNÇÃO handle_new_user CORRIGIDA
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Inserir profile básico
  INSERT INTO profiles (id, email, role, nome, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'consumidor'),
    COALESCE(NEW.raw_user_meta_data->>'nome', split_part(NEW.email, '@', 1)),
    NOW(),
    NOW()
  );
  
  -- Se for empresa, criar registro na tabela empresas
  IF COALESCE(NEW.raw_user_meta_data->>'role', 'consumidor') = 'empresa' THEN
    INSERT INTO empresas (
      user_id,
      nome,
      email,
      telefone,
      endereco,
      created_at,
      updated_at
    ) VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'nome', split_part(NEW.email, '@', 1)),
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'telefone', ''),
      COALESCE(NEW.raw_user_meta_data->>'endereco', ''),
      NOW(),
      NOW()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. RECRIAR TRIGGER
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 4. CRIAR USUÁRIOS DE TESTE COM SENHAS FUNCIONAIS
-- Primeiro, vamos deletar usuários existentes se houver
DO $$
DECLARE
    user_record RECORD;
BEGIN
    -- Deletar usuários existentes
    FOR user_record IN 
        SELECT id FROM auth.users 
        WHERE email IN (
            'admin@matutaria.com',
            'matutaria@delivery.com', 
            'consumidor@teste.com',
            'entregador@teste.com',
            'empresa@teste.com'
        )
    LOOP
        DELETE FROM profiles WHERE id = user_record.id;
        DELETE FROM empresas WHERE user_id = user_record.id;
        DELETE FROM auth.users WHERE id = user_record.id;
    END LOOP;
END $$;

-- 5. INSERIR USUÁRIOS DIRETAMENTE NA TABELA auth.users
-- ADMIN
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
    'admin@matutaria.com',
    crypt('admin123456', gen_salt('bf')),
    NOW(),
    NULL,
    NULL,
    '{"provider": "email", "providers": ["email"]}',
    '{"role": "admin", "nome": "Administrador"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
);

-- MATUTARIA EMPRESA
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
    'matutaria@delivery.com',
    crypt('matutaria123', gen_salt('bf')),
    NOW(),
    NULL,
    NULL,
    '{"provider": "email", "providers": ["email"]}',
    '{"role": "empresa", "nome": "Matutaria Delivery"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
);

-- CONSUMIDOR TESTE
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
    'consumidor@teste.com',
    crypt('teste123456', gen_salt('bf')),
    NOW(),
    NULL,
    NULL,
    '{"provider": "email", "providers": ["email"]}',
    '{"role": "consumidor", "nome": "Consumidor Teste"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
);

-- ENTREGADOR TESTE
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
    'entregador@teste.com',
    crypt('teste123456', gen_salt('bf')),
    NOW(),
    NULL,
    NULL,
    '{"provider": "email", "providers": ["email"]}',
    '{"role": "entregador", "nome": "Entregador Teste"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
);

-- EMPRESA TESTE
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
    'empresa@teste.com',
    crypt('teste123456', gen_salt('bf')),
    NOW(),
    NULL,
    NULL,
    '{"provider": "email", "providers": ["email"]}',
    '{"role": "empresa", "nome": "Empresa Teste"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
);

-- 6. CRIAR PROFILES MANUALMENTE PARA GARANTIR
DO $$
DECLARE
    user_record RECORD;
BEGIN
    FOR user_record IN 
        SELECT 
            id, 
            email, 
            raw_user_meta_data->>'role' as role,
            raw_user_meta_data->>'nome' as nome
        FROM auth.users 
        WHERE email IN (
            'admin@matutaria.com',
            'matutaria@delivery.com', 
            'consumidor@teste.com',
            'entregador@teste.com',
            'empresa@teste.com'
        )
    LOOP
        -- Inserir profile
        INSERT INTO profiles (id, email, role, nome, created_at, updated_at)
        VALUES (
            user_record.id,
            user_record.email,
            user_record.role,
            user_record.nome,
            NOW(),
            NOW()
        ) ON CONFLICT (id) DO UPDATE SET
            email = EXCLUDED.email,
            role = EXCLUDED.role,
            nome = EXCLUDED.nome,
            updated_at = NOW();
            
        -- Se for empresa, criar registro na tabela empresas
        IF user_record.role = 'empresa' THEN
            INSERT INTO empresas (
                user_id,
                nome,
                email,
                telefone,
                endereco,
                created_at,
                updated_at
            ) VALUES (
                user_record.id,
                user_record.nome,
                user_record.email,
                '',
                '',
                NOW(),
                NOW()
            ) ON CONFLICT (user_id) DO UPDATE SET
                nome = EXCLUDED.nome,
                email = EXCLUDED.email,
                updated_at = NOW();
        END IF;
    END LOOP;
END $$;

-- 7. VERIFICAR RESULTADO
SELECT 
    'RESULTADO FINAL' as status,
    au.email,
    p.role,
    p.nome,
    CASE WHEN e.id IS NOT NULL THEN 'SIM' ELSE 'NAO' END as tem_empresa
FROM auth.users au
JOIN profiles p ON au.id = p.id
LEFT JOIN empresas e ON au.id = e.user_id
WHERE au.email IN (
    'admin@matutaria.com',
    'matutaria@delivery.com', 
    'consumidor@teste.com',
    'entregador@teste.com',
    'empresa@teste.com'
)
ORDER BY au.email;