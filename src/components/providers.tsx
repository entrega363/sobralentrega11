'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from '@/components/ui/toaster'
import { AuthProvider } from '@/components/providers/auth-provider'
import { RealtimeProvider } from '@/components/providers/realtime-provider'
import { CartProvider } from '@/components/providers/cart-provider'
import { useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutos
            gcTime: 10 * 60 * 1000, // 10 minutos (anteriormente cacheTime)
            retry: (failureCount, error: any) => {
              // Não tentar novamente para erros 4xx
              if (error?.status >= 400 && error?.status < 500) {
                return false
              }
              return failureCount < 3
            },
            refetchOnWindowFocus: false,
            refetchOnReconnect: true,
          },
          mutations: {
            retry: (failureCount, error: any) => {
              // Não tentar novamente para erros 4xx
              if (error?.status >= 400 && error?.status < 500) {
                return false
              }
              return failureCount < 2
            },
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RealtimeProvider>
          <CartProvider>
            {children}
            <Toaster />
            {process.env.NODE_ENV === 'development' && (
              <ReactQueryDevtools initialIsOpen={false} />
            )}
          </CartProvider>
        </RealtimeProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}