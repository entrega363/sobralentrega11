'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Clock, MapPin, Phone, User } from 'lucide-react'

// Dados mock para demonstração
const mockPedidos = [
  {
    id: '1',
    numero: '#001',
    consumidor: 'João Silva',
    telefone: '(85) 99999-9999',
    status: 'pendente',
    total: 45.90,
    endereco: 'Rua das Flores, 123 - Centro',
    itens: [
      { nome: 'Pizza Margherita', quantidade: 1, preco: 35.90 },
      { nome: 'Refrigerante', quantidade: 2, preco: 5.00 }
    ],
    created_at: '2024-01-15T10:30:00Z',
    observacoes: 'Sem cebola na pizza'
  },
  {
    id: '2',
    numero: '#002',
    consumidor: 'Maria Santos',
    telefone: '(85) 88888-8888',
    status: 'preparando',
    total: 28.50,
    endereco: 'Av. Principal, 456 - Bairro Novo',
    itens: [
      { nome: 'Hambúrguer Artesanal', quantidade: 1, preco: 28.50 }
    ],
    created_at: '2024-01-15T11:15:00Z',
    observacoes: null
  },
  {
    id: '3',
    numero: '#003',
    consumidor: 'Pedro Costa',
    telefone: '(85) 77777-7777',
    status: 'pronto',
    total: 71.80,
    endereco: 'Rua do Comércio, 789 - Centro',
    itens: [
      { nome: 'Pizza Margherita', quantidade: 2, preco: 35.90 }
    ],
    created_at: '2024-01-15T09:45:00Z',
    observacoes: 'Entregar no portão azul'
  }
]

const statusConfig = {
  pendente: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' },
  aceito: { label: 'Aceito', color: 'bg-blue-100 text-blue-800' },
  preparando: { label: 'Preparando', color: 'bg-orange-100 text-orange-800' },
  pronto: { label: 'Pronto', color: 'bg-green-100 text-green-800' },
  saiu_entrega: { label: 'Saiu para Entrega', color: 'bg-purple-100 text-purple-800' },
  entregue: { label: 'Entregue', color: 'bg-green-100 text-green-800' },
  cancelado: { label: 'Cancelado', color: 'bg-red-100 text-red-800' }
}

export default function PedidosPage() {
  const [pedidos] = useState(mockPedidos)
  const [filtroStatus, setFiltroStatus] = useState('todos')

  const pedidosFiltrados = filtroStatus === 'todos' 
    ? pedidos 
    : pedidos.filter(p => p.status === filtroStatus)

  const atualizarStatus = (pedidoId: string, novoStatus: string) => {
    console.log('Atualizar status:', pedidoId, novoStatus)
    // Aqui implementaria a lógica para atualizar o status
  }

  const formatarData = (data: string) => {
    return new Date(data).toLocaleString('pt-BR')
  }

  const PedidoCard = ({ pedido }: { pedido: any }) => (
    <Card key={pedido.id} className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">Pedido {pedido.numero}</CardTitle>
            <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
              <User className="h-4 w-4" />
              <span>{pedido.consumidor}</span>
              <Phone className="h-4 w-4 ml-2" />
              <span>{pedido.telefone}</span>
            </div>
          </div>
          <div className="text-right">
            <Badge className={statusConfig[pedido.status as keyof typeof statusConfig].color}>
              {statusConfig[pedido.status as keyof typeof statusConfig].label}
            </Badge>
            <div className="text-lg font-bold text-green-600 mt-1">
              R$ {pedido.total.toFixed(2)}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 mt-0.5 text-gray-500" />
            <span className="text-sm">{pedido.endereco}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="text-sm">{formatarData(pedido.created_at)}</span>
          </div>

          <div className="border-t pt-3">
            <h4 className="font-semibold mb-2">Itens do Pedido:</h4>
            <div className="space-y-1">
              {pedido.itens.map((item: any, index: number) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>{item.quantidade}x {item.nome}</span>
                  <span>R$ {(item.quantidade * item.preco).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {pedido.observacoes && (
            <div className="border-t pt-3">
              <h4 className="font-semibold mb-1">Observações:</h4>
              <p className="text-sm text-gray-600">{pedido.observacoes}</p>
            </div>
          )}

          <div className="border-t pt-3 flex gap-2">
            {pedido.status === 'pendente' && (
              <>
                <Button 
                  size="sm" 
                  onClick={() => atualizarStatus(pedido.id, 'aceito')}
                >
                  Aceitar
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => atualizarStatus(pedido.id, 'cancelado')}
                >
                  Recusar
                </Button>
              </>
            )}
            
            {pedido.status === 'aceito' && (
              <Button 
                size="sm"
                onClick={() => atualizarStatus(pedido.id, 'preparando')}
              >
                Iniciar Preparo
              </Button>
            )}
            
            {pedido.status === 'preparando' && (
              <Button 
                size="sm"
                onClick={() => atualizarStatus(pedido.id, 'pronto')}
              >
                Marcar como Pronto
              </Button>
            )}
            
            {pedido.status === 'pronto' && (
              <Button 
                size="sm"
                onClick={() => atualizarStatus(pedido.id, 'saiu_entrega')}
              >
                Saiu para Entrega
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Pedidos</h1>
        <p className="text-gray-600">Gerencie os pedidos da sua empresa</p>
      </div>

      <Tabs value={filtroStatus} onValueChange={setFiltroStatus}>
        <TabsList>
          <TabsTrigger value="todos">Todos</TabsTrigger>
          <TabsTrigger value="pendente">Pendentes</TabsTrigger>
          <TabsTrigger value="preparando">Preparando</TabsTrigger>
          <TabsTrigger value="pronto">Prontos</TabsTrigger>
          <TabsTrigger value="entregue">Entregues</TabsTrigger>
        </TabsList>

        <TabsContent value={filtroStatus} className="mt-6">
          {pedidosFiltrados.length > 0 ? (
            <div>
              {pedidosFiltrados.map(pedido => (
                <PedidoCard key={pedido.id} pedido={pedido} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="text-gray-400 mb-4">
                  <Clock className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Nenhum pedido encontrado</h3>
                <p className="text-gray-600">
                  {filtroStatus === 'todos' 
                    ? 'Você ainda não recebeu nenhum pedido'
                    : `Não há pedidos com status "${statusConfig[filtroStatus as keyof typeof statusConfig]?.label}"`
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}