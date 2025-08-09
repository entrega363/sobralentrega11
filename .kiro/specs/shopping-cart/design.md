# Documento de Design

## Visão Geral

O sistema de carrinho de compras será implementado usando Zustand para gerenciamento de estado global, localStorage para persistência e componentes React para interface. O carrinho será acessível de qualquer página e manterá os itens até que o pedido seja finalizado ou o usuário faça logout.

## Arquitetura

### Estado Atual
- **Botão**: "Adicionar ao Carrinho" sem funcionalidade
- **Carrinho**: Não existe
- **Checkout**: Não implementado

### Estado Desejado
- **Store Global**: Zustand store para gerenciar estado do carrinho
- **Persistência**: localStorage para manter itens entre sessões
- **Interface**: Componentes para visualizar e gerenciar carrinho
- **Checkout**: Modal para finalizar pedidos

## Componentes e Interfaces

### 1. Cart Store (Zustand)
- **Arquivo**: `src/stores/cart-store.ts`
- **Funcionalidade**: Gerenciar estado global do carrinho
- **Métodos**: addItem, removeItem, updateQuantity, clearCart, getTotalPrice

### 2. Cart Provider
- **Arquivo**: `src/components/providers/cart-provider.tsx`
- **Funcionalidade**: Inicializar carrinho do localStorage
- **Responsabilidade**: Sincronizar estado com localStorage

### 3. Cart Sidebar
- **Arquivo**: `src/components/cart/cart-sidebar.tsx`
- **Funcionalidade**: Sidebar deslizante para mostrar itens do carrinho
- **Estados**: Aberto/fechado, loading, lista de itens

### 4. Cart Item Component
- **Arquivo**: `src/components/cart/cart-item.tsx`
- **Funcionalidade**: Componente individual para cada item do carrinho
- **Controles**: Botões +/-, remover item, mostrar subtotal

### 5. Checkout Modal
- **Arquivo**: `src/components/cart/checkout-modal.tsx`
- **Funcionalidade**: Modal para finalizar pedido
- **Campos**: Endereço de entrega, forma de pagamento, observações

### 6. Cart Button
- **Arquivo**: `src/components/cart/cart-button.tsx`
- **Funcionalidade**: Botão no header para abrir carrinho
- **Indicador**: Badge com quantidade de itens

## Modelos de Dados

### Cart Item
```typescript
interface CartItem {
  id: string
  produto_id: string
  nome: string
  preco: number
  quantidade: number
  empresa_id: string
  empresa_nome: string
  categoria: string
  imagem_url?: string
  tempo_preparacao?: number
}
```

### Cart State
```typescript
interface CartState {
  items: CartItem[]
  isOpen: boolean
  isLoading: boolean
  
  // Actions
  addItem: (produto: any) => void
  removeItem: (produto_id: string) => void
  updateQuantity: (produto_id: string, quantidade: number) => void
  clearCart: () => void
  toggleCart: () => void
  
  // Computed
  getTotalItems: () => number
  getTotalPrice: () => number
  getItemsByEmpresa: () => Record<string, CartItem[]>
}
```

### Checkout Data
```typescript
interface CheckoutData {
  endereco_entrega: {
    rua: string
    numero: string
    complemento?: string
    bairro: string
    cidade: string
    cep: string
  }
  forma_pagamento: 'dinheiro' | 'cartao_credito' | 'cartao_debito' | 'pix'
  observacoes?: string
  tipo_entrega: 'sistema' | 'proprio'
}
```

## Fluxo de Dados

### Adicionar ao Carrinho
1. Usuário clica em "Adicionar ao Carrinho"
2. Produto é validado (disponível, empresa ativa)
3. Item é adicionado ao store Zustand
4. Store sincroniza com localStorage
5. UI é atualizada (badge do carrinho, toast de sucesso)

### Visualizar Carrinho
1. Usuário clica no ícone do carrinho
2. Sidebar é aberta mostrando itens
3. Cada item mostra controles de quantidade
4. Total é calculado dinamicamente

### Finalizar Pedido
1. Usuário clica em "Finalizar Pedido"
2. Modal de checkout é aberto
3. Dados são validados
4. Pedido é criado via API
5. Carrinho é limpo
6. Usuário recebe confirmação

## Tratamento de Erros

### Validações
- **Produto Indisponível**: Verificar se produto ainda está disponível
- **Empresa Inativa**: Verificar se empresa ainda está ativa
- **Quantidade Mínima**: Não permitir quantidade menor que 1
- **Dados de Checkout**: Validar endereço e forma de pagamento

### Estados de Erro
- **Erro ao Adicionar**: Toast com mensagem de erro
- **Erro no Checkout**: Mensagens específicas por campo
- **Erro de Rede**: Botão para tentar novamente

## Estratégia de Implementação

### Fase 1: Store e Persistência
- Criar cart store com Zustand
- Implementar persistência com localStorage
- Adicionar cart provider ao app

### Fase 2: Interface Básica
- Implementar botão "Adicionar ao Carrinho"
- Criar cart sidebar com lista de itens
- Adicionar controles de quantidade

### Fase 3: Checkout
- Criar modal de checkout
- Implementar validações
- Integrar com API de pedidos

### Fase 4: Refinamentos
- Adicionar animações
- Melhorar UX com loading states
- Otimizar performance

## Padrões de Design

### Cart Sidebar
```typescript
// Sidebar deslizante do lado direito
<div className={`fixed inset-y-0 right-0 z-50 w-96 bg-white shadow-xl transform transition-transform ${
  isOpen ? 'translate-x-0' : 'translate-x-full'
}`}>
  <CartHeader />
  <CartItems />
  <CartFooter />
</div>
```

### Cart Item
```typescript
// Item individual no carrinho
<div className="flex items-center gap-4 p-4 border-b">
  <img src={item.imagem_url} className="w-16 h-16 object-cover rounded" />
  <div className="flex-1">
    <h4 className="font-medium">{item.nome}</h4>
    <p className="text-sm text-gray-600">{item.empresa_nome}</p>
    <p className="font-bold text-green-600">{formatCurrency(item.preco)}</p>
  </div>
  <QuantityControls />
</div>
```

### Quantity Controls
```typescript
// Controles de quantidade
<div className="flex items-center gap-2">
  <Button size="sm" onClick={() => updateQuantity(item.produto_id, item.quantidade - 1)}>
    <Minus className="h-4 w-4" />
  </Button>
  <span className="w-8 text-center">{item.quantidade}</span>
  <Button size="sm" onClick={() => updateQuantity(item.produto_id, item.quantidade + 1)}>
    <Plus className="h-4 w-4" />
  </Button>
</div>
```