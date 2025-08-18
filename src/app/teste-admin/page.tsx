'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function TesteAdminPage() {
  const [info, setInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Get session
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
          setInfo({ error: 'Não logado' })
          setLoading(false)
          return
        }

        // Get profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        setInfo({
          user: session.user,
          profile,
          isAdmin: profile?.role === 'admin'
        })

        // Auto redirect if admin
        if (profile?.role === 'admin') {
          setTimeout(() => {
            router.push('/admin')
          }, 2000)
        }

      } catch (error: any) {
        setInfo({ error: error.message || 'Erro desconhecido' })
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [supabase, router])

  if (loading) return <div>Carregando...</div>

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Teste Admin</h1>
      
      {info?.error && (
        <div style={{ color: 'red' }}>
          <h2>Erro:</h2>
          <p>{info.error}</p>
          <button onClick={() => router.push('/login')}>
            Ir para Login
          </button>
        </div>
      )}

      {info?.user && (
        <div>
          <h2>Usuário:</h2>
          <p>ID: {info.user.id}</p>
          <p>Email: {info.user.email}</p>
          
          <h2>Profile:</h2>
          <p>Role: {info.profile?.role || 'Não encontrado'}</p>
          <p>Status: {info.profile?.status_disponibilidade || 'N/A'}</p>
          
          <h2>Status:</h2>
          <p>É Admin: {info.isAdmin ? '✅ SIM' : '❌ NÃO'}</p>
          
          {info.isAdmin && (
            <div style={{ color: 'green' }}>
              <p>✅ Redirecionando para /admin em 2 segundos...</p>
            </div>
          )}
          
          <button onClick={() => router.push('/admin')}>
            Ir para Admin Manualmente
          </button>
        </div>
      )}
    </div>
  )
}