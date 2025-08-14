#!/usr/bin/env node

/**
 * Script para preparar o projeto para deploy no Vercel
 * Verifica dependências, arquivos necessários e configurações
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Preparando projeto para deploy no Vercel...\n');

// Verificar se package.json existe e tem as dependências necessárias
function checkPackageJson() {
  console.log('📦 Verificando package.json...');
  
  if (!fs.existsSync('package.json')) {
    console.error('❌ package.json não encontrado!');
    return false;
  }
  
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  const requiredDeps = [
    '@supabase/supabase-js',
    'next',
    'react',
    'react-dom',
    'tailwindcss'
  ];
  
  const missingDeps = requiredDeps.filter(dep => 
    !packageJson.dependencies?.[dep] && !packageJson.devDependencies?.[dep]
  );
  
  if (missingDeps.length > 0) {
    console.error('❌ Dependências faltando:', missingDeps.join(', '));
    return false;
  }
  
  console.log('✅ package.json OK');
  return true;
}

// Verificar se .env.local existe (para desenvolvimento)
function checkEnvFile() {
  console.log('🔐 Verificando arquivo de ambiente...');
  
  if (!fs.existsSync('.env.local')) {
    console.warn('⚠️  .env.local não encontrado - certifique-se de configurar as variáveis no Vercel');
  } else {
    console.log('✅ .env.local encontrado');
  }
  
  return true;
}

// Verificar se arquivos essenciais existem
function checkEssentialFiles() {
  console.log('📁 Verificando arquivos essenciais...');
  
  const essentialFiles = [
    'src/app/layout.tsx',
    'src/app/page.tsx',
    'src/lib/supabase/server.ts',
    'next.config.js',
    'tailwind.config.ts'
  ];
  
  const missingFiles = essentialFiles.filter(file => !fs.existsSync(file));
  
  if (missingFiles.length > 0) {
    console.error('❌ Arquivos essenciais faltando:', missingFiles.join(', '));
    return false;
  }
  
  console.log('✅ Arquivos essenciais OK');
  return true;
}

// Verificar se vercel.json está configurado corretamente
function checkVercelConfig() {
  console.log('⚙️  Verificando configuração do Vercel...');
  
  if (!fs.existsSync('vercel.json')) {
    console.log('📝 Criando vercel.json...');
    
    const vercelConfig = {
      "framework": "nextjs",
      "buildCommand": "npm run build",
      "devCommand": "npm run dev",
      "installCommand": "npm install",
      "functions": {
        "src/app/api/**/*.ts": {
          "maxDuration": 30
        }
      }
    };
    
    fs.writeFileSync('vercel.json', JSON.stringify(vercelConfig, null, 2));
    console.log('✅ vercel.json criado');
  } else {
    console.log('✅ vercel.json já existe');
  }
  
  return true;
}

// Verificar se .gitignore está configurado
function checkGitignore() {
  console.log('🚫 Verificando .gitignore...');
  
  if (!fs.existsSync('.gitignore')) {
    console.log('📝 Criando .gitignore...');
    
    const gitignoreContent = `# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/

# Next.js
.next/
out/

# Production
build/
dist/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Vercel
.vercel

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# SQL files (não fazer commit de scripts de teste)
*.sql
!supabase/migrations/*.sql
`;
    
    fs.writeFileSync('.gitignore', gitignoreContent);
    console.log('✅ .gitignore criado');
  } else {
    console.log('✅ .gitignore já existe');
  }
  
  return true;
}

// Criar README com instruções
function createReadme() {
  console.log('📖 Verificando README...');
  
  if (!fs.existsSync('README.md')) {
    console.log('📝 Criando README.md...');
    
    const readmeContent = `# Sistema de Delivery

Sistema completo de delivery com Next.js e Supabase.

## 🚀 Deploy

Este projeto está configurado para deploy automático no Vercel.

### Variáveis de Ambiente Necessárias:

\`\`\`
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key
\`\`\`

### Como fazer deploy:

1. Faça push para o GitHub
2. Conecte o repositório no Vercel
3. Configure as variáveis de ambiente
4. Deploy automático!

## 🧪 Usuários de Teste

- **Consumidor:** teste.consumidor@gmail.com / 123456
- **Empresa:** teste.empresa@gmail.com / 123456
- **Entregador:** teste.entregador@gmail.com / 123456

## 🛠️ Desenvolvimento Local

\`\`\`bash
npm install
npm run dev
\`\`\`

## 📱 Funcionalidades

- ✅ Autenticação completa
- ✅ Dashboard para cada tipo de usuário
- ✅ Sistema de pedidos
- ✅ Sistema de produtos
- ✅ Sistema de entregadores
- ✅ Sistema de avaliações
- ✅ Sistema de chat
- ✅ Sistema de notificações
- ✅ Sistema de analytics
- ✅ Sistema de comanda (restaurante)
`;
    
    fs.writeFileSync('README.md', readmeContent);
    console.log('✅ README.md criado');
  } else {
    console.log('✅ README.md já existe');
  }
  
  return true;
}

// Executar todas as verificações
async function main() {
  const checks = [
    checkPackageJson,
    checkEnvFile,
    checkEssentialFiles,
    checkVercelConfig,
    checkGitignore,
    createReadme
  ];
  
  let allPassed = true;
  
  for (const check of checks) {
    if (!check()) {
      allPassed = false;
    }
    console.log('');
  }
  
  if (allPassed) {
    console.log('🎉 Projeto pronto para deploy!');
    console.log('\n📋 Próximos passos:');
    console.log('1. git add .');
    console.log('2. git commit -m "Prepare for deploy"');
    console.log('3. git push origin main');
    console.log('4. Conectar repositório no Vercel');
    console.log('5. Configurar variáveis de ambiente');
    console.log('6. Deploy! 🚀');
  } else {
    console.log('❌ Corrija os problemas acima antes de fazer deploy');
    process.exit(1);
  }
}

main().catch(console.error);