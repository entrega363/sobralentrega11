'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { RefreshCw, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'

interface DebugData {
  email: string
  checks: {
    authUser: {
      exists: boolean
      data: any
      error?: string
    }
    userRole: {
      exists: boolean
      data: any
      error?: string
    }
    adminProfile: {
      exists: boolean
      data: any
      error?: string
    }
    profile: {
      exists: boolean
      data: any
      error?: string
    }
    loginTest: {
      success: boolean
      error?: string
      user?: any
    }
  }
  recommendations: string[]
}

export default function DebugLoginPage() {
  const [debugData, setDebugData] = useState<DebugData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('entregasobral@gmail.com')

  const fetchDebugData = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/debug-login?email=${encodeURIComponent(email)}`)
      const data = await response.json()
      setDebugData(data)
    } catch (error) {
      console.error('Erro ao buscar dados de debug:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDebugData()
  }, [])

  const getStatusIcon = (exists: boolean, error?: string) => {
    if (error) return <XCircle className="h-5 w-5 text-destructive" />
    if (exists) return <CheckCircle className="h-5 w-5 text-green-500" />
    return <XCircle className="h-5 w-5 text-destructive" />
  }

  const getStatusBadge = (exists: boolean, error?: string) => {
    if (error) return <Badge variant="destructive">Erro</Badge>
    if (exists) return <Badge variant="default">OK</Badge>
    return <Badge variant="destructive">Não encontrado</Badge>
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Debug de Login</h1>
          <p className="text-muted-foreground">
            Diagnóstico completo do sistema de autenticação
          </p>
        </div>
        <Button onClick={fetchDebugData} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Email sendo testado</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-md"
              placeholder="Email para testar"
            />
            <Button onClick={fetchDebugData} disabled={isLoading}>
              Testar
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoading && (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <LoadingSpinner />
          </CardContent>
        </Card>
      )}

      {debugData && (
        <>
          {/* Verificações */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  {getStatusIcon(debugData.checks.authUser.exists, debugData.checks.authUser.error)}
                  <span className="ml-2">Auth Users</span>
                  {getStatusBadge(debugData.checks.authUser.exists, debugData.checks.authUser.error)}
                </CardTitle>
                <CardDescription>
                  Verificação na tabela auth.users do Supabase
                </CardDescription>
              </CardHeader>
              <CardContent>
                {debugData.checks.authUser.data ? (
                  <div className="space-y-2 text-sm">
                    <div><strong>ID:</strong> {debugData.checks.authUser.data.id}</div>
                    <div><strong>Email:</strong> {debugData.checks.authUser.data.email}</div>
                    <div><strong>Email Confirmado:</strong> {debugData.checks.authUser.data.email_confirmed ? 'Sim' : 'Não'}</div>
                    <div><strong>Metadata:</strong> {JSON.stringify(debugData.checks.authUser.data.metadata, null, 2)}</div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Usuário não encontrado</p>
                )}
                {debugData.checks.authUser.error && (
                  <p className="text-destructive text-sm mt-2">{debugData.checks.authUser.error}</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  {getStatusIcon(debugData.checks.userRole.exists, debugData.checks.userRole.error)}
                  <span className="ml-2">User Roles</span>
                  {getStatusBadge(debugData.checks.userRole.exists, debugData.checks.userRole.error)}
                </CardTitle>
                <CardDescription>
                  Verificação na tabela user_roles
                </CardDescription>
              </CardHeader>
              <CardContent>
                {debugData.checks.userRole.data ? (
                  <div className="space-y-2 text-sm">
                    <div><strong>Role:</strong> {debugData.checks.userRole.data.role}</div>
                    <div><strong>Criado em:</strong> {new Date(debugData.checks.userRole.data.created_at).toLocaleString()}</div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Role não encontrada</p>
                )}
                {debugData.checks.userRole.error && (
                  <p className="text-destructive text-sm mt-2">{debugData.checks.userRole.error}</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  {getStatusIcon(debugData.checks.adminProfile.exists, debugData.checks.adminProfile.error)}
                  <span className="ml-2">Admin Profile</span>
                  {getStatusBadge(debugData.checks.adminProfile.exists, debugData.checks.adminProfile.error)}
                </CardTitle>
                <CardDescription>
                  Verificação na tabela admins
                </CardDescription>
              </CardHeader>
              <CardContent>
                {debugData.checks.adminProfile.data ? (
                  <div className="space-y-2 text-sm">
                    <div><strong>Nome:</strong> {debugData.checks.adminProfile.data.nome}</div>
                    <div><strong>Email:</strong> {debugData.checks.adminProfile.data.email}</div>
                    <div><strong>Telefone:</strong> {debugData.checks.adminProfile.data.telefone}</div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Perfil admin não encontrado</p>
                )}
                {debugData.checks.adminProfile.error && (
                  <p className="text-destructive text-sm mt-2">{debugData.checks.adminProfile.error}</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  {getStatusIcon(debugData.checks.profile.exists, debugData.checks.profile.error)}
                  <span className="ml-2">Profiles View</span>
                  {getStatusBadge(debugData.checks.profile.exists, debugData.checks.profile.error)}
                </CardTitle>
                <CardDescription>
                  Verificação na view profiles
                </CardDescription>
              </CardHeader>
              <CardContent>
                {debugData.checks.profile.data ? (
                  <div className="space-y-2 text-sm">
                    <div><strong>Nome:</strong> {debugData.checks.profile.data.nome}</div>
                    <div><strong>Role:</strong> {debugData.checks.profile.data.role}</div>
                    <div><strong>Email:</strong> {debugData.checks.profile.data.email}</div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Perfil não encontrado na view</p>
                )}
                {debugData.checks.profile.error && (
                  <p className="text-destructive text-sm mt-2">{debugData.checks.profile.error}</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Teste de Login */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                {debugData.checks.loginTest.success ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-destructive" />
                )}
                <span className="ml-2">Teste de Login</span>
                {debugData.checks.loginTest.success ? (
                  <Badge variant="default">Sucesso</Badge>
                ) : (
                  <Badge variant="destructive">Falhou</Badge>
                )}
              </CardTitle>
              <CardDescription>
                Teste de login programático com as credenciais
              </CardDescription>
            </CardHeader>
            <CardContent>
              {debugData.checks.loginTest.success ? (
                <div className="space-y-2 text-sm">
                  <p className="text-green-600">✅ Login realizado com sucesso!</p>
                  {debugData.checks.loginTest.user && (
                    <div>
                      <strong>Usuário logado:</strong> {debugData.checks.loginTest.user.email}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-destructive">❌ Falha no login</p>
                  {debugData.checks.loginTest.error && (
                    <p className="text-sm text-muted-foreground">{debugData.checks.loginTest.error}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recomendações */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                <span className="ml-2">Recomendações</span>
              </CardTitle>
              <CardDescription>
                Ações sugeridas para corrigir problemas encontrados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {debugData.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <span className="text-sm">{rec}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Scripts de Correção */}
      <Card>
        <CardHeader>
          <CardTitle>Scripts de Correção</CardTitle>
          <CardDescription>
            Execute estes scripts no Supabase SQL Editor se houver problemas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">1. Script de Diagnóstico</h4>
            <code className="text-sm bg-muted p-2 rounded block">
              Execute: DIAGNOSTICAR_LOGIN_ADMIN.sql
            </code>
          </div>
          <div>
            <h4 className="font-medium mb-2">2. Script de Correção Completa</h4>
            <code className="text-sm bg-muted p-2 rounded block">
              Execute: CORRIGIR_PROBLEMA_LOGIN_COMPLETO.sql
            </code>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}