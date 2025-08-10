'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { useRatings, Rating, RatingStats } from '@/hooks/use-ratings'
import { Star, MessageCircle, ThumbsUp, ThumbsDown, Reply, Award } from 'lucide-react'

interface RatingDisplayProps {
  ratings: Rating[]
  stats?: RatingStats | null
  showReplyOption?: boolean
  compact?: boolean
}

export function RatingDisplay({ 
  ratings, 
  stats, 
  showReplyOption = false, 
  compact = false 
}: RatingDisplayProps) {
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const { replyToRating, isLoading } = useRatings()

  const handleReply = async (ratingId: string) => {
    if (!replyText.trim()) return

    const success = await replyToRating(ratingId, replyText.trim())
    if (success) {
      setReplyingTo(null)
      setReplyText('')
    }
  }

  const renderStars = (rating: number, size: 'sm' | 'md' = 'md') => {
    const starSize = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'
    
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${starSize} ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  if (ratings.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Nenhuma avaliação ainda
          </h3>
          <p className="text-gray-600">
            Seja o primeiro a avaliar!
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Estatísticas */}
      {stats && !compact && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Resumo das Avaliações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600">
                  {stats.media_geral}
                </div>
                <div className="flex justify-center mb-1">
                  {renderStars(stats.media_geral)}
                </div>
                <div className="text-sm text-gray-600">
                  {stats.total_avaliacoes} avaliações
                </div>
              </div>
              
              {Object.entries(stats.criterios).map(([criterio, nota]) => (
                nota > 0 && (
                  <div key={criterio} className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {nota}
                    </div>
                    <div className="text-sm font-medium capitalize">
                      {criterio}
                    </div>
                    <div className="flex justify-center">
                      {renderStars(nota, 'sm')}
                    </div>
                  </div>
                )
              ))}
            </div>

            {/* Badges */}
            {stats.badges.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Conquistas</h4>
                <div className="flex flex-wrap gap-2">
                  {stats.badges.map((badge) => (
                    <Badge key={badge} variant="secondary" className="bg-yellow-100 text-yellow-800">
                      <Award className="h-3 w-3 mr-1" />
                      {badge}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Distribuição de Notas */}
            <div className="mt-4">
              <h4 className="font-medium text-gray-900 mb-2">Distribuição</h4>
              <div className="space-y-1">
                {[5, 4, 3, 2, 1].map((star) => (
                  <div key={star} className="flex items-center gap-2 text-sm">
                    <span className="w-8">{star}★</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full"
                        style={{
                          width: `${(stats.distribuicao[star as keyof typeof stats.distribuicao] / stats.total_avaliacoes) * 100}%`
                        }}
                      />
                    </div>
                    <span className="w-8 text-right">
                      {stats.distribuicao[star as keyof typeof stats.distribuicao]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Avaliações */}
      <div className="space-y-4">
        {ratings.map((rating) => (
          <Card key={rating.id}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">
                    {rating.avaliador_nome}
                  </CardTitle>
                  <CardDescription>
                    {rating.pedido_numero && `Pedido ${rating.pedido_numero} • `}
                    {formatDate(rating.created_at)}
                  </CardDescription>
                </div>
                <div className="text-right">
                  {renderStars(rating.nota_geral)}
                  <div className="text-sm text-gray-600 mt-1">
                    {rating.nota_geral}/5
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Critérios Específicos */}
              {!compact && (rating.nota_qualidade || rating.nota_atendimento || rating.nota_pontualidade || rating.nota_embalagem) && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  {rating.nota_qualidade && (
                    <div>
                      <div className="font-medium">Qualidade</div>
                      <div className="flex items-center gap-1">
                        {renderStars(rating.nota_qualidade, 'sm')}
                        <span className="text-gray-600">({rating.nota_qualidade})</span>
                      </div>
                    </div>
                  )}
                  {rating.nota_atendimento && (
                    <div>
                      <div className="font-medium">Atendimento</div>
                      <div className="flex items-center gap-1">
                        {renderStars(rating.nota_atendimento, 'sm')}
                        <span className="text-gray-600">({rating.nota_atendimento})</span>
                      </div>
                    </div>
                  )}
                  {rating.nota_pontualidade && (
                    <div>
                      <div className="font-medium">Pontualidade</div>
                      <div className="flex items-center gap-1">
                        {renderStars(rating.nota_pontualidade, 'sm')}
                        <span className="text-gray-600">({rating.nota_pontualidade})</span>
                      </div>
                    </div>
                  )}
                  {rating.nota_embalagem && (
                    <div>
                      <div className="font-medium">Embalagem</div>
                      <div className="flex items-center gap-1">
                        {renderStars(rating.nota_embalagem, 'sm')}
                        <span className="text-gray-600">({rating.nota_embalagem})</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Pontos Positivos */}
              {rating.pontos_positivos && rating.pontos_positivos.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <ThumbsUp className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-800">Pontos Positivos</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {rating.pontos_positivos.map((ponto, index) => (
                      <Badge key={index} variant="secondary" className="bg-green-100 text-green-800 text-xs">
                        {ponto}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Pontos Negativos */}
              {rating.pontos_negativos && rating.pontos_negativos.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <ThumbsDown className="h-4 w-4 text-red-600" />
                    <span className="font-medium text-red-800">Pontos a Melhorar</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {rating.pontos_negativos.map((ponto, index) => (
                      <Badge key={index} variant="destructive" className="text-xs">
                        {ponto}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Comentário */}
              {rating.comentario && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-start gap-2">
                    <MessageCircle className="h-4 w-4 text-gray-600 mt-0.5" />
                    <p className="text-gray-700">{rating.comentario}</p>
                  </div>
                </div>
              )}

              {/* Resposta */}
              {rating.resposta && (
                <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
                  <div className="flex items-start gap-2">
                    <Reply className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div>
                      <div className="font-medium text-blue-900 text-sm">
                        Resposta de {rating.avaliado_nome}
                      </div>
                      <p className="text-blue-800 mt-1">{rating.resposta}</p>
                      <div className="text-xs text-blue-600 mt-2">
                        {rating.respondido_em && formatDate(rating.respondido_em)}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Opção de Resposta */}
              {showReplyOption && !rating.resposta && (
                <div className="border-t pt-3">
                  {replyingTo === rating.id ? (
                    <div className="space-y-2">
                      <Textarea
                        placeholder="Escreva sua resposta..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => handleReply(rating.id)}
                          disabled={!replyText.trim() || isLoading}
                        >
                          {isLoading ? 'Enviando...' : 'Enviar Resposta'}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setReplyingTo(null)
                            setReplyText('')
                          }}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setReplyingTo(rating.id)}
                    >
                      <Reply className="h-4 w-4 mr-2" />
                      Responder
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}