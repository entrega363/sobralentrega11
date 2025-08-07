import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  // Update session
  let response = await updateSession(request)

  // Create Supabase client for middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // Get session
  const { data: { session } } = await supabase.auth.getSession()

  // Protected routes configuration
  const protectedRoutes = {
    '/admin': ['admin'],
    '/empresa': ['empresa'],
    '/entregador': ['entregador'],
    '/consumidor': ['consumidor'],
  }

  const pathname = request.nextUrl.pathname

  // Check if route needs protection
  for (const [route, allowedRoles] of Object.entries(protectedRoutes)) {
    if (pathname.startsWith(route)) {
      // If not authenticated, redirect to login
      if (!session) {
        return NextResponse.redirect(new URL('/login', request.url))
      }

      // Get user profile to check role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single()

      // If no profile or wrong role, redirect to login
      if (!profile || !allowedRoles.includes(profile.role)) {
        return NextResponse.redirect(new URL('/login', request.url))
      }
    }
  }

  // Redirect authenticated users from auth pages
  if (session && (pathname.startsWith('/login') || pathname.startsWith('/register'))) {
    // Get user profile to redirect to correct dashboard
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (profile) {
      const redirectPaths: Record<string, string> = {
        admin: '/admin',
        empresa: '/empresa',
        entregador: '/entregador',
        consumidor: '/consumidor',
      }
      
      const redirectPath = redirectPaths[profile.role]

      if (redirectPath) {
        return NextResponse.redirect(new URL(redirectPath, request.url))
      }
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}