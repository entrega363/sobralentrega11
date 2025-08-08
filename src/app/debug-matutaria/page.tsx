'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthSelectors } from '@/stores/auth-store'
import { createClient } from '@/lib/supabase/client'

export default function DebugMatutariaPage() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const { user, profile } = useAuthSelectors()
  const supabase = createClient()

  const checkUserInDatabase = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          empresas (*),
          consumidores (*)
        `)
        .eq('email', 'matutaria@gmail.com')
        .single()

      setResult({
        type: 'database_check',
        data,
        error
      })
    } catch (error) {
      setResult({
        type: 'database_check',
        error
      })
    } finally {
      setLoading(false)
    }
  }

  const fixUser = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/fix-matutaria-user', {
        method: 'POST'
      })
      
      const data = await response.json()
      
      setResult({
        type: 'fix_user',
        data,
        status: response.status
      })
    } catch (error) {
      setResult({
        type: 'fix_user',
        error
      })
    } finally {
      setLoading(false)
    }
  }

  const clearCache = async () => {
    setLoading(true)
    try {
      // Clear localStorage
      localStorage.removeItem('auth-storage')
      
      // Call clear cache endpoint
      const response = await fetch('/api/clear-cache', {
        method: 'POST'
      })
      
      const data = await response.json()
      
      setResult({
        type: 'clear_cache',
        data,
        status: response.status
      })
      
      // Reload page after clearing cache
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (error) {
      setResult({
        type: 'clear_cache',
        error
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Debug Usuário Matutaria</h1>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Estado Atual do Usuário Logado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Email:</strong> {user?.email || 'Não logado'}</p>
              <p><strong>ID:</strong> {user?.id || 'N/A'}</p>
              <p><strong>Role no Profile:</strong> {profile?.role || 'N/A'}</p>
              <p><strong>Nome no Profile:</strong> {profile?.nome || 'N/A'}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ações de Debug</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={checkUserInDatabase}
              disabled={loading}
              className="w-full"
            >
              Verificar Usuário no Banco
            </Button>
            
            <Button 
              onClick={fixUser}
              disabled={loading}
              variant="destructive"
              className="w-full"
            >
              Corrigir Usuário Matutaria
            </Button>
            
            <Button 
              onClick={clearCache}
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              Limpar Cache e Recarregar
            </Button>
          </CardContent>
        </Card>

        {result && (
          <Card>
            <CardHeader>
              <CardTitle>Resultado da Ação</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}