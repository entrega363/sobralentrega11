'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EmpresaRegisterForm } from './empresa-register-form'
import { EntregadorRegisterForm } from './entregador-register-form'
import { ConsumidorRegisterForm } from './consumidor-register-form'

type UserType = 'empresa' | 'entregador' | 'consumidor' | null

export function RegisterForm() {
  const [selectedType, setSelectedType] = useState<UserType>(null)

  if (selectedType) {
    return (
      <div className="space-y-4">
        <Button
          variant="ghost"
          onClick={() => setSelectedType(null)}
          className="mb-4"
        >
          ← Voltar à seleção
        </Button>
        
        {selectedType === 'empresa' && <EmpresaRegisterForm />}
        {selectedType === 'entregador' && <EntregadorRegisterForm />}
        {selectedType === 'consumidor' && <ConsumidorRegisterForm />}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Button
        variant="outline"
        className="w-full h-auto p-4 text-left"
        onClick={() => setSelectedType('consumidor')}
      >
        <div className="flex items-center space-x-3">
          <div className="text-2xl">👤</div>
          <div>
            <div className="font-semibold">Consumidor</div>
            <div className="text-sm text-muted-foreground">
              Peça comida dos seus restaurantes favoritos
            </div>
          </div>
        </div>
      </Button>

      <Button
        variant="outline"
        className="w-full h-auto p-4 text-left"
        onClick={() => setSelectedType('empresa')}
      >
        <div className="flex items-center space-x-3">
          <div className="text-2xl">🏢</div>
          <div>
            <div className="font-semibold">Empresa</div>
            <div className="text-sm text-muted-foreground">
              Cadastre seu restaurante e venda online
            </div>
          </div>
        </div>
      </Button>

      <Button
        variant="outline"
        className="w-full h-auto p-4 text-left"
        onClick={() => setSelectedType('entregador')}
      >
        <div className="flex items-center space-x-3">
          <div className="text-2xl">🛵</div>
          <div>
            <div className="font-semibold">Entregador</div>
            <div className="text-sm text-muted-foreground">
              Faça entregas e ganhe dinheiro
            </div>
          </div>
        </div>
      </Button>
    </div>
  )
}