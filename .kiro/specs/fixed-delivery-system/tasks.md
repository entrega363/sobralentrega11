# Implementation Plan

- [ ] 1. Criar estrutura de banco de dados para entregadores fixos
  - Criar migration com tabelas empresa_entregador_fixo e entregador_status_historico
  - Adicionar coluna status_disponibilidade na tabela profiles
  - Implementar índices para otimização de consultas
  - _Requirements: 5.1, 5.2, 5.3_

- [ ] 2. Implementar modelos de dados TypeScript
  - Criar interfaces para EmpresaEntregadorFixo, EntregadorStatus e StatusHistorico
  - Definir tipos para StatusDisponibilidade
  - Implementar validações de transição de status
  - _Requirements: 2.3, 3.1, 3.2_

- [ ] 3. Criar API endpoints para gerenciamento de convites
  - Implementar POST /api/empresa/entregadores-fixos/convite para enviar convites
  - Implementar GET /api/entregador/convites para listar convites pendentes
  - Implementar POST /api/entregador/convites/[id]/resposta para aceitar/recusar
  - Adicionar validações e tratamento de erros
  - _Requirements: 1.3, 1.4, 2.1, 2.2, 2.3, 2.4_

- [ ] 4. Implementar API endpoints para gerenciamento de status
  - Implementar PUT /api/entregador/status-disponibilidade para mudança de status
  - Implementar GET /api/entregador/status-atual para consultar status
  - Implementar GET /api/empresa/entregadores-fixos para listar entregadores da empresa
  - Adicionar lógica de transições válidas de status
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 4.1, 4.2_

- [x] 5. Criar componente de convite de entregador para empresa


  - Implementar modal ConviteEntregadorModal com lista de entregadores disponíveis
  - Adicionar filtros por distância, avaliação e disponibilidade
  - Implementar envio de convite com feedback visual
  - Adicionar validações no frontend
  - _Requirements: 1.1, 1.2, 1.3_


- [ ] 6. Implementar painel de entregadores fixos da empresa
  - Criar página /empresa/entregadores-fixos com lista de entregadores vinculados
  - Adicionar botão "Adicionar Entregador Fixo" que abre o modal
  - Mostrar status em tempo real, histórico e métricas de cada entregador
  - Implementar opção de desvincular entregador
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 7. Criar componente de gerenciamento de status do entregador
  - Implementar componente StatusDisponibilidade com controles de mudança
  - Adicionar visualização de empresa vinculada (se houver)
  - Implementar transições de status com confirmação
  - Mostrar opções disponíveis baseadas no status atual
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ] 8. Implementar painel de convites do entregador
  - Criar seção para visualizar convites pendentes
  - Mostrar detalhes da empresa (nome, avaliação, localização)
  - Implementar botões de aceitar/recusar com confirmação
  - Adicionar histórico de convites respondidos
  - _Requirements: 2.1, 2.2, 2.3, 2.4_- [
 ] 9. Implementar sistema de notificações para convites
  - Criar componente ConviteNotification para notificar entregadores
  - Implementar notificações em tempo real via WebSocket/Server-Sent Events
  - Adicionar notificações para empresas sobre respostas aos convites
  - Integrar com sistema de notificações existente
  - _Requirements: 1.4, 2.1, 2.4_

- [ ] 10. Modificar sistema de distribuição de pedidos
  - Atualizar lógica de atribuição para priorizar entregadores fixos
  - Implementar fallback para pool geral quando não há entregadores fixos disponíveis
  - Respeitar status de disponibilidade na distribuição
  - Adicionar logs para auditoria de distribuição
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 11. Criar hooks personalizados para gerenciamento de estado
  - Implementar useEntregadoresFixos para empresas
  - Implementar useStatusDisponibilidade para entregadores
  - Implementar useConvites para gerenciar convites pendentes
  - Adicionar cache e sincronização em tempo real
  - _Requirements: 1.1, 2.1, 3.1, 4.1_

- [ ] 12. Implementar painel administrativo para monitoramento
  - Criar página /admin/entregadores-fixos com visão geral do sistema
  - Mostrar estatísticas de vínculos ativos, pendentes e histórico
  - Implementar ferramentas para resolver conflitos e desfazer vínculos
  - Adicionar relatórios de performance de entregadores fixos vs pool geral
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ] 13. Adicionar validações e políticas RLS no Supabase
  - Implementar políticas de segurança para tabela empresa_entregador_fixo
  - Adicionar validações de integridade referencial
  - Implementar triggers para auditoria de mudanças
  - Configurar permissões por role (empresa, entregador, admin)
  - _Requirements: 1.3, 2.3, 4.3, 6.2_

- [ ] 14. Implementar testes unitários para componentes
  - Criar testes para ConviteEntregadorModal
  - Criar testes para StatusDisponibilidade
  - Criar testes para hooks personalizados
  - Testar validações e transições de status
  - _Requirements: 1.1, 2.1, 3.1_

- [ ] 15. Implementar testes de integração para APIs
  - Testar fluxo completo de convite (envio → recebimento → resposta)
  - Testar mudanças de status e suas consequências
  - Testar sistema de distribuição com entregadores fixos
  - Verificar notificações em tempo real
  - _Requirements: 1.3, 2.3, 3.2, 5.1_

- [ ] 16. Adicionar documentação e ajuda contextual
  - Criar tooltips explicativos para status de disponibilidade
  - Adicionar guia de primeiros passos para empresas
  - Documentar fluxo de trabalho para entregadores
  - Criar FAQ sobre sistema de entregadores fixos
  - _Requirements: 1.1, 2.1, 3.1_

- [ ] 17. Implementar métricas e analytics
  - Adicionar tracking de eventos de convites e vínculos
  - Implementar métricas de performance de entregadores fixos
  - Criar dashboards com KPIs do sistema
  - Adicionar alertas para problemas de disponibilidade
  - _Requirements: 4.2, 6.3_

- [ ] 18. Integrar com sistema de avaliações existente
  - Modificar sistema de avaliações para considerar vínculos fixos
  - Implementar avaliações específicas empresa-entregador
  - Adicionar métricas de satisfação para vínculos
  - Criar relatórios de performance por vínculo
  - _Requirements: 4.2, 6.3_