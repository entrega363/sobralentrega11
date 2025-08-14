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
  const { id } = await params
  try {
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

    // Verificar se empresa existe
    const { data: empresaAtual, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .eq('role', 'empresa')
      .single()

    if (fetchError || !empresaAtual) {
      return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 })
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

    // Atualizar empresa
    const { data, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', id)
      .eq('role', 'empresa')
      .select()
      .single()

    if (error) throw error

    // Log da ação administrativa
    await supabase
      .from('admin_logs')
      .insert({
        admin_id: session.user.id,
        action: 'update_empresa_status',
        target_id: id,
        details: {
          old_status: empresaAtual.status,
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