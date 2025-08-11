import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validateLoginGarcom } from '@/lib/validations/garcom'
import { GARCOM_ERRORS } from '@/types/garcom'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validar dados de entrada
    const validation = validateLoginGarcom(body)
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Dados inválidos',
          details: validation.error.errors 
        },
        { status: 400 }
      )
    }

    const { usuario, senha } = validation.data
    const supabase = createClient()

    // Buscar garçom pelo usuário
    const { data: garcom, error: garcomError } = await supabase
      .from('garcons')
      .select(`
        id,
        empresa_id,
        nome,
        usuario,
        senha_hash,
        ativo,
        permissoes,
        ultimo_login,
        empresas!inner (
          id,
          nome,
          ativo
        )
      `)
      .eq('usuario', usuario)
      .single()

    if (garcomError || !garcom) {
      return NextResponse.json(
        { error: GARCOM_ERRORS.CREDENCIAIS_INVALIDAS },
        { status: 401 }
      )
    }

    // Verificar se garçom está ativo
    if (!garcom.ativo) {
      return NextResponse.json(
        { error: GARCOM_ERRORS.GARCOM_INATIVO },
        { status: 403 }
      )
    }

    // Verificar se empresa está ativa
    if (!garcom.empresas.ativo) {
      return NextResponse.json(
        { error: GARCOM_ERRORS.EMPRESA_INATIVA },
        { status: 403 }
      )
    }

    // Verificar senha
    const senhaValida = await bcrypt.compare(senha, garcom.senha_hash)
    if (!senhaValida) {
      return NextResponse.json(
        { error: GARCOM_ERRORS.CREDENCIAIS_INVALIDAS },
        { status: 401 }
      )
    }

    // Atualizar último login
    const agora = new Date().toISOString()
    await supabase
      .from('garcons')
      .update({ ultimo_login: agora })
      .eq('id', garcom.id)

    // Registrar atividade de login
    await supabase
      .from('garcon_atividades')
      .insert({
        garcom_id: garcom.id,
        acao: 'login',
        detalhes: {
          timestamp: agora,
          ip_address: request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown',
          user_agent: request.headers.get('user-agent') || 'unknown'
        },
        ip_address: request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip'),
        user_agent: request.headers.get('user-agent')
      })

    // Gerar JWT token específico para garçom
    const tokenPayload = {
      garcom_id: garcom.id,
      empresa_id: garcom.empresa_id,
      usuario: garcom.usuario,
      permissoes: garcom.permissoes,
      type: 'garcom'
    }

    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET || 'fallback-secret',
      { 
        expiresIn: '8h', // Token expira em 8 horas
        issuer: 'comanda-local'
      }
    )

    // Resposta com dados do garçom (sem senha)
    const response = {
      token,
      garcom: {
        id: garcom.id,
        nome: garcom.nome,
        usuario: garcom.usuario,
        empresa: {
          id: garcom.empresas.id,
          nome: garcom.empresas.nome
        },
        permissoes: garcom.permissoes,
        ultimo_login: agora
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Erro no login do garçom:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}