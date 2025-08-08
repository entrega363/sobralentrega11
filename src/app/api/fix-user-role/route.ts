import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient()
    
    // Get the email from query params
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email') || 'matutaria@gmail.com'
    
    console.log(`Fixing user role for: ${email}`)
    
    // 1. Get user data
    const { data: userData, error: userError } = await supabase.auth.admin.listUsers()
    if (userError) throw userError
    
    const user = userData.users.find(u => u.email === email)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    console.log('User found:', user.id, user.email)
    console.log('User metadata:', user.user_metadata)
    
    // 2. Update profile to empresa
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ 
        role: 'empresa',
        nome: user.user_metadata?.nome || 'Empresa Matutaria'
      })
      .eq('id', user.id)
    
    if (profileError) {
      console.error('Profile update error:', profileError)
      throw profileError
    }
    
    console.log('Profile updated to empresa')
    
    // 3. Check if empresa record exists
    const { data: existingEmpresa } = await supabase
      .from('empresas')
      .select('id')
      .eq('profile_id', user.id)
      .single()
    
    if (!existingEmpresa) {
      // 4. Create empresa record
      const { error: empresaError } = await supabase
        .from('empresas')
        .insert({
          profile_id: user.id,
          nome: user.user_metadata?.nome || 'Empresa Matutaria',
          cnpj: user.user_metadata?.cnpj || '00.000.000/0001-00',
          categoria: user.user_metadata?.categoria || 'Restaurante',
          responsavel: user.user_metadata?.responsavel || 'Responsável',
          telefone: user.user_metadata?.telefone || '(88) 99999-9999',
          endereco: user.user_metadata?.endereco || {
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
    
    // 5. Remove from consumidores if exists
    const { error: deleteError } = await supabase
      .from('consumidores')
      .delete()
      .eq('profile_id', user.id)
    
    if (deleteError && deleteError.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Delete consumidor error:', deleteError)
    } else {
      console.log('Removed from consumidores table (if existed)')
    }
    
    // 6. Verify the fix
    const { data: verifyProfile } = await supabase
      .from('profiles')
      .select('role, nome')
      .eq('id', user.id)
      .single()
    
    const { data: verifyEmpresa } = await supabase
      .from('empresas')
      .select('id, nome')
      .eq('profile_id', user.id)
      .single()
    
    return NextResponse.json({
      success: true,
      message: `User ${email} role fixed successfully!`,
      user: {
        id: user.id,
        email: user.email,
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