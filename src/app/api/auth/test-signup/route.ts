import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    const { testType = 'empresa' } = await request.json()
    
    console.log('🧪 Starting signup test for:', testType)
    
    // Generate test data
    const timestamp = Date.now()
    const testData = {
      empresa: {
        email: `test-empresa-${timestamp}@example.com`,
        password: 'test123456',
        role: 'empresa' as const,
        nome: 'Empresa Teste',
        cnpj: '12345678000199',
        categoria: 'Comida Japonesa',
        responsavel: 'João Silva',
        telefone: '85999999999',
        endereco: {
          rua: 'Rua Teste',
          numero: '123',
          bairro: 'Centro',
          cidade: 'Sobral',
          cep: '62000000'
        }
      },
      entregador: {
        email: `test-entregador-${timestamp}@example.com`,
        password: 'test123456',
        role: 'entregador' as const,
        nome: 'Entregador Teste',
        cpf: '12345678901',
        telefone: '85999999999',
        cnh: '12345678901',
        endereco: {
          rua: 'Rua Teste',
          numero: '123',
          bairro: 'Centro',
          cidade: 'Sobral',
          cep: '62000000'
        },
        veiculo: {
          tipo: 'moto',
          modelo: 'Honda CG 160',
          placa: 'ABC1234'
        }
      },
      consumidor: {
        email: `test-consumidor-${timestamp}@example.com`,
        password: 'test123456',
        role: 'consumidor' as const,
        nome: 'Consumidor Teste',
        telefone: '85999999999',
        endereco: {
          rua: 'Rua Teste',
          numero: '123',
          bairro: 'Centro',
          cidade: 'Sobral',
          cep: '62000000'
        }
      }
    }
    
    const selectedTestData = testData[testType as keyof typeof testData]
    
    if (!selectedTestData) {
      return NextResponse.json({
        success: false,
        error: 'Invalid test type. Use: empresa, entregador, or consumidor'
      }, { status: 400 })
    }
    
    console.log('📝 Test data prepared:', selectedTestData.email)
    
    // Call our signup endpoint
    const signupResponse = await fetch(`${request.nextUrl.origin}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(selectedTestData)
    })
    
    const signupResult = await signupResponse.json()
    
    console.log('📊 Signup result:', signupResult.success ? 'SUCCESS' : 'FAILED')
    
    // Additional verification
    let verificationResults: {
      profile?: {
        exists: boolean
        error?: string
        data?: any
      }
      role_record?: {
        exists: boolean
        error?: string
        data?: any
      }
    } = {}
    
    if (signupResult.success && signupResult.user?.id) {
      console.log('🔍 Running verification checks...')
      
      // Check if profile exists
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', signupResult.user.id)
        .single()
      
      // Check if role-specific record exists
      let roleRecord = null
      let roleError = null
      
      switch (testType) {
        case 'empresa':
          const { data: empresa, error: empresaError } = await supabase
            .from('empresas')
            .select('*')
            .eq('profile_id', signupResult.user.id)
            .single()
          roleRecord = empresa
          roleError = empresaError
          break
          
        case 'entregador':
          const { data: entregador, error: entregadorError } = await supabase
            .from('entregadores')
            .select('*')
            .eq('profile_id', signupResult.user.id)
            .single()
          roleRecord = entregador
          roleError = entregadorError
          break
          
        case 'consumidor':
          const { data: consumidor, error: consumidorError } = await supabase
            .from('consumidores')
            .select('*')
            .eq('profile_id', signupResult.user.id)
            .single()
          roleRecord = consumidor
          roleError = consumidorError
          break
      }
      
      verificationResults = {
        profile: {
          exists: !!profile,
          error: profileError?.message,
          data: profile
        },
        role_record: {
          exists: !!roleRecord,
          error: roleError?.message,
          data: roleRecord
        }
      }
      
      console.log('✅ Verification completed')
    }
    
    // Cleanup test user if requested
    const cleanup = request.nextUrl.searchParams.get('cleanup') === 'true'
    let cleanupResult = null
    
    if (cleanup && signupResult.user?.id) {
      console.log('🧹 Cleaning up test user...')
      
      try {
        const { error: deleteError } = await supabase.auth.admin.deleteUser(signupResult.user.id)
        cleanupResult = {
          success: !deleteError,
          error: deleteError?.message
        }
      } catch (cleanupError) {
        cleanupResult = {
          success: false,
          error: cleanupError instanceof Error ? cleanupError.message : 'Cleanup failed'
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      test_type: testType,
      test_email: selectedTestData.email,
      signup_result: signupResult,
      verification: verificationResults,
      cleanup: cleanupResult,
      summary: {
        signup_successful: signupResult.success,
        profile_created: verificationResults.profile?.exists || false,
        role_record_created: verificationResults.role_record?.exists || false,
        overall_success: signupResult.success && 
                        (verificationResults.profile?.exists || false) && 
                        (verificationResults.role_record?.exists || false)
      }
    })
    
  } catch (error) {
    console.error('Test signup error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const testType = request.nextUrl.searchParams.get('type') || 'empresa'
  const cleanup = request.nextUrl.searchParams.get('cleanup') === 'true'
  
  return NextResponse.json({
    message: 'Test signup endpoint',
    usage: {
      method: 'POST',
      body: {
        testType: 'empresa | entregador | consumidor'
      },
      query_params: {
        cleanup: 'true | false (cleanup test user after test)'
      }
    },
    example: `POST /api/auth/test-signup?cleanup=true
    Body: { "testType": "${testType}" }`
  })
}