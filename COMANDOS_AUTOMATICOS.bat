@echo off
echo 🚀 CONFIGURAÇÃO AUTOMÁTICA COMPLETA
echo.

echo 📦 Instalando Vercel CLI...
npm install -g vercel

echo.
echo 🔐 Executando script de configuração automática...
node scripts/setup-vercel-env-automatico.js

echo.
echo ✅ PROCESSO CONCLUÍDO!
echo.
pause