import { Suspense } from 'react'
import { HomeContent } from '@/components/home/home-content'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Suspense fallback={<LoadingSpinner />}>
        <HomeContent />
      </Suspense>
    </main>
  )
}