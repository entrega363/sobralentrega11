'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import { Search, Star, MessageSquare, Calendar, User } from 'lucide-react'

export default function AvaliacoesPage() {
  const [busca, setBusca] = useState('')
  const [filtroEstrelas, setFiltroEstrelas] = useState('')

  // Dados mockados para demonstração
  const avaliacoes = [
    {
      id: '1',
      cliente: 'Maria Santos',
      pedido_numero: '#045',
      data: '2024-01-15',
      estrelas: 5,
      comentario: 'Entregador muito educado e pontual! Entrega rápida e comida chegou quentinha.',
      resposta: null
    },
    {
      id: '2',
      cliente: 'João Oliveira',
      pedido_numero: '#044',
      data: '2024-01-15',
      estrelas: 4,
      comentario: 'Boa entrega, mas demorou um pouco mais que o esperado.',
      resposta: 'Obrigado pelo feedback! Vou me esforçar para ser mais rápido.'
    },
    {
      id: '3',
      cliente: 'Ana Costa',
      pedido_numero: '#043',
      data: '2024-01-14',
      estrelas: 5,
      comentario: 'Perfeito! Entregador super atencioso e entrega muito rápida.',
      resposta: null
    },
    {
      id: '4',
      cliente: 'Pedro Silva',
      pedido_numero: '#042',
      data: '2024-01-14',
      estrelas: 3,
      comentario: 'Entrega ok, mas o entregador poderia ser mais simpático.',
      resposta: null
    }
  ]

  const avaliacoesFiltradas = avaliacoes.filter(avaliacao => {
    const matchBusca = !busca || 
      avaliacao.cliente.toLowerCase().includes(busca.toLowerCase()) ||
      avaliacao.pedido_numero.toLowerCase().includes(busca.toLowerCase()) ||
      avaliacao.comentario.toLowerCase().includes(busca.toLowerCase())
    
    const matchEstrelas = !filtroEstrelas || avaliacao.estrelas.toString() === filtroEstrelas
    
    return matchBusca && matchEstrelas
  })

  const totalAvaliacoes = avaliacoes.length
  const avaliacaoMedia = avaliacoes.reduce((sum, av) => sum + av.estrelas, 0) / avaliacoes.length
  const distribuicaoEstrelas = {
    5: avaliacoes.filter(av => av.estrelas === 5).length,
    4: avaliacoes.filter(av => av.estrelas === 4).length,
    3: avaliacoes.filter(av => av.estrelas === 3).length,
    2: avaliacoes.filter(av => av.estrelas === 2).length,
    1: avaliacoes.filter(av => av.estrelas === 1).length,
  }

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

  const getStarColor = (stars: number) => {
    if (stars >= 4) return 'text-green-600'
    if (stars >= 3) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Avaliações</h1>
        <p className="text-gray-600">
          Veja o feedback dos clientes sobre suas entregas
        </p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avaliação Média</p>
                <div className="flex items-center space-x-2 mt-1">
                  <p className="text-2xl font-bold">{avaliacaoMedia.toFixed(1)}</p>
                  <div className="flex">
                    {renderStars(Math.round(avaliacaoMedia))}
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Baseado em {totalAvaliacoes} avaliações
                </p>
              </div>
              <div className="text-4xl">⭐</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <p className="text-sm text-gray-600 font-medium">Distribuição</p>
              {[5, 4, 3, 2, 1].map(stars => (
                <div key={stars} className="flex items-center space-x-2">
                  <span className="text-sm w-8">{stars}★</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-400 h-2 rounded-full"
                      style={{ 
                        width: `${totalAvaliacoes > 0 ? (distribuicaoEstrelas[stars as keyof typeof distribuicaoEstrelas] / totalAvaliacoes) * 100 : 0}%` 
                      }}
                    />
                  </div>
                  <span className="text-sm text-gray-500 w-8">
                    {distribuicaoEstrelas[stars as keyof typeof distribuicaoEstrelas]}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar por cliente, pedido ou comentário..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <select
          value={filtroEstrelas}
          onChange={(e) => setFiltroEstrelas(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sobral-red-500"
        >
          <option value="">Todas as estrelas</option>
          <option value="5">5 estrelas</option>
          <option value="4">4 estrelas</option>
          <option value="3">3 estrelas</option>
          <option value="2">2 estrelas</option>
          <option value="1">1 estrela</option>
        </select>
      </div>

      {/* Lista de Avaliações */}
      {avaliacoesFiltradas.length > 0 ? (
        <div className="grid gap-4">
          {avaliacoesFiltradas.map((avaliacao) => (
            <Card key={avaliacao.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    <div className="bg-gray-100 rounded-full p-2">
                      <User className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{avaliacao.cliente}</CardTitle>
                      <CardDescription>
                        Pedido {avaliacao.pedido_numero}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-1 mb-1">
                      <span className={`text-lg font-bold ${getStarColor(avaliacao.estrelas)}`}>
                        {avaliacao.estrelas}
                      </span>
                      <div className="flex">
                        {renderStars(avaliacao.estrelas)}
                      </div>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(avaliacao.data).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <MessageSquare className="h-4 w-4 text-gray-500 mt-0.5" />
                    <p className="text-sm text-gray-700">{avaliacao.comentario}</p>
                  </div>
                </div>
                
                {avaliacao.resposta && (
                  <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
                    <p className="text-sm text-blue-800 font-medium mb-1">Sua resposta:</p>
                    <p className="text-sm text-blue-700">{avaliacao.resposta}</p>
                  </div>
                )}
                
                {!avaliacao.resposta && (
                  <Button variant="outline" size="sm" className="w-full">
                    Responder Avaliação
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon="⭐"
          title="Nenhuma avaliação encontrada"
          description="Não há avaliações que correspondam aos filtros aplicados."
        />
      )}
    </div>
  )
}