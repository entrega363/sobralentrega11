# Setup do Supabase

Este diretório contém todas as configurações e migrações do banco de dados Supabase.

## 🚀 Configuração Inicial

### 1. Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Crie uma nova conta ou faça login
3. Clique em "New Project"
4. Escolha sua organização
5. Configure:
   - **Name**: Sistema Entrega Sobral
   - **Database Password**: (anote esta senha)
   - **Region**: South America (São Paulo) - sa-east-1
6. Clique em "Create new project"

### 2. Configurar Variáveis de Ambiente

Após criar o projeto, copie as credenciais:

1. Vá em **Settings** → **API**
2. Copie:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY`

3. Crie o arquivo `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role
```

### 3. Executar Migrações

Execute as migrações na ordem correta:

```bash
# 1. Schema inicial
# Copie e execute o conteúdo de migrations/001_initial_schema.sql no SQL Editor

# 2. Políticas RLS
# Copie e execute o conteúdo de migrations/002_rls_policies.sql no SQL Editor

# 3. Funções e Triggers
# Copie e execute o conteúdo de migrations/003_functions_triggers.sql no SQL Editor

# 4. Dados iniciais (opcional)
# Copie e execute o conteúdo de migrations/004_seed_data.sql no SQL Editor
```

### 4. Configurar Autenticação

1. Vá em **Authentication** → **Settings**
2. Configure:
   - **Site URL**: `http://localhost:3000` (desenvolvimento)
   - **Redirect URLs**: `http://localhost:3000/auth/callback`
3. Em **Auth Providers**, mantenha apenas **Email** habilitado

### 5. Configurar Storage (Opcional)

Para upload de imagens:

1. Vá em **Storage**
2. Crie um bucket chamado `produtos`
3. Configure as políticas de acesso

### 6. Gerar Tipos TypeScript

```bash
npm run db:generate-types
```

## 📊 Estrutura do Banco

### Tabelas Principais

- **profiles**: Perfis de usuário (extends auth.users)
- **empresas**: Dados das empresas
- **entregadores**: Dados dos entregadores  
- **consumidores**: Dados dos consumidores
- **produtos**: Produtos das empresas
- **pedidos**: Pedidos realizados
- **pedido_itens**: Itens dos pedidos
- **avaliacoes**: Avaliações dos pedidos

### Relacionamentos

```
auth.users (1) → (1) profiles
profiles (1) → (1) empresas/entregadores/consumidores
empresas (1) → (N) produtos
consumidores (1) → (N) pedidos
pedidos (1) → (N) pedido_itens
produtos (1) → (N) pedido_itens
pedidos (1) → (1) avaliacoes
```

### Políticas RLS

Todas as tabelas têm Row Level Security habilitado:

- **Empresas**: Só podem ver/editar seus próprios dados
- **Produtos**: Empresas gerenciam seus produtos, público vê disponíveis
- **Pedidos**: Consumidores veem seus pedidos, empresas veem pedidos com seus produtos
- **Admin**: Acesso total a todos os dados

## 🔧 Comandos Úteis

```bash
# Gerar tipos TypeScript
npm run db:generate-types

# Reset do banco (cuidado!)
npm run db:reset

# Aplicar migrações
npm run db:migrate
```

## 🚨 Troubleshooting

### Erro de Conexão
- Verifique se as variáveis de ambiente estão corretas
- Confirme se o projeto Supabase está ativo

### Erro de Permissão
- Verifique se as políticas RLS estão configuradas
- Confirme se o usuário tem o role correto

### Tipos não Atualizados
- Execute `npm run db:generate-types`
- Reinicie o servidor de desenvolvimento

## 📚 Recursos

- [Documentação Supabase](https://supabase.com/docs)
- [Supabase CLI](https://supabase.com/docs/guides/cli)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)