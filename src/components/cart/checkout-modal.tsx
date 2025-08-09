'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { useCartStore } from '@/stores/cart-store'
import { useAuthSelectors } from '@/stores/auth-store'
import { formatCurrency } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'
import { CreditCard, MapPin, MessageSquare } from 'lucide-react'

interface CheckoutModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const { items, getTotalPrice, clearCart } = useCartStore()
  const { user } = useAuthSelectors()
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    endereco: {
      rua: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: 'Sobral',
      cep: ''
    },
    forma_pagamento: '',
    observacoes: '',
    tipo_entrega: 'sistema' as 'sistema' | 'proprio'
  })

  const totalPrice = getTotalPrice()

  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith('endereco.')) {
      const enderecoField = field.replace('endereco.', '')
      setFormData(prev => ({
        ...prev,
        endereco: {
          ...prev.endereco,
          [enderecoField]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.endereco.rua || !formData.endereco.numero || !formData.endereco.bairro) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos obrigatórios do endereço',
        variant: 'destructive'
      })
      return
    }

    if (!formData.forma_pagamento) {
      toast({
        title: 'Erro',
        description: 'Selecione uma forma de pagamento',
        variant: 'destructive'
      })
      return
    }

    setIsLoading(true)

    try {
      // Agrupar itens por empresa
      const itensPorEmpresa = items.reduce((acc, item) => {
        if (!acc[item.empresa_id]) {
          acc[item.empresa_id] = []
        }
        acc[item.empresa_id].push(item)
        return acc
      }, {} as Record<string, typeof items>)

      // Criar um pedido para cada empresa
      const pedidosPromises = Object.entries(itensPorEmpresa).map(async ([empresaId, itensEmpresa]) => {
        const totalEmpresa = itensEmpresa.reduce((total, item) => total + (item.preco * item.quantidade), 0)
        
        const pedidoData = {
          total: totalEmpresa,
          endereco_entrega: formData.endereco,
          observacoes: formData.observacoes,
          forma_pagamento: formData.forma_pagamento,
          tipo_entrega: formData.tipo_entrega,
          itens: itensEmpresa.map(item => ({
            produto_id: item.produto_id,
            empresa_id: item.empresa_id,
            quantidade: item.quantidade,
            preco_unitario: item.preco,
            observacoes: ''
          }))
        }

        const response = await fetch('/api/pedidos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(pedidoData)
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Erro ao criar pedido')
        }

        return response.json()
      })

      const pedidosCriados = await Promise.all(pedidosPromises)

      // Limpar carrinho
      clearCart()

      // Fechar modal
      onClose()

      toast({
        title: 'Pedido realizado com sucesso!',
        description: `${pedidosCriados.length} pedido(s) criado(s). Total: ${formatCurrency(totalPrice)}`,
      })

    } catch (error) {
      console.error('Erro ao finalizar pedido:', error)
      toast({
        title: 'Erro ao finalizar pedido',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Finalizar Pedido</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Resumo do Pedido */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Resumo do Pedido</h3>
            <div className="space-y-1 text-sm">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <span>{item.quantidade}x {item.nome}</span>
                  <span>{formatCurrency(item.preco * item.quantidade)}</span>
                </div>
              ))}
              <div className="border-t pt-1 mt-2 font-semibold flex justify-between">
                <span>Total:</span>
                <span className="text-green-600">{formatCurrency(totalPrice)}</span>
              </div>
            </div>
          </div>

          {/* Endereço de Entrega */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-gray-600" />
              <h3 className="font-semibold">Endereço de Entrega</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="rua">Rua *</Label>
                <Input
                  id="rua"
                  value={formData.endereco.rua}
                  onChange={(e) => handleInputChange('endereco.rua', e.target.value)}
                  placeholder="Nome da rua"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="numero">Número *</Label>
                <Input
                  id="numero"
                  value={formData.endereco.numero}
                  onChange={(e) => handleInputChange('endereco.numero', e.target.value)}
                  placeholder="123"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="complemento">Complemento</Label>
              <Input
                id="complemento"
                value={formData.endereco.complemento}
                onChange={(e) => handleInputChange('endereco.complemento', e.target.value)}
                placeholder="Apartamento, bloco, etc."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="bairro">Bairro *</Label>
                <Input
                  id="bairro"
                  value={formData.endereco.bairro}
                  onChange={(e) => handleInputChange('endereco.bairro', e.target.value)}
                  placeholder="Nome do bairro"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="cidade">Cidade</Label>
                <Input
                  id="cidade"
                  value={formData.endereco.cidade}
                  onChange={(e) => handleInputChange('endereco.cidade', e.target.value)}
                  placeholder="Sobral"
                />
              </div>
              
              <div>
                <Label htmlFor="cep">CEP</Label>
                <Input
                  id="cep"
                  value={formData.endereco.cep}
                  onChange={(e) => handleInputChange('endereco.cep', e.target.value)}
                  placeholder="00000-000"
                  maxLength={9}
                />
              </div>
            </div>
          </div>

          {/* Forma de Pagamento */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-gray-600" />
              <h3 className="font-semibold">Forma de Pagamento</h3>
            </div>
            
            <Select 
              value={formData.forma_pagamento} 
              onValueChange={(value) => handleInputChange('forma_pagamento', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a forma de pagamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dinheiro">Dinheiro</SelectItem>
                <SelectItem value="cartao_credito">Cartão de Crédito</SelectItem>
                <SelectItem value="cartao_debito">Cartão de Débito</SelectItem>
                <SelectItem value="pix">PIX</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Observações */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-gray-600" />
              <h3 className="font-semibold">Observações</h3>
            </div>
            
            <Textarea
              value={formData.observacoes}
              onChange={(e) => handleInputChange('observacoes', e.target.value)}
              placeholder="Observações adicionais para o pedido..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Finalizando...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Finalizar Pedido - {formatCurrency(totalPrice)}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}