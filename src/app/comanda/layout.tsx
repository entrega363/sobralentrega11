import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sistema de Comanda',
  description: 'Sistema de comanda local para garçons',
}

export default function ComandaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  )
}