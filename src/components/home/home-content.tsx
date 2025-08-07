'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function HomeContent() {
  return (
      <div className="min-h-screen gradient-sobral flex items-center justify-center p-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-8xl mb-8">🍕</div>
          <h1 className="text-5xl font-bold text-white mb-4">
            Entrega Sobral
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Sistema completo de delivery para Sobral - CE. 
            Conectando empresas, entregadores e consumidores de forma simples e eficiente.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardHeader>
                <div className="text-3xl mb-2">🏢</div>
                <CardTitle>Empresas</CardTitle>
                <CardDescription className="text-white/80">
                  Gerencie seu negócio, produtos e pedidos
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardHeader>
                <div className="text-3xl mb-2">🛵</div>
                <CardTitle>Entregadores</CardTitle>
                <CardDescription className="text-white/80">
                  Aceite entregas e ganhe dinheiro
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardHeader>
                <div className="text-3xl mb-2">👥</div>
                <CardTitle>Consumidores</CardTitle>
                <CardDescription className="text-white/80">
                  Peça sua comida favorita com facilidade
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardHeader>
                <div className="text-3xl mb-2">⚙️</div>
                <CardTitle>Administração</CardTitle>
                <CardDescription className="text-white/80">
                  Gerencie todo o sistema
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
          
          <div className="space-y-4">
            <div className="flex gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-sobral-red-600 hover:bg-white/90 font-semibold px-8 py-3 text-lg"
                onClick={() => window.location.href = '/login'}
              >
                Fazer Login
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-white text-white hover:bg-white/10 font-semibold px-8 py-3 text-lg"
                onClick={() => window.location.href = '/register'}
              >
                Cadastrar-se
              </Button>
            </div>
            <p className="text-white/80 text-sm">
              Versão 2.0 - Powered by Next.js & Supabase
            </p>
          </div>
        </div>
      </div>
    )
}