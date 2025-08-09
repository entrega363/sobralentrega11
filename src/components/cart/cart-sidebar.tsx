'use client'

import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useCartStore } from '@/stores/cart-store'
import { CartItemComponent } from './cart-item'
import { formatCurrency } from '@/lib/utils'
import { X, ShoppingBag, CreditCard } from 'lucide-react'
import { useState } from 'react'

export function CartSidebar() {
  const { 
    items, 
    isOpen, 
    setIsOpen, 
    getTotalPrice, 
    getTotalItems,
    clearCart 
  } = useCartStore()
  
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  
  const totalPrice = getTotalPrice()
  const totalItems = getTotalItems()

  const handleClose = () => {
    setIsOpen(false)
  }

  const handleCheckout = () => {
    setIsCheckingOut(true)
    // TODO: Implementar modal de checkout
    setTimeout(() => {
      setIsCheckingOut(false)
      alert('Checkout será implementado em breve!')
    }, 1000)
  }

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={handleClose}
      />
      
      {/* Sidebar */}
      <div className="fixed inset-y-0 right-0 z-50 w-96 bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Carrinho ({totalItems})
            </h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex flex-col h-full">
          {items.length === 0 ? (
            /* Empty State */
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center">
                <div className="text-6xl mb-4">🛒</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Carrinho vazio
                </h3>
                <p className="text-gray-600 mb-4">
                  Adicione produtos ao seu carrinho para continuar
                </p>
                <Button onClick={handleClose} variant="outline">
                  Continuar Comprando
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Items List */}
              <ScrollArea className="flex-1">
                <div className="divide-y divide-gray-100">
                  {items.map((item) => (
                    <CartItemComponent key={item.id} item={item} />
                  ))}
                </div>
              </ScrollArea>

              {/* Footer */}
              <div className="border-t border-gray-200 p-4 space-y-4">
                {/* Total */}
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-gray-900">
                    Total:
                  </span>
                  <span className="text-xl font-bold text-green-600">
                    {formatCurrency(totalPrice)}
                  </span>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <Button
                    onClick={handleCheckout}
                    disabled={isCheckingOut}
                    className="w-full"
                    size="lg"
                  >
                    {isCheckingOut ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Processando...
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Finalizar Pedido
                      </>
                    )}
                  </Button>
                  
                  <Button
                    onClick={clearCart}
                    variant="outline"
                    className="w-full"
                    size="sm"
                  >
                    Limpar Carrinho
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}