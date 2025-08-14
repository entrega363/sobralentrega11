# 🔐 Solução Completa para o Problema de Login

## 🎯 Problema
O login com `matutaria@gmail.com` está dando "credencial inválida" no site online.

## 🛠️ Solução em 3 Passos

### PASSO 1: Executar Script no Supabase
1. Acesse: https://supabase.com/dashboard/project/twijaxnjazanojbaegxs
2. Vá em **SQL Editor** (menu lateral)
3. Clique em **New Query**
4. Cole o conteúdo do arquivo `CORRIGIR_LOGIN_DEFINITIVO.sql`
5. Clique em **Run** (ou pressione Ctrl+Enter)

### PASSO 2: Testar no Site
1. Acesse: https://delivery2-2rwjrbuo1-entregasobrals-projects.vercel.app/teste-login
2. Clique em **"🔗 Testar Conexão"** - deve aparecer ✅
3. Clique em **"👤 Verificar Usuários"** - deve mostrar dados
4. Clique em **"🔐 Testar Login"** - deve fazer login com sucesso

### PASSO 3: Testar Login Principal
1. Acesse: https://delivery2-2rwjrbuo1-entregasobrals-projects.vercel.app/login
2. Use as credenciais:
   - **Email:** matutaria@gmail.com
   - **Senha:** 123456
3. Deve fazer login e ir para o dashboard da empresa

---

## 📋 Credenciais Atualizadas
- **Email:** matutaria@gmail.com
- **Senha:** 123456
- **Tipo:** Empresa
- **Status:** Aprovada

---

## 🔍 Se Ainda Não Funcionar

### Opção A: Usar a Página de Teste
1. Acesse: https://delivery2-2rwjrbuo1-entregasobrals-projects.vercel.app/teste-login
2. Clique em **"➕ Criar Usuário"**
3. Isso vai criar um novo usuário automaticamente

### Opção B: Verificar no Supabase
1. Acesse o Supabase Dashboard
2. Vá em **Authentication > Users**
3. Procure por `matutaria@gmail.com`
4. Se não existir, execute o script novamente

### Opção C: Resetar Senha
Execute este comando no SQL Editor do Supabase:
```sql
UPDATE auth.users 
SET encrypted_password = crypt('123456', gen_salt('bf'))
WHERE email = 'matutaria@gmail.com';
```

---

## 🎯 Links Importantes

- **Site Principal:** https://delivery2-2rwjrbuo1-entregasobrals-projects.vercel.app
- **Página de Login:** https://delivery2-2rwjrbuo1-entregasobrals-projects.vercel.app/login
- **Página de Teste:** https://delivery2-2rwjrbuo1-entregasobrals-projects.vercel.app/teste-login
- **Supabase Dashboard:** https://supabase.com/dashboard/project/twijaxnjazanojbaegxs

---

## ✅ Resultado Esperado

Após seguir os passos:
1. ✅ Login funcionando com matutaria@gmail.com
2. ✅ Acesso ao dashboard da empresa
3. ✅ Todas as funcionalidades disponíveis
4. ✅ Site totalmente funcional online

---

## 🆘 Suporte

Se ainda houver problemas:
1. Execute o script `VERIFICAR_USUARIO_MATUTARIA_ONLINE.sql` no Supabase
2. Verifique os resultados na página de teste
3. Me informe qual erro específico está aparecendo

**O site está funcionando perfeitamente, só precisa configurar o usuário no banco de dados!** 🚀