# Requirements Document

## Introduction

Este documento define os requisitos para um sistema de entregadores fixos que permite às empresas convidar entregadores para trabalhar exclusivamente para elas. O sistema gerencia o status de disponibilidade dos entregadores, permitindo que eles escolham entre trabalhar para uma empresa específica ou permanecer disponíveis no pool geral do sistema.

## Requirements

### Requirement 1

**User Story:** Como empresa, eu quero poder convidar entregadores para serem meus entregadores fixos, para que eu possa ter uma equipe dedicada e confiável de entrega.

#### Acceptance Criteria

1. WHEN uma empresa acessa o painel de entregadores THEN o sistema SHALL exibir um botão "Adicionar Entregador Fixo"
2. WHEN a empresa clica em "Adicionar Entregador Fixo" THEN o sistema SHALL exibir uma lista de entregadores disponíveis para convite
3. WHEN a empresa seleciona um entregador e envia o convite THEN o sistema SHALL criar uma solicitação de vínculo pendente
4. WHEN um convite é enviado THEN o sistema SHALL notificar o entregador sobre a solicitação

### Requirement 2

**User Story:** Como entregador, eu quero receber e responder convites de empresas para me tornar entregador fixo, para que eu possa escolher trabalhar exclusivamente para uma empresa se desejar.

#### Acceptance Criteria

1. WHEN um entregador recebe um convite de empresa THEN o sistema SHALL exibir uma notificação no painel do entregador
2. WHEN o entregador visualiza o convite THEN o sistema SHALL mostrar detalhes da empresa e opções "Aceitar" ou "Recusar"
3. WHEN o entregador aceita o convite THEN o sistema SHALL estabelecer o vínculo fixo e alterar seu status para "indisponível para sistema geral"
4. WHEN o entregador recusa o convite THEN o sistema SHALL manter seu status atual e notificar a empresa

### Requirement 3

**User Story:** Como entregador fixo, eu quero poder gerenciar minha disponibilidade para a empresa e para o sistema geral, para que eu tenha controle sobre quando trabalho.

#### Acceptance Criteria

1. WHEN um entregador está vinculado a uma empresa THEN o sistema SHALL exibir opções de status: "Disponível para empresa", "Indisponível para empresa"
2. WHEN o entregador fica indisponível para a empresa THEN o sistema SHALL oferecer opções: "Disponível para sistema geral" ou "Indisponível para tudo"
3. WHEN o entregador escolhe "Disponível para sistema geral" THEN o sistema SHALL incluí-lo no pool de entregadores disponíveis para todas as empresas
4. WHEN o entregador escolhe "Indisponível para tudo" THEN o sistema SHALL não oferecer o entregador para nenhuma entrega

### Requirement 4

**User Story:** Como empresa, eu quero visualizar e gerenciar meus entregadores fixos, para que eu possa acompanhar minha equipe de entrega.

#### Acceptance Criteria

1. WHEN a empresa acessa a seção de entregadores fixos THEN o sistema SHALL exibir uma lista de todos os entregadores vinculados
2. WHEN a empresa visualiza um entregador fixo THEN o sistema SHALL mostrar status atual, histórico de entregas e avaliações
3. WHEN a empresa deseja remover um entregador fixo THEN o sistema SHALL permitir desvincular o entregador
4. WHEN um entregador é desvinculado THEN o sistema SHALL retornar o entregador ao pool geral automaticamente

### Requirement 5

**User Story:** Como sistema, eu preciso gerenciar a distribuição de pedidos considerando entregadores fixos e disponíveis, para que as entregas sejam atribuídas corretamente.

#### Acceptance Criteria

1. WHEN um pedido é criado para uma empresa com entregadores fixos disponíveis THEN o sistema SHALL priorizar os entregadores fixos dessa empresa
2. WHEN não há entregadores fixos disponíveis para uma empresa THEN o sistema SHALL usar entregadores do pool geral
3. WHEN um entregador está "indisponível para tudo" THEN o sistema SHALL não oferecer nenhuma entrega para ele
4. WHEN um entregador está "disponível para sistema geral" THEN o sistema SHALL incluí-lo nas opções para todas as empresas exceto sua empresa fixa (se houver)

### Requirement 6

**User Story:** Como administrador do sistema, eu quero monitorar e gerenciar os vínculos entre empresas e entregadores, para que eu possa resolver conflitos e manter o sistema funcionando adequadamente.

#### Acceptance Criteria

1. WHEN o administrador acessa o painel de vínculos THEN o sistema SHALL exibir todos os relacionamentos empresa-entregador
2. WHEN há conflitos ou problemas reportados THEN o sistema SHALL permitir ao administrador desfazer vínculos
3. WHEN o administrador visualiza estatísticas THEN o sistema SHALL mostrar métricas de entregadores fixos vs pool geral
4. WHEN necessário THEN o sistema SHALL permitir ao administrador forçar mudanças de status de entregadores