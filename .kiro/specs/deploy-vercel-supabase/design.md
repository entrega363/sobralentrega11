# Documento de Design

## Visão Geral

Este documento define a arquitetura técnica para modernizar o Sistema Entrega Sobral, migrando de React puro para Next.js 14+ com integração completa ao Supabase, otimizado para deploy no Vercel com as melhores práticas de performance e segurança.

## Arquitetura

### Stack Tecnológico

**Frontend:**
- Next.js 14+ com App Router
- TypeScript 5+
- Tailwind CSS 3+ para estilização
- React Hook Form + Zod para formulários e validação
- Zustand para estado global
- TanStack Query (React Query) para cache e sincronização de dados

**Backend/Database:**
- Supabase (PostgreSQL + Auth + Real-time + Storage)
- Next.js API Routes para endpoints customizados
- Edge Functions para lógica de negócio crítica

**Deploy e Infraestrutura:**
- Vercel para hosting e CI/CD
- Vercel Analytics para monitoramento
- Vercel Speed Insights para performance

**PWA e Offline:**
- Next-PWA para funcionalidades PWA
- Service Workers para cache offline
- IndexedDB para armazenamento local

### Estrutura de Diretórios

```
src/
├── app/                          # App Router do Next.js
│   ├── (auth)/                   # Grupo de rotas de autenticação
│   │   ├── login/
│   │   ├── register/
│   │   └── layout.tsx
│   ├── (dashboard)/              # Grupo de rotas do dashboard
│   │   ├── admin/
│   │   ├── empresa/
│   │   ├── entregador/
│   │   ├── consumidor/
│   │   └── layout.tsx
│   ├── api/                      # API Routes
│   │   ├── auth/
│   │   ├── empresas/
│   │   ├── produtos/
│   │   ├── pedidos/
│   │   └── webhooks/
│   ├── globals.css
│   ├── layout.tsx                # Root layout
│   ├── loading.tsx
│   ├── error.tsx
│   └── page.tsx                  # Home page
├── components/                   # Componentes reutilizáveis
│   ├── ui/                       # Componentes base (shadcn/ui)
│   ├── forms/                    # Componentes de formulário
│   ├── layout/                   # Componentes de layout
│   └── features/                 # Componentes específicos por feature
├── lib/                          # Utilitários e configurações
│   ├── supabase/                 # Cliente e tipos Supabase
│   ├── validations/              # Schemas Zod
│   ├── utils.ts                  # Utilitários gerais
│   └── constants.ts              # Constantes da aplicação
├── hooks/                        # Custom hooks
├── stores/                       # Stores Zustand
├── types/                        # Definições de tipos TypeScript
└── middleware.ts                 # Middleware do Next.js
```

## Componentes e Interfaces

### 1. Sistema de Autenticação

**Supabase Auth Integration:**
```typescript
// lib/supabase/auth.ts
export interface AuthUser {
  id: string;
  email: string;
  user_metadata: {
    role: 'admin' | 'empresa' | 'entregador' | 'consumidor';
    profile_id: string;
  };
}

export class AuthService {
  async signIn(email: string, password: string): Promise<AuthUser>;
  async signUp(userData: SignUpData): Promise<AuthUser>;
  async signOut(): Promise<void>;
  async getCurrentUser(): Promise<AuthUser | null>;
}
```

**Middleware de Autenticação:**
```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  const { supabase, response } = createMiddlewareClient({ req: request });
  
  // Verificar autenticação
  const { data: { session } } = await supabase.auth.getSession();
  
  // Proteger rotas baseado em roles
  if (request.nextUrl.pathname.startsWith('/admin') && 
      session?.user?.user_metadata?.role !== 'admin') {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return response;
}
```

### 2. Schema do Banco de Dados (Supabase)

**Tabelas Principais:**
```sql
-- Profiles (extends auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  role user_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Empresas
CREATE TABLE empresas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id),
  nome VARCHAR NOT NULL,
  cnpj VARCHAR UNIQUE NOT NULL,
  categoria VARCHAR NOT NULL,
  status empresa_status DEFAULT 'pendente',
  endereco JSONB NOT NULL,
  contato JSONB NOT NULL,
  configuracoes JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Produtos
CREATE TABLE produtos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  nome VARCHAR NOT NULL,
  descricao TEXT,
  preco DECIMAL(10,2) NOT NULL,
  categoria VARCHAR NOT NULL,
  imagem_url VARCHAR,
  disponivel BOOLEAN DEFAULT true,
  tempo_preparacao INTEGER,
  ingredientes TEXT[],
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pedidos
CREATE TABLE pedidos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  consumidor_id UUID REFERENCES profiles(id),
  status pedido_status DEFAULT 'pendente',
  total DECIMAL(10,2) NOT NULL,
  endereco_entrega JSONB NOT NULL,
  observacoes TEXT,
  forma_pagamento VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Itens do Pedido
CREATE TABLE pedido_itens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pedido_id UUID REFERENCES pedidos(id) ON DELETE CASCADE,
  produto_id UUID REFERENCES produtos(id),
  empresa_id UUID REFERENCES empresas(id),
  quantidade INTEGER NOT NULL,
  preco_unitario DECIMAL(10,2) NOT NULL,
  observacoes TEXT
);
```

