import { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

export interface GarcomTokenPayload {
  garcomId: string
  empresaId: string
  nome: string
  usuario: string
  permissoes: {
    criar_pedidos: boolean
    editar_pedidos: boolean
    cancelar_pedidos: boolean
  }
  iat: number
  exp: number
}

export const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export function generateGarcomToken(garcom: {
  id: string
  empresa_id: string
  nome: string
  usuario: string
  permissoes: any
}): string {
  const payload: Omit<GarcomTokenPayload, 'iat' | 'exp'> = {
    garcomId: garcom.id,
    empresaId: garcom.empresa_id,
    nome: garcom.nome,
    usuario: garcom.usuario,
    permissoes: garcom.permissoes
  }

  return jwt.sign(payload, JWT_SECRET, { 
    expiresIn: '8h' // Token expira em 8 horas
  })
}

export function verifyGarcomToken(token: string): GarcomTokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as GarcomTokenPayload
    return decoded
  } catch (error) {
    console.error('Erro ao verificar token do garçom:', error)
    return null
  }
}

export function extractGarcomTokenFromRequest(request: NextRequest): string | null {
  // Tentar pegar do header Authorization
  const authHeader = request.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }

  // Tentar pegar do cookie
  const tokenCookie = request.cookies.get('garcom_token')
  if (tokenCookie) {
    return tokenCookie.value
  }

  return null
}

export function getGarcomFromRequest(request: NextRequest): GarcomTokenPayload | null {
  const token = extractGarcomTokenFromRequest(request)
  if (!token) {
    return null
  }

  return verifyGarcomToken(token)
}

// Utilitário para verificar permissões
export function hasPermission(
  garcom: GarcomTokenPayload, 
  permission: keyof GarcomTokenPayload['permissoes']
): boolean {
  return garcom.permissoes[permission] === true
}

// Utilitário para criar resposta de erro de autenticação
export function createAuthErrorResponse(message: string, status: number = 401) {
  return new Response(
    JSON.stringify({ 
      error: message,
      code: 'GARCOM_AUTH_ERROR'
    }),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  )
}

// Middleware para proteger rotas de garçom
export function requireGarcomAuth(handler: (request: NextRequest, garcom: GarcomTokenPayload) => Promise<Response>) {
  return async (request: NextRequest) => {
    const garcom = getGarcomFromRequest(request)
    
    if (!garcom) {
      return createAuthErrorResponse('Token de autenticação não encontrado ou inválido')
    }

    // Verificar se o token não expirou
    const now = Math.floor(Date.now() / 1000)
    if (garcom.exp < now) {
      return createAuthErrorResponse('Token expirado')
    }

    return handler(request, garcom)
  }
}

// Middleware para verificar permissões específicas
export function requireGarcomPermission(
  permission: keyof GarcomTokenPayload['permissoes'],
  handler: (request: NextRequest, garcom: GarcomTokenPayload) => Promise<Response>
) {
  return requireGarcomAuth(async (request: NextRequest, garcom: GarcomTokenPayload) => {
    if (!hasPermission(garcom, permission)) {
      return createAuthErrorResponse(
        `Permissão '${permission}' necessária para esta ação`,
        403
      )
    }

    return handler(request, garcom)
  })
}