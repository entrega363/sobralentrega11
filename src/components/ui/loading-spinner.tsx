import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-sobral-red-500 to-sobral-orange-600">
      <div className="bg-white rounded-lg shadow-2xl p-8 text-center">
        <div className="text-6xl mb-4">🍕</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Entrega Sobral</h2>
        <div
          className={cn(
            'loading-spinner border-sobral-red-600 mx-auto',
            sizeClasses[size],
            className
          )}
        />
        <p className="text-gray-600 mt-4">Carregando...</p>
      </div>
    </div>
  )
}