# Implementation Plan

- [x] 1. Create base components and utilities


  - Create AdminPageLayout component for consistent page structure
  - Implement DataTable component with sorting and pagination
  - Create StatusBadge component for status display
  - Implement FilterBar component for search and filtering
  - Create ActionButtons component for table actions
  - _Requirements: 7.1, 7.2, 7.3_





- [ ] 2. Implement Empresas management page
  - [ ] 2.1 Create /admin/empresas page structure
    - Create src/app/(dashboard)/admin/empresas/page.tsx

    - Implement page layout with AdminPageLayout
    - Add loading states and error handling
    - _Requirements: 1.1, 7.1, 7.2_

  - [ ] 2.2 Implement empresas data fetching and display
    - Create useEmpresas hook for data management

    - Implement DataTable with empresa-specific columns
    - Add search functionality by name, email, CNPJ
    - Implement status filtering (aprovado, pendente, rejeitado)
    - _Requirements: 1.2, 1.3_




  - [ ] 2.3 Add empresa approval/rejection functionality
    - Implement approve and reject action buttons
    - Create confirmation modals for actions
    - Add API integration for status updates
    - Show success/error toast messages

    - _Requirements: 1.4, 1.5_

- [ ] 3. Implement Entregadores management page
  - [ ] 3.1 Create /admin/entregadores page structure
    - Create src/app/(dashboard)/admin/entregadores/page.tsx
    - Implement page layout with AdminPageLayout

    - Add loading states and error handling
    - _Requirements: 2.1, 7.1, 7.2_

  - [x] 3.2 Implement entregadores data fetching and display

    - Create useEntregadores hook for data management

    - Implement DataTable with entregador-specific columns
    - Add search functionality by name, email, CPF
    - Display entregador information (nome, email, telefone, status, documentos)
    - _Requirements: 2.2, 2.4_


  - [ ] 3.3 Add entregador approval functionality
    - Implement approve and reject action buttons
    - Create confirmation modals for actions
    - Add API integration for status updates
    - _Requirements: 2.3_


- [ ] 4. Implement Consumidores management page
  - [ ] 4.1 Create /admin/consumidores page structure
    - Create src/app/(dashboard)/admin/consumidores/page.tsx
    - Implement page layout with AdminPageLayout

    - Add loading states and error handling

    - _Requirements: 3.1, 7.1, 7.2_

  - [ ] 4.2 Implement consumidores data fetching and display
    - Create useConsumidores hook for data management
    - Implement DataTable with consumidor-specific columns

    - Display consumidor information (nome, email, telefone, endereços, histórico)
    - Add search functionality by name, email, telefone
    - _Requirements: 3.2, 3.3_

  - [ ] 4.3 Add consumidor management functionality
    - Implement activate/deactivate action buttons

    - Create modal for viewing consumidor details and order history
    - Add API integration for status updates
    - _Requirements: 3.4_


- [x] 5. Implement Pedidos management page

  - [ ] 5.1 Create /admin/pedidos page structure
    - Create src/app/(dashboard)/admin/pedidos/page.tsx
    - Implement page layout with AdminPageLayout
    - Add loading states and error handling
    - _Requirements: 4.1, 7.1, 7.2_


  - [ ] 5.2 Implement pedidos data fetching and display
    - Create usePedidos hook for data management
    - Implement DataTable with pedido-specific columns
    - Display pedido information (cliente, empresa, entregador, status, valor, data)
    - Add comprehensive filtering by status, date, empresa, entregador

    - _Requirements: 4.2, 4.3, 4.4_

  - [ ] 5.3 Add pedido management functionality
    - Implement status change functionality for problem cases


    - Create modal for viewing complete pedido details

    - Add search functionality by pedido ID or cliente name
    - _Requirements: 4.5_

- [ ] 6. Implement Relatórios page
  - [x] 6.1 Create /admin/relatorios page structure

    - Create src/app/(dashboard)/admin/relatorios/page.tsx
    - Implement page layout with AdminPageLayout
    - Add loading states and error handling
    - _Requirements: 5.1, 7.1, 7.2_

  - [x] 6.2 Implement metrics and charts display

    - Create StatsCards component for key metrics
    - Implement charts for pedidos, receita, empresas ativas, entregadores ativos
    - Add date range filtering functionality












    - Display comprehensive system statistics
    - _Requirements: 5.2, 5.3, 5.4_


  - [x] 6.3 Add report export functionality

    - Implement PDF export functionality
    - Implement Excel export functionality
    - Add export buttons with loading states
    - _Requirements: 5.5_



