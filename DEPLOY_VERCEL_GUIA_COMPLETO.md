# 🚀 GUIA COMPLETO: DEPLOY VERCEL DO ZERO

## 📋 PASSO A PASSO COMPLETO

### 1️⃣ **PREPARAR O PROJETO PARA GITHUB**

```bash
# Inicializar git (se ainda não foi feito)
git init

# Adicionar todos os arquivos
git add .

# Fazer commit
git commit -m "Initial commit - Sistema de delivery completo"

# Adicionar repositório remoto (substitua pela sua URL)
git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git

# Fazer push
git push -u origin main
```

### 2️⃣ **CRIAR NOVO PROJETO SUPABASE**

1. Acesse [supabase.com](https://supabase.com)
2. Clique em "New Project"
3. Escolha sua organização
4. Nome do projeto: `delivery-app-novo`
5. Database Password: **ANOTE ESTA SENHA!**
6. Região: South America (São Paulo)
7. Clique em "Create new project"

### 3️⃣ **CONFIGURAR BANCO DE DADOS**

Após o projeto ser criado:

1. Vá em **SQL Editor**
2. Execute os scripts na seguinte ordem:

#### **Script 1: Schema Inicial**
```sql
-- Executar: supabase/migrations/001_initial_schema.sql
-- (Cole o conteúdo do arquivo)
```

#### **Script 2: Políticas RLS**
```sql
-- Executar: supabase/migrations/002_rls_policies.sql
-- (Cole o conteúdo do arquivo)
```

#### **Script 3: Funções e Triggers**
```sql
-- Executar: supabase/migrations/003_functions_triggers.sql
-- (Cole o conteúdo do arquivo)
```

#### **Script 4: Dados de Exemplo**
```sql
-- Executar: supabase/migrations/004_seed_data.sql
-- (Cole o conteúdo do arquivo)
```

### 4️⃣ **CONFIGURAR VERCEL**

1. Acesse [vercel.com](https://vercel.com)
2. Clique em "New Project"
3. Importe seu repositório do GitHub
4. Configure as variáveis de ambiente:

#### **Environment Variables:**
```
NEXT_PUBLIC_SUPABASE_URL=https://SEU_PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=SUA_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=SUA_SERVICE_ROLE_KEY
```

**Para encontrar essas chaves:**
- Vá no Supabase → Settings → API
- `URL`: Project URL
- `anon key`: anon public
- `service_role key`: service_role (secret)

### 5️⃣ **FAZER DEPLOY**

1. No Vercel, clique em "Deploy"
2. Aguarde o build completar
3. Acesse a URL gerada

### 6️⃣ **CRIAR USUÁRIOS DE TESTE**

Após o deploy, execute no SQL Editor do Supabase:

```sql
-- Criar usuários de teste
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES 
(
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'teste.consumidor@gmail.com',
    crypt('123456', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    FALSE,
    '',
    '',
    '',
    ''
),
(
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'teste.empresa@gmail.com',
    crypt('123456', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    FALSE,
    '',
    '',
    '',
    ''
),
(
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'teste.entregador@gmail.com',
    crypt('123456', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    FALSE,
    '',
    '',
    '',
    ''
);

-- Criar profiles
INSERT INTO profiles (id, email, role, nome, telefone, created_at, updated_at)
SELECT 
    u.id,
    u.email,
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
    '(11) 99999-9999',
    NOW(),
    NOW()
FROM auth.users u
WHERE u.email IN ('teste.consumidor@gmail.com', 'teste.empresa@gmail.com', 'teste.entregador@gmail.com');
```

### 7️⃣ **TESTAR O SISTEMA**

**Credenciais de Teste:**
- **Consumidor:** teste.consumidor@gmail.com / 123456
- **Empresa:** teste.empresa@gmail.com / 123456  
- **Entregador:** teste.entregador@gmail.com / 123456

### 🔧 **TROUBLESHOOTING**

#### **Se der erro de build:**
1. Verifique se todas as dependências estão no package.json
2. Verifique se não há imports quebrados
3. Verifique se as variáveis de ambiente estão corretas

#### **Se der erro de autenticação:**
1. Verifique as chaves do Supabase
2. Verifique se o RLS está configurado corretamente
3. Execute o script de usuários de teste novamente

#### **Se der erro de banco:**
1. Execute as migrations na ordem correta
2. Verifique se todas as tabelas foram criadas
3. Verifique se as políticas RLS estão ativas

### 📱 **FUNCIONALIDADES DISPONÍVEIS**

✅ Sistema de autenticação completo
✅ Dashboard para cada tipo de usuário
✅ Sistema de pedidos
✅ Sistema de produtos
✅ Sistema de entregadores
✅ Sistema de avaliações
✅ Sistema de chat
✅ Sistema de notificações
✅ Sistema de analytics
✅ Sistema de comanda (restaurante)

### 🎯 **PRÓXIMOS PASSOS**

1. Testar todas as funcionalidades
2. Configurar domínio personalizado (opcional)
3. Configurar SSL (automático no Vercel)
4. Monitorar logs e performance

---

**🚀 SEU SISTEMA ESTARÁ FUNCIONANDO EM PRODUÇÃO!**