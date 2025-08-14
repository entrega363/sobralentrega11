# Guia de Configuração do Vercel - Sistema Entrega Sobral

## 🚀 Passo a Passo para Corrigir o Deployment

### 1. Configurar Variáveis de Ambiente no Vercel

**Acesse o dashboard do Vercel:**
1. Vá para [vercel.com](https://vercel.com) e faça login
2. Selecione seu projeto "delivery2-hidizya34-entregasobrals-projects"
3. Clique em **Settings** (Configurações)
4. Clique em **Environment Variables** no menu lateral

**Adicione as seguintes variáveis:**

| Nome da Variável | Valor | Ambiente |
|------------------|-------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://twijaxnjazanojbaegxs.supabase.co` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3aWpheG5qYXphbm9qYmFlZ3hzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NzcwMjQsImV4cCI6MjA3MDE1MzAyNH0.SM6Xv6dX7N31pbnNUNvh_jb1ZPOJfcemEkQaQU6TLSM` | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3aWpheG5qYXphbm9qYmFlZ3hzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDU3NzAyNCwiZXhwIjoyMDcwMTUzMDI0fQ.i6nv9rHjMTdXZqCNnTkaUFW0FEewcMc6ea8HkXFEDWQ` | Production, Preview, Development |

**Como adicionar cada variável:**
1. Clique em **Add New**
2. Digite o nome da variável (ex: `NEXT_PUBLIC_SUPABASE_URL`)
3. Cole o valor correspondente
4. Selecione todos os ambientes: **Production**, **Preview**, e **Development**
5. Clique em **Save**

### 2. Verificar Configurações de Build

**Vá para Settings > General:**
- **Framework Preset:** Next.js
- **Build Command:** `npm run build`
- **Install Command:** `npm install`
- **Output Directory:** `.next` (deixe vazio para usar padrão)

### 3. Configurar Node.js Version

**Adicione ao package.json:**
```json
{
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### 4. Forçar Novo Deploy

Após configurar as variáveis de ambiente:
1. Vá para a aba **Deployments**
2. Clique nos três pontos (...) do último deployment
3. Clique em **Redeploy**
4. Selecione **Use existing Build Cache** (desmarque para build limpo)
5. Clique em **Redeploy**

### 5. Monitorar o Build

**Durante o build, verifique:**
1. **Build Logs:** Procure por erros de variáveis de ambiente
2. **Function Logs:** Verifique se as API routes estão funcionando
3. **Runtime Logs:** Monitore erros em tempo real

### 6. Troubleshooting Comum

**Se ainda houver erros:**

**Erro: "Dynamic server usage"**
- Este é um warning, não um erro fatal
- O build deve continuar normalmente

**Erro: "Environment variable not found"**
- Verifique se todas as variáveis foram adicionadas
- Certifique-se de que estão nos ambientes corretos

**Erro: "Build failed"**
- Verifique os logs detalhados no Vercel
- Execute `npm run build` localmente para reproduzir

### 7. Verificação Final

**Após o deploy bem-sucedido:**
1. Acesse a URL do projeto: `https://delivery2-hidizya34-entregasobrals-projects.vercel.app`
2. Teste o login com: `matutaria@gmail.com`
3. Verifique se o dashboard carrega corretamente
4. Teste algumas funcionalidades básicas

### 8. Comandos Úteis

**Para debug local:**
```bash
# Testar build local
npm run build

# Testar produção local
npm run start

# Verificar variáveis de ambiente
npm run type-check
```

### 9. Links Importantes

- **Dashboard do Projeto:** https://vercel.com/entregasobrals-projects/delivery2-hidizya34
- **URL do Site:** https://delivery2-hidizya34-entregasobrals-projects.vercel.app
- **Supabase Dashboard:** https://supabase.com/dashboard/project/twijaxnjazanojbaegxs

---

## 🔧 Configurações Avançadas (Opcional)

### Custom Domain
Se quiser configurar um domínio personalizado:
1. Vá em Settings > Domains
2. Adicione seu domínio
3. Configure os DNS records

### Performance Monitoring
Para monitorar performance:
1. Ative Vercel Analytics em Settings > Analytics
2. Configure Speed Insights para Core Web Vitals

### Security Headers
Os headers de segurança já estão configurados no `vercel.json`:
- X-Content-Type-Options
- X-Frame-Options  
- X-XSS-Protection
- Referrer-Policy

---

## ✅ Checklist Final

- [ ] Variáveis de ambiente configuradas no Vercel
- [ ] Build command configurado como `npm run build`
- [ ] Framework preset definido como Next.js
- [ ] Node.js version >=18 especificada
- [ ] Novo deploy executado
- [ ] Site acessível na URL do Vercel
- [ ] Login funcionando com matutaria@gmail.com
- [ ] Dashboard carregando corretamente

**Após completar todos os itens, o site deve estar funcionando perfeitamente no Vercel!**