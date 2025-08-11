import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { data: reports, error } = await supabase
      .from('saved_reports')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json(reports)
  } catch (error) {
    console.error('Erro ao buscar relatórios:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const reportConfig = await request.json()

    const { data: report, error } = await supabase
      .from('saved_reports')
      .insert({
        user_id: user.id,
        name: reportConfig.name,
        description: reportConfig.description || null,
        report_config: reportConfig
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(report)
  } catch (error) {
    console.error('Erro ao salvar relatório:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}