import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/server'
import { handleApiError, createSuccessResponse } from '@/lib/api-utils'
import { z } from 'zod'

const statusUpdateSchema = z.object({
  status: z.enum(['pendente', 'aprovada', 'rejeitada', 'suspensa']),
  motivo: z.string().optional(),
})



export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const supabase = await createRouteHandlerClient()
    
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
      return NextResponse.json({ error: 'Apenas administradores podem alterar status de empresas' }, { status: 403 })
    }

    // Validar dados
    const body = await request.json()
    const validatedData = statusUpdateSchema.parse(body)

    // Verificar se empresa existe
    const { data: empresaAtual, error: fetchError } = await supabase
      .from('empresas')
      .select('*')
      .eq('id', resolvedParams.id)
      .single()

    if (fetchError) throw fetchError

    if (!empresaAtual) {
      return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 })
    }

    // Preparar dados de atualização
    const updateData: any = {
      status: validatedData.status,
      updated_at: new Date().toISOString(),
    }

    // Adicionar timestamp específico baseado no status
    if (validatedData.status === 'aprovada') {
      updateData.aprovada_em = new Date().toISOString()
    } else if (validatedData.status === 'rejeitada') {
      updateData.rejeitada_em = new Date().toISOString()
      updateData.motivo_rejeicao = validatedData.motivo
    } else if (validatedData.status === 'suspensa') {
      updateData.suspensa_em = new Date().toISOString()
      updateData.motivo_suspensao = validatedData.motivo
    }

    // Atualizar empresa
    const { data, error } = await supabase
      .from('empresas')
      .update(updateData)
      .eq('id', resolvedParams.id)
      .select()
      .single()

    if (error) throw error

    // TODO: Enviar email de notificação para a empresa
    // await sendStatusChangeEmail(data.contato.email, validatedData.status, validatedData.motivo)

    return createSuccessResponse(data)
  } catch (error) {
    return handleApiError(error)
  }
}