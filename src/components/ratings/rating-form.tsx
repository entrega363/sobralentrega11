'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useRatings } from '@/hooks/use-ratings'
import { Star, Send, ThumbsUp, ThumbsDown } from 'lucide-react'

interface RatingFormProps {
  pedidoId: string
  avaliadoId: string
  avaliadoNome: string
  tipoAvaliacao: 'empresa' | 'entregador' | 'consumidor'
  onSuccess?: () => void
}

const criteriosLabels = {
  empresa: {
    qualidade: 'Qualidade da Comida',
    atendimento: 'Atendimento',
    pontualidade: 'Pontualidade',
    embalagem: 'Embalagem'
  },
  entregador: {
    pontualidade: 'Pontualidade',
    atendimento: 'Cordialidade',
    qualidade: 'Cuidado com o Pedido'
  },
  consumidor: {
    atendimento: 'Comunicação',
    pontualidade: 'Disponibilidade'
  }
}

const pontosPositivosOptions = {
  empresa: [
    'Comida saborosa',
    'Entrega rápida',
    'Boa embalagem',
    'Preço justo',
    'Atendimento cordial',
    'Variedade do cardápio'
  ],
  entregador: [
    'Pontual',
    'Educado',
    'Cuidadoso',
    'Rápido',
    'Comunicativo',
    'Profissional'
  ],
  consumidor: [
    'Educado',
    'Pontual',
    'Comunicativo',
    'Compreensivo'
  ]
}

