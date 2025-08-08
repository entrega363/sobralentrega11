import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export function handleApiError(error: unknown) {
  console.error('API Error:', error)

  if (error instanceof ApiError) {
    return NextResponse.json(
      { 
        error: error.message, 
        code: error.code 
      },
      { status: error.statusCode }
    )
  }

  if (error instanceof ZodError) {
    // Verificar se há erro específico de categoria
    const categoryError = error.errors.find(err => err.path.includes('categoria'))
    
    if (categoryError) {
      return NextResponse.json(
        { 
          error: categoryError.message,
          field: 'categoria'
        },
        { status: 400 }
      )
    }

    // Para outros erros de validação, mostrar o primeiro erro mais específico
    const firstError = error.errors[0]
    return NextResponse.json(
      { 
        error: firstError.message,
        field: firstError.path.join('.'),
        details: error.errors 
      },
      { status: 400 }
    )
  }

  // Supabase errors
  if (error && typeof error === 'object' && 'message' in error) {
    const supabaseError = error as { message: string; code?: string }
    
    // Handle specific Supabase error codes
    if (supabaseError.code === '23505') {
      return NextResponse.json(
        { error: 'Registro já existe' },
        { status: 409 }
      )
    }
    
    if (supabaseError.code === '42501') {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: supabaseError.message },
      { status: 400 }
    )
  }

  return NextResponse.json(
    { error: 'Erro interno do servidor' },
    { status: 500 }
  )
}

export async function validateAuth(request: Request) {
  const authHeader = request.headers.get('authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new ApiError('Token de acesso requerido', 401, 'UNAUTHORIZED')
  }

  return authHeader.replace('Bearer ', '')
}

export function createSuccessResponse(data: any, status: number = 200) {
  return NextResponse.json(data, { status })
}

export function createErrorResponse(message: string, status: number = 400) {
  return NextResponse.json({ error: message }, { status })
}