import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email') || 'entregasobral@gmail.com'

    // 1. Verificar se o usuário existe na auth.users
    const { data: authUser, error: authError } = await supabase
      .from('auth.users')
      .select('*')
      .eq('email', email)
      .single()

    // 2. Verificar se existe na user_roles
    const { data: userRole, error: roleError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', authUser?.id)
      .single()

    // 3. Verificar se existe na tabela admins
    const { data: adminProfile, error: adminError } = await supabase
      .from('admins')
      .select('*')
      .eq('user_id', authUser?.id)
      .single()

    // 4. Verificar se existe na view profiles
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single()

    // 5. Tentar fazer login programaticamente para testar
    let loginTest = null
    try {
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: email,
        password: 'tenderbr0'
      })
      
      loginTest = {
        success: !loginError,
        error: loginError?.message,
        user: loginData?.user ? {
          id: loginData.user.id,
          email: loginData.user.email,
          metadata: loginData.user.user_metadata
        } : null
      }
    } catch (error) {
      loginTest = {
        success: false,
        error: 'Erro ao testar login'
      }
    }

    return NextResponse.json({
      email,
      checks: {
        authUser: {
          exists: !!authUser,
          data: authUser ? {
            id: authUser.id,
            email: authUser.email,
            email_confirmed: !!authUser.email_confirmed_at,
            metadata: authUser.raw_user_meta_data
          } : null,
          error: authError?.message
        },
        userRole: {
          exists: !!userRole,
          data: userRole,
          error: roleError?.message
        },
        adminProfile: {
          exists: !!adminProfile,
          data: adminProfile,
          error: adminError?.message
        },
        profile: {
          exists: !!profile,
          data: profile,
          error: profileError?.message
        },
        loginTest
      },
      recommendations: generateRecommendations(authUser, userRole, adminProfile, profile)
    })

  } catch (error) {
    console.error('Debug login error:', error)
    return NextResponse.json({
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}

function generateRecommendations(authUser: any, userRole: any, adminProfile: any, profile: any) {
  const recommendations = []

  if (!authUser) {
    recommendations.push('❌ Usuário não existe na tabela auth.users - Execute o script de criação')
  } else {
    recommendations.push('✅ Usuário existe na tabela auth.users')
    
    if (!authUser.email_confirmed_at) {
      recommendations.push('⚠️ Email não confirmado - Pode causar problemas de login')
    }
  }

  if (!userRole) {
    recommendations.push('❌ Role não definida na tabela user_roles - Execute o script de correção')
  } else if (userRole.role !== 'admin') {
    recommendations.push(`⚠️ Role incorreta: ${userRole.role} (deveria ser admin)`)
  } else {
    recommendations.push('✅ Role admin definida corretamente')
  }

  if (!adminProfile) {
    recommendations.push('❌ Perfil admin não existe - Execute o script de criação')
  } else {
    recommendations.push('✅ Perfil admin existe')
  }

  if (!profile) {
    recommendations.push('❌ Perfil não encontrado na view profiles - Verifique se a view existe')
  } else if (profile.role !== 'admin') {
    recommendations.push(`⚠️ Role na view profiles incorreta: ${profile.role}`)
  } else {
    recommendations.push('✅ Perfil na view profiles correto')
  }

  return recommendations
}