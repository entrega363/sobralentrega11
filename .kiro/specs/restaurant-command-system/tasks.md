# Implementation Plan

- [x] 1. Criar estrutura de banco de dados para sistema de comanda local


  - Criar migration com tabela garcons, extensões na tabela pedidos e tabela garcon_atividades
  - Adicionar índices para otimização de consultas
  - Implementar constraints e validações de integridade
  - _Requirements: 1.1, 1.3, 6.2_




- [x] 2. Implementar modelos de dados TypeScript para garçons


  - Criar interfaces para Garcom, PedidoLocal e GarcomAtividade


  - Definir tipos para permissões e ações de garçom
  - Implementar validações de dados no frontend
  - _Requirements: 1.2, 2.1, 6.1_

- [x] 3. Criar sistema de autenticação específico para garçons


  - Implementar POST /api/auth/garcom/login com validação de credenciais
  - Implementar geração de JWT tokens específicos para garçons
  - Implementar GET /api/auth/garcom/me para dados do garçom autenticado
  - Implementar POST /api/auth/garcom/logout com registro de atividade
  - _Requirements: 2.1, 2.2, 2.3, 6.2_



- [ ] 4. Implementar APIs para gerenciamento de garçons pela empresa
  - Implementar GET /api/empresa/garcons para listar garçons
  - Implementar POST /api/empresa/garcons para cadastrar novo garçom
  - Implementar PUT /api/empresa/garcons/[id] para editar garçom
  - Implementar DELETE /api/empresa/garcons/[id] para desativar garçom
  - _Requirements: 1.1, 1.2, 1.4, 6.3_

- [x] 5. Criar painel de gerenciamento de garçons para empresa



  - Implementar página /empresa/garcons com lista de garçons
  - Adicionar botão "Adicionar Garçom" que abre modal de cadastro


  - Mostrar status (ativo/inativo), última atividade e métricas básicas
  - Implementar ações de editar, desativar e visualizar atividades








  - _Requirements: 1.1, 1.2, 1.4, 6.4_

- [ ] 6. Implementar modal de cadastro/edição de garçom
  - Criar componente GarcomFormModal com formulário completo


  - Implementar validações de usuário único e senha segura
  - Adicionar controles de permissões (criar, editar, cancelar pedidos)
  - Implementar feedback visual para sucesso/erro
  - _Requirements: 1.2, 1.3, 6.1_

- [ ] 7. Criar tela de login específica para garçons
  - Implementar página /comanda/login com formulário de autenticação
  - Adicionar validações no frontend e mensagens de erro específicas
  - Implementar redirecionamento para painel de comanda após login
  - Adicionar design diferenciado do login principal
  - _Requirements: 2.1, 2.2, 2.3_

- [x] 8. Implementar painel de comanda para garçons


  - Criar página /comanda/dashboard com visão geral dos pedidos do garçom
  - Mostrar nome do garçom, empresa e botão de logout
  - Exibir lista de pedidos ativos com status em tempo real
  - Adicionar botão "Novo Pedido" e notificações de pedidos prontos
  - _Requirements: 2.4, 4.1, 4.2, 4.3_



- [x] 9. Criar APIs para pedidos locais
  - Implementar POST /api/comanda/pedidos para criar pedido local
  - Implementar GET /api/comanda/pedidos para listar pedidos do garçom
  - Implementar PUT /api/comanda/pedidos/[id] para editar/cancelar pedidos



  - Implementar GET /api/comanda/produtos para produtos da empresa
  - _Requirements: 3.1, 3.3, 3.4, 4.1, 4.4_

- [ ] 10. Implementar componente de criação de pedido local
  - Criar componente NovoPedidoLocal com seleção de produtos
  - Implementar carrinho com quantidades e observações por item
  - Adicionar campos para mesa e dados do cliente (opcional)
  - Implementar cálculo de total e confirmação do pedido
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ] 11. Integrar pedidos locais com painel geral da empresa
  - Modificar painel de pedidos da empresa para incluir pedidos locais
  - Adicionar identificação visual de pedidos locais (garçom, mesa)
  - Implementar filtros para separar pedidos delivery e locais
  - Sincronizar status em tempo real entre garçom e empresa
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 12. Implementar sistema de permissões e validações
  - Criar middleware para validar permissões de garçom nas APIs
  - Implementar controle de acesso baseado em permissões configuradas
  - Adicionar validações de integridade para pedidos locais
  - Implementar rate limiting específico para garçons
  - _Requirements: 6.1, 6.3_




- [ ] 13. Criar sistema de logs e auditoria
  - Implementar registro automático de atividades dos garçons
  - Criar logs para login, logout, criação e edição de pedidos
  - Implementar API para consultar histórico de atividades
  - Adicionar componente para visualizar logs no painel da empresa
  - _Requirements: 6.2, 6.4_

- [ ] 14. Implementar notificações em tempo real
  - Integrar pedidos locais com sistema de notificações existente
  - Implementar notificações para garçom quando pedido fica pronto
  - Adicionar notificações para empresa sobre novos pedidos locais
  - Implementar WebSocket/SSE para atualizações em tempo real
  - _Requirements: 4.2, 4.3, 5.2_

- [ ] 15. Criar relatórios de performance por garçom
  - Implementar API para métricas de garçom (pedidos, vendas, tempo médio)
  - Criar componente de relatórios no painel da empresa
  - Adicionar gráficos de performance por período
  - Implementar exportação de relatórios detalhados
  - _Requirements: 6.4_

- [ ] 16. Implementar middleware de autenticação para rotas de comanda
  - Criar middleware específico para validar tokens de garçom
  - Implementar proteção de rotas /comanda/* 
  - Adicionar verificação de empresa ativa e garçom ativo
  - Implementar renovação automática de tokens
  - _Requirements: 2.2, 2.4, 6.1_

- [ ] 17. Adicionar validações e políticas RLS no Supabase
  - Implementar políticas de segurança para tabela garcons
  - Adicionar RLS para pedidos locais (apenas garçom criador e empresa)
  - Implementar triggers para auditoria automática
  - Configurar permissões específicas por role
  - _Requirements: 1.3, 6.1, 6.2_

- [ ] 18. Implementar testes unitários e de integração
  - Criar testes para autenticação de garçom
  - Testar CRUD de garçons com validações
  - Testar criação e gerenciamento de pedidos locais
  - Testar integração com sistema de pedidos existente
  - _Requirements: 2.1, 3.1, 4.1, 5.1_

- [ ] 19. Adicionar componente de gestão de mesas (opcional)
  - Criar sistema simples de numeração de mesas
  - Implementar validação de mesa disponível
  - Adicionar visualização de ocupação de mesas
  - Integrar com criação de pedidos locais
  - _Requirements: 3.3_

- [ ] 20. Implementar funcionalidades de segurança avançadas
  - Adicionar logout automático por inatividade
  - Implementar bloqueio temporário após tentativas de login falhadas
  - Criar sistema de recuperação de senha para garçons
  - Adicionar logs de segurança e alertas para atividades suspeitas
  - _Requirements: 2.4, 6.2, 6.3_