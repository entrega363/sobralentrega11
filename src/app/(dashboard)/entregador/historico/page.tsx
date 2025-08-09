'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import { Search, MapPin, Clock, Star, Calendar } from 'lucide-react'

export default function HistoricoPage() {
  const [busca, setBusca] = useState('')
  const [filtroMes, setFiltroMes] = useState('')

  // Dados mockados para demonstração
  const historico = [
    {
      id: '1',
      pedido_numero: '#045',
      cliente: 'Maria Santos',
      endereco: 'Rua das Palmeiras, 789 - Dom Expedito',
      data: '2024-01-15',
      valor: 28.50,
      avaliacao: 5,
      tempo_entrega: '18 min',
      distancia: '3.2 km'
    },
    {
      id: '2',
      pedido_numero: '#044',
      cliente: 'João Oliveira',
      endereco: 'Av. Senador Fernandes, 321 - Centro',
      data: '2024-01-15',
      valor: 42.90,
      avaliacao: 4,
      tempo_entrega: '22 min',
      distancia: '2.8 km'
    },
    {
      id: '3',
      pedido_numero: '#043',
      cliente: 'Ana Costa',
      endereco: 'Rua das Flores, 123 - Centro',
      data: '2024-01-14',
      valor: 35.75,
      avaliacao: 5,
      tempo_entrega: '15 min',
      distancia: '1.5 km'
    }
  ]

  const entregasFiltradasPorMes = historico.filter(entrega => {
    const matchBusca = !busca || 
      entrega.cliente.toLowerCase().includes(busca.toLowerCase()) ||
      entrega.pedido_numero.toLowerCase().includes(busca.toLowerCase())
    
    const matchMes = !filtroMes || entrega.data.startsWith(filtroMes)
    
    return matchBusca && matchMes
  })

  const totalEntregas = historico.length
  const totalGanhos = historico.reduce((sum, entrega) => sum + entrega.valor, 0)
  const avaliacaoMedia = historico.reduce((sum, entrega) => sum + entrega.avaliacao, 0) / historico.length

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Histórico de Entregas</h1>
        <p className="text-gray-600">
          Visualize suas entregas realizadas e estatísticas
        </p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="text-2xl">📦</div>
              <div>
                <p className="text-sm text-gray-600">Total de Entregas</p>
                <p className="text-xl font-semibold">{totalEntregas}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="text-2xl">💰</div>
              <div>
                <p className="text-sm text-gray-600">Total Ganho</p>
                <p className="text-xl font-semibold text-green-600">
                  R$ {totalGanhos.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="text-2xl">⭐</div>
              <div>
                <p className="text-sm text-gray-600">Avaliação Média</p>
                <div className="flex items-center space-x-1">
                  <p className="text-xl font-semibold">{avaliacaoMedia.toFixed(1)}</p>
                  <div className="flex">
                    {renderStars(Math.round(avaliacaoMedia))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
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
          value={filtroMes}
          onChange={(e) => setFiltroMes(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sobral-red-500"
        >
          <option value="">Todos os meses</option>
          <option value="2024-01">Janeiro 2024</option>
          <option value="2023-12">Dezembro 2023</option>
          <option value="2023-11">Novembro 2023</option>
        </select>
      </div>

      {/* Lista do Histórico */}
      {entregasFiltradasPorMes.length > 0 ? (
        <div className="grid gap-4">
          {entregasFiltradasPorMes.map((entrega) => (
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
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Entregue
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
                      <Calendar className="h-4 w-4 mr-2" />
                      {new Date(entrega.data).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-2" />
                      {entrega.tempo_entrega} • {entrega.distancia}
                    </div>
                    <div className="text-lg font-semibold text-green-600">
                      R$ {entrega.valor.toFixed(2)}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Avaliação:</span>
                    <div className="flex">
                      {renderStars(entrega.avaliacao)}
                    </div>
                  </div>
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
          icon="📋"
          title="Nenhuma entrega encontrada"
          description="Não há entregas no histórico que correspondam aos filtros aplicados."
        />
      )}
    </div>
  )
}