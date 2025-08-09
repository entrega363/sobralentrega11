# Requirements Document

## Introduction

O sistema precisa implementar a funcionalidade de carrinho de compras para permitir que consumidores adicionem produtos, gerenciem quantidades e finalizem pedidos. Atualmente, o botão "Adicionar ao Carrinho" não possui funcionalidade implementada.

## Requirements

### Requirement 1

**User Story:** Como consumidor, eu quero adicionar produtos ao carrinho, para que eu possa acumular itens antes de finalizar o pedido.

#### Acceptance Criteria

1. WHEN um consumidor clica em "Adicionar ao Carrinho" THEN o sistema SHALL adicionar o produto ao carrinho com quantidade 1
2. WHEN um produto já está no carrinho THEN o sistema SHALL incrementar a quantidade em vez de duplicar o item
3. WHEN um produto é adicionado THEN o sistema SHALL mostrar feedback visual de sucesso
4. WHEN o carrinho é atualizado THEN o sistema SHALL persistir os dados localmente

### Requirement 2

**User Story:** Como consumidor, eu quero visualizar os itens do meu carrinho, para que eu possa revisar minha seleção antes de finalizar.

#### Acceptance Criteria

1. WHEN um consumidor acessa o carrinho THEN o sistema SHALL mostrar todos os itens adicionados
2. WHEN há itens no carrinho THEN o sistema SHALL mostrar nome, preço, quantidade e subtotal de cada item
3. WHEN há itens no carrinho THEN o sistema SHALL mostrar o valor total do pedido
4. WHEN o carrinho está vazio THEN o sistema SHALL mostrar uma mensagem informativa

### Requirement 3

**User Story:** Como consumidor, eu quero gerenciar as quantidades dos produtos no carrinho, para que eu possa ajustar meu pedido conforme necessário.

#### Acceptance Criteria

1. WHEN um consumidor quer aumentar quantidade THEN o sistema SHALL permitir incrementar via botão +
2. WHEN um consumidor quer diminuir quantidade THEN o sistema SHALL permitir decrementar via botão -
3. WHEN a quantidade chega a 0 THEN o sistema SHALL remover o item do carrinho
4. WHEN quantidades são alteradas THEN o sistema SHALL recalcular totais automaticamente

### Requirement 4

**User Story:** Como consumidor, eu quero finalizar meu pedido, para que eu possa receber os produtos solicitados.

#### Acceptance Criteria

1. WHEN um consumidor clica em "Finalizar Pedido" THEN o sistema SHALL abrir um modal de checkout
2. WHEN no checkout THEN o sistema SHALL solicitar endereço de entrega e forma de pagamento
3. WHEN dados são válidos THEN o sistema SHALL criar o pedido no banco de dados
4. WHEN pedido é criado THEN o sistema SHALL limpar o carrinho e mostrar confirmação

### Requirement 5

**User Story:** Como desenvolvedor, eu quero que o carrinho seja persistente, para que os itens não sejam perdidos ao navegar entre páginas.

#### Acceptance Criteria

1. WHEN um consumidor adiciona itens THEN o sistema SHALL salvar no localStorage
2. WHEN um consumidor recarrega a página THEN o sistema SHALL restaurar itens do localStorage
3. WHEN um consumidor faz logout THEN o sistema SHALL limpar o carrinho
4. WHEN um pedido é finalizado THEN o sistema SHALL limpar o carrinho