import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { toast } from '@/hooks/use-toast'

export interface CartItem {
  id: string
  produto_id: string
  nome: string
  preco: number
  quantidade: number
  empresa_id: string
  empresa_nome: string
  categoria: string
  imagem_url?: string
  tempo_preparacao?: number
}

interface CartState {
  items: CartItem[]
  isOpen: boolean
  isLoading: boolean
  
  // Actions
  addItem: (produto: any) => void
  removeItem: (produto_id: string) => void
  updateQuantity: (produto_id: string, quantidade: number) => void
  clearCart: () => void
  toggleCart: () => void
  setIsOpen: (isOpen: boolean) => void
  
  // Computed
  getTotalItems: () => number
  getTotalPrice: () => number
  getItemsByEmpresa: () => Record<string, CartItem[]>
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      isLoading: false,

      addItem: (produto) => {
        const { items } = get()
        const existingItem = items.find(item => item.produto_id === produto.id)

        if (existingItem) {
          // Se o item já existe, incrementa a quantidade
          set({
            items: items.map(item =>
              item.produto_id === produto.id
                ? { ...item, quantidade: item.quantidade + 1 }
                : item
            )
          })
          
          toast({
            title: 'Quantidade atualizada!',
            description: `${produto.nome} - Quantidade: ${existingItem.quantidade + 1}`,
          })
        } else {
          // Se é um novo item, adiciona ao carrinho
          const newItem: CartItem = {
            id: `${produto.id}-${Date.now()}`,
            produto_id: produto.id,
            nome: produto.nome,
            preco: produto.preco,
            quantidade: 1,
            empresa_id: produto.empresa_id,
            empresa_nome: produto.empresas?.nome || 'Empresa',
            categoria: produto.categoria,
            imagem_url: produto.imagem_url,
            tempo_preparacao: produto.tempo_preparacao,
          }

          set({
            items: [...items, newItem]
          })

          toast({
            title: 'Produto adicionado!',
            description: `${produto.nome} foi adicionado ao carrinho`,
          })
        }
      },

      removeItem: (produto_id) => {
        const { items } = get()
        const item = items.find(item => item.produto_id === produto_id)
        
        set({
          items: items.filter(item => item.produto_id !== produto_id)
        })

        if (item) {
          toast({
            title: 'Produto removido',
            description: `${item.nome} foi removido do carrinho`,
          })
        }
      },

      updateQuantity: (produto_id, quantidade) => {
        if (quantidade <= 0) {
          get().removeItem(produto_id)
          return
        }

        const { items } = get()
        set({
          items: items.map(item =>
            item.produto_id === produto_id
              ? { ...item, quantidade }
              : item
          )
        })
      },

      clearCart: () => {
        set({ items: [] })
        toast({
          title: 'Carrinho limpo',
          description: 'Todos os itens foram removidos do carrinho',
        })
      },

      toggleCart: () => {
        set(state => ({ isOpen: !state.isOpen }))
      },

      setIsOpen: (isOpen) => {
        set({ isOpen })
      },

      getTotalItems: () => {
        const { items } = get()
        return items.reduce((total, item) => total + item.quantidade, 0)
      },

      getTotalPrice: () => {
        const { items } = get()
        return items.reduce((total, item) => total + (item.preco * item.quantidade), 0)
      },

      getItemsByEmpresa: () => {
        const { items } = get()
        return items.reduce((acc, item) => {
          if (!acc[item.empresa_id]) {
            acc[item.empresa_id] = []
          }
          acc[item.empresa_id].push(item)
          return acc
        }, {} as Record<string, CartItem[]>)
      },
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ items: state.items }),
    }
  )
)