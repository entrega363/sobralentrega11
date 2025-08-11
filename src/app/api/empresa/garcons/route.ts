import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validateCriarGarcom } from '@/lib/validations/garcom'
import { GARCOM_ERRORS } from '@/types/garcom'
import bcrypt from 'bcryptjs'

// GET - Listar garçons da empresa
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()

    // Verificar autenticação da empresa
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Buscar perfil da empresa
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('empresa_id, role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile || profile.role !== 'empresa') {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    // Buscar garçons da empresa com estatísticas
    const hoje = new Date().toISOString().split('T')[0]
    
    const { data: garcons, error: garconsError } = await supabase
      .from('garcons')
      .select(`
        id,
        nome,
        usuario,
        ativo,
        permissoes,
        ultimo_login,
        created_at,
        updated_at
      `)
      .eq('empresa_id', profile.empresa_id)
      .order('created_at', { ascending: false })

    if (garconsError) {
      console.error('Erro ao buscar garçons:', garconsError)
      return NextResponse.json(
        { error: 'Erro ao buscar garçons' },
        { status: 500 }
      )
    }

    // Buscar estatísticas de cada garçom
    const garconsComStats = await Promise.all(
      (garcons || []).map(async (garcom) => {
        // Pedidos de hoje
        const { data: pedidosHoje } = await supabase
          .from('pedidos')
          .select('id, total')
          .eq('garcom_id', garcom.id)
          .gte('created_at', `${hoje}T00:00:00.000Z`)
          .lt('created_at', `${hoje}T23:59:59.999Z`)

        // Última atividade
        const { data: ultimaAtividade } = await supabase
          .from('garcon_atividades')
          .select('acao, created_at')
          .eq('garcom_id', garcom.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        const totalPedidosHoje = pedidosHoje?.length || 0
        const vendaTotal = pedidosHoje?.reduce((acc, pedido) => acc + (pedido.total || 0), 0) || 0

        return {
          ...garcom,
          totalPedidosHoje,
          vendaTotal,
          ultimaAtividade: ultimaAtividade?.created_at || garcom.ultimo_login
        }
      })
    )

    return NextResponse.json({ garcons: garconsComStats })

  } catch (error) {
    console.error('Erro ao listar garçons:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar novo garçom
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validar dados de entrada
    const validation = validateCriarGarcom(body)
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Dados inválidos',
          details: validation.error.errors 
        },
        { status: 400 }
      )
    }

    const { nome, usuario, senha, permissoes } = validation.data
    const supabase = createClient()

    // Verificar autenticação da empresa
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Buscar perfil da empresa
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('empresa_id, role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile || profile.role !== 'empresa') {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    // Verificar se usuário já existe
    const { data: usuarioExistente } = await supabase
      .from('garcons')
      .select('id')
      .eq('usuario', usuario)
      .single()

    if (usuarioExistente) {
      return NextResponse.json(
        { error: GARCOM_ERRORS.USUARIO_JA_EXISTE },
        { status: 409 }
      )
    }

    // Hash da senha
    const senhaHash = await bcrypt.hash(senha, 12)

    // Criar garçom
    const { data: novoGarcom, error: criarError } = await supabase
      .from('garcons')
      .insert({
        empresa_id: profile.empresa_id,
        nome,
        usuario,
        senha_hash: senhaHash,
        permissoes,
        ativo: true
      })
      .select(`
        id,
        nome,
        usuario,
        ativo,
        permissoes,
        created_at,
        updated_at
      `)
      .single()

    if (criarError) {
      console.error('Erro ao criar garçom:', criarError)
      return NextResponse.json(
        { error: 'Erro ao criar garçom' },
        { status: 500 }
      )
    }

    // Registrar atividade de criação
    await supabase
      .from('garcon_atividades')
      .insert({
        garcom_id: novoGarcom.id,
        acao: 'criar_pedido', // Usando ação existente como placeholder
        detalhes: {
          acao_real: 'garcom_criado',
          criado_por: user.id,
          timestamp: new Date().toISOString()
        }
      })

    return NextResponse.json({ 
      garcom: {
        ...novoGarcom,
        totalPedidosHoje: 0,
        vendaTotal: 0,
        ultimaAtividade: novoGarcom.created_at
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Erro ao criar garçom:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}