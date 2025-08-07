import { ReactNode } from 'react'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  icon: string
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
  children?: ReactNode
}

export function EmptyState({ 
  icon, 
  title, 
  description, 
  action, 
  children 
}: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {title}
      </h3>
      <p className="text-gray-600 mb-4 max-w-md mx-auto">
        {description}
      </p>
      {action && (
        <Button onClick={action.onClick}>
          {action.label}
        </Button>
      )}
      {children}
    </div>
  )
}