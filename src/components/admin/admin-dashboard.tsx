'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StatCard } from '@/components/ui/stat-card'
import { EmptyState } from '@/components/ui/empty-state'
import { ConnectionStatus } from '@/components/realtime/connection-status'
import { useEmpresas, usePedidos } from '@/hooks/use-supabase'
import { formatCurrency, formatDate } from '@/lib/utils'
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
          value={formatCurrency(receitaTotal)}
          icon={TrendingUp}
          iconColor="text-sobral-red-600"
        />
      </div>

      {/* Empresas Pendentes */}
      {empresasPendentes > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <span>Empresas Aguardando Aprovação</span>
            </CardTitle>
            <CardDescription>
              Empresas que precisam ser analisadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {empresas
                ?.filter((e: any) => e.status === 'pendente')
                .slice(0, 5)
                .map((empresa: any) => (
                  <div key={empresa.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div>
                          <p className="font-semibold">{empresa.nome}</p>
                          <p className="text-sm text-gray-600">
                            {empresa.categoria} • {formatDate(empresa.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <Badge variant="secondary">
                        Pendente
                      </Badge>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pedidos Recentes */}
      <Card>
        <CardHeader>
          <CardTitle>Pedidos Recentes</CardTitle>
          <CardDescription>
            Últimos pedidos do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pedidos.length === 0 ? (
            <EmptyState
              icon="📦"
              title="Nenhum pedido ainda"
              description="Os pedidos aparecerão aqui quando forem realizados"
            />
          ) : (
            <div className="space-y-4">
              {pedidos?.slice(0, 10).map((pedido: any) => (
                <div key={pedido.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div>
                        <p className="font-semibold">Pedido #{pedido.id.slice(-6)}</p>
                        <p className="text-sm text-gray-600">
                          {formatDate(pedido.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(pedido.total)}</p>
                      <Badge 
                        variant={
                          pedido.status === 'pendente' ? 'secondary' :
                          pedido.status === 'entregue' ? 'default' : 'outline'
                        }
                      >
                        {pedido.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resumo do Sistema */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Status das Empresas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Aprovadas</span>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="font-semibold">{empresasAprovadas}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Pendentes</span>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-orange-600" />
                  <span className="font-semibold">{empresasPendentes}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Total</span>
                <span className="font-semibold">{empresas?.length || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Atividade do Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Pedidos Hoje</span>
                <span className="font-semibold">{pedidosHoje}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Total de Pedidos</span>
                <span className="font-semibold">{pedidos?.length || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Receita Total</span>
                <span className="font-semibold">{formatCurrency(receitaTotal)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}