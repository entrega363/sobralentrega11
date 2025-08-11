// Tipos para o sistema de comanda local

export type StatusDisponibilidade = 
  | 'disponivel_sistema'     // Disponível para todas as empresas
  | 'disponivel_empresa'     // Disponível apenas para empresa vinculada
  | 'indisponivel_empresa'   // Indisponível para empresa, pode escolher sistema
  | 'indisponivel_total'     // Indisponível para tudo

export type TipoPedido = 'delivery' | 'local'

export type AcaoGarcom = 
  | 'login' 
  | 'logout' 
  | 'criar_pedido' 
  | 'editar_pedido' 
  | 'cancelar_pedido'

export type StatusVinculo = 'pendente' | 'ativo' | 'inativo'

// Permissões do garçom
export interface GarcomPermissoes {
  criar_pedidos: boolean
  editar_pedidos: boolean
  cancelar_pedidos: boolean
}

// Interface principal do garçom
export interface Garcom {
  id: string
  empresa_id: string
  nome: string
  usuario: string
  senha_hash?: string // Não incluído em respostas da API
  ativo: boolean
  permissoes: GarcomPermissoes
  ultimo_login?: string
  created_at: string
  updated_at: string
}

// Dados para criação/edição de garçom
export interface GarcomFormData {
  nome: string
  usuario: string
  senha?: string
  permissoes: GarcomPermissoes
}

// Dados de resposta da API com informações extras
export interface GarcomWithStats extends Omit<Garcom, 'senha_hash'> {
  totalPedidosHoje: number
  vendaTotal: number
  ultimaAtividade?: string
}

// Atividade do garçom
export interface GarcomAtividade {
  id: string
  garcom_id: string
  acao: AcaoGarcom
  detalhes?: Record<string, any>
  pedido_id?: string
  ip_address?: string
  user_agent?: string
  created_at: string
}

// Pedido local (extensão do pedido normal)
export interface PedidoLocal {
  id: string
  empresa_id: string
  consumidor_id?: string
  garcom_id: string
  tipo_pedido: 'local'
  mesa: string
  observacoes_garcom?: string
  status: string
  total: number
  created_at: string
  updated_at: string
  
  // Relacionamentos
  garcom?: {
    id: string
    nome: string
  }
  itens?: PedidoItem[]
}

// Item do pedido
export interface PedidoItem {
  id: string
  pedido_id: string
  produto_id: string
  quantidade: number
  preco_unitario: number
  observacoes?: string
  
  // Relacionamento
  produto?: {
    id: string
    nome: string
    preco: number
  }
}

// Dados para criação de pedido local
export interface CriarPedidoLocalData {
  produtos: Array<{
    produto_id: string
    quantidade: number
    observacoes?: string
  }>
  mesa: string
  cliente_nome?: string
  observacoes_garcom?: string
}

// Status do entregador (para sistema de entregadores fixos)
export interface EntregadorStatus {
  entregador_id: string
  status_disponibilidade: StatusDisponibilidade
  empresa_vinculada_id?: string
  ultima_atualizacao: string
}

// Histórico de status do entregador
export interface EntregadorStatusHistorico {
  id: string
  entregador_id: string
  status_anterior: StatusDisponibilidade
  status_novo: StatusDisponibilidade
  motivo?: string
  empresa_id?: string
  created_at: string
}

// Vínculo empresa-entregador fixo
export interface EmpresaEntregadorFixo {
  id: string
  empresa_id: string
  entregador_id: string
  status: StatusVinculo
  data_convite: string
  data_resposta?: string
  data_vinculo?: string
  created_at: string
  updated_at: string
}

// Dados de resposta para vínculo com informações do entregador
export interface VinculoComEntregador extends EmpresaEntregadorFixo {
  entregador: {
    id: string
    nome: string
    email: string
    telefone?: string
    avaliacao_media?: number
    total_entregas?: number
  }
}

// Dados de resposta para convite com informações da empresa
export interface ConviteComEmpresa extends EmpresaEntregadorFixo {
  empresa: {
    id: string
    nome: string
    endereco?: string
    avaliacao_media?: number
  }
  mensagem?: string
}

// Validações
export const GARCOM_VALIDATIONS = {
  usuario: {
    minLength: 3,
    maxLength: 50,
    pattern: /^[a-zA-Z0-9_]+$/, // apenas alfanumérico e underscore
  },
  senha: {
    minLength: 6,
    requireNumbers: true,
    requireLetters: true,
  },
  nome: {
    minLength: 2,
    maxLength: 100,
  },
  mesa: {
    minLength: 1,
    maxLength: 20,
  }
} as const

