import { ReactNode } from 'react'

interface AdminPageLayoutProps {
  title: string
  description?: string
  actions?: ReactNode
  children: ReactNode
}

export function AdminPageLayout({ 
  title, 
  description, 
  actions, 
  children 
}: AdminPageLayoutProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {description && (
            <p className="text-gray-600 mt-1">{description}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center space-x-3">
            {actions}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow">
        {children}
      </div>
    </div>
  )
}