'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCartStore } from '@/stores/cart-store'
import { ShoppingCart } from 'lucide-react'

export function CartButton() {
  const { toggleCart, getTotalItems } = useCartStore()
  const totalItems = getTotalItems()

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleCart}
      className="relative"
    >
      <ShoppingCart className="h-4 w-4" />
      {totalItems > 0 && (
        <Badge 
          variant="destructive" 
          className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
        >
          {totalItems > 99 ? '99+' : totalItems}
        </Badge>
      )}
    </Button>
  )
}