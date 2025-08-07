export default function DebugPage() {
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Page</h1>
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Environment Variables:</h2>
          <p>NEXT_PUBLIC_SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set'}</p>
          <p>NEXT_PUBLIC_SUPABASE_ANON_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set'}</p>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold">Links de Teste:</h2>
          <ul className="space-y-2">
            <li><a href="/login" className="text-blue-600 hover:underline">Login Page</a></li>
            <li><a href="/register" className="text-blue-600 hover:underline">Register Page</a></li>
            <li><a href="/forgot-password" className="text-blue-600 hover:underline">Forgot Password Page</a></li>
            <li><a href="/" className="text-blue-600 hover:underline">Home Page</a></li>
          </ul>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold">Current URL:</h2>
          <p id="current-url">Loading...</p>
        </div>
      </div>
      
      <script dangerouslySetInnerHTML={{
        __html: `
          document.getElementById('current-url').textContent = window.location.href;
        `
      }} />
    </div>
  )
}