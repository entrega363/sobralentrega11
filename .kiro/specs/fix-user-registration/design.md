# Design Document

## Overview

O sistema de cadastro de usuários está falhando devido a problemas na cadeia de criação de perfis e registros específicos de role. A análise identificou várias causas potenciais:

1. **Trigger `handle_new_user`**: Pode estar falhando ao criar o profile inicial
2. **Políticas RLS**: Podem estar bloqueando inserções necessárias
3. **Transações assíncronas**: O processo de criação de registros específicos (empresa, entregador) pode estar falhando
4. **Validação de dados**: Campos obrigatórios podem estar ausentes ou inválidos
5. **Tratamento de erros**: Erros não estão sendo capturados e reportados adequadamente

## Architecture

### Fluxo de Cadastro Atual (Problemático)
```
1. Frontend → signUp() → Supabase Auth
2. Supabase Auth → Trigger handle_new_user() → Cria profile básico
3. Frontend → setTimeout() → Atualiza role do profile
4. Frontend → setTimeout() → Cria registro específico (empresa/entregador)
```

### Fluxo de Cadastro Proposto (Corrigido)
```
1. Frontend → signUp() → Supabase Auth
2. Supabase Auth → Trigger handle_new_user() → Cria profile com role correto
3. Frontend → Função RPC create_user_with_role() → Cria todos os registros em transação
4. Sistema → Logs detalhados → Monitoramento e diagnóstico
```

## Components and Interfaces

### 1. Database Functions
- **`handle_new_user()`**: Trigger melhorado com tratamento de erro robusto
- **`create_empresa_profile()`**: Função RPC para criar empresa em transação
- **`create_entregador_profile()`**: Função RPC para criar entregador em transação
- **`create_consumidor_profile()`**: Função RPC para criar consumidor em transação
- **`diagnose_user_creation()`**: Função para diagnóstico de problemas

### 2. API Endpoints
- **`/api/auth/signup`**: Endpoint principal de cadastro com validação robusta
- **`/api/auth/diagnose`**: Endpoint para diagnóstico de problemas
- **`/api/auth/test-signup`**: Endpoint para testes automatizados
- **`/api/auth/fix-user`**: Endpoint para correção de usuários com problemas

### 3. Frontend Components
- **`AuthProvider`**: Provider melhorado com tratamento de erro
- **`RegisterForm`**: Formulários com validação client-side robusta
- **`DiagnosticPanel`**: Painel para desenvolvedores diagnosticarem problemas

### 4. Monitoring and Logging
- **Error Logging**: Sistema de logs estruturados para rastreamento
- **Health Checks**: Verificações automáticas da integridade do sistema
- **Metrics**: Métricas de sucesso/falha dos cadastros

## Data Models

### Profile Model (Enhanced)
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  role user_role NOT NULL,
  email VARCHAR NOT NULL,
  nome VARCHAR NOT NULL,
  telefone VARCHAR,
  status VARCHAR DEFAULT 'active',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Error Log Model
```sql
CREATE TABLE user_creation_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  step VARCHAR NOT NULL,
  status VARCHAR NOT NULL, -- 'success', 'error', 'warning'
  message TEXT,
  error_details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Diagnostic Model
```sql
CREATE TABLE system_health_checks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  check_type VARCHAR NOT NULL,
  status VARCHAR NOT NULL,
  details JSONB,
  checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Error Handling

### 1. Database Level
- **Triggers com EXCEPTION handling**: Captura e loga erros sem bloquear o processo
- **Transações ACID**: Garante consistência dos dados
- **Rollback automático**: Em caso de falha parcial
- **Logs estruturados**: Para análise posterior

### 2. API Level
- **Validação de entrada**: Zod schemas rigorosos
- **Try-catch abrangente**: Captura todos os tipos de erro
- **Respostas estruturadas**: Formato consistente de erro
- **Rate limiting**: Previne ataques de força bruta

### 3. Frontend Level
- **Validação client-side**: Feedback imediato ao usuário
- **Estados de loading**: Indicadores visuais claros
- **Retry mechanism**: Tentativas automáticas em caso de falha temporária
- **Fallback UI**: Interface alternativa em caso de erro

## Testing Strategy

### 1. Unit Tests
- **Database functions**: Testes isolados de cada função
- **API endpoints**: Testes de cada rota com diferentes cenários
- **Frontend components**: Testes de interação e validação

### 2. Integration Tests
- **Fluxo completo**: Teste end-to-end do cadastro
- **Cenários de erro**: Simulação de falhas em diferentes pontos
- **Performance**: Testes de carga e stress

### 3. Manual Testing
- **Casos de uso reais**: Testes com dados reais
- **Diferentes browsers**: Compatibilidade cross-browser
- **Dispositivos móveis**: Responsividade e usabilidade

### 4. Automated Monitoring
- **Health checks**: Verificações automáticas periódicas
- **Alertas**: Notificações em caso de falhas
- **Métricas**: Dashboard de monitoramento em tempo real

## Implementation Phases

### Phase 1: Database Fixes
1. Corrigir função `handle_new_user()` com tratamento robusto de erro
2. Criar funções RPC para cada tipo de usuário
3. Implementar sistema de logs de erro
4. Atualizar políticas RLS conforme necessário

### Phase 2: API Improvements
1. Criar endpoint de cadastro robusto
2. Implementar endpoint de diagnóstico
3. Adicionar validação server-side rigorosa
4. Implementar rate limiting

### Phase 3: Frontend Enhancements
1. Melhorar tratamento de erro no AuthProvider
2. Adicionar validação client-side robusta
3. Implementar retry mechanism
4. Criar painel de diagnóstico para desenvolvedores

### Phase 4: Monitoring and Testing
1. Implementar sistema de monitoramento
2. Criar testes automatizados
3. Configurar alertas
4. Documentar procedimentos de troubleshooting

## Security Considerations

### 1. Data Validation
- **Input sanitization**: Limpeza de dados de entrada
- **SQL injection prevention**: Uso de prepared statements
- **XSS protection**: Sanitização de outputs

### 2. Access Control
- **RLS policies**: Políticas de segurança em nível de linha
- **Role-based access**: Controle baseado em roles
- **API authentication**: Validação de tokens

### 3. Privacy
- **Data encryption**: Criptografia de dados sensíveis
- **GDPR compliance**: Conformidade com regulamentações
- **Audit trails**: Rastros de auditoria

## Performance Considerations

### 1. Database Optimization
- **Índices apropriados**: Para consultas frequentes
- **Connection pooling**: Gerenciamento eficiente de conexões
- **Query optimization**: Otimização de consultas

### 2. Caching Strategy
- **Profile caching**: Cache de perfis de usuário
- **Session management**: Gerenciamento eficiente de sessões
- **CDN usage**: Para assets estáticos

### 3. Scalability
- **Horizontal scaling**: Preparação para crescimento
- **Load balancing**: Distribuição de carga
- **Monitoring**: Métricas de performance