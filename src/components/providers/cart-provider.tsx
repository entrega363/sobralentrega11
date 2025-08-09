'use client'

import { useEffect } from 'react'
import { useCartStore } from '@/stores/cart-store'
import { useAuthSelectors } from '@/stores/auth-store'

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuthSelectors()
  const clearCart = useCartStore(state => state.clearCart)

  // Limpar carrinho quando usuário faz logout
  useEffect(() => {
    if (!user) {
      clearCart()
    }
  }, [user, clearCart])

  return <>{children}</>
}