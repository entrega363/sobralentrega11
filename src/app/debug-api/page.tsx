'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthSelectors } from '@/stores/auth-store'

export default function DebugApiPage() {
  const [results, setResults] = useState<any>({})
  const [loading, setLoading] = useState<string | null>(null)
  const { user, userRole } = useAuthSelectors()

  const testApi = async (endpoint: string, name: string) => {
    setLoading(name)
    try {
      const response = await fetch(`/api${endpoint}`)
      const data = await response.json()
      
      setResults((prev: any) => ({
        ...prev,
        [name]: {
          status: response.status,
          data: data,
          success: response.ok
        }
      }))
    } catch (error: any) {
      setResults((prev: any) => ({
        ...prev,
        [name]: {
          status: 'error',
          data: error.message,
          success: false
        }
      }))
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Debug API</h1>
        <p className="text-gray-600">Teste as APIs do sistema</p>
        <div className="mt-2 text-sm">
          <p>Usuário: {user?.email}</p>
          <p>Role: {userRole}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button 
          onClick={() => testApi('/empresas', 'empresas')}
          disabled={loading === 'empresas'}
        >
          {loading === 'empresas' ? 'Testando...' : 'Testar Empresas'}
        </Button>
        
        <Button 
          onClick={() => testApi('/produtos', 'produtos')}
          disabled={loading === 'produtos'}
        >
          {loading === 'produtos' ? 'Testando...' : 'Testar Produtos'}
        </Button>
        
        <Button 
          onClick={() => testApi('/pedidos', 'pedidos')}
          disabled={loading === 'pedidos'}
        >
          {loading === 'pedidos' ? 'Testando...' : 'Testar Pedidos'}
        </Button>
      </div>

      <div className="space-y-4">
        {Object.entries(results).map(([name, result]: [string, any]) => (
          <Card key={name}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>{name}</span>
                <span className={`px-2 py-1 rounded text-xs ${
                  result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {result.status}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                {JSON.stringify(result.data, null, 2)}
              </pre>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}