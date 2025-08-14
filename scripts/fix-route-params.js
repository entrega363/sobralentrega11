const fs = require('fs');
const path = require('path');

// Função para encontrar todos os arquivos de rota
function findRouteFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      files.push(...findRouteFiles(fullPath));
    } else if (item === 'route.ts' && fullPath.includes('[') && fullPath.includes(']')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Função para corrigir um arquivo
function fixRouteFile(filePath) {
  console.log(`Corrigindo: ${filePath}`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Padrão 1: Interface RouteParams
  const interfacePattern = /interface\s+RouteParams\s*\{[^}]*params:\s*\{[^}]*\}[^}]*\}/g;
  if (interfacePattern.test(content)) {
    content = content.replace(interfacePattern, '');
    modified = true;
  }
  
  // Padrão 2: Parâmetros de função com RouteParams
  const functionPattern = /export\s+async\s+function\s+(GET|POST|PUT|DELETE|PATCH)\s*\(\s*([^,]+),\s*\{\s*params\s*\}:\s*RouteParams\s*\)/g;
  content = content.replace(functionPattern, (match, method, request) => {
    modified = true;
    return `export async function ${method}(\n  ${request.trim()},\n  { params }: { params: Promise<{ id: string }> }\n)`;
  });
  
  // Padrão 3: Parâmetros de função sem interface
  const directPattern = /export\s+async\s+function\s+(GET|POST|PUT|DELETE|PATCH)\s*\(\s*([^,]+),\s*\{\s*params\s*\}:\s*\{\s*params:\s*\{[^}]*\}\s*\}\s*\)/g;
  content = content.replace(directPattern, (match, method, request) => {
    modified = true;
    return `export async function ${method}(\n  ${request.trim()},\n  { params }: { params: Promise<{ id: string }> }\n)`;
  });
  
  // Padrão 4: Uso direto de params.id
  if (content.includes('params.id')) {
    // Adicionar await params no início da função
    const functionBodyPattern = /(export\s+async\s+function\s+(?:GET|POST|PUT|DELETE|PATCH)\s*\([^)]*\)\s*\{\s*)(try\s*\{)?/;
    content = content.replace(functionBodyPattern, (match, funcStart, tryBlock) => {
      modified = true;
      if (tryBlock) {
        return `${funcStart}${tryBlock}\n    const resolvedParams = await params`;
      } else {
        return `${funcStart}\n  try {\n    const resolvedParams = await params`;
      }
    });
    
    // Substituir params.id por resolvedParams.id
    content = content.replace(/params\.id/g, 'resolvedParams.id');
    modified = true;
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Corrigido: ${filePath}`);
  } else {
    console.log(`⏭️  Não precisou corrigir: ${filePath}`);
  }
}

// Executar correção
const apiDir = path.join(process.cwd(), 'src', 'app', 'api');
if (fs.existsSync(apiDir)) {
  const routeFiles = findRouteFiles(apiDir);
  console.log(`Encontrados ${routeFiles.length} arquivos de rota com parâmetros dinâmicos:`);
  
  routeFiles.forEach(file => {
    console.log(`- ${file}`);
  });
  
  console.log('\nIniciando correções...\n');
  
  routeFiles.forEach(fixRouteFile);
  
  console.log('\n✅ Correção concluída!');
} else {
  console.log('❌ Diretório src/app/api não encontrado');
}