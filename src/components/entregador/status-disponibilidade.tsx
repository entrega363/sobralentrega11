'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Truck, Building2, Globe, XCircle, AlertTriangle } from 'lucide-react'

interface StatusDisponibilidadeProps {
  entregadorId: string
  statusAtual: 'disponivel_sistema' | 'disponivel_empresa' | 'indisponivel_empresa' | 'indisponivel_total'
  empresaVinculada?: {
    id: string
    nome: string
  }
  onStatusChange: (novoStatus: string) => void
}

export function StatusDisponibilidadeComponent({ 
  entregadorId, 
  statusAtual, 
  empresaVinculada, 
  onStatusChange 
}: StatusDisponibilidadeProps) {
  const { toast } = useToast()
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [novoStatusPendente, setNovoStatusPendente] = useState<string>('')
  const [motivo, setMotivo] = useState('')
  const [loading, setLoading] = useState(false)

  const statusOptions = [
    {
      value: 'disponivel_sistema',
      label: 'Disponível para Sistema',
      description: 'Receber entregas de todas as empresas',
      icon: Globe,
      color: 'bg-blue-100 text-blue-800',
      available: !empresaVinculada || statusAtual === 'indisponivel_empresa'
    },
    {
      value: 'disponivel_empresa',
      label: 'Disponível para Empresa',
      description: empresaVinculada ? `Trabalhar exclusivamente para ${empresaVinculada.nome}` : 'Você precisa estar vinculado a uma empresa',
      icon: Building2,
      color: 'bg-green-100 text-green-800',
      available: !!empresaVinculada
    },
    {
      value: 'indisponivel_empresa',
      label: 'Indisponível para Empresa',
      description: empresaVinculada ? `Temporariamente indisponível para ${empresaVinculada.nome}` : 'Você não está vinculado a nenhuma empresa',
      icon: XCircle,
      color: 'bg-yellow-100 text-yellow-800',
      available: !!empresaVinculada
    },
    {
      value: 'indisponivel_total',
      label: 'Indisponível Total',
      description: 'Não receber nenhuma entrega',
      icon: XCircle,
      color: 'bg-red-100 text-red-800',
      available: true
    }
  ]

  const handleStatusClick = (novoStatus: string) => {
    if (novoStatus === statusAtual) return

    const option = statusOptions.find(opt => opt.value === novoStatus)
    if (!option?.available) {
      toast({
        title: 'Status não disponível',
        description: option?.description || 'Este status não está disponível no momento',
        variant: 'destructive'
      })
      return
    }

    setNovoStatusPendente(novoStatus)
    setShowConfirmDialog(true)
  }

  const handleConfirmarMudanca = async () => {
    if (!novoStatusPendente) return

    setLoading(true)

    try {
      // Simular chamada da API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Em produção, fazer chamada para /api/entregador/status-disponibilidade
      /*
      const response = await fetch('/api/entregador/status-disponibilidade', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          novoStatus: novoStatusPendente,
          motivo: motivo.trim() || undefined
        }),
      })

      if (!response.ok) {
        throw new Error('Erro ao atualizar status')
      }
      */

      onStatusChange(novoStatusPendente)

      const statusLabel = statusOptions.find(opt => opt.value === novoStatusPendente)?.label
      toast({
        title: 'Status atualizado',
        description: `Seu status foi alterado para: ${statusLabel}`,
      })

      setShowConfirmDialog(false)
      setNovoStatusPendente('')
      setMotivo('')

    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar seu status. Tente novamente.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancelar = () => {
    setShowConfirmDialog(false)
    setNovoStatusPendente('')
    setMotivo('')
  }

  const getStatusAtualInfo = () => {
    return statusOptions.find(opt => opt.value === statusAtual)
  }

  const statusAtualInfo = getStatusAtualInfo()

  return (
    <div className="space-y-4">
      {/* Status Atual */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-3">
          {statusAtualInfo && (
            <>
              <statusAtualInfo.icon className="h-6 w-6 text-gray-600" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{statusAtualInfo.label}</h3>
                  <Badge className={statusAtualInfo.color}>Atual</Badge>
                </div>
                <p className="text-sm text-gray-600 mt-1">{statusAtualInfo.description}</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Opções de Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {statusOptions.map((option) => {
          const Icon = option.icon
          const isAtual = option.value === statusAtual
          const isDisabled = !option.available

          return (
            <Card 
              key={option.value}
              className={`cursor-pointer transition-all ${
                isAtual 
                  ? 'ring-2 ring-sobral-red-500 bg-sobral-red-50' 
                  : isDisabled
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:shadow-md hover:border-gray-300'
              }`}
              onClick={() => !isDisabled && handleStatusClick(option.value)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Icon className={`h-5 w-5 mt-0.5 ${isAtual ? 'text-sobral-red-600' : 'text-gray-500'}`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className={`font-medium ${isAtual ? 'text-sobral-red-900' : 'text-gray-900'}`}>
                        {option.label}
                      </h4>
                      {isAtual && (
                        <Badge variant="default" className="text-xs">
                          Atual
                        </Badge>
                      )}
                    </div>
                    <p className={`text-sm mt-1 ${isAtual ? 'text-sobral-red-700' : 'text-gray-600'}`}>
                      {option.description}
                    </p>
                    {!option.available && (
                      <p className="text-xs text-red-500 mt-1">
                        Não disponível
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Dialog de Confirmação */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Confirmar Mudança de Status
            </DialogTitle>
            <DialogDescription>
              Você está prestes a alterar seu status de disponibilidade. Esta ação pode afetar as entregas que você recebe.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm">
                <span className="font-medium">Status atual:</span> {statusAtualInfo?.label}
              </p>
              <p className="text-sm mt-1">
                <span className="font-medium">Novo status:</span> {statusOptions.find(opt => opt.value === novoStatusPendente)?.label}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="motivo">Motivo da mudança (opcional)</Label>
              <Textarea
                id="motivo"
                placeholder="Descreva o motivo da mudança de status..."
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                rows={3}
                maxLength={200}
              />
              <p className="text-xs text-gray-500">
                {motivo.length}/200 caracteres
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancelar}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleConfirmarMudanca}
              disabled={loading}
              className="bg-sobral-red-600 hover:bg-sobral-red-700"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Atualizando...
                </>
              ) : (
                'Confirmar Mudança'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}