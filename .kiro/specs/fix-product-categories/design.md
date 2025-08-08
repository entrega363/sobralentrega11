# Documento de Design

## Visão Geral

O problema identificado é uma inconsistência entre as categorias de produtos definidas no arquivo `src/lib/constants.ts` e as categorias fixas no componente `src/app/(dashboard)/empresa/produtos/page.tsx`. O schema de validação em `src/lib/validations/produto.ts` usa as categorias do constants.ts, mas o formulário usa uma lista diferente, causando falhas de validação.

## Arquitetura

### Estado Atual
- **Constantes**: `CATEGORIAS_PRODUTOS` em `src/lib/constants.ts` define: ['Açaí', 'Pizzas', 'Hambúrgueres', 'Comida Japonesa', ...]
- **Componente do Formulário**: Lista fixa com: ['Pizza', 'Hambúrguer', 'Bebida', 'Sobremesa', ...]
- **Validação**: `produtoSchema` usa `CATEGORIAS_PRODUTOS` do constants.ts

### Estado Desejado
- **Fonte Única da Verdade**: Todas as categorias vêm de `CATEGORIAS_PRODUTOS`
- **Validação Consistente**: Schema e formulário usam a mesma fonte
- **Melhor Tratamento de Erros**: Mensagens claras para diferentes tipos de erro

## Componentes e Interfaces

### 1. Atualização das Constantes
- **Arquivo**: `src/lib/constants.ts`
- **Ação**: Revisar e ajustar `CATEGORIAS_PRODUTOS` para incluir categorias mais comuns e práticas
- **Justificativa**: Algumas categorias atuais são muito específicas, outras muito genéricas

### 2. Atualização do Componente do Formulário
- **Arquivo**: `src/app/(dashboard)/empresa/produtos/page.tsx`
- **Ação**: Importar e usar `CATEGORIAS_PRODUTOS` do constants.ts
- **Remover**: Array fixo de categorias
- **Adicionar**: Import das constantes

### 3. Melhoria da Validação
- **Arquivo**: `src/lib/validations/produto.ts`
- **Ação**: Melhorar mensagens de erro para categorias inválidas
- **Adicionar**: Mensagem mais descritiva sobre categorias válidas

### 4. Tratamento de Erros da API
- **Arquivo**: `src/app/api/produtos/route.ts`
- **Ação**: Melhorar tratamento de erros de validação
- **Adicionar**: Mensagens específicas para diferentes tipos de erro de validação

## Modelos de Dados

### Enum de Categorias
```typescript
export const CATEGORIAS_PRODUTOS = [
  'Pizza',
  'Hambúrguer', 
  'Bebida',
  'Sobremesa',
  'Entrada',
  'Prato Principal',
  'Lanche',
  'Salgado',
  'Açaí',
  'Comida Japonesa',
  'Comida Italiana',
  'Comida Brasileira',
  'Sorvetes',
  'Padaria',
  'Farmácia',
  'Mercado',
  'Outros'
] as const
```

### Melhoria do Schema do Produto
```typescript
export const produtoSchema = z.object({
  // ... outros campos
  categoria: z.enum(CATEGORIAS_PRODUTOS as any, {
    errorMap: () => ({ 
      message: `Categoria inválida. Categorias válidas: ${CATEGORIAS_PRODUTOS.join(', ')}` 
    })
  }),
  // ... outros campos
})
```

## Tratamento de Erros

### Erros de Validação
- **Categoria Inválida**: Mostrar lista de categorias válidas
- **Campos Obrigatórios**: Indicar campos obrigatórios faltando
- **Erros de Tipo de Dados**: Mensagens específicas para tipos incorretos

### Erros da API
- **Autenticação**: "Sessão expirada. Faça login novamente."
- **Autorização**: "Acesso negado. Apenas empresas podem cadastrar produtos."
- **Banco de Dados**: "Erro interno. Tente novamente em alguns minutos."
- **Validação**: Passar mensagens específicas do schema

### Experiência do Usuário
- **Estados de Carregamento**: Indicadores visuais durante salvamento
- **Feedback de Sucesso**: Confirmação clara quando produto é salvo
- **Recuperação de Erros**: Sugestões de como corrigir erros

## Estratégia de Testes

### Testes Unitários
- Validação de schema com categorias válidas e inválidas
- Componente de formulário com diferentes estados
- Funções de utilidade para tratamento de erro

### Testes de Integração
- Fluxo completo de criação de produto
- Validação ponta a ponta com diferentes categorias
- Tratamento de erros de API

### Testes Manuais
- Testar cada categoria disponível
- Verificar mensagens de erro em diferentes cenários
- Confirmar consistência visual e funcional