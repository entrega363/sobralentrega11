import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { getGarcomFromRequest } from '@/lib/auth/garcom-auth'

export async function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl
    
    // Handle comanda routes (garçom authentication)
    if (pathname.startsWith('/comanda')) {
      // Allow access to login page
      if (pathname === '/comanda/login') {
        return NextResponse.next()
      }
      
      // Check garçom authentication for other comanda routes
      const garcom = getGarcomFromRequest(request)
      if (!garcom) {
        return NextResponse.redirect(new URL('/comanda/login', request.url))
      }
      
      return NextResponse.next()
    }
    
    // Handle regular dashboard routes (supabase auth)
    const response = await updateSession(request)
    
    // Allow access to auth pages and public routes
    const isAuthPage = pathname.startsWith('/login') || 
                      pathname.startsWith('/register') || 
                      pathname.startsWith('/forgot-password')
    const isPublicRoute = pathname === '/' || 
                         pathname.startsWith('/api') || 
                         pathname.startsWith('/_next') ||
                         pathname.includes('.')
    
    if (isAuthPage || isPublicRoute) {
      return response
    }
    
    return response
  } catch (error) {
    console.error('Middleware error:', error)
    // If there's any error, just pass through
    return NextResponse.next()
  }
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