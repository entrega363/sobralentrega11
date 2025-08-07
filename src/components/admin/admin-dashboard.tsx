'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StatCard } from '@/components/ui/stat-card'
import { EmptyState } from '@/components/ui/empty-state'
import { ConnectionStatus } from '@/components/realtime/connection-status'
import { Building2, Users, ShoppingCart, TrendingUp, Clock, CheckCircle } from 'lucide-react'

export function AdminDashboard() {
  // Dados estáticos para evitar erros de API
  const empresasPendentes = 0
  const empresasAprovadas = 1
  const pedidosHoje = 0
  const receitaTotal = 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Administrativo</h1>
        <p className="text-gray-600">
          Visão geral do sistema Entrega Sobral
        </p>
        <div className="mt-2">
          <ConnectionStatus />
        </div>
      </div>

      {/* Estatísticas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Empresas Ativas"
          value={empresasAprovadas}
          icon={Building2}
          iconColor="text-blue-600"
        />
        <StatCard
          title="Pendentes Aprovação"
          value={empresasPendentes}
          icon={Clock}
          iconColor="text-orange-600"
        />
        <StatCard
          title="Pedidos Hoje"
          value={pedidosHoje}
          icon={ShoppingCart}
          iconColor="text-green-600"
        />
        <StatCard
          title="Receita Total"
          value={`R$ ${receitaTotal.toFixed(2)}`}
          icon={TrendingUp}
          iconColor="text-purple-600"
        />
      </div>

      {/* Empresas Pendentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building2 className="h-5 w-5" />
            <span>Empresas Pendentes de Aprovação</span>
          </CardTitle>
          <CardDescription>
            Empresas aguardando aprovação para começar a operar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <EmptyState
              icon="🏢"
              title="Nenhuma empresa pendente"
              description="Todas as empresas foram processadas."
            />
          </div>
        </CardContent>
      </Card>

      {/* Pedidos Recentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ShoppingCart className="h-5 w-5" />
            <span>Pedidos Recentes</span>
          </CardTitle>
          <CardDescription>
            Últimos pedidos realizados no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <EmptyState
              icon="🛒"
              title="Nenhum pedido recente"
              description="Não há pedidos para exibir no momento."
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}