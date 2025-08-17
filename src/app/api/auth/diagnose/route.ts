import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    
    console.log('🔍 Starting registration system diagnosis...')
    
    // Test 1: Check profiles table structure
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id, role, email, nome, telefone, created_at')
      .limit(3)
    
    // Test 2: Check auth users
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers()
    
    // Test 3: Check empresas table
    const { data: empresasData, error: empresasError } = await supabase
      .from('empresas')
      .select('id, profile_id, nome, status')
      .limit(3)
    
    // Test 4: Check if user_creation_logs table exists
    const { data: logsData, error: logsError } = await supabase
      .from('user_creation_logs')
      .select('id, user_id, step, status, message')
      .limit(3)
    
    const diagnosis = {
      timestamp: new Date().toISOString(),
      tests: {
        profiles_table: {
          accessible: !profilesError,
          error: profilesError?.message,
          sample_data: profilesData,
          count: profilesData?.length || 0
        },
        auth_users: {
          accessible: !authError,
          error: authError?.message,
          count: authData?.users?.length || 0
        },
        empresas_table: {
          accessible: !empresasError,
          error: empresasError?.message,
          sample_data: empresasData,
          count: empresasData?.length || 0
        },
        logs_table: {
          accessible: !logsError,
          error: logsError?.message,
          sample_data: logsData,
          count: logsData?.length || 0
        }
      },
      issues_detected: [] as Array<{
        severity: string
        issue: string
        details: string
      }>,
      recommendations: [] as string[]
    }
    
    // Analyze issues
    if (profilesError) {
      diagnosis.issues_detected.push({
        severity: 'high',
        issue: 'Cannot access profiles table',
        details: profilesError.message
      })
      diagnosis.recommendations.push('Check if profiles table exists and has correct permissions')
    }
    
    if (authError) {
      diagnosis.issues_detected.push({
        severity: 'high',
        issue: 'Cannot access auth users',
        details: authError.message
      })
      diagnosis.recommendations.push('Check Supabase auth configuration and service role key')
    }
    
    if (empresasError) {
      diagnosis.issues_detected.push({
        severity: 'medium',
        issue: 'Cannot access empresas table',
        details: empresasError.message
      })
      diagnosis.recommendations.push('Check if empresas table exists and has correct structure')
    }
    
    if (logsError) {
      diagnosis.issues_detected.push({
        severity: 'low',
        issue: 'User creation logs table not available',
        details: logsError.message
      })
      diagnosis.recommendations.push('Create user_creation_logs table for better debugging')
    }
    
    // Check for data consistency issues
    const authUserCount = authData?.users?.length || 0
    const profileCount = profilesData?.length || 0
    
    if (authUserCount > 0 && profileCount === 0) {
      diagnosis.issues_detected.push({
        severity: 'high',
        issue: 'Auth users exist but no profiles found',
        details: `${authUserCount} auth users but ${profileCount} profiles`
      })
      diagnosis.recommendations.push('Check if handle_new_user trigger is working correctly')
    }
    
    return NextResponse.json({
      success: true,
      diagnosis: diagnosis
    })
    
  } catch (error) {
    console.error('Diagnosis error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to diagnose registration system',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json({
        success: false,
        error: 'Email is required for user-specific diagnosis'
      }, { status: 400 })
    }
    
    console.log(`🔍 Diagnosing user: ${email}`)
    
    // Check if user exists in auth
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
    const authUser = authUsers?.users?.find(u => u.email === email)
    
    // Check if profile exists
    let profileData = null
    let profileError = null
    
    if (authUser) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single()
      
      profileData = data
      profileError = error
    }
    
    // Check if empresa record exists
    let empresaData = null
    let empresaError = null
    
    if (authUser) {
      const { data, error } = await supabase
        .from('empresas')
        .select('*')
        .eq('profile_id', authUser.id)
        .single()
      
      empresaData = data
      empresaError = error
    }
    
    // Check logs if available
    let logsData = null
    let logsError = null
    
    if (authUser) {
      const { data, error } = await supabase
        .from('user_creation_logs')
        .select('*')
        .eq('user_id', authUser.id)
        .order('created_at', { ascending: false })
        .limit(10)
      
      logsData = data
      logsError = error
    }
    
    const userDiagnosis = {
      email: email,
      user_id: authUser?.id,
      auth_user: {
        exists: !!authUser,
        created_at: authUser?.created_at,
        email_confirmed: authUser?.email_confirmed_at ? true : false,
        metadata: authUser?.user_metadata
      },
      profile: {
        exists: !!profileData,
        error: profileError?.message,
        data: profileData
      },
      empresa: {
        exists: !!empresaData,
        error: empresaError?.message,
        data: empresaData
      },
      logs: {
        available: !logsError,
        error: logsError?.message,
        data: logsData
      }
    }
    
    return NextResponse.json({
      success: true,
      user_diagnosis: userDiagnosis
    })
    
  } catch (error) {
    console.error('User diagnosis error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to diagnose user',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}