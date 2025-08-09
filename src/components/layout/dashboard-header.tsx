'use client'

import { useAuthSelectors, useAuthStore } from '@/stores/auth-store'
import { Button } from '@/components/ui/button'
import { NotificationCenter } from '@/components/notifications/notification-center'
import { CartButton } from '@/components/cart/cart-button'
import { LogOut, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from '@/hooks/use-toast'

export function DashboardHeader() {
  const { user, userRole } = useAuthSelectors()
  const { reset } = useAuthStore()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      reset()
      router.push('/login')
      toast({
        title: 'Logout realizado',
        description: 'Você foi desconectado com sucesso.',
      })
    } catch (error) {
      console.error('Erro no logout:', error)
      toast({
        title: 'Erro no logout',
        description: 'Ocorreu um erro ao fazer logout.',
        variant: 'destructive',
      })
    }
  }

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      admin: 'Administrador',
      empresa: 'Empresa',
      consumidor: 'Consumidor',
      entregador: 'Entregador',
    }
    return labels[role] || role
  }

  return (
    <header className="border-b bg-white">
      <div className="flex h-16 items-center px-6">
        <div className="flex items-center space-x-4">
          <div className="text-2xl">🍕</div>
          <h1 className="text-xl font-semibold">Sistema Entrega Sobral</h1>
        </div>
        
        <div className="ml-auto flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4" />
            <span className="text-sm font-medium">{user?.email}</span>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {getRoleLabel(userRole || '')}
            </span>
          </div>
          
          {/* Carrinho (apenas para consumidores) */}
          {userRole === 'consumidor' && <CartButton />}
          
          {/* Centro de Notificações */}
          <NotificationCenter />
          
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>
      </div>
    </header>
  )
}