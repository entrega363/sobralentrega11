'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import { Search, MapPin, Clock, Phone, CheckCircle } from 'lucide-react'

export default function EntregasPage() {
  const [busca, setBusca] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('')

  // Dados mockados para demonstração
  const entregas = [
    {
      id: '1',
      pedido_numero: '#001',
      cliente: 'Ana Costa',
      telefone: '(85) 99999-1111',
      endereco: 'Rua das Flores, 123 - Centro',
      status: 'pendente',
      valor: 45.90,
      tempo_estimado: '25 min',
      distancia: '2.5 km'
    },
    {
      id: '2',
      pedido_numero: '#002',
      cliente: 'Pedro Silva',
      telefone: '(85) 88888-2222',
      endereco: 'Av. Principal, 456 - Cidade Dr. José Euclides',
      status: 'em_transito',
      valor: 32.50,
      tempo_estimado: '15 min',
      distancia: '1.8 km'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente': return 'bg-yellow-100 text-yellow-800'
      case 'em_transito': return 'bg-blue-100 text-blue-800'
      case 'entregue': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pendente': return 'Pendente'
      case 'em_transito': return 'Em Trânsito'
      case 'entregue': return 'Entregue'
      default: return status
    }
  }

  const entregasFiltradas = entregas.filter(entrega => {
    const matchBusca = !busca || 
      entrega.cliente.toLowerCase().includes(busca.toLowerCase()) ||
      entrega.pedido_numero.toLowerCase().includes(busca.toLowerCase())
    
    const matchStatus = !filtroStatus || entrega.status === filtroStatus
    
    return matchBusca && matchStatus
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Entregas</h1>
        <p className="text-gray-600">
          Gerencie suas entregas pendentes e em andamento
        </p>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar por cliente ou número do pedido..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <select
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sobral-red-500"
        >
          <option value="">Todos os status</option>
          <option value="pendente">Pendente</option>
          <option value="em_transito">Em Trânsito</option>
          <option value="entregue">Entregue</option>
        </select>
      </div>

      {/* Lista de Entregas */}
      {entregasFiltradas.length > 0 ? (
        <div className="grid gap-4">
          {entregasFiltradas.map((entrega) => (
            <Card key={entrega.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      Pedido {entrega.pedido_numero}
                    </CardTitle>
                    <CardDescription>
                      {entrega.cliente}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(entrega.status)}>
                    {getStatusText(entrega.status)}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      {entrega.endereco}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="h-4 w-4 mr-2" />
                      {entrega.telefone}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-2" />
                      {entrega.tempo_estimado} • {entrega.distancia}
                    </div>
                    <div className="text-lg font-semibold text-green-600">
                      R$ {entrega.valor.toFixed(2)}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2 pt-2">
                  {entrega.status === 'pendente' && (
                    <Button size="sm" className="flex-1">
                      Aceitar Entrega
                    </Button>
                  )}
                  {entrega.status === 'em_transito' && (
                    <Button size="sm" className="flex-1">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Marcar como Entregue
                    </Button>
                  )}
                  <Button variant="outline" size="sm">
                    Ver Detalhes
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon="🚚"
          title="Nenhuma entrega encontrada"
          description="Não há entregas disponíveis no momento ou que correspondam aos filtros aplicados."
        />
      )}
    </div>
  )
}