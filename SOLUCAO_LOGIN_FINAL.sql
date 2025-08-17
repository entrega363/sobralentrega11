-- SOLUÇÃO FINAL PARA LOGIN - MÉTODO MAIS CONFIÁVEL
-- Execute este script no Supabase SQL Editor

-- 1. HABILITAR EXTENSÕES NECESSÁRIAS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. LIMPAR DADOS EXISTENTES
DO $$
DECLARE
    user_id UUID;
BEGIN
    -- Buscar e deletar usuários existentes
    FOR user_id IN 
        SELECT id FROM auth.users 
        WHERE email IN (
            'admin@matutaria.com',
            'matutaria@delivery.com', 
            'consumidor@teste.com',
            'entregador@teste.com',
            'empresa@teste.com'
        )
    LOOP
        DELETE FROM empresas WHERE user_id = user_id;
        DELETE FROM profiles WHERE id = user_id;
        DELETE FROM auth.users WHERE id = user_id;
    END LOOP;
END $$;

-- 3. FUNÇÃO PARA CRIAR USUÁRIO COMPLETO
CREATE OR REPLACE FUNCTION criar_usuario_completo(
    p_email TEXT,
    p_senha TEXT,
    p_role TEXT,
    p_nome TEXT
) RETURNS UUID AS $$
DECLARE
    new_user_id UUID;
    senha_hash TEXT;
BEGIN
    -- Gerar ID único
    new_user_id := gen_random_uuid();
    
    -- Gerar hash da senha
    senha_hash := crypt(p_senha, gen_salt('bf'));
    
    -- Inserir na auth.users
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
        new_user_id,
        'authenticated',
        'authenticated',
        p_email,
        senha_hash,
        NOW(),
        NULL,
        NULL,
        '{"provider": "email", "providers": ["email"]}',
        json_build_object('role', p_role, 'nome', p_nome),
        NOW(),
        NOW(),
        '',
        '',
        '',
        ''
    );
    
    -- Inserir profile
    INSERT INTO profiles (id, email, role, nome, created_at, updated_at)
    VALUES (new_user_id, p_email, p_role, p_nome, NOW(), NOW());
    
    -- Se for empresa, inserir na tabela empresas
    IF p_role = 'empresa' THEN
        INSERT INTO empresas (
            user_id,
            nome,
            email,
            telefone,
            endereco,
            created_at,
            updated_at
        ) VALUES (
            new_user_id,
            p_nome,
            p_email,
            '',
            '',
            NOW(),
            NOW()
        );
    END IF;
    
    RETURN new_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. CRIAR TODOS OS USUÁRIOS
SELECT criar_usuario_completo('admin@matutaria.com', 'admin123456', 'admin', 'Administrador');
SELECT criar_usuario_completo('matutaria@delivery.com', 'matutaria123', 'empresa', 'Matutaria Delivery');
SELECT criar_usuario_completo('consumidor@teste.com', 'teste123456', 'consumidor', 'Consumidor Teste');
SELECT criar_usuario_completo('entregador@teste.com', 'teste123456', 'entregador', 'Entregador Teste');
SELECT criar_usuario_completo('empresa@teste.com', 'teste123456', 'empresa', 'Empresa Teste');

-- 5. VERIFICAR RESULTADO
SELECT 
    'USUARIOS CRIADOS' as status,
    au.email,
    p.role,
    p.nome,
    CASE WHEN e.id IS NOT NULL THEN 'SIM' ELSE 'NAO' END as tem_empresa,
    au.email_confirmed_at IS NOT NULL as email_confirmado
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

-- 6. TESTAR HASH DE SENHA (para debug)
SELECT 
    email,
    encrypted_password,
    crypt('admin123456', encrypted_password) = encrypted_password as senha_admin_ok,
    crypt('matutaria123', encrypted_password) = encrypted_password as senha_matutaria_ok,
    crypt('teste123456', encrypted_password) = encrypted_password as senha_teste_ok
FROM auth.users 
WHERE email IN (
    'admin@matutaria.com',
    'matutaria@delivery.com', 
    'consumidor@teste.com',
    'entregador@teste.com',
    'empresa@teste.com'
);

-- 7. LIMPAR FUNÇÃO TEMPORÁRIA
DROP FUNCTION IF EXISTS criar_usuario_completo(TEXT, TEXT, TEXT, TEXT);