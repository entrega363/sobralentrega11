import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/server'
import { handleApiError, createSuccessResponse } from '@/lib/api-utils'
import { z } from 'zod'

const statusUpdateSchema = z.object({
  status: z.enum(['pendente', 'confirmado', 'preparando', 'saiu_entrega', 'entregue', 'cancelado']),
  motivo: z.string().optional(),
})

export async function PUT(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const supabase = createRouteHandlerClient()
    
    // Verificar autenticação
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Verificar se é admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    // Validar dados
    const body = await request.json()
    const validatedData = statusUpdateSchema.parse(body)

    // Verificar se pedido existe
    const { data: pedidoAtual, error: fetchError } = await supabase
      .from('pedidos')
      .select('*')
      .eq('id', resolvedParams.id)
      .single()

    if (fetchError || !pedidoAtual) {
      return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 })
    }

    // Verificar se a mudança de status é válida
    const statusValidos: Record<string, string[]> = {
      'pendente': ['confirmado', 'cancelado'],
      'confirmado': ['preparando', 'cancelado'],
      'preparando': ['saiu_entrega', 'cancelado'],
      'saiu_entrega': ['entregue', 'cancelado'],
      'entregue': [], // Status final
      'cancelado': [] // Status final
    }

    const statusAtual = pedidoAtual.status
    const novoStatus = validatedData.status

    // Admins podem forçar qualquer mudança de status em casos especiais
    // mas vamos logar isso como uma intervenção administrativa
    const isIntervencaoAdmin = !statusValidos[statusAtual]?.includes(novoStatus) && 
                              statusAtual !== novoStatus

    // Preparar dados de atualização
    const updateData: any = {
      status: validatedData.status,
      updated_at: new Date().toISOString(),
    }

    // Adicionar timestamps específicos
    if (validatedData.status === 'confirmado') {
      updateData.confirmado_em = new Date().toISOString()
    } else if (validatedData.status === 'preparando') {
      updateData.preparando_em = new Date().toISOString()
    } else if (validatedData.status === 'saiu_entrega') {
      updateData.saiu_entrega_em = new Date().toISOString()
    } else if (validatedData.status === 'entregue') {
      updateData.entregue_em = new Date().toISOString()
    } else if (validatedData.status === 'cancelado') {
      updateData.cancelado_em = new Date().toISOString()
      updateData.motivo_cancelamento = validatedData.motivo || 'Cancelado pelo administrador'
    }

    // Atualizar pedido
    const { data, error } = await supabase
      .from('pedidos')
      .update(updateData)
      .eq('id', resolvedParams.id)
      .select()
      .single()

    if (error) throw error

    // Log da ação administrativa
    await supabase
      .from('admin_logs')
      .insert({
        admin_id: session.user.id,
        action: isIntervencaoAdmin ? 'intervencao_pedido_status' : 'update_pedido_status',
        target_id: resolvedParams.id,
        details: {
          old_status: statusAtual,
          new_status: validatedData.status,
          motivo: validatedData.motivo,
          is_intervencao: isIntervencaoAdmin
        }
      })

    return createSuccessResponse(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Dados inválidos', 
        details: error.errors 
      }, { status: 400 })
    }
    return handleApiError(error)
  }
}