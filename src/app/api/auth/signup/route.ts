import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Validation schemas
const empresaSignupSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  role: z.literal('empresa'),
  nome: z.string().min(1, 'Nome é obrigatório'),
  cnpj: z.string().min(14, 'CNPJ inválido'),
  categoria: z.string().min(1, 'Categoria é obrigatória'),
  responsavel: z.string().min(1, 'Responsável é obrigatório'),
  telefone: z.string().min(10, 'Telefone inválido'),
  endereco: z.object({
    rua: z.string().min(1, 'Rua é obrigatória'),
    numero: z.string().min(1, 'Número é obrigatório'),
    bairro: z.string().min(1, 'Bairro é obrigatório'),
    cidade: z.string().default('Sobral'),
    cep: z.string().min(8, 'CEP inválido')
  })
})

const entregadorSignupSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  role: z.literal('entregador'),
  nome: z.string().min(1, 'Nome é obrigatório'),
  cpf: z.string().min(11, 'CPF inválido'),
  telefone: z.string().min(10, 'Telefone inválido'),
  cnh: z.string().min(1, 'CNH é obrigatória'),
  endereco: z.object({
    rua: z.string().min(1, 'Rua é obrigatória'),
    numero: z.string().min(1, 'Número é obrigatório'),
    bairro: z.string().min(1, 'Bairro é obrigatório'),
    cidade: z.string().default('Sobral'),
    cep: z.string().min(8, 'CEP inválido')
  }),
  veiculo: z.object({
    tipo: z.string().min(1, 'Tipo de veículo é obrigatório'),
    modelo: z.string().min(1, 'Modelo é obrigatório'),
    placa: z.string().min(7, 'Placa inválida')
  })
})

const consumidorSignupSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  role: z.literal('consumidor'),
  nome: z.string().min(1, 'Nome é obrigatório'),
  telefone: z.string().min(10, 'Telefone inválido'),
  endereco: z.object({
    rua: z.string().min(1, 'Rua é obrigatória'),
    numero: z.string().min(1, 'Número é obrigatório'),
    bairro: z.string().min(1, 'Bairro é obrigatório'),
    cidade: z.string().default('Sobral'),
    cep: z.string().min(8, 'CEP inválido')
  })
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    const body = await request.json()
    
    console.log('🚀 Starting robust signup process for:', body.email)
    
    // Validate input based on role
    let validatedData
    try {
      switch (body.role) {
        case 'empresa':
          validatedData = empresaSignupSchema.parse(body)
          break
        case 'entregador':
          validatedData = entregadorSignupSchema.parse(body)
          break
        case 'consumidor':
          validatedData = consumidorSignupSchema.parse(body)
          break
        default:
          throw new Error('Role inválido')
      }
    } catch (validationError) {
      console.error('Validation error:', validationError)
      return NextResponse.json({
        success: false,
        error: 'Dados inválidos',
        details: validationError instanceof z.ZodError ? validationError.errors : 'Validation failed'
      }, { status: 400 })
    }
    
    // Step 1: Create auth user
    console.log('📝 Creating auth user...')
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: validatedData.email,
      password: validatedData.password,
      options: {
        data: {
          role: validatedData.role,
          nome: validatedData.nome,
          telefone: validatedData.telefone
        }
      }
    })
    
    if (authError) {
      console.error('Auth signup error:', authError)
      return NextResponse.json({
        success: false,
        error: 'Erro ao criar usuário',
        details: authError.message
      }, { status: 400 })
    }
    
    if (!authData.user) {
      console.error('No user returned from auth signup')
      return NextResponse.json({
        success: false,
        error: 'Usuário não foi criado'
      }, { status: 400 })
    }
    
    console.log('✅ Auth user created:', authData.user.id)
    
    // Step 2: Wait a moment for trigger to create profile
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Step 3: Create role-specific record using RPC functions
    let roleResult
    try {
      switch (validatedData.role) {
        case 'empresa':
          console.log('🏢 Creating empresa profile...')
          const { data: empresaResult, error: empresaError } = await supabase
            .rpc('create_empresa_profile', {
              user_id: authData.user.id,
              empresa_data: {
                email: validatedData.email,
                nome: validatedData.nome,
                cnpj: validatedData.cnpj,
                categoria: validatedData.categoria,
                responsavel: validatedData.responsavel,
                telefone: validatedData.telefone,
                endereco: validatedData.endereco
              }
            })
          
          if (empresaError) {
            console.error('Empresa RPC error:', empresaError)
            // Fallback: try direct insertion
            const { data: empresaFallback, error: empresaFallbackError } = await supabase
              .from('empresas')
              .insert({
                profile_id: authData.user.id,
                nome: validatedData.nome,
                cnpj: validatedData.cnpj,
                categoria: validatedData.categoria,
                responsavel: validatedData.responsavel,
                telefone: validatedData.telefone,
                endereco: validatedData.endereco,
                status: 'pendente'
              })
              .select()
              .single()
            
            if (empresaFallbackError) {
              throw new Error(`Empresa creation failed: ${empresaFallbackError.message}`)
            }
            
            roleResult = { success: true, fallback: true, data: empresaFallback }
          } else {
            roleResult = empresaResult
          }
          break
          
        case 'entregador':
          console.log('🚴 Creating entregador profile...')
          const { data: entregadorResult, error: entregadorError } = await supabase
            .rpc('create_entregador_profile', {
              user_id: authData.user.id,
              entregador_data: {
                email: validatedData.email,
                nome: validatedData.nome,
                cpf: validatedData.cpf,
                telefone: validatedData.telefone,
                endereco: validatedData.endereco,
                contato: {
                  telefone: validatedData.telefone,
                  cnh: validatedData.cnh
                },
                veiculo: validatedData.veiculo
              }
            })
          
          if (entregadorError) {
            console.error('Entregador RPC error:', entregadorError)
            // Fallback: try direct insertion
            const { data: entregadorFallback, error: entregadorFallbackError } = await supabase
              .from('entregadores')
              .insert({
                profile_id: authData.user.id,
                nome: validatedData.nome,
                cpf: validatedData.cpf,
                endereco: validatedData.endereco,
                contato: {
                  telefone: validatedData.telefone,
                  cnh: validatedData.cnh
                },
                veiculo: validatedData.veiculo,
                status: 'pendente'
              })
              .select()
              .single()
            
            if (entregadorFallbackError) {
              throw new Error(`Entregador creation failed: ${entregadorFallbackError.message}`)
            }
            
            roleResult = { success: true, fallback: true, data: entregadorFallback }
          } else {
            roleResult = entregadorResult
          }
          break
          
        case 'consumidor':
          console.log('👤 Creating consumidor profile...')
          const { data: consumidorResult, error: consumidorError } = await supabase
            .rpc('create_consumidor_profile', {
              user_id: authData.user.id,
              consumidor_data: {
                email: validatedData.email,
                nome: validatedData.nome,
                telefone: validatedData.telefone,
                endereco: validatedData.endereco
              }
            })
          
          if (consumidorError) {
            console.error('Consumidor RPC error:', consumidorError)
            // Fallback: try direct insertion
            const { data: consumidorFallback, error: consumidorFallbackError } = await supabase
              .from('consumidores')
              .insert({
                profile_id: authData.user.id,
                nome: validatedData.nome,
                telefone: validatedData.telefone,
                endereco: validatedData.endereco
              })
              .select()
              .single()
            
            if (consumidorFallbackError) {
              throw new Error(`Consumidor creation failed: ${consumidorFallbackError.message}`)
            }
            
            roleResult = { success: true, fallback: true, data: consumidorFallback }
          } else {
            roleResult = consumidorResult
          }
          break
      }
    } catch (roleError) {
      console.error('Role-specific creation error:', roleError)
      
      // If role creation fails, we should clean up the auth user
      // But for now, we'll just return the error and let the user know
      return NextResponse.json({
        success: false,
        error: 'Erro ao criar perfil específico',
        details: roleError instanceof Error ? roleError.message : 'Unknown error',
        user_created: true,
        user_id: authData.user.id,
        cleanup_required: true
      }, { status: 500 })
    }
    
    console.log('✅ Role-specific profile created:', roleResult)
    
    // Step 4: Verify everything was created correctly
    const { data: finalProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single()
    
    if (profileError) {
      console.error('Profile verification error:', profileError)
    }
    
    console.log('🎉 Signup completed successfully for:', validatedData.email)
    
    return NextResponse.json({
      success: true,
      message: 'Cadastro realizado com sucesso!',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        role: validatedData.role
      },
      profile: finalProfile,
      role_result: roleResult,
      next_steps: validatedData.role === 'empresa' 
        ? 'Sua empresa será analisada pela nossa equipe. Você receberá um email quando for aprovada.'
        : validatedData.role === 'entregador'
        ? 'Seu cadastro será analisado pela nossa equipe. Você receberá um email quando for aprovado.'
        : 'Seu cadastro foi realizado com sucesso! Você já pode fazer login.'
    })
    
  } catch (error) {
    console.error('Signup error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}