const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function applyMigration() {
  try {
    console.log('🚀 Starting migration application...')
    
    // Read the migration file
    const migrationPath = path.join(__dirname, 'supabase/migrations/014_fix_user_registration.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
    
    console.log('📖 Migration file loaded successfully')
    
    // Split into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`)
    
    let successCount = 0
    let errorCount = 0
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      
      try {
        console.log(`⚡ Executing statement ${i + 1}/${statements.length}...`)
        console.log(`   ${statement.substring(0, 80)}...`)
        
        const { data, error } = await supabase.rpc('exec_sql', {
          sql_query: statement + ';'
        })
        
        if (error) {
          console.error(`❌ Error in statement ${i + 1}:`, error.message)
          errorCount++
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`)
          successCount++
        }
        
        // Small delay to avoid overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 100))
        
      } catch (err) {
        console.error(`❌ Exception in statement ${i + 1}:`, err.message)
        errorCount++
      }
    }
    
    console.log('\n📊 Migration Summary:')
    console.log(`   ✅ Successful: ${successCount}`)
    console.log(`   ❌ Errors: ${errorCount}`)
    console.log(`   📝 Total: ${statements.length}`)
    
    // Test the migration by checking if new table exists
    console.log('\n🔍 Testing migration...')
    
    const { data: testData, error: testError } = await supabase
      .from('user_creation_logs')
      .select('count')
      .limit(1)
    
    if (testError) {
      console.error('❌ Migration test failed:', testError.message)
    } else {
      console.log('✅ Migration test passed - user_creation_logs table exists')
    }
    
    // Test diagnostic function
    const { data: diagnosticData, error: diagnosticError } = await supabase
      .rpc('diagnose_user_creation')
    
    if (diagnosticError) {
      console.error('❌ Diagnostic function test failed:', diagnosticError.message)
    } else {
      console.log('✅ Diagnostic function test passed')
      console.log('📊 System health:', JSON.stringify(diagnosticData, null, 2))
    }
    
    console.log('\n🎉 Migration application completed!')
    
  } catch (error) {
    console.error('💥 Fatal error applying migration:', error)
    process.exit(1)
  }
}

// Run the migration
applyMigration()
  .then(() => {
    console.log('✨ All done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Unhandled error:', error)
    process.exit(1)
  })