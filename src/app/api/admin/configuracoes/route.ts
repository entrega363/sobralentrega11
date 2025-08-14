import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/server'
import { handleApiError, createSuccessResponse } from '@/lib/api-utils'
import { z } from 'zod'

const configuracaoSchema = z.object({
  taxaEntregaPadrao: z.number().min(0),
  comissaoEmpresa: z.number().min(0).max(100),
  comissaoEntregador: z.number().min(0).max(100),
  tempoMaximoEntrega: z.number().min(1),
  notificacoesEmail: z.boolean(),
  notificacoesSMS: z.boolean(),
  manutencaoAtiva: z.boolean(),
  horarioFuncionamento: z.object({
    inicio: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    fim: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
  })
})

export async function GET(request: NextRequest) {
  try {
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
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    // Buscar configurações do sistema
    const { data: configuracoes, error } = await supabase
      .from('configuracoes_sistema')
      .select('*')
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error
    }

    // Se não existir configuração, retornar valores padrão
    const configPadrao = {
      taxaEntregaPadrao: 5.00,
      comissaoEmpresa: 15.0,
      comissaoEntregador: 10.0,
      tempoMaximoEntrega: 60,
      notificacoesEmail: true,
      notificacoesSMS: false,
      manutencaoAtiva: false,
      horarioFuncionamento: {
        inicio: '08:00',
        fim: '23:00'
      }
    }

    const configAtual = configuracoes ? {
      taxaEntregaPadrao: configuracoes.taxa_entrega_padrao,
      comissaoEmpresa: configuracoes.comissao_empresa,
      comissaoEntregador: configuracoes.comissao_entregador,
      tempoMaximoEntrega: configuracoes.tempo_maximo_entrega,
      notificacoesEmail: configuracoes.notificacoes_email,
      notificacoesSMS: configuracoes.notificacoes_sms,
      manutencaoAtiva: configuracoes.manutencao_ativa,
      horarioFuncionamento: configuracoes.horario_funcionamento
    } : configPadrao

    return createSuccessResponse(configAtual)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PUT(request: NextRequest) {
  try {
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
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    // Validar dados
    const body = await request.json()
    const validatedData = configuracaoSchema.parse(body)

    // Preparar dados para inserção/atualização
    const configData = {
      taxa_entrega_padrao: validatedData.taxaEntregaPadrao,
      comissao_empresa: validatedData.comissaoEmpresa,
      comissao_entregador: validatedData.comissaoEntregador,
      tempo_maximo_entrega: validatedData.tempoMaximoEntrega,
      notificacoes_email: validatedData.notificacoesEmail,
      notificacoes_sms: validatedData.notificacoesSMS,
      manutencao_ativa: validatedData.manutencaoAtiva,
      horario_funcionamento: validatedData.horarioFuncionamento,
      updated_at: new Date().toISOString(),
      updated_by: session.user.id
    }

    // Verificar se já existe configuração
    const { data: configExistente } = await supabase
      .from('configuracoes_sistema')
      .select('id')
      .single()

    let result
    if (configExistente) {
      // Atualizar configuração existente
      result = await supabase
        .from('configuracoes_sistema')
        .update(configData)
        .eq('id', configExistente.id)
        .select()
        .single()
    } else {
      // Criar nova configuração
      result = await supabase
        .from('configuracoes_sistema')
        .insert({
          ...configData,
          created_at: new Date().toISOString(),
          created_by: session.user.id
        })
        .select()
        .single()
    }

    if (result.error) throw result.error

    // Log da ação administrativa
    await supabase
      .from('admin_logs')
      .insert({
        admin_id: session.user.id,
        action: 'update_configuracoes_sistema',
        target_id: result.data.id,
        details: validatedData
      })

    // Converter de volta para o formato da API
    const responseData = {
      taxaEntregaPadrao: result.data.taxa_entrega_padrao,
      comissaoEmpresa: result.data.comissao_empresa,
      comissaoEntregador: result.data.comissao_entregador,
      tempoMaximoEntrega: result.data.tempo_maximo_entrega,
      notificacoesEmail: result.data.notificacoes_email,
      notificacoesSMS: result.data.notificacoes_sms,
      manutencaoAtiva: result.data.manutencao_ativa,
      horarioFuncionamento: result.data.horario_funcionamento
    }

    return createSuccessResponse(responseData)
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