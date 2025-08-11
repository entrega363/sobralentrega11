import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { GARCOM_ERRORS } from '@/types/garcom'
import jwt from 'jsonwebtoken'

interface GarcomTokenPayload {
  garcom_id: string
  empresa_id: string
  usuario: string
  type: string
}

export async function POST(request: NextRequest) {
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
      // Mesmo com token inválido, consideramos logout bem-sucedido
      return NextResponse.json({ message: 'Logout realizado com sucesso' })
    }

    // Verificar se é token de garçom
    if (decoded.type !== 'garcom') {
      return NextResponse.json(
        { error: GARCOM_ERRORS.PERMISSAO_NEGADA },
        { status: 403 }
      )
    }

    const supabase = createClient()

    // Registrar atividade de logout
    await supabase
      .from('garcon_atividades')
      .insert({
        garcom_id: decoded.garcom_id,
        acao: 'logout',
        detalhes: {
          timestamp: new Date().toISOString(),
          ip_address: request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown',
          user_agent: request.headers.get('user-agent') || 'unknown'
        },
        ip_address: request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip'),
        user_agent: request.headers.get('user-agent')
      })

    return NextResponse.json({ 
      message: 'Logout realizado com sucesso' 
    })

  } catch (error) {
    console.error('Erro no logout do garçom:', error)
    // Mesmo com erro, consideramos logout bem-sucedido para o cliente
    return NextResponse.json({ 
      message: 'Logout realizado com sucesso' 
    })
  }
}