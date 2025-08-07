import { z } from 'zod'
import { CATEGORIAS_PRODUTOS } from '@/lib/constants'

export const produtoSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome muito longo'),
  descricao: z.string().max(500, 'Descrição muito longa').optional(),
  preco: z.number().positive('Preço deve ser positivo').max(999.99, 'Preço muito alto'),
  categoria: z.enum(CATEGORIAS_PRODUTOS as any, {
    errorMap: () => ({ message: 'Categoria inválida' })
  }),
  imagem_url: z.string().url('URL da imagem inválida').optional().or(z.literal('')),
  disponivel: z.boolean().default(true),
  tempo_preparacao: z.number().int().positive('Tempo deve ser positivo').max(180, 'Tempo muito alto').optional(),
  ingredientes: z.array(z.string()).optional(),
  observacoes: z.string().max(200, 'Observações muito longas').optional(),
})

export const produtoUpdateSchema = produtoSchema.partial().extend({
  id: z.string().uuid('ID inválido'),
})

export type ProdutoInput = z.infer<typeof produtoSchema>
export type ProdutoUpdateInput = z.infer<typeof produtoUpdateSchema>