#!/bin/bash

echo "🚀 FAZENDO DEPLOY AUTOMATICO PARA GITHUB..."
echo

# Verificar se git está inicializado
if [ ! -d ".git" ]; then
    echo "📦 Inicializando repositório Git..."
    git init
fi

echo "📁 Adicionando todos os arquivos..."
git add .

echo "💾 Fazendo commit..."
git commit -m "Deploy: Sistema de delivery completo"

echo "🔗 Configurando repositório remoto..."
echo
echo "⚠️  IMPORTANTE: Cole a URL do seu repositório GitHub quando solicitado"
echo "   Exemplo: https://github.com/seu-usuario/nome-do-repo.git"
echo
read -p "Digite a URL do repositório: " REPO_URL

# Remover origin existente se houver
git remote remove origin 2>/dev/null

# Adicionar novo origin
git remote add origin "$REPO_URL"

echo "🚀 Fazendo push para GitHub..."
if git push -u origin main; then
    echo
    echo "✅ SUCESSO! Código enviado para GitHub!"
    echo "🎯 Próximo passo: Fazer deploy no Vercel"
    echo "   1. Acesse vercel.com"
    echo "   2. Importe seu repositório"
    echo "   3. Configure as variáveis de ambiente"
    echo "   4. Deploy!"
else
    echo
    echo "❌ Erro no push. Verifique:"
    echo "   - URL do repositório está correta"
    echo "   - Você tem permissão no repositório"
    echo "   - Repositório existe no GitHub"
fi

echo
read -p "Pressione Enter para continuar..."