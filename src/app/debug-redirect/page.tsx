'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthSelectors } from '@/stores/auth-store'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function DebugRedirectPage() {
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const authSelectors = useAuthSelectors()
  const supabase = createClient()

  useEffect(() => {
    const fetchDebugInfo = async () => {
      try {
        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        let profile = null
        let profileError = null
        
        if (session?.user) {
          // Try to fetch profile
          const { data: profileData, error: profError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
          
          profile = profileData
          profileError = profError
        }

        setDebugInfo({
          session: session ? {
            user_id: session.user.id,
            email: session.user.email,
            role: session.user.role,
          } : null,
          sessionError,
          profile,
          profileError,
          authSelectors,
          timestamp: new Date().toISOString(),
        })
      } catch (error: any) {
        console.error('Debug fetch error:', error)
        setDebugInfo({ error: error.message || 'Erro desconhecido' })
      } finally {
        setIsLoading(false)
      }
    }

    fetchDebugInfo()
  }, [supabase, authSelectors])

  const handleManualRedirect = () => {
    const role = debugInfo?.profile?.role || authSelectors.userRole
    
    const redirectMap: Record<string, string> = {
      admin: '/admin',
      empresa: '/empresa',
      entregador: '/entregador',
      consumidor: '/consumidor',
    }
    
    const redirectPath = redirectMap[role as string]
    
    if (redirectPath) {
      router.push(redirectPath)
    } else {
      alert('Role não encontrado: ' + role)
    }
  }

  const handleRefreshProfile = async () => {
    setIsLoading(true)
    
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        // Force refresh profile
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
        
        if (error) {
          alert('Erro ao buscar profile: ' + error.message)
        } else {
          alert('Profile atualizado: ' + JSON.stringify(profile))
          window.location.reload()
        }
      }
    } catch (error: any) {
      alert('Erro: ' + (error.message || 'Erro desconhecido'))
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>Debug Redirecionamento - Carregando...</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Carregando informações de debug...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Debug Redirecionamento Admin</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold">Informações de Debug:</h3>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={handleManualRedirect}>
              Redirecionar Manualmente
            </Button>
            <Button onClick={handleRefreshProfile} variant="outline">
              Atualizar Profile
            </Button>
            <Button onClick={() => window.location.reload()} variant="outline">
              Recarregar Página
            </Button>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-semibold">Status Atual:</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Autenticado: {authSelectors.isAuthenticated ? '✅ Sim' : '❌ Não'}</li>
              <li>Role: {authSelectors.userRole || '❌ Não encontrado'}</li>
              <li>É Admin: {authSelectors.isAdmin ? '✅ Sim' : '❌ Não'}</li>
              <li>Profile carregado: {debugInfo?.profile ? '✅ Sim' : '❌ Não'}</li>
              <li>Session ativa: {debugInfo?.session ? '✅ Sim' : '❌ Não'}</li>
            </ul>
          </div>
          
          {debugInfo?.profileError && (
            <div className="bg-red-100 p-4 rounded">
              <h3 className="font-semibold text-red-800">Erro no Profile:</h3>
              <p className="text-red-700">{debugInfo.profileError.message}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}