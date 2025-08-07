import { Button } from '@/components/ui/button'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { 
  MoreHorizontal, 
  Eye, 
  Check, 
  X, 
  Edit, 
  Trash2, 
  UserCheck, 
  UserX,
  RefreshCw
} from 'lucide-react'
import { useState } from 'react'

export interface ActionItem {
  key: string
  label: string
  icon?: React.ComponentType<{ className?: string }>
  variant?: 'default' | 'destructive' | 'success' | 'warning'
  disabled?: boolean
}

interface ActionButtonsProps {
  actions: ActionItem[]
  onAction: (actionKey: string) => void
  loading?: string // key of the action that is loading
}

const iconMap = {
  view: Eye,
  approve: Check,
  reject: X,
  edit: Edit,
  delete: Trash2,
  activate: UserCheck,
  deactivate: UserX,
  refresh: RefreshCw,
}

const variantStyles = {
  default: 'text-gray-700 hover:bg-gray-50',
  destructive: 'text-red-700 hover:bg-red-50',
  success: 'text-green-700 hover:bg-green-50',
  warning: 'text-orange-700 hover:bg-orange-50',
}

export function ActionButtons({ actions, onAction, loading }: ActionButtonsProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleAction = (actionKey: string) => {
    onAction(actionKey)
    setIsOpen(false)
  }

  if (actions.length === 0) {
    return null
  }

  // If only one action, show as button
  if (actions.length === 1) {
    const action = actions[0]
    const Icon = action.icon || iconMap[action.key as keyof typeof iconMap] || Eye
    const isLoading = loading === action.key

    return (
      <Button
        variant={action.variant === 'destructive' ? 'destructive' : 'outline'}
        size="sm"
        onClick={() => handleAction(action.key)}
        disabled={action.disabled || isLoading}
        className="flex items-center gap-2"
      >
        {isLoading ? (
          <RefreshCw className="h-4 w-4 animate-spin" />
        ) : (
          <Icon className="h-4 w-4" />
        )}
        {action.label}
      </Button>
    )
  }

  // Multiple actions - show dropdown
  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {actions.map((action) => {
          const Icon = action.icon || iconMap[action.key as keyof typeof iconMap] || Eye
          const isLoading = loading === action.key
          const variant = action.variant || 'default'

          return (
            <DropdownMenuItem
              key={action.key}
              onClick={() => handleAction(action.key)}
              disabled={action.disabled || isLoading}
              className={variantStyles[variant]}
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Icon className="h-4 w-4 mr-2" />
              )}
              {action.label}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}