// Mensagens de erro
export const GARCOM_ERRORS = {
  CREDENCIAIS_INVALIDAS: 'Usuário ou senha incorretos',
  GARCOM_INATIVO: 'Garçom desativado. Contate o gerente',
  USUARIO_JA_EXISTE: 'Nome de usuário já está em uso',
  PERMISSAO_NEGADA: 'Você não tem permissão para esta ação',
  SESSAO_EXPIRADA: 'Sessão expirada. Faça login novamente',
  EMPRESA_INATIVA: 'Empresa temporariamente indisponível',
  MESA_OBRIGATORIA: 'Número da mesa é obrigatório',
  PRODUTOS_OBRIGATORIOS: 'Selecione pelo menos um produto',
  CONVITE_DUPLICADO: 'Este entregador já possui vínculo com sua empresa',
  ENTREGADOR_OCUPADO: 'Entregador está realizando uma entrega no momento',
  TRANSICAO_INVALIDA: 'Mudança de status não permitida',
  VINCULO_NAO_ENCONTRADO: 'Vínculo não encontrado'
} as const

// Utilitários de validação
export const validateGarcomData = (data: GarcomFormData): string[] => {
  const errors: string[] = []

  // Validar nome
  if (!data.nome.trim()) {
    errors.push('Nome é obrigatório')
  } else if (data.nome.trim().length < GARCOM_VALIDATIONS.nome.minLength) {
    errors.push(`Nome deve ter pelo menos ${GARCOM_VALIDATIONS.nome.minLength} caracteres`)
  }

  // Validar usuário
  if (!data.usuario.trim()) {
    errors.push('Usuário é obrigatório')
  } else if (data.usuario.trim().length < GARCOM_VALIDATIONS.usuario.minLength) {
    errors.push(`Usuário deve ter pelo menos ${GARCOM_VALIDATIONS.usuario.minLength} caracteres`)
  } else if (!GARCOM_VALIDATIONS.usuario.pattern.test(data.usuario)) {
    errors.push('Usuário deve conter apenas letras, números e underscore')
  }

  // Validar senha (se fornecida)
  if (data.senha) {
    if (data.senha.length < GARCOM_VALIDATIONS.senha.minLength) {
      errors.push(`Senha deve ter pelo menos ${GARCOM_VALIDATIONS.senha.minLength} caracteres`)
    } else if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(data.senha)) {
      errors.push('Senha deve conter pelo menos uma letra e um número')
    }
  }

  return errors
}

export const validatePedidoLocalData = (data: CriarPedidoLocalData): string[] => {
  const errors: string[] = []

  // Validar mesa
  if (!data.mesa.trim()) {
    errors.push(GARCOM_ERRORS.MESA_OBRIGATORIA)
  }

  // Validar produtos
  if (!data.produtos || data.produtos.length === 0) {
    errors.push(GARCOM_ERRORS.PRODUTOS_OBRIGATORIOS)
  } else {
    data.produtos.forEach((produto, index) => {
      if (!produto.produto_id) {
        errors.push(`Produto ${index + 1}: ID é obrigatório`)
      }
      if (!produto.quantidade || produto.quantidade <= 0) {
        errors.push(`Produto ${index + 1}: Quantidade deve ser maior que zero`)
      }
    })
  }

  return errors
}

// Dados de autenticação do garçom
export interface GarcomAuth {
  garcom: Omit<Garcom, 'senha_hash'>
  empresa: {
    id: string
    nome: string
    ativo: boolean
  }
  token: string
  expires_at: string
}

// Dados de sessão do garçom
export interface GarcomSession {
  garcom_id: string
  empresa_id: string
  nome: string
  usuario: string
  permissoes: GarcomPermissoes
  empresa_nome: string
  login_at: string
}

// Estatísticas do garçom
export interface GarcomStats {
  pedidos_hoje: number
  pedidos_semana: number
  pedidos_mes: number
  vendas_hoje: number
  vendas_semana: number
  vendas_mes: number
  tempo_medio_atendimento: number
  ultima_atividade?: string
}

// Utilitários de formatação
export const formatPermissoes = (permissoes: GarcomPermissoes): string[] => {
  const labels: string[] = []
  
  if (permissoes.criar_pedidos) labels.push('Criar')
  if (permissoes.editar_pedidos) labels.push('Editar')
  if (permissoes.cancelar_pedidos) labels.push('Cancelar')
  
  return labels
}

export const formatStatusDisponibilidade = (status: StatusDisponibilidade): string => {
  const statusMap = {
    disponivel_sistema: 'Disponível para Sistema',
    disponivel_empresa: 'Disponível para Empresa',
    indisponivel_empresa: 'Indisponível para Empresa',
    indisponivel_total: 'Indisponível Total'
  }
  
  return statusMap[status] || status
}

export const formatStatusVinculo = (status: StatusVinculo): string => {
  const statusMap = {
    pendente: 'Pendente',
    ativo: 'Ativo',
    inativo: 'Inativo'
  }
  
  return statusMap[status] || status
}