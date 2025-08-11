import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { GARCOM_ERRORS } from '@/types/garcom'
import jwt from 'jsonwebtoken'

interface GarcomTokenPayload {
  garcom_id: string
  empresa_id: string
  usuario: string
  permissoes: {
    criar_pedidos: boolean
    editar_pedidos: boolean
    cancelar_pedidos: boolean
  }
  type: string
}

export async function GET(request: NextRequest) {
  try {
    // Extrair token do header Authorization
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token de acesso requerido' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7) // Remove "Bearer "

    // Verificar e decodificar token
    let decoded: GarcomTokenPayload
    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'fallback-secret'
      ) as GarcomTokenPayload
    } catch (jwtError) {
      return NextResponse.json(
        { error: GARCOM_ERRORS.SESSAO_EXPIRADA },
        { status: 401 }
      )
    }

    // Verificar se é token de garçom
    if (decoded.type !== 'garcom') {
      return NextResponse.json(
        { error: GARCOM_ERRORS.PERMISSAO_NEGADA },
        { status: 403 }
      )
    }

    const supabase = createClient()

    // Buscar dados atualizados do garçom
    const { data: garcom, error: garcomError } = await supabase
      .from('garcons')
      .select(`
        id,
        empresa_id,
        nome,
        usuario,
        ativo,
        permissoes,
        ultimo_login,
        empresas!inner (
          id,
          nome,
          ativo
        )
      `)
      .eq('id', decoded.garcom_id)
      .single()

    if (garcomError || !garcom) {
      return NextResponse.json(
        { error: 'Garçom não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se garçom ainda está ativo
    if (!garcom.ativo) {
      return NextResponse.json(
        { error: GARCOM_ERRORS.GARCOM_INATIVO },
        { status: 403 }
      )
    }

    // Verificar se empresa ainda está ativa
    if (!garcom.empresas.ativo) {
      return NextResponse.json(
        { error: GARCOM_ERRORS.EMPRESA_INATIVA },
        { status: 403 }
      )
    }

    // Buscar estatísticas do dia
    const hoje = new Date().toISOString().split('T')[0]
    
    const { data: pedidosHoje } = await supabase
      .from('pedidos')
      .select('id, total')
      .eq('garcom_id', garcom.id)
      .gte('created_at', `${hoje}T00:00:00.000Z`)
      .lt('created_at', `${hoje}T23:59:59.999Z`)

    const totalPedidosHoje = pedidosHoje?.length || 0
    const vendaTotal = pedidosHoje?.reduce((acc, pedido) => acc + (pedido.total || 0), 0) || 0

    // Resposta com dados do garçom
    const response = {
      garcom: {
        id: garcom.id,
        nome: garcom.nome,
        usuario: garcom.usuario,
        empresa: {
          id: garcom.empresas.id,
          nome: garcom.empresas.nome
        },
        permissoes: garcom.permissoes,
        ultimo_login: garcom.ultimo_login,
        estatisticas: {
          pedidos_hoje: totalPedidosHoje,
          venda_total: vendaTotal
        }
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Erro ao buscar dados do garçom:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}