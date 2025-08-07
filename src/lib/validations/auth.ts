import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
})

const baseRegisterSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string(),
  role: z.enum(['empresa', 'entregador', 'consumidor']),
})

export const registerSchema = baseRegisterSchema.refine((data) => data.password === data.confirmPassword, {
  message: 'Senhas não coincidem',
  path: ['confirmPassword'],
})

export const empresaRegisterSchema = baseRegisterSchema.extend({
  nome: z.string().min(1, 'Nome da empresa é obrigatório'),
  cnpj: z.string().min(14, 'CNPJ inválido'),
  categoria: z.string().min(1, 'Categoria é obrigatória'),
  responsavel: z.string().min(1, 'Nome do responsável é obrigatório'),
  telefone: z.string().min(10, 'Telefone inválido'),
  endereco: z.object({
    rua: z.string().min(1, 'Rua é obrigatória'),
    numero: z.string().min(1, 'Número é obrigatório'),
    bairro: z.string().min(1, 'Bairro é obrigatório'),
    cidade: z.string().default('Sobral'),
    cep: z.string().min(8, 'CEP inválido'),
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Senhas não coincidem',
  path: ['confirmPassword'],
})

export const entregadorRegisterSchema = baseRegisterSchema.extend({
  nome: z.string().min(1, 'Nome é obrigatório'),
  cpf: z.string().min(11, 'CPF inválido'),
  telefone: z.string().min(10, 'Telefone inválido'),
  endereco: z.object({
    rua: z.string().min(1, 'Rua é obrigatória'),
    numero: z.string().min(1, 'Número é obrigatório'),
    bairro: z.string().min(1, 'Bairro é obrigatório'),
    cidade: z.string().default('Sobral'),
    cep: z.string().min(8, 'CEP inválido'),
  }),
  veiculo: z.object({
    tipo: z.string().min(1, 'Tipo de veículo é obrigatório'),
    placa: z.string().min(7, 'Placa inválida'),
    modelo: z.string().min(1, 'Modelo é obrigatório'),
  }),
  cnh: z.string().min(1, 'CNH é obrigatória'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Senhas não coincidem',
  path: ['confirmPassword'],
})

export const consumidorRegisterSchema = baseRegisterSchema.extend({
  nome: z.string().min(1, 'Nome é obrigatório'),
  cpf: z.string().min(11, 'CPF inválido'),
  telefone: z.string().min(10, 'Telefone inválido'),
  endereco: z.object({
    rua: z.string().min(1, 'Rua é obrigatória'),
    numero: z.string().min(1, 'Número é obrigatório'),
    bairro: z.string().min(1, 'Bairro é obrigatório'),
    cidade: z.string().default('Sobral'),
    cep: z.string().min(8, 'CEP inválido'),
    pontoReferencia: z.string().optional(),
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Senhas não coincidem',
  path: ['confirmPassword'],
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type EmpresaRegisterInput = z.infer<typeof empresaRegisterSchema>
export type EntregadorRegisterInput = z.infer<typeof entregadorRegisterSchema>
export type ConsumidorRegisterInput = z.infer<typeof consumidorRegisterSchema>