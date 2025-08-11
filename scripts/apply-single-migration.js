const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente não encontradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function applySingleMigration(migrationFile) {
  console.log(`🔄 Aplicando migração: ${migrationFile}`)
  
  try {
    const migrationPath = `supabase/migrations/${migrationFile}`
    const sql = fs.readFileSync(migrationPath, 'utf8')
    
    // Dividir o SQL em statements individuais
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))
    
    console.log(`📝 Executando ${statements.length} statements...`)
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';'
      
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: statement })
        
        if (error) {
          console.log(`⚠️  Statement ${i + 1} falhou: ${error.message}`)
          // Continuar com próximo statement se for erro de "já existe"
          if (!error.message.includes('already exists')) {
            throw error
          }
        } else {
          console.log(`✅ Statement ${i + 1} executado com sucesso`)
        }
      } catch (err) {
        console.log(`❌ Erro no statement ${i + 1}: ${err.message}`)
        if (!err.message.includes('already exists')) {
          throw err
        }
      }
    }
    
    console.log(`✅ Migração ${migrationFile} aplicada com sucesso!`)
    return true
    
  } catch (error) {
    console.error(`❌ Erro ao aplicar migração ${migrationFile}:`, error.message)
    return false
  }
}

// Aplicar migração específica
const migrationFile = process.argv[2]
if (!migrationFile) {
  console.error('❌ Especifique o arquivo de migração: node apply-single-migration.js 008_add_push_notifications.sql')
  process.exit(1)
}

applySingleMigration(migrationFile)