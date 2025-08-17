## 🛠️ Tecnologias Utilizadas

### Frontend
- **Next.js 15**: Framework React com App Router
- **React 18**: Biblioteca de interface
- **TypeScript**: Tipagem estática
- **Tailwind CSS**: Framework CSS utilitário
- **Radix UI**: Componentes acessíveis
- **shadcn/ui**: Sistema de design
- **Lucide React**: Ícones
- **React Hook Form**: Gerenciamento de formulários
- **Zod**: Validação de esquemas
- **Zustand**: Gerenciamento de estado
- **React Query**: Cache e sincronização de dados

### Backend
- **Supabase**: Backend-as-a-Service
- **PostgreSQL**: Banco de dados relacional
- **Row Level Security**: Segurança em nível de linha
- **Real-time Subscriptions**: Atualizações em tempo real
- **Edge Functions**: Funções serverless
- **Supabase Auth**: Sistema de autenticação
- **Supabase Storage**: Armazenamento de arquivos

### DevOps e Deploy
- **Vercel**: Plataforma de deploy
- **GitHub Actions**: CI/CD (futuro)
- **ESLint**: Linting de código
- **Prettier**: Formatação de código
- **TypeScript**: Verificação de tipos

### Ferramentas de Desenvolvimento
- **VS Code**: Editor recomendado
- **Supabase CLI**: Gerenciamento local
- **Postman**: Testes de API
- **Chrome DevTools**: Debug e performance

---

## 📁 Estrutura do Projeto

```
sistema-entrega-sobral/
├── public/                     # Arquivos estáticos
│   ├── icons/                 # Ícones da aplicação
│   ├── images/                # Imagens
│   ├── manifest.json          # PWA manifest
│   └── sw.js                  # Service Worker
├── src/
│   ├── app/                   # App Router (Next.js 13+)
│   │   ├── (auth)/           # Grupo de rotas de autenticação
│   │   │   ├── login/        # Página de login
│   │   │   ├── register/     # Página de registro
│   │   │   └── layout.tsx    # Layout das páginas de auth
│   │   ├── (dashboard)/      # Grupo de rotas do dashboard
│   │   │   ├── admin/        # Páginas do administrador
│   │   │   ├── empresa/      # Páginas da empresa
│   │   │   ├── entregador/   # Páginas do entregador
│   │   │   ├── consumidor/   # Páginas do consumidor
│   │   │   └── layout.tsx    # Layout do dashboard
│   │   ├── api/              # API Routes
│   │   │   ├── auth/         # Endpoints de autenticação
│   │   │   ├── admin/        # Endpoints administrativos
│   │   │   ├── empresa/      # Endpoints de empresa
│   │   │   ├── pedidos/      # Endpoints de pedidos
│   │   │   └── produtos/     # Endpoints de produtos
│   │   ├── globals.css       # Estilos globais
│   │   ├── layout.tsx        # Layout raiz
│   │   └── page.tsx          # Página inicial
│   ├── components/           # Componentes React
│   │   ├── ui/              # Componentes base (shadcn/ui)
│   │   ├── auth/            # Componentes de autenticação
│   │   ├── admin/           # Componentes administrativos
│   │   ├── empresa/         # Componentes de empresa
│   │   ├── entregador/      # Componentes de entregador
│   │   ├── consumidor/      # Componentes de consumidor
│   │   ├── layout/          # Componentes de layout
│   │   └── providers/       # Providers de contexto
│   ├── hooks/               # Custom hooks
│   ├── lib/                 # Utilitários e configurações
│   │   ├── supabase/        # Configuração do Supabase
│   │   ├── validations/     # Esquemas de validação
│   │   ├── constants.ts     # Constantes da aplicação
│   │   └── utils.ts         # Funções utilitárias
│   ├── stores/              # Stores do Zustand
│   ├── types/               # Definições de tipos TypeScript
│   └── middleware.ts        # Middleware do Next.js
├── supabase/
│   ├── migrations/          # Migrações do banco
│   ├── functions/           # Edge Functions
│   └── config.toml          # Configuração do Supabase
├── scripts/                 # Scripts utilitários
├── .env.local              # Variáveis de ambiente
├── .env.example            # Exemplo de variáveis
├── next.config.js          # Configuração do Next.js
├── tailwind.config.ts      # Configuração do Tailwind
├── tsconfig.json           # Configuração do TypeScript
└── package.json            # Dependências e scripts
```