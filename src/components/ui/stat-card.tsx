import { ReactNode } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  iconColor?: string
  description?: string
}

export function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  iconColor = 'text-blue-600',
  description 
}: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center space-x-2">
          <Icon className={`h-5 w-5 ${iconColor}`} />
          <div className="flex-1">
            <p className="text-sm text-gray-600">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {description && (
              <p className="text-xs text-gray-500">{description}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}