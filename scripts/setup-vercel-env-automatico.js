#!/usr/bin/env node

/**
 * Script para configurar variáveis de ambiente no Vercel automaticamente
 * Requer Vercel CLI instalado: npm i -g vercel
 */

const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 CONFIGURAÇÃO AUTOMÁTICA DE VARIÁVEIS NO VERCEL\n');

async function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function main() {
  try {
    console.log('📋 Vou configurar as variáveis de ambiente automaticamente!\n');
    
    // Verificar se Vercel CLI está instalado
    try {
      execSync('vercel --version', { stdio: 'ignore' });
      console.log('✅ Vercel CLI encontrado');
    } catch (error) {
      console.log('❌ Vercel CLI não encontrado. Instalando...');
      execSync('npm install -g vercel', { stdio: 'inherit' });
      console.log('✅ Vercel CLI instalado');
    }
    
    // Login no Vercel
    console.log('\n🔐 Fazendo login no Vercel...');
    execSync('vercel login', { stdio: 'inherit' });
    
    // Link do projeto
    console.log('\n🔗 Conectando ao projeto...');
    execSync('vercel link', { stdio: 'inherit' });
    
    // Coletar informações do Supabase
    console.log('\n📝 Agora preciso das informações do Supabase:');
    
    const supabaseUrl = await question('Cole a URL do Supabase (https://xxx.supabase.co): ');
    const anonKey = await question('Cole a ANON KEY (eyJ0eXAi...): ');
    const serviceKey = await question('Cole a SERVICE ROLE KEY (eyJ0eXAi...): ');
    
    console.log('\n⚙️ Configurando variáveis de ambiente...');
    
    // Configurar variáveis
    execSync(`vercel env add NEXT_PUBLIC_SUPABASE_URL production`, {
      input: supabaseUrl,
      stdio: ['pipe', 'inherit', 'inherit']
    });
    
    execSync(`vercel env add NEXT_PUBLIC_SUPABASE_URL preview`, {
      input: supabaseUrl,
      stdio: ['pipe', 'inherit', 'inherit']
    });
    
    execSync(`vercel env add NEXT_PUBLIC_SUPABASE_URL development`, {
      input: supabaseUrl,
      stdio: ['pipe', 'inherit', 'inherit']
    });
    
    execSync(`vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production`, {
      input: anonKey,
      stdio: ['pipe', 'inherit', 'inherit']
    });
    
    execSync(`vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY preview`, {
      input: anonKey,
      stdio: ['pipe', 'inherit', 'inherit']
    });
    
    execSync(`vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY development`, {
      input: anonKey,
      stdio: ['pipe', 'inherit', 'inherit']
    });
    
    execSync(`vercel env add SUPABASE_SERVICE_ROLE_KEY production`, {
      input: serviceKey,
      stdio: ['pipe', 'inherit', 'inherit']
    });
    
    execSync(`vercel env add SUPABASE_SERVICE_ROLE_KEY preview`, {
      input: serviceKey,
      stdio: ['pipe', 'inherit', 'inherit']
    });
    
    execSync(`vercel env add SUPABASE_SERVICE_ROLE_KEY development`, {
      input: serviceKey,
      stdio: ['pipe', 'inherit', 'inherit']
    });
    
    console.log('\n🚀 Fazendo redeploy...');
    execSync('vercel --prod', { stdio: 'inherit' });
    
    console.log('\n🎉 SUCESSO! Variáveis configuradas e deploy realizado!');
    console.log('\n📋 Próximos passos:');
    console.log('1. Execute as migrations no Supabase');
    console.log('2. Crie os usuários de teste');
    console.log('3. Teste o sistema na URL gerada');
    
  } catch (error) {
    console.error('\n❌ Erro:', error.message);
    console.log('\n🔧 Solução manual:');
    console.log('1. Acesse vercel.com');
    console.log('2. Vá em Settings → Environment Variables');
    console.log('3. Configure as 3 variáveis manualmente');
  } finally {
    rl.close();
  }
}

main();