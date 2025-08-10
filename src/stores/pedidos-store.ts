import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Função para enviar notificações automáticas
const sendStatusNotification = async (pedido: Pedido, status: Pedido['status']) => {
  try {
    const eventMap = {
      'aceito': 'pedido_aceito',
      'preparando': 'pedido_preparando',
      'pronto': 'pedido_pronto',
      'saiu_entrega': 'pedido_saiu_entrega',
      'entregue': 'pedido_entregue'
    }

    const event = eventMap[status as keyof typeof eventMap]
    if (!event) return

    await fetch('/api/notifications/send', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        event,
        data: pedido
      })
    })
  } catch (error) {
    console.error('Erro ao enviar notificação:', error)
  }
}

export interface Pedido {
  id: string
  numero: string
  consumidor_id: string
  consumidor_nome: string
  empresa_id: string
  empresa_nome: string
  entregador_id?: string
  entregador_nome?: string
  status: 'pendente' | 'aceito' | 'preparando' | 'pronto' | 'saiu_entrega' | 'entregue' | 'cancelado' | 'recusado'
  total: number
  endereco: string
  telefone: string
  itens: Array<{
    nome: string
    quantidade: number
    preco: number
  }>
  observacoes?: string
  created_at: string
  updated_at: string
  entregue_em?: string
}

interface PedidosState {
  pedidos: Pedido[]
  
  // Actions
  setPedidos: (pedidos: Pedido[]) => void
  addPedido: (pedido: Pedido) => void
  updatePedidoStatus: (pedidoId: string, status: Pedido['status'], entregadorInfo?: { id: string, nome: string }) => void
  removePedido: (pedidoId: string) => void
  
  // Getters
  getPedidosByConsumidor: (consumidorId: string) => Pedido[]
  getPedidosByEmpresa: (empresaId: string) => Pedido[]
  getPedidosByEntregador: (entregadorId: string) => Pedido[]
  getPedidoById: (pedidoId: string) => Pedido | undefined
}

export const usePedidosStore = create<PedidosState>()(
  persist(
    (set, get) => ({
      pedidos: [],

      setPedidos: (pedidos) => set({ pedidos }),

      addPedido: (pedido) => set((state) => ({
        pedidos: [...state.pedidos, pedido]
      })),

      updatePedidoStatus: (pedidoId, status, entregadorInfo) => {
        const updatedPedido = get().pedidos.find(p => p.id === pedidoId)
        
        set((state) => ({
          pedidos: state.pedidos.map(pedido => 
            pedido.id === pedidoId 
              ? { 
                  ...pedido, 
                  status, 
                  updated_at: new Date().toISOString(),
                  ...(status === 'entregue' && { entregue_em: new Date().toISOString() }),
                  ...(entregadorInfo && { 
                    entregador_id: entregadorInfo.id, 
                    entregador_nome: entregadorInfo.nome 
                  })
                }
              : pedido
          )
        }))

        // Enviar notificação push após atualizar o estado
        if (updatedPedido) {
          sendStatusNotification({ ...updatedPedido, status }, status)
        }
      },

      removePedido: (pedidoId) => set((state) => ({
        pedidos: state.pedidos.filter(pedido => pedido.id !== pedidoId)
      })),

      getPedidosByConsumidor: (consumidorId) => {
        return get().pedidos.filter(pedido => pedido.consumidor_id === consumidorId)
      },

      getPedidosByEmpresa: (empresaId) => {
        return get().pedidos.filter(pedido => pedido.empresa_id === empresaId)
      },

      getPedidosByEntregador: (entregadorId) => {
        return get().pedidos.filter(pedido => pedido.entregador_id === entregadorId)
      },

      getPedidoById: (pedidoId) => {
        return get().pedidos.find(pedido => pedido.id === pedidoId)
      }
    }),
    {
      name: 'pedidos-storage',
      partialize: (state) => ({ pedidos: state.pedidos }),
    }
  )
)

// Hook para inicializar dados mockados (apenas para demonstração)
export const useInitializeMockPedidos = () => {
  const { setPedidos } = usePedidosStore()
  
  const initializeMockData = () => {
    const mockPedidos: Pedido[] = [
      {
        id: '1',
        numero: '#001',
        consumidor_id: 'consumer-1',
        consumidor_nome: 'Ana Costa',
        empresa_id: 'empresa-1',
        empresa_nome: 'Matutaria',
        entregador_id: 'entregador-1',
        entregador_nome: 'Entregador Sobral',
        status: 'saiu_entrega',
        total: 45.90,
        endereco: 'Rua das Flores, 123 - Centro',
        telefone: '(85) 99999-1111',
        itens: [
          { nome: 'Pizza Margherita', quantidade: 1, preco: 35.90 },
          { nome: 'Refrigerante', quantidade: 2, preco: 5.00 }
        ],
        observacoes: 'Sem cebola na pizza',
        created_at: '2024-01-15T10:30:00Z',
        updated_at: '2024-01-15T11:00:00Z'
      },
      {
        id: '2',
        numero: '#002',
        consumidor_id: 'consumer-2',
        consumidor_nome: 'Pedro Silva',
        empresa_id: 'empresa-1',
        empresa_nome: 'Matutaria',
        status: 'preparando',
        total: 32.50,
        endereco: 'Av. Principal, 456 - Cidade Dr. José Euclides',
        telefone: '(85) 88888-2222',
        itens: [
          { nome: 'Hambúrguer Artesanal', quantidade: 1, preco: 32.50 }
        ],
        created_at: '2024-01-15T11:15:00Z',
        updated_at: '2024-01-15T11:15:00Z'
      }
    ]
    
    setPedidos(mockPedidos)
  }
  
  return { initializeMockData }
}