# Requirements Document

## Introduction

Este documento define os requisitos para um sistema de comanda local que permite às empresas (restaurantes) gerenciar garçons com login próprio, criar pedidos internos no estabelecimento e controlar o fluxo de atendimento presencial. O sistema funciona como uma extensão do painel da empresa para atendimento local.

## Requirements

### Requirement 1

**User Story:** Como empresa/restaurante, eu quero cadastrar e gerenciar garçons com usuário e senha, para que eles possam acessar o sistema de comanda local de forma segura.

#### Acceptance Criteria

1. WHEN a empresa acessa o painel de garçons THEN o sistema SHALL exibir lista de garçons cadastrados
2. WHEN a empresa clica em "Adicionar Garçom" THEN o sistema SHALL abrir formulário com nome, usuário, senha e permissões
3. WHEN um garçom é cadastrado THEN o sistema SHALL criar credenciais de acesso exclusivas para comanda local
4. WHEN necessário THEN o sistema SHALL permitir editar, desativar ou remover garçons

### Requirement 2

**User Story:** Como garçom, eu quero fazer login no sistema de comanda local, para que eu possa criar e gerenciar pedidos dos clientes presenciais.

#### Acceptance Criteria

1. WHEN o garçom acessa a tela de login THEN o sistema SHALL solicitar usuário e senha específicos
2. WHEN as credenciais são válidas THEN o sistema SHALL dar acesso ao painel de comanda local
3. WHEN o login é bem-sucedido THEN o sistema SHALL mostrar nome do garçom e empresa logada
4. WHEN há inatividade THEN o sistema SHALL fazer logout automático por segurança

### Requirement 3

**User Story:** Como garçom, eu quero criar pedidos locais selecionando produtos e mesa, para que eu possa registrar os pedidos dos clientes presenciais no sistema.

#### Acceptance Criteria

1. WHEN o garçom acessa "Novo Pedido" THEN o sistema SHALL mostrar lista de produtos disponíveis da empresa
2. WHEN o garçom seleciona produtos THEN o sistema SHALL permitir definir quantidades e observações
3. WHEN o garçom finaliza seleção THEN o sistema SHALL solicitar número da mesa e dados do cliente (opcional)
4. WHEN o pedido é confirmado THEN o sistema SHALL gerar número único e enviar para cozinha

### Requirement 4

**User Story:** Como garçom, eu quero visualizar e gerenciar meus pedidos ativos, para que eu possa acompanhar o status e atender os clientes adequadamente.

#### Acceptance Criteria

1. WHEN o garçom acessa "Meus Pedidos" THEN o sistema SHALL mostrar todos os pedidos criados por ele
2. WHEN um pedido muda de status THEN o sistema SHALL atualizar em tempo real na tela do garçom
3. WHEN um pedido fica pronto THEN o sistema SHALL notificar o garçom responsável
4. WHEN necessário THEN o sistema SHALL permitir ao garçom adicionar observações ou cancelar pedidos

### Requirement 5

**User Story:** Como empresa, eu quero visualizar todos os pedidos locais junto com os de delivery, para que eu possa ter controle total do movimento do restaurante.

#### Acceptance Criteria

1. WHEN a empresa acessa o painel geral THEN o sistema SHALL mostrar pedidos delivery e locais juntos
2. WHEN visualiza um pedido local THEN o sistema SHALL identificar o garçom responsável e mesa
3. WHEN há pedidos locais pendentes THEN o sistema SHALL destacá-los na interface da cozinha
4. WHEN necessário THEN o sistema SHALL permitir filtrar apenas pedidos locais ou delivery

### Requirement 6

**User Story:** Como empresa, eu quero controlar permissões e monitorar atividade dos garçons, para que eu possa manter segurança e qualidade do atendimento.

#### Acceptance Criteria

1. WHEN a empresa define permissões THEN o sistema SHALL controlar quais garçons podem criar, editar ou cancelar pedidos
2. WHEN um garçom faz ações THEN o sistema SHALL registrar logs de atividade com timestamp
3. WHEN há problemas THEN o sistema SHALL permitir à empresa desativar temporariamente um garçom
4. WHEN solicitado THEN o sistema SHALL gerar relatórios de performance por garçom (pedidos, vendas, tempo médio)