- [ ] 7. Implement Configurações page
  - [ ] 7.1 Create /admin/configuracoes page structure
    - Create src/app/(dashboard)/admin/configuracoes/page.tsx
    - Implement page layout with AdminPageLayout


    - Add loading states and error handling
    - _Requirements: 6.1, 7.1, 7.2_

  - [ ] 7.2 Implement system configuration form
    - Create form for global system settings


    - Implement taxa de entrega configuration
    - Add comissões configuration by category
    - Implement other global system settings
    - _Requirements: 6.2, 6.4_

  - [x] 7.3 Add configuration save functionality

    - Implement form validation and submission
    - Add API integration for saving configurations
    - Show confirmation message after successful save
    - _Requirements: 6.3, 6.5_

- [ ] 8. Create supporting API endpoints
  - [ ] 8.1 Implement admin empresas API endpoints
    - Create GET /api/admin/empresas endpoint
    - Create PUT /api/admin/empresas/[id]/status endpoint
    - Add proper authentication and authorization
    - Implement error handling and validation
    - _Requirements: 1.2, 1.4, 1.5_

  - [ ] 8.2 Implement admin entregadores API endpoints
    - Create GET /api/admin/entregadores endpoint
    - Create PUT /api/admin/entregadores/[id]/status endpoint
    - Add proper authentication and authorization
    - _Requirements: 2.2, 2.3_

  - [ ] 8.3 Implement admin consumidores API endpoints
    - Create GET /api/admin/consumidores endpoint
    - Create PUT /api/admin/consumidores/[id]/status endpoint
    - Add proper authentication and authorization
    - _Requirements: 3.2, 3.4_

  - [ ] 8.4 Implement admin pedidos API endpoints
    - Create GET /api/admin/pedidos endpoint
    - Create PUT /api/admin/pedidos/[id]/status endpoint
    - Add filtering and search capabilities
    - _Requirements: 4.2, 4.4, 4.5_

  - [ ] 8.5 Implement admin relatórios API endpoints
    - Create GET /api/admin/relatorios endpoint
    - Implement data aggregation for metrics
    - Add date range filtering
    - Create export functionality endpoints
    - _Requirements: 5.2, 5.3, 5.4, 5.5_

  - [ ] 8.6 Implement admin configurações API endpoints
    - Create GET /api/admin/configuracoes endpoint
    - Create PUT /api/admin/configuracoes endpoint
    - Add validation for configuration values
    - _Requirements: 6.2, 6.3, 6.4_

- [ ] 9. Add comprehensive error handling and security
  - [ ] 9.1 Implement role-based access control
    - Add admin role verification to all pages
    - Create middleware for protecting admin routes
    - Implement permission validation in API endpoints
    - Add rate limiting for administrative actions
    - _Requirements: 7.4_

  - [ ] 9.2 Add comprehensive error handling
    - Implement loading skeletons for all data tables
    - Add error boundaries for component error handling
    - Create user-friendly error messages
    - Add retry mechanisms for failed requests
    - _Requirements: 7.2, 7.3_

  - [ ] 9.3 Implement direct URL access handling
    - Ensure all pages work when accessed directly via URL
    - Add proper loading states for direct access
    - Implement proper authentication checks
    - _Requirements: 7.5_

- [ ] 10. Add responsive design and performance optimizations
  - [ ] 10.1 Implement responsive design
    - Make all DataTables responsive with horizontal scroll
    - Adapt modals for mobile screens
    - Implement collapsible navigation for mobile
    - Test all pages on different screen sizes
    - _Requirements: 7.1_

  - [ ] 10.2 Add performance optimizations
    - Implement server-side pagination for large datasets
    - Add React Query caching for data fetching
    - Implement lazy loading for heavy components
    - Optimize images and assets
    - _Requirements: 7.1, 7.2_

- [ ] 11. Write comprehensive tests
  - [ ] 11.1 Write unit tests for components
    - Test DataTable component with different data sets
    - Test StatusBadge component with all status types
    - Test FilterBar component functionality
    - Test all custom hooks for data management
    - _Requirements: 7.1, 7.2_

  - [ ] 11.2 Write integration tests
    - Test complete empresa approval flow
    - Test navigation between admin pages
    - Test filtering and search functionality
    - Test API integration with error scenarios
    - _Requirements: 1.4, 1.5, 2.3, 3.4, 4.5_

  - [ ] 11.3 Write end-to-end tests
    - Test admin login and navigation to all pages
    - Test administrative actions (approve, reject, status changes)
    - Test responsive behavior on different devices
    - Test direct URL access for all pages
    - _Requirements: 7.4, 7.5_