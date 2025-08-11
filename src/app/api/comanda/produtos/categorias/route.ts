import { NextRequest, NextResponse } from 'next/server'
import { requireGarcomAuth } from '@/lib/auth/garcom-auth'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

// GET /api/comanda/produtos/categorias - Listar categorias disponíveis
export const GET = requireGarcomAuth(async (request: NextRequest, garcom) => {
  try {
    const supabase = createClient()

    const { data: produtos, error } = await supabase
      .from('produtos')
      .select('categoria')
      .eq('empresa_id', garcom.empresaId)
      .eq('disponivel', true)

    if (error) {
      console.error('Erro ao buscar categorias:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar categorias' },
        { status: 500 }
      )
    }

    // Extrair categorias únicas e contar produtos por categoria
    const categoriaCount: { [key: string]: number } = {}
    
    produtos?.forEach(produto => {
      const categoria = produto.categoria || 'Sem categoria'
      categoriaCount[categoria] = (categoriaCount[categoria] || 0) + 1
    })

    const categorias = Object.entries(categoriaCount)
      .map(([nome, count]) => ({
        nome,
        count
      }))
      .sort((a, b) => a.nome.localeCompare(b.nome))

    return NextResponse.json({
      categorias,
      total: categorias.length
    })

  } catch (error) {
    console.error('Erro interno:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
})