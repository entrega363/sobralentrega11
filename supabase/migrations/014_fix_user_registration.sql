-- Migration to fix user registration issues
-- This addresses the "Database error saving new user" problem

-- 1. Create user creation logs table for debugging
CREATE TABLE IF NOT EXISTS user_creation_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  step VARCHAR NOT NULL,
  status VARCHAR NOT NULL, -- 'success', 'error', 'warning'
  message TEXT,
  error_details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Add missing columns to profiles table if they don't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS email VARCHAR,
ADD COLUMN IF NOT EXISTS nome VARCHAR,
ADD COLUMN IF NOT EXISTS telefone VARCHAR,
ADD COLUMN IF NOT EXISTS status VARCHAR DEFAULT 'active',
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- 3. Create enhanced handle_new_user function with robust error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role user_role;
  user_nome VARCHAR;
  user_telefone VARCHAR;
BEGIN
  -- Log the start of user creation
  INSERT INTO user_creation_logs (user_id, step, status, message)
  VALUES (NEW.id, 'trigger_start', 'success', 'Starting user profile creation');

  -- Extract role from metadata, default to 'consumidor'
  user_role := COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'consumidor');
  user_nome := COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email);
  user_telefone := COALESCE(NEW.raw_user_meta_data->>'telefone', '');

  -- Insert profile with extracted data
  INSERT INTO public.profiles (
    id, 
    role, 
    email, 
    nome, 
    telefone,
    status,
    metadata,
    created_at, 
    updated_at
  )
  VALUES (
    NEW.id, 
    user_role,
    NEW.email,
    user_nome,
    user_telefone,
    'active',
    COALESCE(NEW.raw_user_meta_data, '{}'::jsonb),
    NOW(),
    NOW()
  );

  -- Log successful profile creation
  INSERT INTO user_creation_logs (user_id, step, status, message, error_details)
  VALUES (
    NEW.id, 
    'profile_created', 
    'success', 
    'Profile created successfully',
    jsonb_build_object(
      'role', user_role,
      'email', NEW.email,
      'nome', user_nome
    )
  );

  RETURN NEW;

EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    INSERT INTO user_creation_logs (user_id, step, status, message, error_details)
    VALUES (
      NEW.id, 
      'profile_creation_error', 
      'error', 
      'Failed to create profile: ' || SQLERRM,
      jsonb_build_object(
        'error_code', SQLSTATE,
        'error_message', SQLERRM,
        'user_email', NEW.email,
        'metadata', NEW.raw_user_meta_data
      )
    );
    
    -- Still return NEW to not block user creation in auth.users
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Create RPC function for empresa profile creation
CREATE OR REPLACE FUNCTION public.create_empresa_profile(
  user_id UUID,
  empresa_data JSONB
) RETURNS JSONB AS $$
DECLARE
  result JSONB;
  empresa_id UUID;
  profile_exists BOOLEAN;
BEGIN
  -- Log the start of empresa creation
  INSERT INTO user_creation_logs (user_id, step, status, message)
  VALUES (user_id, 'empresa_creation_start', 'success', 'Starting empresa profile creation');

  -- Check if profile exists
  SELECT EXISTS(SELECT 1 FROM profiles WHERE id = user_id) INTO profile_exists;
  
  IF NOT profile_exists THEN
    -- Create profile if it doesn't exist
    INSERT INTO public.profiles (
      id, 
      role, 
      email, 
      nome, 
      telefone,
      status,
      created_at, 
      updated_at
    )
    VALUES (
      user_id, 
      'empresa',
      empresa_data->>'email',
      empresa_data->>'nome',
      empresa_data->>'telefone',
      'active',
      NOW(),
      NOW()
    );
  ELSE
    -- Update existing profile with empresa role
    UPDATE profiles 
    SET 
      role = 'empresa',
      nome = COALESCE(empresa_data->>'nome', nome),
      telefone = COALESCE(empresa_data->>'telefone', telefone),
      updated_at = NOW()
    WHERE id = user_id;
  END IF;
  
  -- Create empresa record
  INSERT INTO empresas (
    profile_id,
    nome,
    cnpj,
    categoria,
    responsavel,
    telefone,
    endereco,
    status,
    created_at,
    updated_at
  ) VALUES (
    user_id,
    empresa_data->>'nome',
    empresa_data->>'cnpj',
    empresa_data->>'categoria',
    empresa_data->>'responsavel',
    empresa_data->>'telefone',
    COALESCE(empresa_data->'endereco', '{}'::jsonb),
    'pendente',
    NOW(),
    NOW()
  ) RETURNING id INTO empresa_id;
  
  -- Log successful creation
  INSERT INTO user_creation_logs (user_id, step, status, message, error_details)
  VALUES (
    user_id, 
    'empresa_created', 
    'success', 
    'Empresa profile created successfully',
    jsonb_build_object('empresa_id', empresa_id)
  );
  
  -- Return success result
  SELECT jsonb_build_object(
    'success', true,
    'empresa_id', empresa_id,
    'message', 'Empresa criada com sucesso'
  ) INTO result;
  
  RETURN result;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error
    INSERT INTO user_creation_logs (user_id, step, status, message, error_details)
    VALUES (
      user_id, 
      'empresa_creation_error', 
      'error', 
      'Failed to create empresa: ' || SQLERRM,
      jsonb_build_object(
        'error_code', SQLSTATE,
        'error_message', SQLERRM,
        'empresa_data', empresa_data
      )
    );
    
    -- Return error result
    SELECT jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'error_code', SQLSTATE
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Create RPC function for entregador profile creation
CREATE OR REPLACE FUNCTION public.create_entregador_profile(
  user_id UUID,
  entregador_data JSONB
) RETURNS JSONB AS $$
DECLARE
  result JSONB;
  entregador_id UUID;
  profile_exists BOOLEAN;
