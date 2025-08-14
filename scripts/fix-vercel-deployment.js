#!/usr/bin/env node

/**
 * Script para diagnosticar e corrigir problemas de deployment no Vercel
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Diagnosticando problemas de deployment no Vercel...\n');

// 1. Verificar se todas as variáveis de ambiente necessárias estão definidas
function checkEnvironmentVariables() {
  console.log('1. Verificando variáveis de ambiente...');
  
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];
  
  const envFile = path.join(process.cwd(), '.env.local');
  
  if (!fs.existsSync(envFile)) {
    console.log('❌ Arquivo .env.local não encontrado');
    return false;
  }
  
  const envContent = fs.readFileSync(envFile, 'utf8');
  const missingVars = [];
  
  requiredEnvVars.forEach(varName => {
    if (!envContent.includes(varName)) {
      missingVars.push(varName);
    }
  });
  
  if (missingVars.length > 0) {
    console.log(`❌ Variáveis de ambiente faltando: ${missingVars.join(', ')}`);
    return false;
  }
  
  console.log('✅ Todas as variáveis de ambiente necessárias estão definidas');
  return true;
}

// 2. Verificar configuração do Next.js
function checkNextConfig() {
  console.log('\n2. Verificando configuração do Next.js...');
  
  const nextConfigPath = path.join(process.cwd(), 'next.config.js');
  
  if (!fs.existsSync(nextConfigPath)) {
    console.log('❌ next.config.js não encontrado');
    return false;
  }
  
  const configContent = fs.readFileSync(nextConfigPath, 'utf8');
  
  // Verificar se tem configurações problemáticas
  if (configContent.includes('experimental')) {
    console.log('⚠️  Configurações experimentais detectadas - podem causar problemas no build');
  }
  
  console.log('✅ Configuração do Next.js parece estar correta');
  return true;
}

// 3. Verificar package.json
function checkPackageJson() {
  console.log('\n3. Verificando package.json...');
  
  const packagePath = path.join(process.cwd(), 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  // Verificar scripts necessários
  const requiredScripts = ['build', 'start', 'dev'];
  const missingScripts = requiredScripts.filter(script => !packageJson.scripts[script]);
  
  if (missingScripts.length > 0) {
    console.log(`❌ Scripts faltando no package.json: ${missingScripts.join(', ')}`);
    return false;
  }
  
  // Verificar versão do Next.js
  const nextVersion = packageJson.dependencies?.next || packageJson.devDependencies?.next;
  if (!nextVersion) {
    console.log('❌ Next.js não encontrado nas dependências');
    return false;
  }
  
  console.log(`✅ Next.js versão: ${nextVersion}`);
  console.log('✅ Scripts necessários estão presentes');
  return true;
}

// 4. Verificar estrutura de arquivos
function checkFileStructure() {
  console.log('\n4. Verificando estrutura de arquivos...');
  
  const requiredFiles = [
    'src/app/layout.tsx',
    'src/app/page.tsx',
    'tailwind.config.ts',
    'tsconfig.json'
  ];
  
  const missingFiles = requiredFiles.filter(file => !fs.existsSync(path.join(process.cwd(), file)));
  
  if (missingFiles.length > 0) {
    console.log(`❌ Arquivos faltando: ${missingFiles.join(', ')}`);
    return false;
  }
  
  console.log('✅ Estrutura de arquivos está correta');
  return true;
}

// 5. Verificar configuração do Vercel
function checkVercelConfig() {
  console.log('\n5. Verificando configuração do Vercel...');
  
  const vercelConfigPath = path.join(process.cwd(), 'vercel.json');
  
  if (!fs.existsSync(vercelConfigPath)) {
    console.log('⚠️  vercel.json não encontrado - usando configurações padrão');
    return true;
  }
  
  try {
    const vercelConfig = JSON.parse(fs.readFileSync(vercelConfigPath, 'utf8'));
    
    // Verificar se tem configurações problemáticas
    if (vercelConfig.functions && Object.keys(vercelConfig.functions).length > 0) {
      console.log('✅ Configurações de functions detectadas');
    }
    
    console.log('✅ Configuração do Vercel parece estar correta');
    return true;
  } catch (error) {
    console.log('❌ Erro ao ler vercel.json:', error.message);
    return false;
  }
}

// 6. Gerar relatório de recomendações
function generateRecommendations() {
  console.log('\n📋 RECOMENDAÇÕES PARA CORRIGIR O DEPLOYMENT:\n');
  
  console.log('1. Configurar variáveis de ambiente no Vercel:');
  console.log('   - Acesse o dashboard do Vercel');
  console.log('   - Vá em Settings > Environment Variables');
  console.log('   - Adicione as seguintes variáveis:');
  console.log('     * NEXT_PUBLIC_SUPABASE_URL');
  console.log('     * NEXT_PUBLIC_SUPABASE_ANON_KEY');
  console.log('     * SUPABASE_SERVICE_ROLE_KEY');
  
  console.log('\n2. Verificar configurações de build:');
  console.log('   - Build Command: npm run build');
  console.log('   - Install Command: npm install');
  console.log('   - Framework Preset: Next.js');
  
  console.log('\n3. Verificar logs de erro no Vercel:');
  console.log('   - Acesse a aba "Functions" no dashboard');
  console.log('   - Verifique os logs de erro detalhados');
  console.log('   - Procure por erros de importação ou dependências');
  
  console.log('\n4. Testar build local:');
  console.log('   - Execute: npm run build');
  console.log('   - Se falhar localmente, corrija os erros primeiro');
  
  console.log('\n5. Verificar Node.js version:');
  console.log('   - Certifique-se de usar Node.js 18+ no Vercel');
  console.log('   - Adicione "engines" no package.json se necessário');
}

// Executar diagnóstico
async function runDiagnostic() {
  const checks = [
    checkEnvironmentVariables,
    checkNextConfig,
    checkPackageJson,
    checkFileStructure,
    checkVercelConfig
  ];
  
  let allPassed = true;
  
  for (const check of checks) {
    if (!check()) {
      allPassed = false;
    }
  }
  
  console.log('\n' + '='.repeat(50));
  
  if (allPassed) {
    console.log('✅ Todos os checks passaram! O problema pode estar nas variáveis de ambiente do Vercel.');
  } else {
    console.log('❌ Alguns problemas foram encontrados. Corrija-os antes de fazer o deploy.');
  }
  
  generateRecommendations();
}

// Executar o script
runDiagnostic().catch(console.error);