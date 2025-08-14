import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/server'
import { handleApiError, createSuccessResponse } from '@/lib/api-utils'
import { z } from 'zod'

const statusUpdateSchema = z.object({
  status: z.enum(['aprovado', 'pendente', 'rejeitado']),
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

    // Verificar se entregador existe
    const { data: entregadorAtual, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', resolvedParams.id)
      .eq('role', 'entregador')
      .single()

    if (fetchError || !entregadorAtual) {
      return NextResponse.json({ error: 'Entregador não encontrado' }, { status: 404 })
    }

    // Preparar dados de atualização
    const updateData: any = {
      status: validatedData.status,
      updated_at: new Date().toISOString(),
    }

    // Adicionar campos específicos baseado no status
    if (validatedData.status === 'aprovado') {
      updateData.aprovada_em = new Date().toISOString()
      updateData.rejeitada_em = null
      updateData.motivo_rejeicao = null
    } else if (validatedData.status === 'rejeitado') {
      updateData.rejeitada_em = new Date().toISOString()
      updateData.aprovada_em = null
      updateData.motivo_rejeicao = validatedData.motivo || 'Não especificado'
    } else if (validatedData.status === 'pendente') {
      updateData.aprovada_em = null
      updateData.rejeitada_em = null
      updateData.motivo_rejeicao = null
    }

    // Atualizar entregador
    const { data, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', resolvedParams.id)
      .eq('role', 'entregador')
      .select()
      .single()

    if (error) throw error

    // Log da ação administrativa
    await supabase
      .from('admin_logs')
      .insert({
        admin_id: session.user.id,
        action: 'update_entregador_status',
        target_id: resolvedParams.id,
        details: {
          old_status: entregadorAtual.status,
          new_status: validatedData.status,
          motivo: validatedData.motivo
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