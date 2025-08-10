'use client'

import { useAuthSelectors } from '@/stores/auth-store'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  BarChart3, 
  Building2, 
  Package, 
  ShoppingCart, 
  Truck, 
  Users, 
  Settings,
  Home,
  Star,
  MessageCircle
} from 'lucide-react'

const navigationItems = {
  admin: [
    { name: 'Dashboard', href: '/admin', icon: Home },
    { name: 'Empresas', href: '/admin/empresas', icon: Building2 },
    { name: 'Entregadores', href: '/admin/entregadores', icon: Truck },
    { name: 'Consumidores', href: '/admin/consumidores', icon: Users },
    { name: 'Pedidos', href: '/admin/pedidos', icon: ShoppingCart },
    { name: 'Chat', href: '/chat', icon: MessageCircle },
    { name: 'Relatórios', href: '/admin/relatorios', icon: BarChart3 },
    { name: 'Configurações', href: '/admin/configuracoes', icon: Settings },
  ],
  empresa: [
    { name: 'Dashboard', href: '/empresa', icon: Home },
    { name: 'Produtos', href: '/empresa/produtos', icon: Package },
    { name: 'Pedidos', href: '/empresa/pedidos', icon: ShoppingCart },
    { name: 'Chat', href: '/chat', icon: MessageCircle },
    { name: 'Avaliações', href: '/empresa/avaliacoes', icon: Star },
    { name: 'Configurações', href: '/empresa/configuracoes', icon: Settings },
  ],
  entregador: [
    { name: 'Dashboard', href: '/entregador', icon: Home },
    { name: 'Entregas', href: '/entregador/entregas', icon: Truck },
    { name: 'Histórico', href: '/entregador/historico', icon: BarChart3 },
    { name: 'Chat', href: '/chat', icon: MessageCircle },
    { name: 'Avaliações', href: '/entregador/avaliacoes', icon: Star },
    { name: 'Configurações', href: '/entregador/configuracoes', icon: Settings },
  ],
  consumidor: [
    { name: 'Marketplace', href: '/consumidor', icon: Home },
    { name: 'Meus Pedidos', href: '/consumidor/pedidos', icon: ShoppingCart },
    { name: 'Favoritos', href: '/consumidor/favoritos', icon: Star },
    { name: 'Chat', href: '/chat', icon: MessageCircle },
    { name: 'Configurações', href: '/consumidor/configuracoes', icon: Settings },
  ],
}

export function DashboardNav() {
  const { userRole } = useAuthSelectors()
  const pathname = usePathname()

  if (!userRole) return null

  const items = navigationItems[userRole] || []

  return (
    <nav className="w-64 bg-white border-r border-gray-200 min-h-screen">
      <div className="p-4">
        <ul className="space-y-2">
          {items.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-sobral-red-50 text-sobral-red-700 border-r-2 border-sobral-red-500'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}