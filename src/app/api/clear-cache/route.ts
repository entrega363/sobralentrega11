import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // This endpoint just returns a script to clear localStorage
  const script = `
    <script>
      // Clear all auth-related localStorage
      localStorage.removeItem('auth-storage');
      localStorage.clear();
      
      // Clear sessionStorage too
      sessionStorage.clear();
      
      // Redirect to login
      window.location.href = '/login';
    </script>
    <h1>Cache cleared! Redirecting to login...</h1>
  `
  
  return new NextResponse(script, {
    headers: {
      'Content-Type': 'text/html',
    },
  })
}