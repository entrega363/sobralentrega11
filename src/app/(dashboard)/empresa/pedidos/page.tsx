'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Clock, MapPin, Phone, User, Utensils, UserCheck } from 'lucide-react'

// Dados mock para demonstração - incluindo pedidos delivery e locais
const mockPedidos = [
  // Pedidos delivery
  {
    id: '1',
    numero: '#001',
    tipo_pedido: 'delivery',
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
    tipo_pedido: 'delivery',
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
  // Pedidos locais
  {
    id: '3',
    numero: '#003',
    tipo_pedido: 'local',
    mesa: '05',
    garcom: {
      id: '1',
      nome: 'Maria Silva'
    },
    cliente_nome: 'Pedro Costa',
    status: 'pronto',
    total: 71.80,
    itens: [
      { nome: 'Pizza Margherita', quantidade: 2, preco: 35.90 }
    ],
    created_at: '2024-01-15T09:45:00Z',
    observacoes_garcom: 'Cliente pediu sem azeitona'
  },
  {
    id: '4',
    numero: '#004',
    tipo_pedido: 'local',
    mesa: '12',
    garcom: {
      id: '2',
      nome: 'João Santos'
    },
    cliente_nome: 'Ana Oliveira',
    status: 'preparando',
    total: 89.50,
    itens: [
      { nome: 'Lasanha Bolonhesa', quantidade: 1, preco: 45.90 },
      { nome: 'Salada Caesar', quantidade: 1, preco: 25.90 },
      { nome: 'Suco Natural', quantidade: 2, preco: 8.90 }
    ],
    created_at: '2024-01-15T11:30:00Z',
    observacoes_garcom: 'Mesa próxima à janela'
  },
  {
    id: '5',
    numero: '#005',
    tipo_pedido: 'local',
    mesa: '08',
    garcom: {
      id: '1',
      nome: 'Maria Silva'
    },
    status: 'pendente',
    total: 34.80,
    itens: [
      { nome: 'Hambúrguer Clássico', quantidade: 1, preco: 28.90 },
      { nome: 'Batata Frita', quantidade: 1, preco: 5.90 }
    ],
    created_at: '2024-01-15T12:00:00Z',
    observacoes_garcom: 'Sem cebola no hambúrguer'
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
  const [filtroTipo, setFiltroTipo] = useState('todos')

  const pedidosFiltrados = pedidos.filter(p => {
    const statusMatch = filtroStatus === 'todos' || p.status === filtroStatus
    const tipoMatch = filtroTipo === 'todos' || p.tipo_pedido === filtroTipo
    return statusMatch && tipoMatch
  })

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
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className="text-lg">Pedido {pedido.numero}</CardTitle>
              <Badge variant={pedido.tipo_pedido === 'local' ? 'default' : 'secondary'}>
                {pedido.tipo_pedido === 'local' ? (
                  <><Utensils className="h-3 w-3 mr-1" />Local</>
                ) : (
                  <><MapPin className="h-3 w-3 mr-1" />Delivery</>
                )}
              </Badge>
            </div>
            
            {pedido.tipo_pedido === 'delivery' ? (
              <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                <User className="h-4 w-4" />
                <span>{pedido.consumidor}</span>
                <Phone className="h-4 w-4 ml-2" />
                <span>{pedido.telefone}</span>
              </div>
            ) : (
              <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                <div className="flex items-center gap-1">
                  <Utensils className="h-4 w-4" />
                  <span>Mesa {pedido.mesa}</span>
                </div>
                <div className="flex items-center gap-1">
                  <UserCheck className="h-4 w-4" />
                  <span>{pedido.garcom?.nome}</span>
                </div>
                {pedido.cliente_nome && (
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span>{pedido.cliente_nome}</span>
                  </div>
                )}
              </div>
            )}
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
          {pedido.tipo_pedido === 'delivery' && pedido.endereco && (
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 mt-0.5 text-gray-500" />
              <span className="text-sm">{pedido.endereco}</span>
            </div>
          )}
          
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

          {(pedido.observacoes || pedido.observacoes_garcom) && (
            <div className="border-t pt-3">
              <h4 className="font-semibold mb-1">Observações:</h4>
              {pedido.observacoes && (
                <p className="text-sm text-gray-600 mb-1">{pedido.observacoes}</p>
              )}
              {pedido.observacoes_garcom && (
                <p className="text-sm text-blue-600">
                  <span className="font-medium">Garçom:</span> {pedido.observacoes_garcom}
                </p>
              )}
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
            
            {pedido.status === 'pronto' && pedido.tipo_pedido === 'delivery' && (
              <Button 
                size="sm"
                onClick={() => atualizarStatus(pedido.id, 'saiu_entrega')}
              >
                Saiu para Entrega
              </Button>
            )}
            
            {pedido.status === 'pronto' && pedido.tipo_pedido === 'local' && (
              <Button 
                size="sm"
                className="bg-green-600 hover:bg-green-700"
                onClick={() => atualizarStatus(pedido.id, 'entregue')}
              >
                Entregar na Mesa
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
        <p className="text-gray-600">Gerencie os pedidos de delivery e locais da sua empresa</p>
      </div>

      {/* Filtros */}
      <div className="flex gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Tipo:</label>
          <Tabs value={filtroTipo} onValueChange={setFiltroTipo}>
            <TabsList>
              <TabsTrigger value="todos">Todos</TabsTrigger>
              <TabsTrigger value="delivery">
                <MapPin className="h-4 w-4 mr-1" />
                Delivery
              </TabsTrigger>
              <TabsTrigger value="local">
                <Utensils className="h-4 w-4 mr-1" />
                Local
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Status:</label>
          <Tabs value={filtroStatus} onValueChange={setFiltroStatus}>
            <TabsList>
              <TabsTrigger value="todos">Todos</TabsTrigger>
              <TabsTrigger value="pendente">Pendentes</TabsTrigger>
              <TabsTrigger value="preparando">Preparando</TabsTrigger>
              <TabsTrigger value="pronto">Prontos</TabsTrigger>
              <TabsTrigger value="entregue">Entregues</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Hoje</p>
                <p className="text-2xl font-bold">{pedidos.length}</p>
              </div>
              <Clock className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Delivery</p>
                <p className="text-2xl font-bold">
                  {pedidos.filter(p => p.tipo_pedido === 'delivery').length}
                </p>
              </div>
              <MapPin className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Local</p>
                <p className="text-2xl font-bold">
                  {pedidos.filter(p => p.tipo_pedido === 'local').length}
                </p>
              </div>
              <Utensils className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Faturamento</p>
                <p className="text-2xl font-bold">
                  R$ {pedidos.reduce((acc, p) => acc + p.total, 0).toFixed(2)}
                </p>
              </div>
              <User className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Pedidos */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {filtroTipo === 'todos' ? 'Todos os Pedidos' : 
             filtroTipo === 'delivery' ? 'Pedidos Delivery' : 'Pedidos Locais'}
            {filtroStatus !== 'todos' && ` - ${statusConfig[filtroStatus as keyof typeof statusConfig]?.label}`}
          </h2>
          <p className="text-sm text-gray-600">
            {pedidosFiltrados.length} pedido{pedidosFiltrados.length !== 1 ? 's' : ''}
          </p>
        </div>

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
                {filtroTipo === 'local' ? (
                  <Utensils className="h-12 w-12 mx-auto" />
                ) : filtroTipo === 'delivery' ? (
                  <MapPin className="h-12 w-12 mx-auto" />
                ) : (
                  <Clock className="h-12 w-12 mx-auto" />
                )}
              </div>
              <h3 className="text-lg font-semibold mb-2">Nenhum pedido encontrado</h3>
              <p className="text-gray-600">
                {filtroStatus === 'todos' && filtroTipo === 'todos'
                  ? 'Você ainda não recebeu nenhum pedido'
                  : `Não há pedidos ${filtroTipo !== 'todos' ? `${filtroTipo === 'local' ? 'locais' : 'de delivery'}` : ''} ${filtroStatus !== 'todos' ? `com status "${statusConfig[filtroStatus as keyof typeof statusConfig]?.label}"` : ''}`
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}