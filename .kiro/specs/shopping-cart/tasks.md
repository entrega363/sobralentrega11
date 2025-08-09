# Plano de Implementação

- [ ] 1. Criar Cart Store com Zustand
  - Criar arquivo src/stores/cart-store.ts
  - Implementar interface CartItem e CartState
  - Adicionar métodos addItem, removeItem, updateQuantity, clearCart
  - Implementar cálculos de total de itens e preço
  - _Requisitos: 1.1, 1.2, 3.1, 3.2, 3.3, 3.4_

- [ ] 2. Implementar persistência com localStorage
  - Criar middleware para sincronizar store com localStorage
  - Implementar carregamento inicial do localStorage
  - Adicionar limpeza do carrinho no logout
  - Garantir que dados sejam salvos a cada mudança
  - _Requisitos: 5.1, 5.2, 5.3, 5.4_

- [ ] 3. Criar componentes básicos do carrinho
  - Criar src/components/cart/cart-button.tsx (botão no header)
  - Criar src/components/cart/cart-sidebar.tsx (sidebar deslizante)
  - Criar src/components/cart/cart-item.tsx (item individual)
  - Adicionar controles de quantidade (+/- buttons)
  - _Requisitos: 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3_

- [ ] 4. Integrar botão "Adicionar ao Carrinho"
  - Atualizar ConsumidorDashboard para usar cart store
  - Implementar função addToCart no botão
  - Adicionar feedback visual (toast de sucesso)
  - Validar produto antes de adicionar
  - _Requisitos: 1.1, 1.2, 1.3_

- [ ] 5. Implementar checkout modal
  - Criar src/components/cart/checkout-modal.tsx
  - Adicionar formulário de endereço de entrega
  - Implementar seleção de forma de pagamento
  - Integrar com API de pedidos para finalizar compra
  - _Requisitos: 4.1, 4.2, 4.3, 4.4_

- [ ] 6. Adicionar Cart Provider ao app
  - Criar src/components/providers/cart-provider.tsx
  - Integrar provider no layout principal
  - Garantir que carrinho seja inicializado corretamente
  - Testar persistência entre navegação de páginas
  - _Requisitos: 5.1, 5.2_

- [ ] 7. Testar e refinar funcionalidades
  - Testar fluxo completo: adicionar → visualizar → modificar → finalizar
  - Verificar cálculos de totais e subtotais
  - Testar persistência e limpeza do carrinho
  - Validar tratamento de erros e estados de loading
  - _Requisitos: 1.4, 2.1, 2.2, 2.3, 4.3, 4.4_

- [ ] 8. Melhorar UX e adicionar animações
  - Adicionar animações na sidebar do carrinho
  - Implementar loading states durante operações
  - Melhorar feedback visual para ações do usuário
  - Otimizar responsividade em diferentes telas
  - _Requisitos: 1.3, 2.4_