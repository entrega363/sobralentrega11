# ✅ CHECKLIST DEPLOY VERCEL

## 🎯 **ANTES DE COMEÇAR**

- [ ] Código funcionando localmente
- [ ] Todas as dependências instaladas
- [ ] Sem erros no console
- [ ] Banco de dados Supabase funcionando

## 📦 **PREPARAR REPOSITÓRIO**

- [ ] Executar script de preparação: `node scripts/prepare-for-deploy.js`
- [ ] Verificar se .gitignore está correto
- [ ] Verificar se package.json tem todas as dependências
- [ ] Verificar se vercel.json foi criado

## 🔧 **COMANDOS PARA GITHUB**

```bash
# 1. Inicializar git (se necessário)
git init

# 2. Adicionar todos os arquivos
git add .

# 3. Fazer commit
git commit -m "Deploy: Sistema de delivery completo"

# 4. Adicionar repositório remoto
git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git

# 5. Fazer push
git push -u origin main
```

## 🗄️ **SUPABASE - NOVO PROJETO**

- [ ] Criar novo projeto no Supabase
- [ ] Anotar URL do projeto
- [ ] Anotar Database Password
- [ ] Ir para SQL Editor
- [ ] Executar migrations na ordem:
  - [ ] 001_initial_schema.sql
  - [ ] 002_rls_policies.sql  
  - [ ] 003_functions_triggers.sql
  - [ ] 004_seed_data.sql
- [ ] Copiar chaves da API (Settings → API)

## 🚀 **VERCEL DEPLOY**

- [ ] Acessar vercel.com
- [ ] Clicar "New Project"
- [ ] Importar repositório do GitHub
- [ ] Configurar variáveis de ambiente:
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Clicar "Deploy"
- [ ] Aguardar build completar

## 👥 **CRIAR USUÁRIOS DE TESTE**

Executar no SQL Editor do Supabase:

```sql
-- Script para criar usuários de teste
INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, 
    email_confirmed_at, created_at, updated_at, raw_app_meta_data, 
    raw_user_meta_data, is_super_admin, confirmation_token, 
    email_change, email_change_token_new, recovery_token
) VALUES 
('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'teste.consumidor@gmail.com', crypt('123456', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{}', FALSE, '', '', '', ''),
('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'teste.empresa@gmail.com', crypt('123456', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{}', FALSE, '', '', '', ''),
('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'teste.entregador@gmail.com', crypt('123456', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{}', FALSE, '', '', '', '');

-- Criar profiles
INSERT INTO profiles (id, email, role, nome, telefone, created_at, updated_at)
SELECT u.id, u.email,
    CASE 
        WHEN u.email = 'teste.consumidor@gmail.com' THEN 'consumidor'
        WHEN u.email = 'teste.empresa@gmail.com' THEN 'empresa'
        WHEN u.email = 'teste.entregador@gmail.com' THEN 'entregador'
    END,
    CASE 
        WHEN u.email = 'teste.consumidor@gmail.com' THEN 'Consumidor Teste'
        WHEN u.email = 'teste.empresa@gmail.com' THEN 'Empresa Teste'
        WHEN u.email = 'teste.entregador@gmail.com' THEN 'Entregador Teste'
    END,
    '(11) 99999-9999', NOW(), NOW()
FROM auth.users u
WHERE u.email IN ('teste.consumidor@gmail.com', 'teste.empresa@gmail.com', 'teste.entregador@gmail.com');
```

## 🧪 **TESTAR SISTEMA**

- [ ] Acessar URL do Vercel
- [ ] Testar login com:
  - [ ] teste.consumidor@gmail.com / 123456
  - [ ] teste.empresa@gmail.com / 123456
  - [ ] teste.entregador@gmail.com / 123456
- [ ] Verificar se dashboards carregam
- [ ] Testar funcionalidades principais

## 🔍 **TROUBLESHOOTING**

### Se der erro de build:
- [ ] Verificar logs no Vercel
- [ ] Verificar se todas as dependências estão no package.json
- [ ] Verificar imports quebrados

### Se der erro de autenticação:
- [ ] Verificar variáveis de ambiente no Vercel
- [ ] Verificar chaves do Supabase
- [ ] Recriar usuários de teste

### Se der erro de banco:
- [ ] Verificar se migrations foram executadas
- [ ] Verificar se RLS está ativo
- [ ] Verificar políticas de segurança

## 🎉 **DEPLOY CONCLUÍDO**

- [ ] Sistema funcionando em produção
- [ ] Usuários de teste criados
- [ ] Todas as funcionalidades testadas
- [ ] URL compartilhada

---

**🚀 SEU SISTEMA ESTÁ NO AR!**