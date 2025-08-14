const fs = require('fs');
const path = require('path');

// Arquivos que precisam de correção manual
const filesToFix = [
  'src/app/api/admin/consumidores/[id]/status/route.ts',
  'src/app/api/admin/empresas/[id]/status/route.ts',
  'src/app/api/comanda/pedidos/[id]/route.ts'
];

function fixFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`❌ Arquivo não encontrado: ${filePath}`);
    return;
  }
  
  console.log(`🔧 Corrigindo: ${filePath}`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Padrão para funções com parâmetros dinâmicos
  const patterns = [
    // PUT function
    {
      old: /export async function PUT\(request: NextRequest, \{ params \}: \{ params: \{ id: string \} \}\)/g,
      new: 'export async function PUT(\n  request: NextRequest,\n  { params }: { params: Promise<{ id: string }> }\n)'
    },
    // GET function
    {
      old: /export async function GET\(request: NextRequest, \{ params \}: \{ params: \{ id: string \} \}\)/g,
      new: 'export async function GET(\n  request: NextRequest,\n  { params }: { params: Promise<{ id: string }> }\n)'
    },
    // DELETE function
    {
      old: /export async function DELETE\(request: NextRequest, \{ params \}: \{ params: \{ id: string \} \}\)/g,
      new: 'export async function DELETE(\n  request: NextRequest,\n  { params }: { params: Promise<{ id: string }> }\n)'
    },
    // PATCH function
    {
      old: /export async function PATCH\(request: NextRequest, \{ params \}: \{ params: \{ id: string \} \}\)/g,
      new: 'export async function PATCH(\n  request: NextRequest,\n  { params }: { params: Promise<{ id: string }> }\n)'
    }
  ];
  
  // Aplicar padrões
  patterns.forEach(pattern => {
    if (pattern.old.test(content)) {
      content = content.replace(pattern.old, pattern.new);
      modified = true;
    }
  });
  
  // Se modificou a assinatura da função, precisa adicionar await params
  if (modified && content.includes('params.id')) {
    // Encontrar o início do try block e adicionar await params
    const tryPattern = /(export async function (?:GET|POST|PUT|DELETE|PATCH)\([^)]*\)\s*\{\s*)(try\s*\{)/;
    if (tryPattern.test(content)) {
      content = content.replace(tryPattern, '$1$2\n    const resolvedParams = await params');
      // Substituir params.id por resolvedParams.id
      content = content.replace(/params\.id/g, 'resolvedParams.id');
    }
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Corrigido: ${filePath}`);
  } else {
    console.log(`⏭️  Não precisou corrigir: ${filePath}`);
  }
}

console.log('🚀 Iniciando correção dos arquivos restantes...\n');

filesToFix.forEach(fixFile);

console.log('\n✅ Correção concluída!');