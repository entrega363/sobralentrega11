# Design Document

## Overview

Este documento descreve o design para implementação das páginas administrativas faltantes no dashboard do sistema de delivery Sobral. O objetivo é criar páginas funcionais para gerenciamento de empresas, entregadores, consumidores, pedidos, relatórios e configurações, mantendo consistência visual e funcional com o dashboard existente.

## Architecture

### Estrutura de Rotas
```
src/app/(dashboard)/admin/
├── page.tsx (Dashboard principal - já existe)
├── empresas/
│   └── page.tsx
├── entregadores/
│   └── page.tsx
├── consumidores/
│   └── page.tsx
├── pedidos/
│   └── page.tsx
├── relatorios/
│   └── page.tsx
└── configuracoes/
    └── page.tsx
```

### Componentes Reutilizáveis
- `AdminPageLayout`: Layout base para páginas administrativas
- `DataTable`: Tabela genérica para listagem de dados
- `StatusBadge`: Badge para exibir status (aprovado, pendente, rejeitado)
- `ActionButtons`: Botões de ação (aprovar, rejeitar, editar, excluir)
- `FilterBar`: Barra de filtros para pesquisa e filtragem
- `StatsCards`: Cards de estatísticas para métricas

## Components and Interfaces

### 1. AdminPageLayout Component
```typescript
interface AdminPageLayoutProps {
  title: string
  description?: string
  actions?: React.ReactNode
  children: React.ReactNode
}
```

### 2. DataTable Component
```typescript
interface DataTableProps<T> {
  data: T[]
  columns: ColumnDef<T>[]
  loading?: boolean
  onRowAction?: (action: string, row: T) => void
  pagination?: boolean
}
```

### 3. StatusBadge Component
```typescript
interface StatusBadgeProps {
  status: 'aprovado' | 'pendente' | 'rejeitado' | 'ativo' | 'inativo'
  variant?: 'default' | 'outline'
}
```

### 4. FilterBar Component
```typescript
interface FilterBarProps {
  onSearch?: (query: string) => void
  onFilter?: (filters: Record<string, any>) => void
  filters?: FilterOption[]
}
```

## Data Models

### Empresa
```typescript
interface Empresa {
  id: string
  nome: string
  email: string
  telefone: string
  endereco: string
  cnpj: string
  status: 'aprovado' | 'pendente' | 'rejeitado'
  created_at: string
  updated_at: string
}
```

### Entregador
```typescript
interface Entregador {
  id: string
  nome: string
  email: string
  telefone: string
  cpf: string
  cnh: string
  veiculo: string
  status: 'aprovado' | 'pendente' | 'rejeitado'
  created_at: string
  updated_at: string
}
```

### Consumidor
```typescript
interface Consumidor {
  id: string
  nome: string
  email: string
  telefone: string
  enderecos: Endereco[]
  status: 'ativo' | 'inativo'
  total_pedidos: number
  created_at: string
  updated_at: string
}
```

### Pedido
```typescript
interface Pedido {
  id: string
  consumidor: Consumidor
  empresa: Empresa
  entregador?: Entregador
  items: PedidoItem[]
  status: 'pendente' | 'confirmado' | 'preparando' | 'saiu_entrega' | 'entregue' | 'cancelado'
  valor_total: number
  taxa_entrega: number
  created_at: string
  updated_at: string
}
```

## Error Handling

### Tratamento de Erros
1. **Erro de Carregamento**: Exibir skeleton loading durante carregamento
2. **Erro de API**: Exibir toast com mensagem de erro específica
3. **Erro de Permissão**: Redirecionar para página de acesso negado
4. **Erro 404**: Exibir página de erro personalizada
5. **Erro de Validação**: Exibir mensagens de erro nos formulários

### Estados de Loading
- Skeleton loading para tabelas
- Spinner para ações individuais
- Placeholder para dados vazios

## Testing Strategy

### Testes Unitários
- Testar componentes individuais (DataTable, StatusBadge, etc.)
- Testar hooks customizados para fetch de dados
- Testar utilitários de formatação e validação

### Testes de Integração
- Testar fluxo completo de aprovação de empresas
- Testar navegação entre páginas
- Testar filtros e pesquisa

