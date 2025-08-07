# Sistema Entrega Sobral

Sistema completo de delivery para Sobral - CE, desenvolvido com Next.js 14+ e Supabase.

## 🚀 Tecnologias

- **Frontend:** Next.js 14+ com App Router
- **Backend:** Supabase (PostgreSQL + Auth + Real-time)
- **Styling:** Tailwind CSS
- **State Management:** Zustand + React Query
- **Forms:** React Hook Form + Zod
- **UI Components:** Radix UI + shadcn/ui
- **PWA:** next-pwa
- **Deploy:** Vercel

## 📱 Funcionalidades

### Para Empresas
- Cadastro e gerenciamento de produtos
- Recebimento e gestão de pedidos em tempo real
- Dashboard com métricas e relatórios
- Configurações de entrega e pagamento

### Para Entregadores
- Visualização de pedidos disponíveis
- Sistema de aceite e entrega
- Histórico de entregas
- Avaliações e ganhos

### Para Consumidores
- Marketplace com produtos de várias empresas
- Carrinho de compras inteligente
- Acompanhamento de pedidos em tempo real
- Sistema de avaliações

### Para Administradores
- Gestão completa do sistema
- Aprovação de empresas e entregadores
- Monitoramento de pedidos
- Relatórios e analytics

## 🛠️ Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/sistema-entrega-sobral.git
cd sistema-entrega-sobral
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env.local
```

4. Configure seu projeto Supabase e atualize as variáveis no `.env.local`

5. Execute o projeto:
```bash
npm run dev
```

## 🗄️ Configuração do Banco de Dados

O sistema utiliza Supabase como backend. Execute os scripts SQL fornecidos na pasta `supabase/migrations/` para criar as tabelas e configurar as políticas de segurança.

## 📦 Deploy

### Vercel (Recomendado)

1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente no dashboard do Vercel
3. O deploy será automático a cada push

### Configurações do Vercel

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs"
}
```

## 🔧 Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Gera o build de produção
- `npm run start` - Inicia o servidor de produção
- `npm run lint` - Executa o linter
- `npm run type-check` - Verifica os tipos TypeScript
- `npm run db:generate-types` - Gera tipos do Supabase

## 📱 PWA

O sistema é configurado como Progressive Web App (PWA) com:
- Service Workers para cache offline
- Manifest para instalação no dispositivo
- Notificações push (em desenvolvimento)

## 🔒 Segurança

- Autenticação via Supabase Auth
- Row Level Security (RLS) no banco de dados
- Middleware de proteção de rotas
- Validação de dados com Zod
- Headers de segurança configurados

## 📊 Monitoramento

- Vercel Analytics para métricas de uso
- Vercel Speed Insights para Core Web Vitals
- Error boundaries para tratamento de erros
- Logs estruturados

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

Para suporte, entre em contato através do email: suporte@entregasobral.com.br

---

Desenvolvido com ❤️ para Sobral - CE