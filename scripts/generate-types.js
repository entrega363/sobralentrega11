#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Check if Supabase CLI is installed
try {
  execSync('supabase --version', { stdio: 'ignore' });
} catch (error) {
  console.error('❌ Supabase CLI não está instalado.');
  console.log('📦 Instale com: npm install -g supabase');
  process.exit(1);
}

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  console.error('❌ Arquivo .env.local não encontrado.');
  console.log('📝 Crie o arquivo .env.local com as configurações do Supabase.');
  process.exit(1);
}

// Read environment variables
require('dotenv').config({ path: envPath });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não configuradas.');
  console.log('📝 Configure NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env.local');
  process.exit(1);
}

// Extract project ID from URL
const projectId = supabaseUrl.match(/https:\/\/(.+)\.supabase\.co/)?.[1];
if (!projectId) {
  console.error('❌ URL do Supabase inválida.');
  process.exit(1);
}

try {
  console.log('🔄 Gerando tipos TypeScript do Supabase...');
  
  // Generate types
  const command = `supabase gen types typescript --project-id ${projectId} --schema public`;
  const types = execSync(command, { encoding: 'utf8' });
  
  // Write to file
  const typesPath = path.join(process.cwd(), 'src', 'types', 'database.ts');
  fs.writeFileSync(typesPath, types);
  
  console.log('✅ Tipos gerados com sucesso em src/types/database.ts');
} catch (error) {
  console.error('❌ Erro ao gerar tipos:', error.message);
  process.exit(1);
}