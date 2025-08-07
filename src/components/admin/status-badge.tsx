import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type Status = 'aprovado' | 'pendente' | 'rejeitado' | 'ativo' | 'inativo' | 'confirmado' | 'preparando' | 'saiu_entrega' | 'entregue' | 'cancelado'

interface StatusBadgeProps {
  status: Status
  variant?: 'default' | 'outline'
}

const statusConfig = {
  aprovado: {
    label: 'Aprovado',
    className: 'bg-green-100 text-green-800 border-green-200',
  },
  pendente: {
    label: 'Pendente',
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  },
  rejeitado: {
    label: 'Rejeitado',
    className: 'bg-red-100 text-red-800 border-red-200',
  },
  ativo: {
    label: 'Ativo',
    className: 'bg-green-100 text-green-800 border-green-200',
  },
  inativo: {
    label: 'Inativo',
    className: 'bg-gray-100 text-gray-800 border-gray-200',
  },
  confirmado: {
    label: 'Confirmado',
    className: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  preparando: {
    label: 'Preparando',
    className: 'bg-orange-100 text-orange-800 border-orange-200',
  },
  saiu_entrega: {
    label: 'Saiu para Entrega',
    className: 'bg-purple-100 text-purple-800 border-purple-200',
  },
  entregue: {
    label: 'Entregue',
    className: 'bg-green-100 text-green-800 border-green-200',
  },
  cancelado: {
    label: 'Cancelado',
    className: 'bg-red-100 text-red-800 border-red-200',
  },
}

export function StatusBadge({ status, variant = 'default' }: StatusBadgeProps) {
  const config = statusConfig[status]
  
  if (!config) {
    return (
      <Badge variant="outline" className="bg-gray-100 text-gray-800">
        {status}
      </Badge>
    )
  }

  return (
    <Badge 
      variant={variant}
      className={cn(
        'font-medium',
        variant === 'default' ? config.className : 'border-current'
      )}
    >
      {config.label}
    </Badge>
  )
}