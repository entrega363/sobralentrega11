'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthSelectors } from '@/stores/auth-store'

export function EntregadorDashboardSimple() {
  const { profile, user } = useAuthSelectors()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard do Entregador</h1>
        <p className="text-gray-600">
          Bem-vindo ao seu painel de entregas
        </p>
      </div>

      {/* Informações do usuário */}
      <Card>
        <CardHeader>
          <CardTitle>Informações da Conta</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>ID:</strong> {user?.id}</p>
            <p><strong>Role:</strong> {profile?.role}</p>
            <p><strong>Nome:</strong> {profile?.nome || 'Não informado'}</p>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas básicas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl mb-2">🚛</div>
              <p className="text-sm text-gray-600">Entregas Disponíveis</p>
              <p className="text-2xl font-bold">0</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl mb-2">📦</div>
              <p className="text-sm text-gray-600">Entregas Hoje</p>
              <p className="text-2xl font-bold">0</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl mb-2">💰</div>
              <p className="text-sm text-gray-600">Ganhos Hoje</p>
              <p className="text-2xl font-bold">R$ 0,00</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mensagem de boas-vindas */}
      <Card>
        <CardHeader>
          <CardTitle>Bem-vindo!</CardTitle>
          <CardDescription>
            Seu dashboard está funcionando corretamente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🎉</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Dashboard carregado com sucesso!
            </h3>
            <p className="text-gray-600">
              Agora você pode começar a gerenciar suas entregas
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}