import { NextRequest, NextResponse } from 'next/server'
import { requireGarcomAuth } from '@/lib/auth/garcom-auth'
import { createClient } from '@/lib/supabase/server'

// GET /api/comanda/produtos - Listar produtos da empresa do garçom
export const GET = requireGarcomAuth(async (request: NextRequest, garcom) => {
  try {
    const supabase = createClient()
    const url = new URL(request.url)
    
    // Parâmetros de consulta
    const categoria = url.searchParams.get('categoria')
    const search = url.searchParams.get('search')
    const disponivel = url.searchParams.get('disponivel')

    // Construir query base
    let query = supabase
      .from('produtos')
      .select(`
        id,
        nome,
        descricao,
        preco,
        categoria,
        disponivel,
        imagem_url,
        tempo_preparo,
        created_at
      `)
      .eq('empresa_id', garcom.empresaId)
      .order('categoria')
      .order('nome')

    // Aplicar filtros
    if (categoria) {
      query = query.eq('categoria', categoria)
    }

    if (search) {
      query = query.or(`nome.ilike.%${search}%,descricao.ilike.%${search}%`)
    }

    if (disponivel === 'true') {
      query = query.eq('disponivel', true)
    } else if (disponivel === 'false') {
      query = query.eq('disponivel', false)
    }

    const { data: produtos, error } = await query

    if (error) {
      console.error('Erro ao buscar produtos:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar produtos' },
        { status: 500 }
      )
    }

    // Agrupar produtos por categoria
    const produtosPorCategoria = produtos?.reduce((acc: any, produto) => {
      const categoria = produto.categoria || 'Sem categoria'
      if (!acc[categoria]) {
        acc[categoria] = []
      }
      acc[categoria].push(produto)
      return acc
    }, {}) || {}

    // Buscar estatísticas dos produtos
    const { data: stats, error: statsError } = await supabase
      .from('produtos')
      .select('categoria, disponivel')
      .eq('empresa_id', garcom.empresaId)

    let estatisticas = {
      total: 0,
      disponiveis: 0,
      indisponiveis: 0,
      categorias: 0
    }

    if (!statsError && stats) {
      estatisticas = {
        total: stats.length,
        disponiveis: stats.filter(p => p.disponivel).length,
        indisponiveis: stats.filter(p => !p.disponivel).length,
        categorias: new Set(stats.map(p => p.categoria || 'Sem categoria')).size
      }
    }

    return NextResponse.json({
      produtos: produtos || [],
      produtosPorCategoria,
      estatisticas,
      filtros: {
        categoria,
        search,
        disponivel
      }
    })

  } catch (error) {
    console.error('Erro interno:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
})

// GET /api/comanda/produtos/categorias - Listar categorias disponíveis
export const categorias = requireGarcomAuth(async (request: NextRequest, garcom) => {
  try {
    const supabase = createClient()

    const { data: categorias, error } = await supabase
      .from('produtos')
      .select('categoria')
      .eq('empresa_id', garcom.empresaId)
      .not('categoria', 'is', null)

    if (error) {
      console.error('Erro ao buscar categorias:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar categorias' },
        { status: 500 }
      )
    }

    // Extrair categorias únicas
    const categoriasUnicas = [...new Set(categorias?.map(p => p.categoria) || [])]
      .filter(Boolean)
      .sort()

    return NextResponse.json({
      categorias: categoriasUnicas
    })

  } catch (error) {
    console.error('Erro interno:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
})