-- Fix the handle_new_user function to properly set user role from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role, nome)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'role', 'consumidor'),
    COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email)
  );
  
  -- Create specific role record based on user type
  IF (NEW.raw_user_meta_data->>'role') = 'empresa' THEN
    INSERT INTO public.empresas (
      profile_id,
      nome,
      cnpj,
      categoria,
      responsavel,
      telefone,
      endereco,
      status
    ) VALUES (
      NEW.id,
      NEW.raw_user_meta_data->>'nome',
      NEW.raw_user_meta_data->>'cnpj',
      NEW.raw_user_meta_data->>'categoria',
      NEW.raw_user_meta_data->>'responsavel',
      NEW.raw_user_meta_data->>'telefone',
      (NEW.raw_user_meta_data->>'endereco')::jsonb,
      'pendente'
    );
  ELSIF (NEW.raw_user_meta_data->>'role') = 'entregador' THEN
    INSERT INTO public.entregadores (
      profile_id,
      nome,
      cpf,
      telefone,
      veiculo,
      endereco,
      status
    ) VALUES (
      NEW.id,
      NEW.raw_user_meta_data->>'nome',
      NEW.raw_user_meta_data->>'cpf',
      NEW.raw_user_meta_data->>'telefone',
      (NEW.raw_user_meta_data->>'veiculo')::jsonb,
      (NEW.raw_user_meta_data->>'endereco')::jsonb,
      'pendente'
    );
  ELSIF (NEW.raw_user_meta_data->>'role') = 'consumidor' THEN
    INSERT INTO public.consumidores (
      profile_id,
      nome,
      telefone,
      endereco
    ) VALUES (
      NEW.id,
      NEW.raw_user_meta_data->>'nome',
      NEW.raw_user_meta_data->>'telefone',
      (NEW.raw_user_meta_data->>'endereco')::jsonb
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;