// Configurações da aplicação
export const APP_CONFIG = {
  name: 'Sistema Entrega Sobral',
  description: 'Sistema completo de delivery para Sobral - CE',
  version: '2.0.0',
  author: 'Entrega Sobral',
} as const

// Status dos pedidos
export const PEDIDO_STATUS = {
  PENDENTE: 'pendente',
  ACEITO: 'aceito',
  PREPARANDO: 'preparando',
  PRONTO: 'pronto',
  SAIU_ENTREGA: 'saiu_entrega',
  ENTREGUE: 'entregue',
  CANCELADO: 'cancelado',
  RECUSADO: 'recusado',
} as const

export type PedidoStatus = typeof PEDIDO_STATUS[keyof typeof PEDIDO_STATUS]

// Status das empresas
export const EMPRESA_STATUS = {
  PENDENTE: 'pendente',
  APROVADA: 'aprovada',
  REJEITADA: 'rejeitada',
  SUSPENSA: 'suspensa',
} as const

export type EmpresaStatus = typeof EMPRESA_STATUS[keyof typeof EMPRESA_STATUS]

// Status dos entregadores
export const ENTREGADOR_STATUS = {
  PENDENTE: 'pendente',
  APROVADO: 'aprovado',
  REJEITADO: 'rejeitado',
  SUSPENSO: 'suspenso',
  ATIVO: 'ativo',
  INATIVO: 'inativo',
} as const

export type EntregadorStatus = typeof ENTREGADOR_STATUS[keyof typeof ENTREGADOR_STATUS]

// Tipos de usuário
export const USER_ROLES = {
  ADMIN: 'admin',
  EMPRESA: 'empresa',
  ENTREGADOR: 'entregador',
  CONSUMIDOR: 'consumidor',
} as const

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES]

// Categorias de produtos
export const CATEGORIAS_PRODUTOS = [
  'Açaí',
  'Pizzas',
  'Hambúrgueres',
  'Comida Japonesa',
  'Comida Italiana',
  'Comida Brasileira',
  'Lanches',
  'Bebidas',
  'Sobremesas',
  'Sorvetes',
  'Padarias',
  'Farmácia',
  'Mercado',
  'Outros',
] as const

export type CategoriaProduto = typeof CATEGORIAS_PRODUTOS[number]

// Formas de pagamento
export const FORMAS_PAGAMENTO = {
  DINHEIRO: 'dinheiro',
  CARTAO_CREDITO: 'cartao_credito',
  CARTAO_DEBITO: 'cartao_debito',
  PIX: 'pix',
  VALE_ALIMENTACAO: 'vale_alimentacao',
} as const

export type FormaPagamento = typeof FORMAS_PAGAMENTO[keyof typeof FORMAS_PAGAMENTO]

// Tipos de entrega
export const TIPOS_ENTREGA = {
  SISTEMA: 'sistema', // Entregador do sistema
  PROPRIO: 'proprio', // Entrega própria da empresa
} as const

export type TipoEntrega = typeof TIPOS_ENTREGA[keyof typeof TIPOS_ENTREGA]

// Configurações de paginação
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
} as const

// Configurações de cache (em milissegundos)
export const CACHE_TIME = {
  SHORT: 5 * 60 * 1000, // 5 minutos
  MEDIUM: 15 * 60 * 1000, // 15 minutos
  LONG: 60 * 60 * 1000, // 1 hora
} as const

// Limites da aplicação
export const LIMITS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_PRODUTOS_POR_EMPRESA: 100,
  MAX_ITENS_POR_PEDIDO: 20,
  MIN_VALOR_PEDIDO: 5.00,
} as const

// Mensagens padrão
export const MESSAGES = {
  LOADING: 'Carregando...',
  ERROR_GENERIC: 'Ocorreu um erro inesperado. Tente novamente.',
  ERROR_NETWORK: 'Erro de conexão. Verifique sua internet.',
  SUCCESS_SAVE: 'Dados salvos com sucesso!',
  SUCCESS_DELETE: 'Item excluído com sucesso!',
  CONFIRM_DELETE: 'Tem certeza que deseja excluir este item?',
} as const