BEGIN
  -- Log the start
  INSERT INTO user_creation_logs (user_id, step, status, message)
  VALUES (user_id, 'entregador_creation_start', 'success', 'Starting entregador profile creation');

  -- Check if profile exists
  SELECT EXISTS(SELECT 1 FROM profiles WHERE id = user_id) INTO profile_exists;
  
  IF NOT profile_exists THEN
    -- Create profile if it doesn't exist
    INSERT INTO public.profiles (
      id, 
      role, 
      email, 
      nome, 
      telefone,
      status,
      created_at, 
      updated_at
    )
    VALUES (
      user_id, 
      'entregador',
      entregador_data->>'email',
      entregador_data->>'nome',
      entregador_data->>'telefone',
      'active',
      NOW(),
      NOW()
    );
  ELSE
    -- Update existing profile
    UPDATE profiles 
    SET 
      role = 'entregador',
      nome = COALESCE(entregador_data->>'nome', nome),
      telefone = COALESCE(entregador_data->>'telefone', telefone),
      updated_at = NOW()
    WHERE id = user_id;
  END IF;
  
  -- Create entregador record
  INSERT INTO entregadores (
    profile_id,
    nome,
    cpf,
    endereco,
    contato,
    veiculo,
    status,
    created_at,
    updated_at
  ) VALUES (
    user_id,
    entregador_data->>'nome',
    entregador_data->>'cpf',
    COALESCE(entregador_data->'endereco', '{}'::jsonb),
    COALESCE(entregador_data->'contato', '{}'::jsonb),
    COALESCE(entregador_data->'veiculo', '{}'::jsonb),
    'pendente',
    NOW(),
    NOW()
  ) RETURNING id INTO entregador_id;
  
  -- Log success
  INSERT INTO user_creation_logs (user_id, step, status, message, error_details)
  VALUES (
    user_id, 
    'entregador_created', 
    'success', 
    'Entregador profile created successfully',
    jsonb_build_object('entregador_id', entregador_id)
  );
  
  -- Return success
  SELECT jsonb_build_object(
    'success', true,
    'entregador_id', entregador_id,
    'message', 'Entregador criado com sucesso'
  ) INTO result;
  
  RETURN result;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Log error
    INSERT INTO user_creation_logs (user_id, step, status, message, error_details)
    VALUES (
      user_id, 
      'entregador_creation_error', 
      'error', 
      'Failed to create entregador: ' || SQLERRM,
      jsonb_build_object(
        'error_code', SQLSTATE,
        'error_message', SQLERRM,
        'entregador_data', entregador_data
      )
    );
    
    -- Return error
    SELECT jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'error_code', SQLSTATE
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create RPC function for consumidor profile creation
CREATE OR REPLACE FUNCTION public.create_consumidor_profile(
  user_id UUID,
  consumidor_data JSONB
) RETURNS JSONB AS $$
DECLARE
  result JSONB;
  consumidor_id UUID;
  profile_exists BOOLEAN;
