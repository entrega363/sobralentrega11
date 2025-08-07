import { z } from 'zod'
import { PEDIDO_STATUS, FORMAS_PAGAMENTO, TIPOS_ENTREGA } from '@/lib/constants'

export const enderecoEntregaSchema = z.object({
  rua: z.string().min(1, 'Rua é obrigatória'),
  numero: z.string().min(1, 'Número é obrigatório'),
  bairro: z.string().min(1, 'Bairro é obrigatório'),
  cidade: z.string().default('Sobral'),
  cep: z.string().min(8, 'CEP inválido'),
  pontoReferencia: z.string().optional(),
  complemento: z.string().optional(),
})

export const itemPedidoSchema = z.object({
  produto_id: z.string().uuid('ID do produto inválido'),
  empresa_id: z.string().uuid('ID da empresa inválido'),
  quantidade: z.number().int().positive('Quantidade deve ser positiva').max(20, 'Quantidade muito alta'),
  preco_unitario: z.number().positive('Preço deve ser positivo'),
  observacoes: z.string().max(200, 'Observações muito longas').optional(),
})

export const pedidoSchema = z.object({
  consumidor_id: z.string().uuid('ID do consumidor inválido'),
  endereco_entrega: enderecoEntregaSchema,
  observacoes: z.string().max(300, 'Observações muito longas').optional(),
  forma_pagamento: z.enum(Object.values(FORMAS_PAGAMENTO) as any, {
    errorMap: () => ({ message: 'Forma de pagamento inválida' })
  }).optional(),
  tipo_entrega: z.enum(Object.values(TIPOS_ENTREGA) as any).default('sistema'),
  itens: z.array(itemPedidoSchema).min(1, 'Pedido deve ter pelo menos um item'),
})

export const pedidoStatusUpdateSchema = z.object({
  id: z.string().uuid('ID do pedido inválido'),
  status: z.enum(Object.values(PEDIDO_STATUS) as any, {
    errorMap: () => ({ message: 'Status inválido' })
  }),
  entregador_id: z.string().uuid('ID do entregador inválido').optional(),
})

export const avaliacaoSchema = z.object({
  pedido_id: z.string().uuid('ID do pedido inválido'),
  consumidor_id: z.string().uuid('ID do consumidor inválido'),
  empresa_id: z.string().uuid('ID da empresa inválido').optional(),
  entregador_id: z.string().uuid('ID do entregador inválido').optional(),
  nota_empresa: z.number().int().min(1, 'Nota mínima é 1').max(5, 'Nota máxima é 5').optional(),
  nota_entregador: z.number().int().min(1, 'Nota mínima é 1').max(5, 'Nota máxima é 5').optional(),
  comentario_empresa: z.string().max(300, 'Comentário muito longo').optional(),
  comentario_entregador: z.string().max(300, 'Comentário muito longo').optional(),
  comentario_geral: z.string().max(500, 'Comentário muito longo').optional(),
})

export type EnderecoEntregaInput = z.infer<typeof enderecoEntregaSchema>
export type ItemPedidoInput = z.infer<typeof itemPedidoSchema>
export type PedidoInput = z.infer<typeof pedidoSchema>
export type PedidoStatusUpdateInput = z.infer<typeof pedidoStatusUpdateSchema>
export type AvaliacaoInput = z.infer<typeof avaliacaoSchema>