'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthSelectors } from '@/stores/auth-store'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

interface RoleGuardProps {
  children: React.ReactNode
  allowedRoles: string[]
  redirectTo?: string
}

export function RoleGuard({ children, allowedRoles, redirectTo = '/login' }: RoleGuardProps) {
  const { user, userRole, isLoading } = useAuthSelectors()
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    if (isLoading) return

    // Se não está autenticado, redireciona para login
    if (!user) {
      router.push('/login')
      return
    }

    // Se não tem role ou role não é permitido, redireciona
    if (!userRole || !allowedRoles.includes(userRole)) {
      router.push('/')
      return
    }

    setIsChecking(false)
  }, [user, userRole, isLoading, allowedRoles, router])

  // Mostra loading enquanto verifica
  if (isLoading || isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600">Verificando permissões...</p>
        </div>
      </div>
    )
  }

  // Se chegou até aqui, o usuário tem permissão
  return <>{children}</>
}