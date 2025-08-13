import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon | string
  iconColor?: string
  description?: string
  change?: string
  trend?: 'up' | 'down' | 'neutral'
}

export function StatCard({ 
  title, 
  value, 
  icon, 
  iconColor = 'text-blue-600',
  description,
  change,
  trend
}: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {typeof icon === 'string' ? (
              <span className="text-xl">{icon}</span>
            ) : (
              React.createElement(icon, { className: `h-5 w-5 ${iconColor}` })
            )}
            <div>
              <p className="text-sm text-gray-600">{title}</p>
              <p className="text-2xl font-bold">{value}</p>
              {description && (
                <p className="text-xs text-gray-500">{description}</p>
              )}
            </div>
          </div>
          {change && (
            <div className={`text-sm ${
              trend === 'up' ? 'text-green-600' : 
              trend === 'down' ? 'text-red-600' : 
              'text-gray-600'
            }`}>
              {change}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}