# Sistema Entrega Sobral - Documentação Completa

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura do Sistema](#arquitetura-do-sistema)
3. [Tecnologias Utilizadas](#tecnologias-utilizadas)
4. [Estrutura do Projeto](#estrutura-do-projeto)
5. [Funcionalidades por Módulo](#funcionalidades-por-módulo)
6. [Banco de Dados](#banco-de-dados)
7. [API e Endpoints](#api-e-endpoints)
8. [Autenticação e Autorização](#autenticação-e-autorização)
9. [Interface do Usuário](#interface-do-usuário)
10. [Deploy e Configuração](#deploy-e-configuração)

---

## 🎯 Visão Geral

O **Sistema Entrega Sobral** é uma plataforma completa de delivery desenvolvida especificamente para a cidade de Sobral - CE. O sistema conecta empresas, entregadores e consumidores em um marketplace integrado, oferecendo uma experiência completa de pedidos online.

### Objetivos Principais

- **Digitalização do Comércio Local**: Permitir que empresas locais vendam online
- **Geração de Renda**: Criar oportunidades para entregadores autônomos
- **Conveniência**: Facilitar pedidos para consumidores
- **Gestão Centralizada**: Fornecer ferramentas administrativas completas

### Características Principais

- **Multi-tenant**: Suporte a múltiplas empresas
- **Real-time**: Atualizações em tempo real via WebSockets
- **PWA**: Funciona como aplicativo móvel
- **Responsivo**: Interface adaptável a todos os dispositivos
- **Escalável**: Arquitetura preparada para crescimento

---

## 🏗️ Arquitetura do Sistema

### Arquitetura Geral

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (Next.js)     │◄──►│   (Supabase)    │◄──►│  (PostgreSQL)   │
│                 │    │                 │    │                 │
│ - React 18      │    │ - Auth          │    │ - Tables        │
│ - TypeScript    │    │ - Real-time     │    │ - Functions     │
│ - Tailwind CSS  │    │ - Storage       │    │ - Triggers      │
│ - Zustand       │    │ - Edge Funcs    │    │ - RLS Policies  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Fluxo de Dados

1. **Cliente** → Interface Next.js
2. **Interface** → Supabase Client
3. **Supabase** → PostgreSQL Database
4. **Real-time** → WebSocket Updates
5. **Storage** → File Management

### Padrões Arquiteturais

- **Component-Based**: Componentes reutilizáveis
- **State Management**: Zustand para estado global
- **Server Components**: Next.js App Router
- **API Routes**: Endpoints customizados
- **Middleware**: Proteção de rotas