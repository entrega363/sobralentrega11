'use client'

import { Button } from '@/components/ui/button'
import { useCartStore, CartItem } from '@/stores/cart-store'
import { formatCurrency } from '@/lib/utils'
import { Minus, Plus, Trash2 } from 'lucide-react'

interface CartItemProps {
  item: CartItem
}

export function CartItemComponent({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCartStore()

  const handleDecrease = () => {
    updateQuantity(item.produto_id, item.quantidade - 1)
  }

  const handleIncrease = () => {
    updateQuantity(item.produto_id, item.quantidade + 1)
  }

  const handleRemove = () => {
    removeItem(item.produto_id)
  }

  const subtotal = item.preco * item.quantidade

  return (
    <div className="flex items-start gap-3 p-4 border-b border-gray-100">
      {/* Imagem do produto */}
      <div className="flex-shrink-0">
        {item.imagem_url ? (
          <img
            src={item.imagem_url}
            alt={item.nome}
            className="w-16 h-16 object-cover rounded-lg border"
          />
        ) : (
          <div className="w-16 h-16 bg-gray-100 rounded-lg border flex items-center justify-center">
            <span className="text-2xl">🍽️</span>
          </div>
        )}
      </div>

      {/* Informações do produto */}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm text-gray-900 truncate">
          {item.nome}
        </h4>
        <p className="text-xs text-gray-500 mt-1">
          {item.empresa_nome}
        </p>
        <p className="text-sm font-semibold text-green-600 mt-1">
          {formatCurrency(item.preco)}
        </p>
        
        {/* Controles de quantidade */}
        <div className="flex items-center gap-2 mt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDecrease}
            className="h-8 w-8 p-0"
          >
            <Minus className="h-3 w-3" />
          </Button>
          
          <span className="w-8 text-center text-sm font-medium">
            {item.quantidade}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleIncrease}
            className="h-8 w-8 p-0"
          >
            <Plus className="h-3 w-3" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 ml-2"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Subtotal */}
      <div className="text-right">
        <p className="text-sm font-semibold text-gray-900">
          {formatCurrency(subtotal)}
        </p>
        {item.tempo_preparacao && (
          <p className="text-xs text-gray-500 mt-1">
            ~{item.tempo_preparacao}min
          </p>
        )}
      </div>
    </div>
  )
}