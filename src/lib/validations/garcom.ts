import { z } from 'zod'
import { GARCOM_VALIDATIONS } from '@/types/garcom'

// Schema para validação de dados do garçom
export const garcomSchema = z.object({
  nome: z
    .string()
    .min(GARCOM_VALIDATIONS.nome.minLength, `Nome deve ter pelo menos ${GARCOM_VALIDATIONS.nome.minLength} caracteres`)
    .max(GARCOM_VALIDATIONS.nome.maxLength, `Nome deve ter no máximo ${GARCOM_VALIDATIONS.nome.maxLength} caracteres`)
    .trim(),
  
  usuario: z
    .string()
    .min(GARCOM_VALIDATIONS.usuario.minLength, `Usuário deve ter pelo menos ${GARCOM_VALIDATIONS.usuario.minLength} caracteres`)
    .max(GARCOM_VALIDATIONS.usuario.maxLength, `Usuário deve ter no máximo ${GARCOM_VALIDATIONS.usuario.maxLength} caracteres`)
    .regex(GARCOM_VALIDATIONS.usuario.pattern, 'Usuário deve conter apenas letras, números e underscore')
    .toLowerCase()
    .trim(),
  
  senha: z
    .string()
    .min(GARCOM_VALIDATIONS.senha.minLength, `Senha deve ter pelo menos ${GARCOM_VALIDATIONS.senha.minLength} caracteres`)
    .regex(/(?=.*[a-zA-Z])/, 'Senha deve conter pelo menos uma letra')
    .regex(/(?=.*\d)/, 'Senha deve conter pelo menos um número')
    .optional(),
  
  permissoes: z.object({
    criar_pedidos: z.boolean().default(true),
    editar_pedidos: z.boolean().default(true),
    cancelar_pedidos: z.boolean().default(false)
  })
})

// Schema para criação de garçom (senha obrigatória)
export const criarGarcomSchema = garcomSchema.extend({
  senha: z
    .string()
    .min(GARCOM_VALIDATIONS.senha.minLength, `Senha deve ter pelo menos ${GARCOM_VALIDATIONS.senha.minLength} caracteres`)
    .regex(/(?=.*[a-zA-Z])/, 'Senha deve conter pelo menos uma letra')
    .regex(/(?=.*\d)/, 'Senha deve conter pelo menos um número')
})

// Schema para atualização de garçom (senha opcional)
export const atualizarGarcomSchema = garcomSchema.extend({
  ativo: z.boolean().optional()
})

// Schema para login do garçom
export const loginGarcomSchema = z.object({
  usuario: z
    .string()
    .min(1, 'Usuário é obrigatório')
    .trim(),
  
  senha: z
    .string()
    .min(1, 'Senha é obrigatória')
})

// Schema para criação de pedido local
export const criarPedidoLocalSchema = z.object({
  produtos: z
    .array(
      z.object({
        produto_id: z.string().uuid('ID do produto inválido'),
        quantidade: z.number().int().min(1, 'Quantidade deve ser maior que zero'),
        observacoes: z.string().optional()
      })
    )
    .min(1, 'Selecione pelo menos um produto'),
  
  mesa: z
    .string()
    .min(1, 'Número da mesa é obrigatório')
    .max(GARCOM_VALIDATIONS.mesa.maxLength, `Mesa deve ter no máximo ${GARCOM_VALIDATIONS.mesa.maxLength} caracteres`)
    .trim(),
  
  cliente_nome: z
    .string()
    .max(100, 'Nome do cliente deve ter no máximo 100 caracteres')
    .trim()
    .optional(),
  
  observacoes_garcom: z
    .string()
    .max(500, 'Observações devem ter no máximo 500 caracteres')
    .trim()
    .optional()
})

// Schema para atualização de pedido local
export const atualizarPedidoLocalSchema = z.object({
  observacoes_garcom: z
    .string()
    .max(500, 'Observações devem ter no máximo 500 caracteres')
    .trim()
    .optional(),
  
  status: z
    .enum(['cancelado'])
    .optional()
})

// Schema para mudança de status de disponibilidade
export const atualizarStatusDisponibilidadeSchema = z.object({
  novoStatus: z.enum([
    'disponivel_sistema',
    'disponivel_empresa', 
    'indisponivel_empresa',
    'indisponivel_total'
  ]),
  motivo: z
    .string()
    .max(200, 'Motivo deve ter no máximo 200 caracteres')
    .trim()
    .optional()
})

