import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/server'
import { pedidoStatusUpdateSchema } from '@/lib/validations/pedido'
import { handleApiError, createSuccessResponse } from '@/lib/api-utils'

interface RouteParams {
  params: {
    id: string
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = createRouteHandlerClient()
    
    // Verificar autenticação
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Buscar perfil do usuário
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 })
    }

    // Validar dados
    const body = await request.json()
    const validatedData = pedidoStatusUpdateSchema.parse({
      ...body,
      id: params.id
    })

    // Buscar pedido atual
    const { data: pedidoAtual, error: fetchError } = await supabase
      .from('pedidos')
      .select(`
        *,
        pedido_itens (
          empresa_id
        )
      `)
      .eq('id', params.id)
      .single()

    if (fetchError) throw fetchError

    if (!pedidoAtual) {
      return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 })
    }

    // Verificar permissões baseadas no role
    let canUpdate = false
    
    if (profile.role === 'admin') {
      canUpdate = true
    } else if (profile.role === 'empresa') {
      // Empresa pode atualizar se o pedido contém produtos dela
      const { data: empresa } = await supabase
        .from('empresas')
        .select('id')
        .eq('profile_id', session.user.id)
        .single()

      if (empresa) {
        const empresaTemProdutos = pedidoAtual.pedido_itens.some(
          (item: any) => item.empresa_id === empresa.id
        )
        canUpdate = empresaTemProdutos
      }
    } else if (profile.role === 'entregador') {
      // Entregador pode atualizar se for o responsável pela entrega
      const { data: entregador } = await supabase
        .from('entregadores')
        .select('id')
        .eq('profile_id', session.user.id)
        .single()

      if (entregador) {
        canUpdate = pedidoAtual.entregador_id === entregador.id ||
                   (pedidoAtual.entregador_id === null && validatedData.status === 'saiu_entrega')
      }
    }

    if (!canUpdate) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    // Validar transições de status
    const validTransitions: Record<string, string[]> = {
      'pendente': ['aceito', 'recusado'],
      'aceito': ['preparando'],
      'preparando': ['pronto'],
      'pronto': ['saiu_entrega'],
      'saiu_entrega': ['entregue'],
    }

    const allowedNextStatuses = validTransitions[pedidoAtual.status] || []
    
    if (!allowedNextStatuses.includes(validatedData.status)) {
      return NextResponse.json({ 
        error: `Transição inválida de ${pedidoAtual.status} para ${validatedData.status}` 
      }, { status: 400 })
    }

    // Preparar dados de atualização
    const updateData: any = {
      status: validatedData.status,
      updated_at: new Date().toISOString(),
    }

    // Se for entregador assumindo a entrega
    if (profile.role === 'entregador' && validatedData.status === 'saiu_entrega') {
      const { data: entregador } = await supabase
        .from('entregadores')
        .select('id')
        .eq('profile_id', session.user.id)
        .single()

      if (entregador) {
        updateData.entregador_id = entregador.id
      }
    }

    // Atualizar pedido
    const { data, error } = await supabase
      .from('pedidos')
      .update(updateData)
      .eq('id', params.id)
      .select(`
        *,
        consumidores (
          nome,
          contato
        ),
        entregadores (
          nome,
          contato
        ),
        pedido_itens (
          *,
          produtos (
            nome,
            preco
          ),
          empresas (
            nome
          )
        )
      `)
      .single()

    if (error) throw error

    return createSuccessResponse(data)
  } catch (error) {
    return handleApiError(error)
  }
}