export function RatingForm({ 
  pedidoId, 
  avaliadoId, 
  avaliadoNome, 
  tipoAvaliacao, 
  onSuccess 
}: RatingFormProps) {
  const [notaGeral, setNotaGeral] = useState(0)
  const [criterios, setCriterios] = useState<Record<string, number>>({})
  const [comentario, setComentario] = useState('')
  const [pontosPositivos, setPontosPositivos] = useState<string[]>([])
  const [pontosNegativos, setPontosNegativos] = useState<string[]>([])
  const [customPositivo, setCustomPositivo] = useState('')
  const [customNegativo, setCustomNegativo] = useState('')

  const { createRating, isLoading } = useRatings()

  const handleStarClick = (rating: number, criterio?: string) => {
    if (criterio) {
      setCriterios(prev => ({ ...prev, [criterio]: rating }))
    } else {
      setNotaGeral(rating)
    }
  }

  const togglePontoPositivo = (ponto: string) => {
    setPontosPositivos(prev => 
      prev.includes(ponto) 
        ? prev.filter(p => p !== ponto)
        : [...prev, ponto]
    )
  }

  const togglePontoNegativo = (ponto: string) => {
    setPontosNegativos(prev => 
      prev.includes(ponto) 
        ? prev.filter(p => p !== ponto)
        : [...prev, ponto]
    )
  }

  const addCustomPositivo = () => {
    if (customPositivo.trim() && !pontosPositivos.includes(customPositivo.trim())) {
      setPontosPositivos(prev => [...prev, customPositivo.trim()])
      setCustomPositivo('')
    }
  }

  const addCustomNegativo = () => {
    if (customNegativo.trim() && !pontosNegativos.includes(customNegativo.trim())) {
      setPontosNegativos(prev => [...prev, customNegativo.trim()])
      setCustomNegativo('')
    }
  }

  const handleSubmit = async () => {
    if (notaGeral === 0) {
      return
    }

    const success = await createRating({
      pedido_id: pedidoId,
      avaliado_id: avaliadoId,
      avaliado_nome: avaliadoNome,
      tipo_avaliacao: tipoAvaliacao,
      nota_geral: notaGeral,
      nota_qualidade: criterios.qualidade,
      nota_atendimento: criterios.atendimento,
      nota_pontualidade: criterios.pontualidade,
      nota_embalagem: criterios.embalagem,
      comentario: comentario.trim() || undefined,
      pontos_positivos: pontosPositivos.length > 0 ? pontosPositivos : undefined,
      pontos_negativos: pontosNegativos.length > 0 ? pontosNegativos : undefined
    })

    if (success && onSuccess) {
      onSuccess()
    }
  }

  const renderStars = (currentRating: number, onStarClick: (rating: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onStarClick(star)}
            className="transition-colors hover:scale-110"
          >
            <Star
              className={`h-6 w-6 ${
                star <= currentRating
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300 hover:text-yellow-400'
              }`}
            />
          </button>
        ))}
      </div>
    )
  }

  const criteriosDoTipo = criteriosLabels[tipoAvaliacao] || {}
  const opcoesPositivas = pontosPositivosOptions[tipoAvaliacao] || []

  return (
    <Card>
      <CardHeader>
        <CardTitle>Avaliar {avaliadoNome}</CardTitle>
        <CardDescription>
          Sua avaliação ajuda a melhorar a qualidade do serviço
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Nota Geral */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Avaliação Geral *
          </label>
          {renderStars(notaGeral, setNotaGeral)}
          {notaGeral > 0 && (
            <p className="text-sm text-gray-600 mt-1">
              {notaGeral === 5 && 'Excelente!'}
              {notaGeral === 4 && 'Muito bom!'}
              {notaGeral === 3 && 'Bom'}
              {notaGeral === 2 && 'Regular'}
              {notaGeral === 1 && 'Precisa melhorar'}
            </p>
          )}
        </div>

        {/* Critérios Específicos */}
        {Object.entries(criteriosDoTipo).map(([key, label]) => (
          <div key={key}>
            <label className="block text-sm font-medium mb-2">
              {label}
            </label>
            {renderStars(criterios[key] || 0, (rating) => handleStarClick(rating, key))}
          </div>
        ))}

        {/* Pontos Positivos */}
        <div>
          <label className="block text-sm font-medium mb-2">
            <ThumbsUp className="inline h-4 w-4 mr-1" />
            Pontos Positivos
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {opcoesPositivas.map((opcao) => (
              <Badge
                key={opcao}
                variant={pontosPositivos.includes(opcao) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => togglePontoPositivo(opcao)}
              >
                {opcao}
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Adicionar ponto positivo..."
              value={customPositivo}
              onChange={(e) => setCustomPositivo(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
              onKeyPress={(e) => e.key === 'Enter' && addCustomPositivo()}
            />
            <Button size="sm" onClick={addCustomPositivo} disabled={!customPositivo.trim()}>
              +
            </Button>
          </div>
          {pontosPositivos.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {pontosPositivos.map((ponto) => (
                <Badge key={ponto} variant="secondary" className="text-xs">
                  {ponto}
                  <button
                    onClick={() => setPontosPositivos(prev => prev.filter(p => p !== ponto))}
                    className="ml-1 hover:text-red-600"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Pontos Negativos (apenas se nota < 4) */}
        {notaGeral > 0 && notaGeral < 4 && (
          <div>
            <label className="block text-sm font-medium mb-2">
              <ThumbsDown className="inline h-4 w-4 mr-1" />
              O que pode melhorar?
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Descreva o que pode melhorar..."
                value={customNegativo}
                onChange={(e) => setCustomNegativo(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                onKeyPress={(e) => e.key === 'Enter' && addCustomNegativo()}
              />
              <Button size="sm" onClick={addCustomNegativo} disabled={!customNegativo.trim()}>
                +
              </Button>
            </div>
            {pontosNegativos.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {pontosNegativos.map((ponto) => (
                  <Badge key={ponto} variant="destructive" className="text-xs">
                    {ponto}
                    <button
                      onClick={() => setPontosNegativos(prev => prev.filter(p => p !== ponto))}
                      className="ml-1 hover:text-white"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Comentário */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Comentário (opcional)
          </label>
          <Textarea
            placeholder="Conte mais sobre sua experiência..."
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            rows={3}
          />
        </div>

        {/* Botão de Envio */}
        <Button 
          onClick={handleSubmit}
          disabled={notaGeral === 0 || isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Enviando...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Enviar Avaliação
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}