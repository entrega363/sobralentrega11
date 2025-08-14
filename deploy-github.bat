@echo off
echo 🚀 FAZENDO DEPLOY AUTOMATICO PARA GITHUB...
echo.

REM Verificar se git está inicializado
if not exist ".git" (
    echo 📦 Inicializando repositório Git...
    git init
)

echo 📁 Adicionando todos os arquivos...
git add .

echo 💾 Fazendo commit...
git commit -m "Deploy: Sistema de delivery completo"

echo 🔗 Configurando repositório remoto...
echo.
echo ⚠️  IMPORTANTE: Cole a URL do seu repositório GitHub quando solicitado
echo    Exemplo: https://github.com/seu-usuario/nome-do-repo.git
echo.
set /p REPO_URL="Digite a URL do repositório: "

REM Remover origin existente se houver
git remote remove origin 2>nul

REM Adicionar novo origin
git remote add origin %REPO_URL%

echo 🚀 Fazendo push para GitHub...
git push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ SUCESSO! Código enviado para GitHub!
    echo 🎯 Próximo passo: Fazer deploy no Vercel
    echo    1. Acesse vercel.com
    echo    2. Importe seu repositório
    echo    3. Configure as variáveis de ambiente
    echo    4. Deploy!
) else (
    echo.
    echo ❌ Erro no push. Verifique:
    echo    - URL do repositório está correta
    echo    - Você tem permissão no repositório
    echo    - Repositório existe no GitHub
)

echo.
pause