### Testes E2E
- Testar login como admin e navegação
- Testar ações administrativas (aprovar, rejeitar)
- Testar responsividade em diferentes dispositivos

## Páginas Específicas

### 1. Página de Empresas (/admin/empresas)
**Funcionalidades:**
- Lista todas as empresas com filtros por status
- Ações: Aprovar, Rejeitar, Ver Detalhes
- Busca por nome, email ou CNPJ
- Paginação para grandes volumes

**Layout:**
- Header com título e botão de ações
- Barra de filtros e pesquisa
- Tabela com colunas: Nome, Email, CNPJ, Status, Data Cadastro, Ações
- Modal para visualizar detalhes da empresa

### 2. Página de Entregadores (/admin/entregadores)
**Funcionalidades:**
- Lista todos os entregadores com filtros por status
- Ações: Aprovar, Rejeitar, Ver Detalhes
- Busca por nome, email ou CPF
- Visualização de documentos (CNH, etc.)

**Layout:**
- Similar à página de empresas
- Colunas específicas: Nome, Email, CPF, CNH, Veículo, Status, Ações

### 3. Página de Consumidores (/admin/consumidores)
**Funcionalidades:**
- Lista todos os consumidores
- Ações: Ativar, Desativar, Ver Histórico
- Busca por nome, email ou telefone
- Estatísticas de pedidos por consumidor

**Layout:**
- Tabela com: Nome, Email, Telefone, Total Pedidos, Status, Ações
- Modal com histórico de pedidos do consumidor

### 4. Página de Pedidos (/admin/pedidos)
**Funcionalidades:**
- Lista todos os pedidos do sistema
- Filtros por status, data, empresa, entregador
- Ações: Ver Detalhes, Alterar Status (em casos especiais)
- Busca por ID do pedido ou nome do cliente

**Layout:**
- Filtros avançados (data, status, empresa)
- Tabela com: ID, Cliente, Empresa, Entregador, Status, Valor, Data
- Modal com detalhes completos do pedido

### 5. Página de Relatórios (/admin/relatorios)
**Funcionalidades:**
- Dashboard com métricas principais
- Gráficos de vendas, pedidos, receita
- Filtros por período
- Exportação de relatórios

**Layout:**
- Cards com métricas principais
- Gráficos interativos (Chart.js ou similar)
- Filtros de data
- Botões de exportação

### 6. Página de Configurações (/admin/configuracoes)
**Funcionalidades:**
- Configurações globais do sistema
- Taxa de entrega padrão
- Comissões por categoria
- Configurações de notificação

**Layout:**
- Formulário organizado em seções
- Campos para taxas e percentuais
- Botão de salvar com confirmação

## Implementação Técnica

### Hooks Customizados
```typescript
// Hook para gerenciar dados de empresas
const useEmpresas = () => {
  // Fetch, update, approve, reject empresas
}

// Hook para gerenciar dados de entregadores
const useEntregadores = () => {
  // Fetch, update, approve, reject entregadores
}

// Hook para gerenciar dados de pedidos
const usePedidos = () => {
  // Fetch, filter, update pedidos
}
```

### APIs Necessárias
- `GET /api/admin/empresas` - Listar empresas
- `PUT /api/admin/empresas/[id]/status` - Atualizar status
- `GET /api/admin/entregadores` - Listar entregadores
- `PUT /api/admin/entregadores/[id]/status` - Atualizar status
- `GET /api/admin/consumidores` - Listar consumidores
- `GET /api/admin/pedidos` - Listar pedidos
- `GET /api/admin/relatorios` - Dados para relatórios

### Segurança
- Verificação de role 'admin' em todas as páginas
- Middleware para proteger rotas administrativas
- Validação de permissões nas APIs
- Rate limiting para ações administrativas

### Performance
- Paginação server-side para grandes volumes
- Cache de dados com React Query
- Lazy loading de componentes pesados
- Otimização de imagens e assets

### Responsividade
- Layout adaptável para mobile e tablet
- Tabelas responsivas com scroll horizontal
- Modais adaptáveis para telas pequenas
- Menu lateral colapsável em mobile