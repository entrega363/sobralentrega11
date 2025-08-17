# Sistema Entrega Sobral - DocumentaÃ§Ã£o Completa

## ðŸ“‹ Ãndice

1. [VisÃ£o Geral](#visÃ£o-geral)
2. [Arquitetura do Sistema](#arquitetura-do-sistema)
3. [Tecnologias Utilizadas](#tecnologias-utilizadas)
4. [Estrutura do Projeto](#estrutura-do-projeto)
5. [Funcionalidades por MÃ³dulo](#funcionalidades-por-mÃ³dulo)
6. [Banco de Dados](#banco-de-dados)
7. [API e Endpoints](#api-e-endpoints)
8. [AutenticaÃ§Ã£o e AutorizaÃ§Ã£o](#autenticaÃ§Ã£o-e-autorizaÃ§Ã£o)
9. [Interface do UsuÃ¡rio](#interface-do-usuÃ¡rio)
10. [Deploy e ConfiguraÃ§Ã£o](#deploy-e-configuraÃ§Ã£o)

---

## ðŸŽ¯ VisÃ£o Geral

O **Sistema Entrega Sobral** Ã© uma plataforma completa de delivery desenvolvida especificamente para a cidade de Sobral - CE. O sistema conecta empresas, entregadores e consumidores em um marketplace integrado, oferecendo uma experiÃªncia completa de pedidos online.

### Objetivos Principais

- **DigitalizaÃ§Ã£o do ComÃ©rcio Local**: Permitir que empresas locais vendam online
- **GeraÃ§Ã£o de Renda**: Criar oportunidades para entregadores autÃ´nomos
- **ConveniÃªncia**: Facilitar pedidos para consumidores
- **GestÃ£o Centralizada**: Fornecer ferramentas administrativas completas

### CaracterÃ­sticas Principais

- **Multi-tenant**: Suporte a mÃºltiplas empresas
- **Real-time**: AtualizaÃ§Ãµes em tempo real via WebSockets
- **PWA**: Funciona como aplicativo mÃ³vel
- **Responsivo**: Interface adaptÃ¡vel a todos os dispositivos
- **EscalÃ¡vel**: Arquitetura preparada para crescimento

---

## ðŸ—ï¸ Arquitetura do Sistema

### Arquitetura Geral

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚   Frontend      â”‚    â”‚   Backend       â”‚    â”‚   Database      â”‚
â”‚   (Next.js)     â”‚â—„â”€â”€â–ºâ”‚   (Supabase)    â”‚â—„â”€â”€â–ºâ”‚  (PostgreSQL)   â”‚
â”‚                 â”‚    â”‚                 â”‚    â”‚                 â”‚
â”‚ - React 18      â”‚    â”‚ - Auth          â”‚    â”‚ - Tables        â”‚
â”‚ - TypeScript    â”‚    â”‚ - Real-time     â”‚    â”‚ - Functions     â”‚
â”‚ - Tailwind CSS  â”‚    â”‚ - Storage       â”‚    â”‚ - Triggers      â”‚
â”‚ - Zustand       â”‚    â”‚ - Edge Funcs    â”‚    â”‚ - RLS Policies  â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### Fluxo de Dados

1. **Cliente** â†’ Interface Next.js
2. **Interface** â†’ Supabase Client
3. **Supabase** â†’ PostgreSQL Database
4. **Real-time** â†’ WebSocket Updates
5. **Storage** â†’ File Management

### PadrÃµes Arquiteturais

- **Component-Based**: Componentes reutilizÃ¡veis
- **State Management**: Zustand para estado global
- **Server Components**: Next.js App Router
- **API Routes**: Endpoints customizados
- **Middleware**: ProteÃ§Ã£o de rotas
## ðŸ› ï¸ Tecnologias Utilizadas

### Frontend
- **Next.js 15**: Framework React com App Router
- **React 18**: Biblioteca de interface
- **TypeScript**: Tipagem estÃ¡tica
- **Tailwind CSS**: Framework CSS utilitÃ¡rio
- **Radix UI**: Componentes acessÃ­veis
- **shadcn/ui**: Sistema de design
- **Lucide React**: Ãcones
- **React Hook Form**: Gerenciamento de formulÃ¡rios
- **Zod**: ValidaÃ§Ã£o de esquemas
- **Zustand**: Gerenciamento de estado
- **React Query**: Cache e sincronizaÃ§Ã£o de dados

### Backend
- **Supabase**: Backend-as-a-Service
- **PostgreSQL**: Banco de dados relacional
- **Row Level Security**: SeguranÃ§a em nÃ­vel de linha
- **Real-time Subscriptions**: AtualizaÃ§Ãµes em tempo real
- **Edge Functions**: FunÃ§Ãµes serverless
- **Supabase Auth**: Sistema de autenticaÃ§Ã£o
- **Supabase Storage**: Armazenamento de arquivos

### DevOps e Deploy
- **Vercel**: Plataforma de deploy
- **GitHub Actions**: CI/CD (futuro)
- **ESLint**: Linting de cÃ³digo
- **Prettier**: FormataÃ§Ã£o de cÃ³digo
- **TypeScript**: VerificaÃ§Ã£o de tipos

### Ferramentas de Desenvolvimento
- **VS Code**: Editor recomendado
- **Supabase CLI**: Gerenciamento local
- **Postman**: Testes de API
- **Chrome DevTools**: Debug e performance

---

## ðŸ“ Estrutura do Projeto

```
sistema-entrega-sobral/
â”œâ”€â”€ public/                     # Arquivos estÃ¡ticos
â”‚   â”œâ”€â”€ icons/                 # Ãcones da aplicaÃ§Ã£o
â”‚   â”œâ”€â”€ images/                # Imagens
â”‚   â”œâ”€â”€ manifest.json          # PWA manifest
â”‚   â””â”€â”€ sw.js                  # Service Worker
â”œâ”€â”€ src/
â”‚   â”œâ”€â”€ app/                   # App Router (Next.js 13+)
â”‚   â”‚   â”œâ”€â”€ (auth)/           # Grupo de rotas de autenticaÃ§Ã£o
â”‚   â”‚   â”‚   â”œâ”€â”€ login/        # PÃ¡gina de login
â”‚   â”‚   â”‚   â”œâ”€â”€ register/     # PÃ¡gina de registro
â”‚   â”‚   â”‚   â””â”€â”€ layout.tsx    # Layout das pÃ¡ginas de auth
â”‚   â”‚   â”œâ”€â”€ (dashboard)/      # Grupo de rotas do dashboard
â”‚   â”‚   â”‚   â”œâ”€â”€ admin/        # PÃ¡ginas do administrador
â”‚   â”‚   â”‚   â”œâ”€â”€ empresa/      # PÃ¡ginas da empresa
â”‚   â”‚   â”‚   â”œâ”€â”€ entregador/   # PÃ¡ginas do entregador
â”‚   â”‚   â”‚   â”œâ”€â”€ consumidor/   # PÃ¡ginas do consumidor
â”‚   â”‚   â”‚   â””â”€â”€ layout.tsx    # Layout do dashboard
â”‚   â”‚   â”œâ”€â”€ api/              # API Routes
â”‚   â”‚   â”‚   â”œâ”€â”€ auth/         # Endpoints de autenticaÃ§Ã£o
â”‚   â”‚   â”‚   â”œâ”€â”€ admin/        # Endpoints administrativos
â”‚   â”‚   â”‚   â”œâ”€â”€ empresa/      # Endpoints de empresa
â”‚   â”‚   â”‚   â”œâ”€â”€ pedidos/      # Endpoints de pedidos
â”‚   â”‚   â”‚   â””â”€â”€ produtos/     # Endpoints de produtos
â”‚   â”‚   â”œâ”€â”€ globals.css       # Estilos globais
â”‚   â”‚   â”œâ”€â”€ layout.tsx        # Layout raiz
â”‚   â”‚   â””â”€â”€ page.tsx          # PÃ¡gina inicial
â”‚   â”œâ”€â”€ components/           # Componentes React
â”‚   â”‚   â”œâ”€â”€ ui/              # Componentes base (shadcn/ui)
â”‚   â”‚   â”œâ”€â”€ auth/            # Componentes de autenticaÃ§Ã£o
â”‚   â”‚   â”œâ”€â”€ admin/           # Componentes administrativos
â”‚   â”‚   â”œâ”€â”€ empresa/         # Componentes de empresa
â”‚   â”‚   â”œâ”€â”€ entregador/      # Componentes de entregador
â”‚   â”‚   â”œâ”€â”€ consumidor/      # Componentes de consumidor
â”‚   â”‚   â”œâ”€â”€ layout/          # Componentes de layout
â”‚   â”‚   â””â”€â”€ providers/       # Providers de contexto
â”‚   â”œâ”€â”€ hooks/               # Custom hooks
â”‚   â”œâ”€â”€ lib/                 # UtilitÃ¡rios e configuraÃ§Ãµes
â”‚   â”‚   â”œâ”€â”€ supabase/        # ConfiguraÃ§Ã£o do Supabase
â”‚   â”‚   â”œâ”€â”€ validations/     # Esquemas de validaÃ§Ã£o
â”‚   â”‚   â”œâ”€â”€ constants.ts     # Constantes da aplicaÃ§Ã£o
â”‚   â”‚   â””â”€â”€ utils.ts         # FunÃ§Ãµes utilitÃ¡rias
â”‚   â”œâ”€â”€ stores/              # Stores do Zustand
â”‚   â”œâ”€â”€ types/               # DefiniÃ§Ãµes de tipos TypeScript
â”‚   â””â”€â”€ middleware.ts        # Middleware do Next.js
â”œâ”€â”€ supabase/
â”‚   â”œâ”€â”€ migrations/          # MigraÃ§Ãµes do banco
â”‚   â”œâ”€â”€ functions/           # Edge Functions
â”‚   â””â”€â”€ config.toml          # ConfiguraÃ§Ã£o do Supabase
â”œâ”€â”€ scripts/                 # Scripts utilitÃ¡rios
â”œâ”€â”€ .env.local              # VariÃ¡veis de ambiente
â”œâ”€â”€ .env.example            # Exemplo de variÃ¡veis
â”œâ”€â”€ next.config.js          # ConfiguraÃ§Ã£o do Next.js
â”œâ”€â”€ tailwind.config.ts      # ConfiguraÃ§Ã£o do Tailwind
â”œâ”€â”€ tsconfig.json           # ConfiguraÃ§Ã£o do TypeScript
â””â”€â”€ package.json            # DependÃªncias e scripts
```
## ðŸŽ­ Funcionalidades por MÃ³dulo

### ðŸ‘¤ MÃ³dulo de AutenticaÃ§Ã£o
- **Registro de UsuÃ¡rios**: Cadastro para todos os tipos de usuÃ¡rio
- **Login/Logout**: AutenticaÃ§Ã£o segura
- **RecuperaÃ§Ã£o de Senha**: Reset via email
- **VerificaÃ§Ã£o de Email**: ConfirmaÃ§Ã£o de conta
- **ProteÃ§Ã£o de Rotas**: Middleware de autenticaÃ§Ã£o

### ðŸ¢ MÃ³dulo Empresa
#### Dashboard
- **VisÃ£o Geral**: MÃ©tricas de vendas e pedidos
- **Pedidos em Tempo Real**: NotificaÃ§Ãµes instantÃ¢neas
- **GestÃ£o de Status**: Controle do fluxo de pedidos

#### Produtos
- **Cadastro de Produtos**: Nome, descriÃ§Ã£o, preÃ§o, categoria
- **Upload de Imagens**: Fotos dos produtos
- **GestÃ£o de Estoque**: Controle de disponibilidade
- **CategorizaÃ§Ã£o**: OrganizaÃ§Ã£o por categorias

#### ConfiguraÃ§Ãµes
- **Dados da Empresa**: InformaÃ§Ãµes bÃ¡sicas
- **HorÃ¡rio de Funcionamento**: ConfiguraÃ§Ã£o de horÃ¡rios
- **Taxa de Entrega**: DefiniÃ§Ã£o de valores
- **Formas de Pagamento**: MÃ©todos aceitos

### ðŸš´ MÃ³dulo Entregador
#### Dashboard
- **Pedidos DisponÃ­veis**: Lista de entregas
- **HistÃ³rico**: Entregas realizadas
- **Ganhos**: RelatÃ³rio financeiro
- **AvaliaÃ§Ãµes**: Feedback dos clientes

#### Entregas
- **Aceitar Pedidos**: Sistema de aceite
- **Rastreamento**: GPS em tempo real
- **Status de Entrega**: AtualizaÃ§Ã£o de status
- **Comprovante**: ConfirmaÃ§Ã£o de entrega

### ðŸ›’ MÃ³dulo Consumidor
#### Marketplace
- **CatÃ¡logo de Empresas**: Lista de estabelecimentos
- **Produtos**: NavegaÃ§Ã£o por categorias
- **Busca**: Pesquisa de produtos e empresas
- **Filtros**: Por categoria, preÃ§o, avaliaÃ§Ã£o

#### Pedidos
- **Carrinho de Compras**: GestÃ£o de itens
- **Checkout**: FinalizaÃ§Ã£o de pedidos
- **Acompanhamento**: Status em tempo real
- **HistÃ³rico**: Pedidos anteriores

#### Perfil
- **Dados Pessoais**: InformaÃ§Ãµes do usuÃ¡rio
- **EndereÃ§os**: MÃºltiplos endereÃ§os de entrega
- **Favoritos**: Produtos e empresas favoritas
- **AvaliaÃ§Ãµes**: HistÃ³rico de avaliaÃ§Ãµes

### ðŸ‘¨â€ðŸ’¼ MÃ³dulo Administrativo
#### GestÃ£o de UsuÃ¡rios
- **Empresas**: AprovaÃ§Ã£o e gerenciamento
- **Entregadores**: Cadastro e validaÃ§Ã£o
- **Consumidores**: Monitoramento e suporte

#### Monitoramento
- **Dashboard Geral**: MÃ©tricas do sistema
- **Pedidos**: Acompanhamento global
- **RelatÃ³rios**: Analytics e insights
- **Logs**: Auditoria do sistema

### ðŸ’¬ Sistema de Chat
- **Chat em Tempo Real**: ComunicaÃ§Ã£o entre usuÃ¡rios
- **Suporte**: Canal de atendimento
- **NotificaÃ§Ãµes**: Mensagens instantÃ¢neas

### â­ Sistema de AvaliaÃ§Ãµes
- **AvaliaÃ§Ã£o de Produtos**: Estrelas e comentÃ¡rios
- **AvaliaÃ§Ã£o de Empresas**: Feedback geral
- **AvaliaÃ§Ã£o de Entregadores**: Qualidade do serviÃ§o
- **ModeraÃ§Ã£o**: Controle de conteÃºdo

### ðŸ“Š Sistema de Analytics
- **MÃ©tricas de Vendas**: RelatÃ³rios financeiros
- **Performance**: Indicadores de desempenho
- **Comportamento**: AnÃ¡lise de usuÃ¡rios
- **ExportaÃ§Ã£o**: RelatÃ³rios em PDF/Excel

### ðŸ”” Sistema de NotificaÃ§Ãµes
- **Push Notifications**: NotificaÃ§Ãµes web
- **Email**: ComunicaÃ§Ã£o por email
- **SMS**: Mensagens de texto (futuro)
- **In-App**: NotificaÃ§Ãµes internas
