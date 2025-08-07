'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function EntregadorRegisterForm() {
  return (
    <div className="text-center space-y-4">
      <div className="text-3xl mb-2">🛵</div>
      <h3 className="text-lg font-semibold">Cadastro de Entregador</h3>
      <p className="text-sm text-muted-foreground">
        O cadastro de entregadores estará disponível em breve.
      </p>
      <p className="text-sm text-muted-foreground">
        Entre em contato conosco pelo WhatsApp para mais informações.
      </p>
      <Button variant="outline" className="w-full">
        Entrar em contato
      </Button>
    </div>
  )
}