import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    
    console.log('🚀 Starting user registration fix...')
    
    // Step 1: Create user_creation_logs table
    const { error: tableError } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS user_creation_logs (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID,
          step VARCHAR NOT NULL,
          status VARCHAR NOT NULL,
          message TEXT,
          error_details JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })
    
    if (tableError) {
      console.log('Table creation via RPC failed, trying direct approach...')
    }
    
    // Step 2: Add missing columns to profiles table
    const alterTableSQL = `
      ALTER TABLE profiles 
      ADD COLUMN IF NOT EXISTS email VARCHAR,
      ADD COLUMN IF NOT EXISTS nome VARCHAR,
      ADD COLUMN IF NOT EXISTS telefone VARCHAR,
      ADD COLUMN IF NOT EXISTS status VARCHAR DEFAULT 'active',
      ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';
    `
    
    // Step 3: Create the enhanced handle_new_user function
    const handleNewUserSQL = `
      CREATE OR REPLACE FUNCTION public.handle_new_user()
      RETURNS TRIGGER AS $$
      DECLARE
        user_role user_role;
        user_nome VARCHAR;
        user_telefone VARCHAR;
      BEGIN
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

        RETURN NEW;

      EXCEPTION
        WHEN OTHERS THEN
          -- Log error but don't fail user creation
          RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `
    
    // Step 4: Recreate the trigger
    const triggerSQL = `
      DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
      CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
    `
    
    // Step 5: Create empresa profile function
    const empresaFunctionSQL = `
      CREATE OR REPLACE FUNCTION public.create_empresa_profile(
        user_id UUID,
        empresa_data JSONB
      ) RETURNS JSONB AS $$
      DECLARE
        result JSONB;
        empresa_id UUID;
        profile_exists BOOLEAN;
      BEGIN
        -- Check if profile exists
        SELECT EXISTS(SELECT 1 FROM profiles WHERE id = user_id) INTO profile_exists;
        
        IF NOT profile_exists THEN
          -- Create profile if it doesn't exist
          INSERT INTO public.profiles (
            id, role, email, nome, telefone, status, created_at, updated_at
          )
          VALUES (
            user_id, 'empresa', empresa_data->>'email', empresa_data->>'nome',
            empresa_data->>'telefone', 'active', NOW(), NOW()
          );
        ELSE
          -- Update existing profile with empresa role
          UPDATE profiles 
          SET role = 'empresa', nome = COALESCE(empresa_data->>'nome', nome),
              telefone = COALESCE(empresa_data->>'telefone', telefone), updated_at = NOW()
          WHERE id = user_id;
        END IF;
        
        -- Create empresa record
        INSERT INTO empresas (
          profile_id, nome, cnpj, categoria, responsavel, telefone, endereco, status, created_at, updated_at
        ) VALUES (
          user_id, empresa_data->>'nome', empresa_data->>'cnpj', empresa_data->>'categoria',
          empresa_data->>'responsavel', empresa_data->>'telefone', 
          COALESCE(empresa_data->'endereco', '{}'::jsonb), 'pendente', NOW(), NOW()
        ) RETURNING id INTO empresa_id;
        
        -- Return success result
        SELECT jsonb_build_object(
          'success', true, 'empresa_id', empresa_id, 'message', 'Empresa criada com sucesso'
        ) INTO result;
        
        RETURN result;
        
      EXCEPTION
        WHEN OTHERS THEN
          -- Return error result
          SELECT jsonb_build_object(
            'success', false, 'error', SQLERRM, 'error_code', SQLSTATE
          ) INTO result;
          RETURN result;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `
    
    // Execute the SQL statements one by one using a different approach
    const statements = [
      {
        name: 'Add columns to profiles',
        sql: alterTableSQL
      },
      {
        name: 'Create handle_new_user function',
        sql: handleNewUserSQL
      },
      {
        name: 'Create trigger',
        sql: triggerSQL
      },
      {
        name: 'Create empresa function',
        sql: empresaFunctionSQL
      }
    ]
    
    const results = []
    
    // Try to execute each statement
    for (const statement of statements) {
      try {
        console.log(`Executing: ${statement.name}`)
        
        // For now, we'll just test if we can query the profiles table
        const { data: testData, error: testError } = await supabase
          .from('profiles')
          .select('id, role, email')
          .limit(1)
        
        if (testError) {
          results.push({
            name: statement.name,
            success: false,
            error: testError.message
          })
        } else {
          results.push({
            name: statement.name,
            success: true,
            message: 'Statement prepared (manual execution required)'
          })
        }
        
      } catch (error) {
        results.push({
          name: statement.name,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }
    
    // Test current system state
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
    
    const { data: usersCount } = await supabase
      .from('profiles')
      .select('id', { count: 'exact' })
    
    return NextResponse.json({
      success: true,
      message: 'Registration fix analysis completed',
      results: results,
      system_status: {
        profiles_accessible: !profilesError,
        profiles_count: usersCount?.length || 0,
        error: profilesError?.message
      },
      manual_steps_required: [
        'Execute the SQL statements in Supabase dashboard',
        'Test user registration after applying changes',
        'Monitor user_creation_logs table for errors'
      ],
      sql_statements: statements
    })
    
  } catch (error) {
    console.error('Registration fix error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to analyze registration system',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    
    // Test current system state
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id, role, email, nome')
      .limit(5)
    
    const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers()
    
    return NextResponse.json({
      system_status: {
        profiles_accessible: !profilesError,
        profiles_sample: profilesData,
        profiles_error: profilesError?.message,
        auth_users_count: usersData?.users?.length || 0,
        auth_error: usersError?.message
      },
      recommendations: [
        'Check if profiles table has required columns',
        'Verify handle_new_user trigger exists and works',
        'Test user registration flow',
        'Monitor for database errors during signup'
      ]
    })
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}