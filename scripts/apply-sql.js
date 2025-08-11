const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente não encontradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function applySql(sqlFile) {
  console.log(`🔄 Aplicando SQL: ${sqlFile}`)
  
  try {
    const sql = fs.readFileSync(sqlFile, 'utf8')
    
    // Executar SQL usando a API REST do Supabase
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey
      },
      body: JSON.stringify({ sql })
    })
    
    if (!response.ok) {
      const error = await response.text()
      throw new Error(`HTTP ${response.status}: ${error}`)
    }
    
    const result = await response.json()
    console.log('✅ SQL aplicado com sucesso!')
    return result
    
  } catch (error) {
    console.error(`❌ Erro ao aplicar SQL:`, error.message)
    return false
  }
}

// Aplicar SQL
const sqlFile = process.argv[2] || 'scripts/create-missing-tables.sql'
applySql(sqlFile)