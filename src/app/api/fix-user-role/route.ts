import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    
    // Get the email from query params
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email') || 'matutaria@gmail.com'
    
    console.log(`Fixing user role for: ${email}`)
    
    // 1. Get current session to verify user
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    
    // 2. Find user by email in profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()
    
    if (profileError || !profileData) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }
    
    // Only allow the user to fix their own role or admin
    if (session.user.email !== email && profileData.role !== 'admin') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }
    
    console.log('User found:', session.user.id, session.user.email)
    
    // 3. Update profile to empresa
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        role: 'empresa',
        nome: session.user.user_metadata?.nome || 'Empresa Matutaria'
      })
      .eq('id', session.user.id)
    
    if (updateError) {
      console.error('Profile update error:', updateError)
      throw updateError
    }
    
    console.log('Profile updated to empresa')
    
    // 4. Check if empresa record exists
    const { data: existingEmpresa } = await supabase
      .from('empresas')
      .select('id')
      .eq('profile_id', session.user.id)
      .single()
    
    if (!existingEmpresa) {
      // 5. Create empresa record
      const { error: empresaError } = await supabase
        .from('empresas')
        .insert({
          profile_id: session.user.id,
          nome: session.user.user_metadata?.nome || 'Empresa Matutaria',
          cnpj: session.user.user_metadata?.cnpj || '00.000.000/0001-00',
          categoria: session.user.user_metadata?.categoria || 'Restaurante',
          responsavel: session.user.user_metadata?.responsavel || 'Responsável',
          telefone: session.user.user_metadata?.telefone || '(88) 99999-9999',
          endereco: session.user.user_metadata?.endereco || {
            rua: 'Rua Principal',
            numero: '123',
            bairro: 'Centro',
            cidade: 'Sobral',
            cep: '62000-000'
          },
          status: 'aprovada'
        })
      
      if (empresaError) {
        console.error('Empresa creation error:', empresaError)
        throw empresaError
      }
      
      console.log('Empresa record created')
    } else {
      console.log('Empresa record already exists')
    }
    
    // 6. Remove from consumidores if exists
    const { error: deleteError } = await supabase
      .from('consumidores')
      .delete()
      .eq('profile_id', session.user.id)
    
    if (deleteError && deleteError.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Delete consumidor error:', deleteError)
    } else {
      console.log('Removed from consumidores table (if existed)')
    }
    
    // 7. Verify the fix
    const { data: verifyProfile } = await supabase
      .from('profiles')
      .select('role, nome')
      .eq('id', session.user.id)
      .single()
    
    const { data: verifyEmpresa } = await supabase
      .from('empresas')
      .select('id, nome')
      .eq('profile_id', session.user.id)
      .single()
    
    return NextResponse.json({
      success: true,
      message: `User ${email} role fixed successfully!`,
      user: {
        id: session.user.id,
        email: session.user.email,
        role: verifyProfile?.role,
        nome: verifyProfile?.nome,
        hasEmpresaRecord: !!verifyEmpresa
      }
    })
    
  } catch (error: any) {
    console.error('Fix user role error:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      details: error
    }, { status: 500 })
  }
}