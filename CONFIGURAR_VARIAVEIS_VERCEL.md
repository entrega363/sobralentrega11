# 🔐 CONFIGURAR VARIÁVEIS DE AMBIENTE NO VERCEL

## 📋 **PASSO A PASSO DETALHADO**

### 1️⃣ **PRIMEIRO: CRIAR PROJETO SUPABASE**

1. Acesse [supabase.com](https://supabase.com)
2. Clique em "New Project"
3. Nome: `delivery-app-novo`
4. Região: South America (São Paulo)
5. **ANOTE A SENHA DO BANCO!**
6. Clique em "Create new project"

### 2️⃣ **COPIAR CHAVES DO SUPABASE**

Após o projeto ser criado:

1. Vá em **Settings** → **API**
2. **Copie estas 3 informações:**

```
Project URL: https://SEU_PROJETO_ID.supabase.co
anon public: eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
service_role: eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

### 3️⃣ **CONFIGURAR NO VERCEL**

1. **Vá para seu projeto no Vercel**
2. **Clique em "Settings"**
3. **Clique em "Environment Variables"**
4. **Adicione estas 3 variáveis:**

#### **Variável 1:**
- **Name:** `NEXT_PUBLIC_SUPABASE_URL`
- **Value:** `https://SEU_PROJETO_ID.supabase.co`
- **Environment:** Production, Preview, Development

#### **Variável 2:**
- **Name:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value:** `sua_anon_key_aqui`
- **Environment:** Production, Preview, Development

#### **Variável 3:**
- **Name:** `SUPABASE_SERVICE_ROLE_KEY`
- **Value:** `sua_service_role_key_aqui`
- **Environment:** Production, Preview, Development

### 4️⃣ **FAZER REDEPLOY**

1. **Vá para "Deployments"**
2. **Clique nos 3 pontinhos** do último deploy
3. **Clique em "Redeploy"**
4. **Aguarde o build completar**

### 5️⃣ **CONFIGURAR BANCO DE DADOS**

Execute no **SQL Editor** do Supabase na ordem:

#### **Script 1: Schema Inicial**
```sql
-- Cole o conteúdo de: supabase/migrations/001_initial_schema.sql
```

#### **Script 2: Políticas RLS**
```sql
-- Cole o conteúdo de: supabase/migrations/002_rls_policies.sql
```

#### **Script 3: Funções e Triggers**
```sql
-- Cole o conteúdo de: supabase/migrations/003_functions_triggers.sql
```

#### **Script 4: Dados de Exemplo**
```sql
-- Cole o conteúdo de: supabase/migrations/004_seed_data.sql
```

### 6️⃣ **CRIAR USUÁRIOS DE TESTE**

```sql
-- Criar usuários de teste
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

### 7️⃣ **TESTAR O SISTEMA**

**Credenciais:**
- **Consumidor:** teste.consumidor@gmail.com / 123456
- **Empresa:** teste.empresa@gmail.com / 123456
- **Entregador:** teste.entregador@gmail.com / 123456

---

## 🎯 **RESUMO RÁPIDO:**

1. ✅ Criar projeto Supabase
2. ✅ Copiar 3 chaves da API
3. ✅ Configurar 3 variáveis no Vercel
4. ✅ Redeploy no Vercel
5. ✅ Executar 4 migrations no Supabase
6. ✅ Criar usuários de teste
7. ✅ Testar o sistema

**🚀 SEU SISTEMA ESTARÁ FUNCIONANDO EM PRODUÇÃO!**