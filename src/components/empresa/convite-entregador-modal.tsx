'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { Search, Star, Truck, MapPin, Send, X } from 'lucide-react'

interface EntregadorDisponivel {
  id: string
  nome: string
  email: string
  telefone?: string
  avaliacaoMedia: number
  totalEntregas: number
  distanciaKm: number
  ultimaAtividade: string
}

interface ConviteEntregadorModalProps {
  isOpen: boolean
  onClose: () => void
  empresaId: string
  onConviteEnviado: () => void
}

export function ConviteEntregadorModal({ isOpen, onClose, empresaId, onConviteEnviado }: ConviteEntregadorModalProps) {
  const { toast } = useToast()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedEntregador, setSelectedEntregador] = useState<EntregadorDisponivel | null>(null)
  const [mensagem, setMensagem] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingEntregadores, setLoadingEntregadores] = useState(false)
  
  // Dados mock para demonstração
  const [entregadoresDisponiveis, setEntregadoresDisponiveis] = useState<EntregadorDisponivel[]>([
    {
      id: '1',
      nome: 'Roberto Silva',
      email: 'roberto@email.com',
      telefone: '(85) 99999-4444',
      avaliacaoMedia: 4.7,
      totalEntregas: 156,
      distanciaKm: 2.3,
      ultimaAtividade: '2024-01-15T12:00:00Z'
    },
    {
      id: '2',
      nome: 'Fernanda Costa',
      email: 'fernanda@email.com',
      telefone: '(85) 99999-5555',
      avaliacaoMedia: 4.9,
      totalEntregas: 203,
      distanciaKm: 1.8,
      ultimaAtividade: '2024-01-15T11:30:00Z'
    },
    {
      id: '3',
      nome: 'Lucas Oliveira',
      email: 'lucas@email.com',
      telefone: '(85) 99999-6666',
      avaliacaoMedia: 4.5,
      totalEntregas: 89,
      distanciaKm: 3.1,
      ultimaAtividade: '2024-01-15T10:45:00Z'
    },
    {
      id: '4',
      nome: 'Mariana Santos',
      email: 'mariana@email.com',
      telefone: '(85) 99999-7777',
      avaliacaoMedia: 4.8,
      totalEntregas: 134,
      distanciaKm: 2.7,
      ultimaAtividade: '2024-01-15T13:15:00Z'
    }
  ])

  const entregadoresFiltrados = entregadoresDisponiveis.filter(entregador =>
    entregador.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entregador.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const loadEntregadoresDisponiveis = async () => {
    try {
      setLoadingEntregadores(true)
      // Simular carregamento da API
      await new Promise(resolve => setTimeout(resolve, 1000))
      // Em produção, fazer chamada para /api/empresa/entregadores-disponiveis
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os entregadores disponíveis',
        variant: 'destructive'
      })
    } finally {
      setLoadingEntregadores(false)
    }
  }

  const handleEnviarConvite = async () => {
    if (!selectedEntregador) {
      toast({
        title: 'Erro',
        description: 'Selecione um entregador para enviar o convite',
        variant: 'destructive'
      })
      return
    }

    setLoading(true)

    try {
      // Simular envio do convite
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Em produção, fazer chamada para /api/empresa/entregadores-fixos/convite
      /*
      const response = await fetch('/api/empresa/entregadores-fixos/convite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          entregador_id: selectedEntregador.id,
          mensagem: mensagem.trim() || undefined
        }),
      })

      if (!response.ok) {
        throw new Error('Erro ao enviar convite')
      }
      */

      toast({
        title: 'Convite enviado!',
        description: `Convite enviado para ${selectedEntregador.nome}. Aguarde a resposta.`,
      })

      onConviteEnviado()
      handleClose()

    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível enviar o convite. Tente novamente.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setSelectedEntregador(null)
    setMensagem('')
    setSearchTerm('')
    onClose()
  }

  const formatLastActivity = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffMinutes < 60) return `${diffMinutes}min atrás`
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h atrás`
    return `${Math.floor(diffMinutes / 1440)}d atrás`
  }

  useEffect(() => {
    if (isOpen) {
      loadEntregadoresDisponiveis()
    }
  }, [isOpen])

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Convidar Entregador Fixo
          </DialogTitle>
          <DialogDescription>
            Selecione um entregador para convidar para sua equipe fixa.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-4">
          {/* Busca */}
          <div className="space-y-2">
            <Label htmlFor="search">Buscar entregador</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="search"
                type="text"
                placeholder="Digite o nome ou email do entregador"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Lista de Entregadores */}
          <div className="flex-1 overflow-y-auto space-y-2 max-h-64">
            {loadingEntregadores ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-sobral-red-600" />
                <span className="ml-2 text-sm text-gray-600">Carregando entregadores...</span>
              </div>
            ) : entregadoresFiltrados.length > 0 ? (
              entregadoresFiltrados.map((entregador) => (
                <div
                  key={entregador.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedEntregador?.id === entregador.id
                      ? 'border-sobral-red-500 bg-sobral-red-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedEntregador(entregador)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{entregador.nome}</h4>
                      <p className="text-sm text-gray-600">{entregador.email}</p>
                      {entregador.telefone && (
                        <p className="text-sm text-gray-600">{entregador.telefone}</p>
                      )}
                    </div>
                    <div className="text-right space-y-1">
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500" />
                        <span className="text-sm font-medium">{entregador.avaliacaoMedia}</span>
                      </div>
                      <p className="text-xs text-gray-500">{entregador.totalEntregas} entregas</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mt-2">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <MapPin className="h-3 w-3" />
                      <span>{entregador.distanciaKm}km de distância</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      Ativo {formatLastActivity(entregador.ultimaAtividade)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Truck className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  {searchTerm ? 'Nenhum entregador encontrado' : 'Nenhum entregador disponível'}
                </p>
              </div>
            )}
          </div>

          {/* Mensagem Personalizada */}
          {selectedEntregador && (
            <div className="space-y-2">
              <Label htmlFor="mensagem">Mensagem personalizada (opcional)</Label>
              <Textarea
                id="mensagem"
                placeholder="Digite uma mensagem para acompanhar o convite..."
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                rows={3}
                maxLength={300}
              />
              <p className="text-xs text-gray-500">
                {mensagem.length}/300 caracteres
              </p>
            </div>
          )}

          {/* Entregador Selecionado */}
          {selectedEntregador && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-800">
                    Entregador selecionado:
                  </p>
                  <p className="text-sm text-green-700">{selectedEntregador.nome}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedEntregador(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleEnviarConvite}
            disabled={!selectedEntregador || loading}
            className="bg-sobral-red-600 hover:bg-sobral-red-700"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Enviar Convite
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}