BEGIN
  -- Log the start
  INSERT INTO user_creation_logs (user_id, step, status, message)
  VALUES (user_id, 'consumidor_creation_start', 'success', 'Starting consumidor profile creation');

  -- Check if profile exists
  SELECT EXISTS(SELECT 1 FROM profiles WHERE id = user_id) INTO profile_exists;
  
  IF NOT profile_exists THEN
    -- Create profile if it doesn't exist
    INSERT INTO public.profiles (
      id, 
      role, 
      email, 
      nome, 
      telefone,
      status,
      created_at, 
      updated_at
    )
    VALUES (
      user_id, 
      'consumidor',
      consumidor_data->>'email',
      consumidor_data->>'nome',
      consumidor_data->>'telefone',
      'active',
      NOW(),
      NOW()
    );
  ELSE
    -- Update existing profile
    UPDATE profiles 
    SET 
      role = 'consumidor',
      nome = COALESCE(consumidor_data->>'nome', nome),
      telefone = COALESCE(consumidor_data->>'telefone', telefone),
      updated_at = NOW()
    WHERE id = user_id;
  END IF;
  
  -- Create consumidor record
  INSERT INTO consumidores (
    profile_id,
    nome,
    telefone,
    endereco,
    created_at,
    updated_at
  ) VALUES (
    user_id,
    consumidor_data->>'nome',
    consumidor_data->>'telefone',
    COALESCE(consumidor_data->'endereco', '{}'::jsonb),
    NOW(),
    NOW()
  ) RETURNING id INTO consumidor_id;
  
  -- Log success
  INSERT INTO user_creation_logs (user_id, step, status, message, error_details)
  VALUES (
    user_id, 
    'consumidor_created', 
    'success', 
    'Consumidor profile created successfully',
    jsonb_build_object('consumidor_id', consumidor_id)
  );
  
  -- Return success
  SELECT jsonb_build_object(
    'success', true,
    'consumidor_id', consumidor_id,
    'message', 'Consumidor criado com sucesso'
  ) INTO result;
  
  RETURN result;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Log error
    INSERT INTO user_creation_logs (user_id, step, status, message, error_details)
    VALUES (
      user_id, 
      'consumidor_creation_error', 
      'error', 
      'Failed to create consumidor: ' || SQLERRM,
      jsonb_build_object(
        'error_code', SQLSTATE,
        'error_message', SQLERRM,
        'consumidor_data', consumidor_data
      )
    );
    
    -- Return error
    SELECT jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'error_code', SQLSTATE
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Create diagnostic function
CREATE OR REPLACE FUNCTION public.diagnose_user_creation(user_email VARCHAR DEFAULT NULL)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
  user_count INTEGER;
  profile_count INTEGER;
  recent_errors INTEGER;
  test_user_id UUID;
BEGIN
  -- Get basic counts
  SELECT COUNT(*) FROM auth.users INTO user_count;
  SELECT COUNT(*) FROM profiles INTO profile_count;
  
  -- Get recent errors
  SELECT COUNT(*) 
  FROM user_creation_logs 
  WHERE status = 'error' 
    AND created_at > NOW() - INTERVAL '1 hour'
  INTO recent_errors;
  
  -- If specific user email provided, get their details
  IF user_email IS NOT NULL THEN
    SELECT id FROM auth.users WHERE email = user_email INTO test_user_id;
    
    SELECT jsonb_build_object(
      'system_health', jsonb_build_object(
        'total_users', user_count,
        'total_profiles', profile_count,
        'recent_errors', recent_errors,
        'profile_creation_rate', ROUND((profile_count::DECIMAL / NULLIF(user_count, 0)) * 100, 2)
      ),
      'user_specific', CASE 
        WHEN test_user_id IS NOT NULL THEN
          jsonb_build_object(
            'user_exists', true,
            'user_id', test_user_id,
            'profile_exists', EXISTS(SELECT 1 FROM profiles WHERE id = test_user_id),
            'recent_logs', (
              SELECT jsonb_agg(
                jsonb_build_object(
                  'step', step,
                  'status', status,
                  'message', message,
                  'created_at', created_at
                )
              )
              FROM user_creation_logs 
              WHERE user_id = test_user_id 
              ORDER BY created_at DESC 
              LIMIT 10
            )
          )
        ELSE
          jsonb_build_object('user_exists', false)
      END
    ) INTO result;
  ELSE
    SELECT jsonb_build_object(
      'system_health', jsonb_build_object(
        'total_users', user_count,
        'total_profiles', profile_count,
        'recent_errors', recent_errors,
        'profile_creation_rate', ROUND((profile_count::DECIMAL / NULLIF(user_count, 0)) * 100, 2)
      ),
      'recent_error_logs', (
        SELECT jsonb_agg(
          jsonb_build_object(
            'user_id', user_id,
            'step', step,
            'message', message,
            'created_at', created_at
          )
        )
        FROM user_creation_logs 
        WHERE status = 'error' 
          AND created_at > NOW() - INTERVAL '24 hours'
        ORDER BY created_at DESC 
        LIMIT 20
      )
    ) INTO result;
  END IF;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_creation_logs_user_id ON user_creation_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_creation_logs_status ON user_creation_logs(status);
CREATE INDEX IF NOT EXISTS idx_user_creation_logs_created_at ON user_creation_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- 10. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT ON user_creation_logs TO authenticated;
GRANT EXECUTE ON FUNCTION create_empresa_profile TO authenticated;
GRANT EXECUTE ON FUNCTION create_entregador_profile TO authenticated;
GRANT EXECUTE ON FUNCTION create_consumidor_profile TO authenticated;
GRANT EXECUTE ON FUNCTION diagnose_user_creation TO authenticated;