// Schema para resposta a convite de entregador fixo
export const respostaConviteSchema = z.object({
  aceitar: z.boolean(),
  motivo: z
    .string()
    .max(200, 'Motivo deve ter no máximo 200 caracteres')
    .trim()
    .optional()
})

// Schema para envio de convite para entregador fixo
export const enviarConviteSchema = z.object({
  entregador_id: z.string().uuid('ID do entregador inválido'),
  mensagem: z
    .string()
    .max(300, 'Mensagem deve ter no máximo 300 caracteres')
    .trim()
    .optional()
})

// Tipos inferidos dos schemas
export type GarcomFormData = z.infer<typeof garcomSchema>
export type CriarGarcomData = z.infer<typeof criarGarcomSchema>
export type AtualizarGarcomData = z.infer<typeof atualizarGarcomSchema>
export type LoginGarcomData = z.infer<typeof loginGarcomSchema>
export type CriarPedidoLocalData = z.infer<typeof criarPedidoLocalSchema>
export type AtualizarPedidoLocalData = z.infer<typeof atualizarPedidoLocalSchema>
export type AtualizarStatusDisponibilidadeData = z.infer<typeof atualizarStatusDisponibilidadeSchema>
export type RespostaConviteData = z.infer<typeof respostaConviteSchema>
export type EnviarConviteData = z.infer<typeof enviarConviteSchema>

// Utilitários de validação
export const validateGarcomForm = (data: unknown) => {
  return garcomSchema.safeParse(data)
}

export const validateCriarGarcom = (data: unknown) => {
  return criarGarcomSchema.safeParse(data)
}

export const validateAtualizarGarcom = (data: unknown) => {
  return atualizarGarcomSchema.safeParse(data)
}

export const validateLoginGarcom = (data: unknown) => {
  return loginGarcomSchema.safeParse(data)
}

export const validateCriarPedidoLocal = (data: unknown) => {
  return criarPedidoLocalSchema.safeParse(data)
}

export const validateAtualizarPedidoLocal = (data: unknown) => {
  return atualizarPedidoLocalSchema.safeParse(data)
}

export const validateAtualizarStatusDisponibilidade = (data: unknown) => {
  return atualizarStatusDisponibilidadeSchema.safeParse(data)
}

export const validateRespostaConvite = (data: unknown) => {
  return respostaConviteSchema.safeParse(data)
}

export const validateEnviarConvite = (data: unknown) => {
  return enviarConviteSchema.safeParse(data)
}

// Validações específicas para permissões
export const validatePermissoes = (permissoes: unknown) => {
  const schema = z.object({
    criar_pedidos: z.boolean(),
    editar_pedidos: z.boolean(),
    cancelar_pedidos: z.boolean()
  })
  
  return schema.safeParse(permissoes)
}

// Validação para verificar se garçom pode executar ação
export const canGarcomExecuteAction = (
  permissoes: { criar_pedidos: boolean; editar_pedidos: boolean; cancelar_pedidos: boolean },
  acao: 'criar_pedido' | 'editar_pedido' | 'cancelar_pedido'
): boolean => {
  switch (acao) {
    case 'criar_pedido':
      return permissoes.criar_pedidos
    case 'editar_pedido':
      return permissoes.editar_pedidos
    case 'cancelar_pedido':
      return permissoes.cancelar_pedidos
    default:
      return false
  }
}

// Validação de transições de status de pedido
export const isValidStatusTransition = (
  statusAtual: string,
  novoStatus: string,
  permissoes: { criar_pedidos: boolean; editar_pedidos: boolean; cancelar_pedidos: boolean }
): boolean => {
  // Apenas garçons com permissão podem cancelar
  if (novoStatus === 'cancelado') {
    return permissoes.cancelar_pedidos
  }
  
  // Outras transições seguem regras de negócio padrão
  const validTransitions: Record<string, string[]> = {
    'pendente': ['em_preparo', 'cancelado'],
    'em_preparo': ['pronto', 'cancelado'],
    'pronto': ['entregue'],
    'entregue': [], // Status final
    'cancelado': [] // Status final
  }
  
  return validTransitions[statusAtual]?.includes(novoStatus) || false
}