# Documento de Design

## Visão Geral

O problema identificado é que a navegação lateral do consumidor possui links para páginas que não existem (/consumidor/pedidos, /consumidor/favoritos, /consumidor/configuracoes), causando erro 404. É necessário implementar essas três páginas com funcionalidades básicas e design consistente com o sistema.

## Arquitetura

### Estado Atual
- **Navegação**: Links funcionais na sidebar apontando para rotas inexistentes
- **Páginas**: Apenas /consumidor existe
- **Funcionalidade**: Navegação quebrada para consumidores

### Estado Desejado
- **Páginas Completas**: Todas as rotas da navegação funcionais
- **Funcionalidade Básica**: Cada página com sua funcionalidade específica
- **Design Consistente**: Uso dos mesmos componentes UI do sistema

## Componentes e Interfaces

### 1. Página Meus Pedidos (/consumidor/pedidos)
- **Arquivo**: `src/app/(dashboard)/consumidor/pedidos/page.tsx`
- **Funcionalidade**: Listar pedidos do usuário logado
- **Estados**: Loading, erro, lista vazia, lista com dados
- **Componentes**: Cards de pedidos, badges de status, formatação de data/valor

### 2. Página Favoritos (/consumidor/favoritos)
- **Arquivo**: `src/app/(dashboard)/consumidor/favoritos/page.tsx`
- **Funcionalidade**: Listar produtos/restaurantes favoritos
- **Estados**: Loading, erro, lista vazia, lista com dados
- **Componentes**: Cards de produtos, botão de remoção, confirmação

### 3. Página Configurações (/consumidor/configuracoes)
- **Arquivo**: `src/app/(dashboard)/consumidor/configuracoes/page.tsx`
- **Funcionalidade**: Editar dados pessoais do consumidor
- **Estados**: Loading, erro, formulário, salvando
- **Componentes**: Formulário de dados pessoais, validação, feedback

## Modelos de Dados

### Estrutura de Pedidos
```typescript
interface Pedido {
  id: string
  consumidor_id: string
  status: 'pendente' | 'aceito' | 'preparando' | 'pronto' | 'saiu_entrega' | 'entregue' | 'cancelado'
  total: number
  created_at: string
  endereco_entrega: object
  pedido_itens: PedidoItem[]
}

interface PedidoItem {
  id: string
  produto_id: string
  quantidade: number
  preco_unitario: number
  produto: {
    nome: string
    empresa: {
      nome: string
    }
  }
}
```

### Estrutura de Favoritos
```typescript
interface Favorito {
  id: string
  consumidor_id: string
  produto_id?: string
  empresa_id?: string
  tipo: 'produto' | 'empresa'
  created_at: string
  produto?: Produto
  empresa?: Empresa
}
```

### Estrutura de Consumidor
```typescript
interface Consumidor {
  id: string
  profile_id: string
  nome: string
  cpf: string
  endereco: object
  contato: object
}
```

## Tratamento de Erros

### Estados de Erro
- **Sem Dados**: Mensagens amigáveis com sugestões de ação
- **Erro de Rede**: Botão para tentar novamente
- **Erro de Validação**: Mensagens específicas por campo
- **Erro de Autorização**: Redirecionamento para login

### Estados de Carregamento
- **Loading Inicial**: Skeleton ou spinner
- **Loading de Ações**: Botões desabilitados com indicador
- **Loading de Salvamento**: Feedback visual durante operação

## Estratégia de Implementação

### Fase 1: Estrutura Básica
- Criar arquivos de página com layout básico
- Implementar estados de loading e erro
- Adicionar navegação funcional

### Fase 2: Funcionalidade Core
- Implementar listagem de pedidos
- Implementar listagem de favoritos
- Implementar formulário de configurações

### Fase 3: Refinamento
- Adicionar validações
- Melhorar UX com feedback
- Otimizar performance

## Padrões de Design

### Layout Consistente
```typescript
// Padrão para todas as páginas
<div className="space-y-6">
  <div>
    <h1 className="text-2xl font-bold">Título da Página</h1>
    <p className="text-gray-600">Descrição da página</p>
  </div>
  
  {/* Conteúdo específico */}
</div>
```

### Estados Vazios
```typescript
// Padrão para listas vazias
<div className="text-center py-12">
  <div className="text-4xl mb-4">{emoji}</div>
  <h3 className="text-lg font-semibold mb-2">Título</h3>
  <p className="text-gray-600">Descrição</p>
  {actionButton && <Button>{actionButton}</Button>}
</div>
```

### Cards de Conteúdo
```typescript
// Padrão para cards de lista
<Card className="hover:shadow-lg transition-shadow">
  <CardHeader>
    <CardTitle>{titulo}</CardTitle>
    <CardDescription>{descricao}</CardDescription>
  </CardHeader>
  <CardContent>
    {conteudo}
  </CardContent>
</Card>
```