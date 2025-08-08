'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star, MessageSquare, User, Calendar } from 'lucide-react'

// Dados mock para demonstração
const mockAvaliacoes = [
  {
    id: '1',
    consumidor: 'João Silva',
    pedido_numero: '#001',
    nota_empresa: 5,
    comentario_empresa: 'Excelente comida! Pizza muito saborosa e entrega rápida.',
    comentario_geral: 'Recomendo para todos!',
    created_at: '2024-01-15T14:30:00Z'
  },
  {
    id: '2',
    consumidor: 'Maria Santos',
    pedido_numero: '#002',
    nota_empresa: 4,
    comentario_empresa: 'Hambúrguer muito bom, mas demorou um pouco para ficar pronto.',
    comentario_geral: 'No geral, boa experiência.',
    created_at: '2024-01-14T19:45:00Z'
  },
  {
    id: '3',
    consumidor: 'Pedro Costa',
    pedido_numero: '#003',
    nota_empresa: 5,
    comentario_empresa: 'Perfeito! Comida deliciosa e atendimento excelente.',
    comentario_geral: 'Voltarei sempre!',
    created_at: '2024-01-13T12:20:00Z'
  },
  {
    id: '4',
    consumidor: 'Ana Oliveira',
    pedido_numero: '#004',
    nota_empresa: 3,
    comentario_empresa: 'Comida boa, mas o tempero poderia ser melhor.',
    comentario_geral: 'Tem potencial para melhorar.',
    created_at: '2024-01-12T16:10:00Z'
  }
]

export default function AvaliacoesPage() {
  const [avaliacoes] = useState(mockAvaliacoes)

  const mediaNotas = avaliacoes.reduce((acc, av) => acc + av.nota_empresa, 0) / avaliacoes.length
  const totalAvaliacoes = avaliacoes.length

  const distribuicaoNotas = {
    5: avaliacoes.filter(av => av.nota_empresa === 5).length,
    4: avaliacoes.filter(av => av.nota_empresa === 4).length,
    3: avaliacoes.filter(av => av.nota_empresa === 3).length,
    2: avaliacoes.filter(av => av.nota_empresa === 2).length,
    1: avaliacoes.filter(av => av.nota_empresa === 1).length,
  }

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const renderStars = (nota: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < nota ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ))
  }

  const getNotaColor = (nota: number) => {
    if (nota >= 4.5) return 'text-green-600'
    if (nota >= 3.5) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Avaliações</h1>
        <p className="text-gray-600">Veja o que os clientes estão dizendo sobre sua empresa</p>
      </div>

      {/* Resumo das Avaliações */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Nota Média</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className={`text-3xl font-bold ${getNotaColor(mediaNotas)}`}>
                {mediaNotas.toFixed(1)}
              </span>
              <div className="flex">
                {renderStars(Math.round(mediaNotas))}
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Baseado em {totalAvaliacoes} avaliações
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total de Avaliações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalAvaliacoes}</div>
            <p className="text-sm text-gray-600 mt-1">Avaliações recebidas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Distribuição</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map(nota => (
                <div key={nota} className="flex items-center gap-2 text-sm">
                  <span className="w-3">{nota}</span>
                  <Star className="h-3 w-3 text-yellow-400 fill-current" />
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-400 h-2 rounded-full"
                      style={{ 
                        width: `${totalAvaliacoes > 0 ? (distribuicaoNotas[nota as keyof typeof distribuicaoNotas] / totalAvaliacoes) * 100 : 0}%` 
                      }}
                    />
                  </div>
                  <span className="w-6 text-right">{distribuicaoNotas[nota as keyof typeof distribuicaoNotas]}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Avaliações */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Avaliações Recentes</h2>
        
        {avaliacoes.map((avaliacao) => (
          <Card key={avaliacao.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="font-semibold">{avaliacao.consumidor}</span>
                  </div>
                  <Badge variant="outline">
                    Pedido {avaliacao.pedido_numero}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="h-4 w-4" />
                  <span>{formatarData(avaliacao.created_at)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <div className="flex">
                  {renderStars(avaliacao.nota_empresa)}
                </div>
                <span className="font-semibold">{avaliacao.nota_empresa}/5</span>
              </div>

              {avaliacao.comentario_empresa && (
                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Sobre a Empresa:</span>
                  </div>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                    "{avaliacao.comentario_empresa}"
                  </p>
                </div>
              )}

              {avaliacao.comentario_geral && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Comentário Geral:</span>
                  </div>
                  <p className="text-gray-700 bg-blue-50 p-3 rounded-lg">
                    "{avaliacao.comentario_geral}"
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {avaliacoes.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-gray-400 mb-4">
              <Star className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Nenhuma avaliação ainda</h3>
            <p className="text-gray-600">
              As avaliações dos clientes aparecerão aqui após os pedidos serem entregues
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}