import { ReactNode } from 'react'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface FormFieldProps {
  label: string
  htmlFor?: string
  error?: string
  required?: boolean
  children: ReactNode
  className?: string
}

export function FormField({ 
  label, 
  htmlFor, 
  error, 
  required, 
  children, 
  className 
}: FormFieldProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor={htmlFor} className="flex items-center space-x-1">
        <span>{label}</span>
        {required && <span className="text-red-500">*</span>}
      </Label>
      {children}
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  )
}