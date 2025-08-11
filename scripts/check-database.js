const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente não encontradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkDatabase() {
  console.log('🔍 Verificando conexão com Supabase...')
  
  try {
    // Verificar conexão
    const { data, error } = await supabase.from('profiles').select('count').limit(1)
    
    if (error) {
      console.error('❌ Erro na conexão:', error.message)
      return false
    }
    
    console.log('✅ Conexão com Supabase estabelecida')
    
    // Verificar tabelas principais
    const tables = [
      'profiles',
      'empresas', 
      'produtos',
      'pedidos',
      'entregadores',
      'garcons',
      'empresa_entregador_vinculos'
    ]
    
    console.log('\n📋 Verificando tabelas...')
    
    for (const table of tables) {
      try {
        const { error } = await supabase.from(table).select('*').limit(1)
        if (error) {
          console.log(`❌ Tabela ${table}: ${error.message}`)
        } else {
          console.log(`✅ Tabela ${table}: OK`)
        }
      } catch (err) {
        console.log(`❌ Tabela ${table}: ${err.message}`)
      }
    }
    
    return true
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message)
    return false
  }
}

checkDatabase().then(success => {
  if (success) {
    console.log('\n🎉 Database check concluído!')
  } else {
    console.log('\n💥 Problemas encontrados no database')
    process.exit(1)
  }
})