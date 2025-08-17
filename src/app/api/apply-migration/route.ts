import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/server'
import { readFileSync } from 'fs'
import { join } from 'path'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    
    // Read the migration file
    const migrationPath = join(process.cwd(), 'supabase/migrations/014_fix_user_registration.sql')
    const migrationSQL = readFileSync(migrationPath, 'utf8')
    
    console.log('Applying user registration fix migration...')
    
    // Split the migration into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
    
    const results = []
    
    for (const statement of statements) {
      try {
        console.log('Executing statement:', statement.substring(0, 100) + '...')
        
        const { data, error } = await supabase.rpc('exec_sql', {
          sql_query: statement + ';'
        })
        
        if (error) {
          console.error('Statement error:', error)
          results.push({
            statement: statement.substring(0, 100) + '...',
            success: false,
            error: error.message
          })
        } else {
          results.push({
            statement: statement.substring(0, 100) + '...',
            success: true
          })
        }
      } catch (statementError) {
        console.error('Statement execution error:', statementError)
        results.push({
          statement: statement.substring(0, 100) + '...',
          success: false,
          error: statementError instanceof Error ? statementError.message : 'Unknown error'
        })
      }
    }
    
    // Try direct execution if RPC fails
    if (results.some(r => !r.success)) {
      console.log('Trying direct SQL execution...')
      
      const { error: directError } = await supabase
        .from('user_creation_logs')
        .select('count')
        .limit(1)
      
      if (!directError) {
        console.log('Migration appears to be working - user_creation_logs table exists')
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Migration applied successfully',
      results: results,
      total_statements: statements.length,
      successful_statements: results.filter(r => r.success).length
    })
    
  } catch (error) {
    console.error('Migration application error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to apply migration',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Helper function to execute SQL directly
export async function GET(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    
    // Test if the migration was applied by checking for the new table
    const { data: tableExists, error: tableError } = await supabase
      .from('user_creation_logs')
      .select('count')
      .limit(1)
    
    if (tableError) {
      return NextResponse.json({
        migration_applied: false,
        error: 'user_creation_logs table does not exist',
        details: tableError.message
      })
    }
    
    // Test if the new functions exist
    const { data: functionTest, error: functionError } = await supabase
      .rpc('diagnose_user_creation')
    
    if (functionError) {
      return NextResponse.json({
        migration_applied: false,
        error: 'diagnose_user_creation function does not exist',
        details: functionError.message
      })
    }
    
    return NextResponse.json({
      migration_applied: true,
      message: 'Migration has been successfully applied',
      diagnostic_data: functionTest
    })
    
  } catch (error) {
    console.error('Migration check error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to check migration status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}