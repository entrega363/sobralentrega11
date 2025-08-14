import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    const body = await request.json()
    
    console.log('Testing empresa signup with data:', body)
    
    // Teste 1: Verificar conexão com Supabase
    const { data: testConnection, error: connectionError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
    
    if (connectionError) {
      return NextResponse.json({
        success: false,
        error: 'Database connection failed',
        details: connectionError
      }, { status: 500 })
    }
    
    // Teste 2: Tentar criar usuário
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: body.email,
      password: body.password,
      options: {
        data: {
          role: 'empresa',
          nome: body.nome,
          telefone: body.telefone
        }
      }
    })
    
    if (authError) {
      return NextResponse.json({
        success: false,
        error: 'Auth signup failed',
        details: authError
      }, { status: 400 })
    }
    
    if (!authData.user) {
      return NextResponse.json({
        success: false,
        error: 'User not created'
      }, { status: 400 })
    }
    
    // Teste 3: Verificar se profile foi criado
    await new Promise(resolve => setTimeout(resolve, 1000)) // Aguardar trigger
    
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single()
    
    if (profileError) {
      console.error('Profile not found:', profileError)
    }
    
    // Teste 4: Tentar criar empresa usando função
    const { data: empresaResult, error: empresaError } = await supabase
      .rpc('create_empresa_profile', {
        user_id: authData.user.id,
        empresa_data: {
          nome: body.nome,
          cnpj: body.cnpj,
          categoria: body.categoria,
          responsavel: body.responsavel,
          telefone: body.telefone,
          endereco: body.endereco
        }
      })
    
    if (empresaError) {
      console.error('Empresa creation failed:', empresaError)
      
      // Fallback: criar empresa diretamente
      const { data: empresaFallback, error: empresaFallbackError } = await supabase
        .from('empresas')
        .insert({
          profile_id: authData.user.id,
          nome: body.nome,
          cnpj: body.cnpj,
          categoria: body.categoria,
          responsavel: body.responsavel,
          telefone: body.telefone,
          endereco: body.endereco,
          status: 'pendente'
        })
        .select()
        .single()
      
      if (empresaFallbackError) {
        return NextResponse.json({
          success: false,
          error: 'Failed to create empresa record',
          details: empresaFallbackError,
          user_created: true,
          user_id: authData.user.id,
          profile: profile
        }, { status: 500 })
      }
      
      return NextResponse.json({
        success: true,
        message: 'Empresa created with fallback method',
        user: authData.user,
        profile: profile,
        empresa: empresaFallback
      })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Empresa created successfully',
      user: authData.user,
      profile: profile,
      empresa_result: empresaResult
    })
    
  } catch (error) {
    console.error('Test signup error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}