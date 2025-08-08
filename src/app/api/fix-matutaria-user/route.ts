import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function POST(request: NextRequest) {
  try {
    const email = 'matutaria@gmail.com'
    
    console.log(`Corrigindo usuário: ${email}`)

    // 1. Buscar o usuário atual
    const { data: currentProfile, error: fetchError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single()

    if (fetchError) {
      console.error('Erro ao buscar perfil:', fetchError)
      return NextResponse.json({ 
        error: 'Usuário não encontrado',
        details: fetchError 
      }, { status: 404 })
    }

    console.log('Perfil atual:', currentProfile)

    // 2. Atualizar o role para empresa
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ 
        role: 'empresa',
        updated_at: new Date().toISOString()
      })
      .eq('email', email)

    if (updateError) {
      console.error('Erro ao atualizar perfil:', updateError)
      return NextResponse.json({ 
        error: 'Erro ao atualizar perfil',
        details: updateError 
      }, { status: 500 })
    }

    // 3. Remover qualquer registro incorreto da tabela consumidores
    const { error: deleteConsumidorError } = await supabaseAdmin
      .from('consumidores')
      .delete()
      .eq('profile_id', currentProfile.id)

    if (deleteConsumidorError) {
      console.log('Aviso ao remover consumidor:', deleteConsumidorError)
    }

    // 4. Verificar se já existe registro na tabela empresas
    const { data: existingEmpresa } = await supabaseAdmin
      .from('empresas')
      .select('*')
      .eq('profile_id', currentProfile.id)
      .single()

    // 5. Se não existe, criar registro na tabela empresas
    if (!existingEmpresa) {
      const { error: insertEmpresaError } = await supabaseAdmin
        .from('empresas')
        .insert({
          profile_id: currentProfile.id,
          nome: currentProfile.nome || 'Matutaria',
          cnpj: '00.000.000/0001-00',
          categoria: 'restaurante',
          responsavel: 'Responsável',
          telefone: '(85) 99999-9999',
          endereco: 'Sobral, CE',
          status: 'ativo'
        })

      if (insertEmpresaError) {
        console.error('Erro ao criar empresa:', insertEmpresaError)
        return NextResponse.json({ 
          error: 'Erro ao criar registro de empresa',
          details: insertEmpresaError 
        }, { status: 500 })
      }
    }

    // 6. Buscar o perfil atualizado para confirmar
    const { data: updatedProfile, error: finalFetchError } = await supabaseAdmin
      .from('profiles')
      .select(`
        *,
        empresas (*)
      `)
      .eq('email', email)
      .single()

    if (finalFetchError) {
      console.error('Erro ao buscar perfil atualizado:', finalFetchError)
    }

    console.log('Perfil corrigido:', updatedProfile)

    return NextResponse.json({
      success: true,
      message: 'Usuário corrigido com sucesso',
      before: currentProfile,
      after: updatedProfile
    })

  } catch (error) {
    console.error('Erro geral:', error)
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error 
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST para corrigir o usuário matutaria@gmail.com'
  })
}