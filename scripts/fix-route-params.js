const fs = require('fs');
const path = require('path');

// Lista de arquivos para corrigir
const filesToFix = [
  'src/app/api/produtos/[id]/route.ts',
  'src/app/api/pedidos/[id]/status/route.ts',
  'src/app/api/empresas/[id]/status/route.ts',
  'src/app/api/admin/pedidos/[id]/status/route.ts',
  'src/app/api/admin/empresas/[id]/status/route.ts'
];

function fixRouteParams(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Remover interface RouteParams
    content = content.replace(/interface RouteParams \{[\s\S]*?\}\s*\n/g, '');
    
    // Corrigir assinatura da função
    content = content.replace(
      /export async function (GET|POST|PUT|DELETE)\(([^,]+),\s*\{\s*params\s*\}:\s*RouteParams\)/g,
      'export async function $1(\n  $2, \n  { params }: { params: Promise<{ id: string }> }\n) {\n  const { id } = await params'
    );
    
    // Substituir params.id por id
    content = content.replace(/params\.id/g, 'id');
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed: ${filePath}`);
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
  }
}

// Corrigir todos os arquivos
filesToFix.forEach(fixRouteParams);

console.log('🎉 All route files fixed!');