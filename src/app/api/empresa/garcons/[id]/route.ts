import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validateAtualizarGarcom } from '@/lib/validations/garcom'
import { GARCOM_ERRORS } from '@/types/garcom'
import bcrypt from 'bcryptjs'

export const runtime = 'nodejs'

// PUT - Atualizar garçom
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const body = await request.json()
    const garcomId = resolvedParams.id
    
    // Validar dados de entrada
    const validation = validateAtualizarGarcom(body)
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Dados inválidos',
          details: validation.error.errors 
        },
        { status: 400 }
      )
    }

    const { nome, usuario, senha, permissoes, ativo } = validation.data
    const supabase = await createClient()

    // Verificar autenticação da empresa
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Buscar perfil da empresa
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('empresa_id, role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile || profile.role !== 'empresa') {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    // Verificar se garçom existe e pertence à empresa
    const { data: garcomExistente, error: garcomError } = await supabase
      .from('garcons')
      .select('id, empresa_id, usuario')
      .eq('id', garcomId)
      .eq('empresa_id', profile.empresa_id)
      .single()

    if (garcomError || !garcomExistente) {
      return NextResponse.json(
        { error: 'Garçom não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se novo usuário já existe (se foi alterado)
    if (usuario && usuario !== garcomExistente.usuario) {
      const { data: usuarioExistente } = await supabase
        .from('garcons')
        .select('id')
        .eq('usuario', usuario)
        .neq('id', garcomId)
        .single()

      if (usuarioExistente) {
        return NextResponse.json(
          { error: GARCOM_ERRORS.USUARIO_JA_EXISTE },
          { status: 409 }
        )
      }
    }

    // Preparar dados para atualização
    const updateData: any = {}
    
    if (nome !== undefined) updateData.nome = nome
    if (usuario !== undefined) updateData.usuario = usuario
    if (permissoes !== undefined) updateData.permissoes = permissoes
    if (ativo !== undefined) updateData.ativo = ativo

    // Hash da nova senha se fornecida
    if (senha) {
      updateData.senha_hash = await bcrypt.hash(senha, 12)
    }

    // Atualizar garçom
    const { data: garcomAtualizado, error: atualizarError } = await supabase
      .from('garcons')
      .update(updateData)
      .eq('id', garcomId)
      .select(`
        id,
        nome,
        usuario,
        ativo,
        permissoes,
        ultimo_login,
        created_at,
        updated_at
      `)
      .single()

    if (atualizarError) {
      console.error('Erro ao atualizar garçom:', atualizarError)
      return NextResponse.json(
        { error: 'Erro ao atualizar garçom' },
        { status: 500 }
      )
    }

    // Registrar atividade de atualização
    await supabase
      .from('garcon_atividades')
      .insert({
        garcom_id: garcomId,
        acao: 'editar_pedido', // Usando ação existente como placeholder
        detalhes: {
          acao_real: 'garcom_atualizado',
          atualizado_por: user.id,
          campos_alterados: Object.keys(updateData),
          timestamp: new Date().toISOString()
        }
      })

    // Buscar estatísticas atualizadas
    const hoje = new Date().toISOString().split('T')[0]
    
    const { data: pedidosHoje } = await supabase
      .from('pedidos')
      .select('id, total')
      .eq('garcom_id', garcomId)
      .gte('created_at', `${hoje}T00:00:00.000Z`)
      .lt('created_at', `${hoje}T23:59:59.999Z`)

    const totalPedidosHoje = pedidosHoje?.length || 0
    const vendaTotal = pedidosHoje?.reduce((acc, pedido) => acc + (pedido.total || 0), 0) || 0

    return NextResponse.json({ 
      garcom: {
        ...garcomAtualizado,
        totalPedidosHoje,
        vendaTotal,
        ultimaAtividade: garcomAtualizado.ultimo_login || garcomAtualizado.updated_at
      }
    })

  } catch (error) {
    console.error('Erro ao atualizar garçom:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Desativar garçom (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const garcomId = resolvedParams.id
    const supabase = await createClient()

    // Verificar autenticação da empresa
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Buscar perfil da empresa
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('empresa_id, role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile || profile.role !== 'empresa') {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    // Verificar se garçom existe e pertence à empresa
    const { data: garcomExistente, error: garcomError } = await supabase
      .from('garcons')
      .select('id, nome')
      .eq('id', garcomId)
      .eq('empresa_id', profile.empresa_id)
      .single()

    if (garcomError || !garcomExistente) {
      return NextResponse.json(
        { error: 'Garçom não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se garçom tem pedidos ativos
    const { data: pedidosAtivos } = await supabase
      .from('pedidos')
      .select('id')
      .eq('garcom_id', garcomId)
      .in('status', ['pendente', 'preparando', 'pronto'])
      .limit(1)

    if (pedidosAtivos && pedidosAtivos.length > 0) {
      return NextResponse.json(
        { error: 'Não é possível desativar garçom com pedidos ativos' },
        { status: 409 }
      )
    }

    // Desativar garçom (soft delete)
    const { error: desativarError } = await supabase
      .from('garcons')
      .update({ ativo: false })
      .eq('id', garcomId)

    if (desativarError) {
      console.error('Erro ao desativar garçom:', desativarError)
      return NextResponse.json(
        { error: 'Erro ao desativar garçom' },
        { status: 500 }
      )
    }

    // Registrar atividade de desativação
    await supabase
      .from('garcon_atividades')
      .insert({
        garcom_id: garcomId,
        acao: 'cancelar_pedido', // Usando ação existente como placeholder
        detalhes: {
          acao_real: 'garcom_desativado',
          desativado_por: user.id,
          timestamp: new Date().toISOString()
        }
      })

    return NextResponse.json({ 
      message: `Garçom ${garcomExistente.nome} foi desativado com sucesso` 
    })

  } catch (error) {
    console.error('Erro ao desativar garçom:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}