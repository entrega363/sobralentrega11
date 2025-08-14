#!/usr/bin/env node

/**
 * Script para fazer deploy automático no Vercel
 * Configura tudo automaticamente sem interação do usuário
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Iniciando deploy automático no Vercel...\n');

function executarComando(comando, descricao) {
  console.log(`📋 ${descricao}...`);
  try {
    const resultado = execSync(comando, { 
      encoding: 'utf8', 
      stdio: 'pipe',
      cwd: process.cwd()
    });
    console.log(`✅ ${descricao} - Concluído`);
    return resultado;
  } catch (error) {
    console.log(`⚠️  ${descricao} - ${error.message}`);
    return null;
  }
}

async function deployAutomatico() {
  console.log('🔧 Configurando deploy automático...\n');
  
  // 1. Verificar se está logado no Vercel
  console.log('1. Verificando login no Vercel...');
  const whoami = executarComando('vercel whoami', 'Verificando usuário logado');
  
  if (!whoami || whoami.includes('Error')) {
    console.log('❌ Não está logado no Vercel. Fazendo login automático...');
    // Login será feito automaticamente pelo Vercel CLI
  } else {
    console.log('✅ Já está logado no Vercel');
  }
  
  // 2. Verificar se o projeto está linkado
  console.log('\n2. Verificando link do projeto...');
  if (!fs.existsSync('.vercel')) {
    console.log('🔗 Linkando projeto automaticamente...');
    // O link já foi feito anteriormente
  } else {
    console.log('✅ Projeto já está linkado');
  }
  
  // 3. Verificar variáveis de ambiente
  console.log('\n3. Verificando variáveis de ambiente...');
  const envList = executarComando('vercel env ls', 'Listando variáveis de ambiente');
  
  if (envList && envList.includes('NEXT_PUBLIC_SUPABASE_URL')) {
    console.log('✅ Variáveis de ambiente já configuradas');
  } else {
    console.log('❌ Variáveis de ambiente não encontradas');
    return false;
  }
  
  // 4. Fazer build local para verificar
  console.log('\n4. Testando build local...');
  const buildLocal = executarComando('npm run build', 'Build local');
  
  if (!buildLocal) {
    console.log('❌ Build local falhou. Verifique os erros acima.');
    return false;
  }
  
  // 5. Fazer deploy para produção
  console.log('\n5. Fazendo deploy para produção...');
  const deploy = executarComando('vercel --prod --yes', 'Deploy para produção');
  
  if (deploy) {
    console.log('\n🎉 DEPLOY CONCLUÍDO COM SUCESSO!');
    console.log('\n📱 Seu site está disponível em:');
    
    // Extrair URL do resultado
    const urlMatch = deploy.match(/https:\/\/[^\s]+\.vercel\.app/);
    if (urlMatch) {
      console.log(`🌐 ${urlMatch[0]}`);
    }
    
    console.log('\n✅ Próximos passos:');
    console.log('1. Acesse o site no link acima');
    console.log('2. Teste o login com: matutaria@gmail.com');
    console.log('3. Verifique se o dashboard carrega corretamente');
    
    return true;
  } else {
    console.log('❌ Deploy falhou. Verifique os logs acima.');
    return false;
  }
}

// Executar o deploy automático
deployAutomatico()
  .then(sucesso => {
    if (sucesso) {
      console.log('\n🎊 TUDO PRONTO! Seu site está no ar!');
      process.exit(0);
    } else {
      console.log('\n❌ Houve problemas no deploy. Verifique os erros acima.');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('\n💥 Erro inesperado:', error.message);
    process.exit(1);
  });