**Row Level Security (RLS):**
```sql
-- Empresas só podem ver seus próprios dados
CREATE POLICY "Empresas podem ver apenas seus dados" ON empresas
  FOR ALL USING (profile_id = auth.uid());

-- Produtos só podem ser gerenciados pela empresa dona
CREATE POLICY "Empresas gerenciam seus produtos" ON produtos
  FOR ALL USING (
    empresa_id IN (
      SELECT id FROM empresas WHERE profile_id = auth.uid()
    )
  );
```

### 3. API Routes e Validação

**Estrutura de API Routes:**
```typescript
// app/api/produtos/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { NextRequest, NextResponse } from 'next/server';
import { produtoSchema } from '@/lib/validations/produto';

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Verificar autenticação
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    
    // Validar dados
    const body = await request.json();
    const validatedData = produtoSchema.parse(body);
    
    // Inserir no banco
    const { data, error } = await supabase
      .from('produtos')
      .insert(validatedData)
      .select()
      .single();
    
    if (error) throw error;
    
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro interno do servidor' }, 
      { status: 500 }
    );
  }
}
```

**Schemas de Validação (Zod):**
```typescript
// lib/validations/produto.ts
import { z } from 'zod';

export const produtoSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  descricao: z.string().optional(),
  preco: z.number().positive('Preço deve ser positivo'),
  categoria: z.string().min(1, 'Categoria é obrigatória'),
  disponivel: z.boolean().default(true),
  tempo_preparacao: z.number().int().positive().optional(),
  ingredientes: z.array(z.string()).optional(),
  observacoes: z.string().optional()
});

export type ProdutoInput = z.infer<typeof produtoSchema>;
```

### 4. Estado Global e Cache

**Zustand Store:**
```typescript
// stores/auth-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  setUser: (user: AuthUser | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: true,
      setUser: (user) => set({ user }),
      setLoading: (isLoading) => set({ isLoading })
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user })
    }
  )
);
```

**React Query Setup:**
```typescript
// lib/react-query.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      cacheTime: 10 * 60 * 1000, // 10 minutos
      retry: 3,
      refetchOnWindowFocus: false
    }
  }
});

// hooks/use-produtos.ts
export function useProdutos(empresaId?: string) {
  return useQuery({
    queryKey: ['produtos', empresaId],
    queryFn: () => fetchProdutos(empresaId),
    enabled: !!empresaId
  });
}
```

### 5. Real-time e Sincronização

**Supabase Real-time:**
```typescript
// hooks/use-realtime-pedidos.ts
export function useRealtimePedidos(empresaId: string) {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    const supabase = createClientComponentClient();
    
    const channel = supabase
      .channel('pedidos-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pedidos',
          filter: `empresa_id=eq.${empresaId}`
        },
        (payload) => {
          // Invalidar cache quando houver mudanças
          queryClient.invalidateQueries(['pedidos', empresaId]);
          
          // Mostrar notificação para novos pedidos
          if (payload.eventType === 'INSERT') {
            showNotification('Novo pedido recebido!');
          }
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [empresaId, queryClient]);
}
```

## Modelos de Dados

### Tipos TypeScript Gerados

```typescript
// types/database.ts (gerado automaticamente do Supabase)
export interface Database {
  public: {
    Tables: {
      empresas: {
        Row: {
          id: string;
          profile_id: string;
          nome: string;
          cnpj: string;
          categoria: string;
          status: 'pendente' | 'aprovada' | 'rejeitada' | 'suspensa';
          endereco: {
            rua: string;
            numero: string;
            bairro: string;
            cidade: string;
            cep: string;
          };
          contato: {
            telefone: string;
            email: string;
          };
          configuracoes: {
            taxa_entrega: number;
            tempo_entrega: number;
            horario_funcionamento: string;
          };
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['empresas']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['empresas']['Insert']>;
      };
      // ... outras tabelas
    };
  };
}
```

## Tratamento de Erros

### Error Boundaries e Logging

```typescript
// components/error-boundary.tsx
'use client';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log do erro para monitoramento
    console.error('Error caught by boundary:', error);
    
    // Enviar para serviço de monitoramento (ex: Sentry)
    if (process.env.NODE_ENV === 'production') {
      // logError(error);
    }
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold mb-4">Algo deu errado!</h2>
      <button
        onClick={reset}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Tentar novamente
      </button>
    </div>
  );
}
```

## Estratégia de Testes

### Testes Unitários e de Integração

```typescript
// __tests__/api/produtos.test.ts
import { POST } from '@/app/api/produtos/route';
import { createMocks } from 'node-mocks-http';

describe('/api/produtos', () => {
  it('deve criar um produto válido', async () => {
    const { req } = createMocks({
      method: 'POST',
      body: {
        nome: 'Pizza Margherita',
        preco: 25.90,
        categoria: 'Pizzas'
      }
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.nome).toBe('Pizza Margherita');
  });
});
```

## Configuração de Deploy

### Vercel Configuration

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

### Environment Variables

```bash
# .env.local (exemplo)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=https://your-domain.vercel.app
```

## PWA Configuration

```javascript
// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/your-project\.supabase\.co\/rest\/v1\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'supabase-api-cache',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60 // 24 horas
        }
      }
    }
  ]
});

module.exports = withPWA({
  experimental: {
    appDir: true
  },
  images: {
    domains: ['your-project.supabase.co']
  }
});
```