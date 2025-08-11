const fs = require('fs')
const path = require('path')

const migrationsDir = 'supabase/migrations'

// Função para corrigir delimitadores SQL
function fixSqlDelimiters(content) {
  // Substituir $ por $$ em funções PL/pgSQL
  let fixed = content
  
  // Padrão mais específico para funções
  fixed = fixed.replace(/AS \$\n/g, 'AS $$\n')
  fixed = fixed.replace(/\n\$ LANGUAGE/g, '\n$$ LANGUAGE')
  
  return fixed
}

// Listar arquivos de migração
const files = fs.readdirSync(migrationsDir)
  .filter(file => file.endsWith('.sql'))
  .sort()

console.log('🔧 Corrigindo delimitadores SQL nas migrações...')

files.forEach(file => {
  const filePath = path.join(migrationsDir, file)
  const content = fs.readFileSync(filePath, 'utf8')
  
  const fixedContent = fixSqlDelimiters(content)
  
  if (content !== fixedContent) {
    fs.writeFileSync(filePath, fixedContent)
    console.log(`✅ Corrigido: ${file}`)
  } else {
    console.log(`⏭️  Sem alterações: ${file}`)
  }
})

console.log('🎉 Correção concluída!')