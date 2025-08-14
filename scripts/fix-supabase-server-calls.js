const fs = require('fs');
const path = require('path');

// Função para encontrar todos os arquivos TypeScript
function findTsFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.includes('node_modules') && !item.includes('.next')) {
      files.push(...findTsFiles(fullPath));
    } else if (item.endsWith('.ts') || item.endsWith('.tsx')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Função para corrigir um arquivo
function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Padrões para corrigir
  const patterns = [
    // createRouteHandlerClient() -> await createRouteHandlerClient()
    {
      old: /const\s+(\w+)\s*=\s*createRouteHandlerClient\(\)/g,
      new: 'const $1 = await createRouteHandlerClient()'
    },
    // createClient() -> await createClient()
    {
      old: /const\s+(\w+)\s*=\s*createClient\(\)/g,
      new: 'const $1 = await createClient()'
    },
    // createServerSupabaseClient() -> await createServerSupabaseClient()
    {
      old: /const\s+(\w+)\s*=\s*createServerSupabaseClient\(\)/g,
      new: 'const $1 = await createServerSupabaseClient()'
    }
  ];
  
  patterns.forEach(pattern => {
    if (pattern.old.test(content)) {
      content = content.replace(pattern.old, pattern.new);
      modified = true;
    }
  });
  
  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Corrigido: ${filePath}`);
  }
}

// Executar correção
const srcDir = path.join(process.cwd(), 'src');
if (fs.existsSync(srcDir)) {
  const tsFiles = findTsFiles(srcDir);
  console.log(`Encontrados ${tsFiles.length} arquivos TypeScript`);
  
  console.log('\nIniciando correções...\n');
  
  tsFiles.forEach(file => {
    try {
      fixFile(file);
    } catch (error) {
      console.log(`❌ Erro ao corrigir ${file}: ${error.message}`);
    }
  });
  
  console.log('\n✅ Correção concluída!');
} else {
  console.log('❌ Diretório src não encontrado');
}