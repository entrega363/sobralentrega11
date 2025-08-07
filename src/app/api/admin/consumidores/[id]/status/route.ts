import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/server'
import { handleApiError, createSuccessResponse } from '@/lib/api-utils'
import { z } from 'zod'

const statusUpdateSchema = z.object({
  status: z.enum(['ativo', 'inativo']),
  motivo: z.string().optional(),
})

interface RouteParams {
  params: {
    id: string
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
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

    // Verificar se consumidor existe
    const { data: consumidorAtual, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', params.id)
      .eq('role', 'consumidor')
      .single()

    if (fetchError || !consumidorAtual) {
      return NextResponse.json({ error: 'Consumidor não encontrado' }, { status: 404 })
    }

    // Preparar dados de atualização
    const updateData: any = {
      status: validatedData.status,
      updated_at: new Date().toISOString(),
    }

    // Adicionar campos específicos baseado no status
    if (validatedData.status === 'inativo') {
      updateData.desativado_em = new Date().toISOString()
      updateData.motivo_desativacao = validatedData.motivo || 'Não especificado'
    } else if (validatedData.status === 'ativo') {
      updateData.desativado_em = null
      updateData.motivo_desativacao = null
    }

    // Atualizar consumidor
    const { data, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', params.id)
      .eq('role', 'consumidor')
      .select()
      .single()

    if (error) throw error

    // Log da ação administrativa
    await supabase
      .from('admin_logs')
      .insert({
        admin_id: session.user.id,
        action: 'update_consumidor_status',
        target_id: params.id,
        details: {
          old_status: consumidorAtual.status,
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