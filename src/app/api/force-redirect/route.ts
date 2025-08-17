import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ 
        success: false, 
        error: 'Usuário não autenticado',
        details: userError?.message 
      })
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) {
      return NextResponse.json({ 
        success: false, 
        error: 'Erro ao buscar profile',
        details: profileError.message 
      })
    }

    // Determine redirect URL based on role
    const redirectMap = {
      admin: '/admin',
      empresa: '/empresa', 
      entregador: '/entregador',
      consumidor: '/consumidor'
    }

    const redirectUrl = redirectMap[profile.role as keyof typeof redirectMap]

    if (!redirectUrl) {
      return NextResponse.json({ 
        success: false, 
        error: 'Role não reconhecido',
        role: profile.role 
      })
    }

    return NextResponse.json({ 
      success: true, 
      redirectUrl,
      user: {
        id: user.id,
        email: user.email,
        role: profile.role
      }
    })

  } catch (error: any) {
    console.error('Force redirect error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Erro interno do servidor',
      details: error.message 
    })
  }
}