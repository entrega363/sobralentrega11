import { NextRequest } from 'next/server'
import { GARCOM_ERRORS } from '@/types/garcom'
import jwt from 'jsonwebtoken'

export interface GarcomTokenPayload {
  garcom_id: string
  empresa_id: string
  usuario: string
  permissoes: {
    criar_pedidos: boolean
    editar_pedidos: boolean
    cancelar_pedidos: boolean
  }
  type: string
  iat?: number
  exp?: number
}

export interface AuthenticatedGarcomRequest extends NextRequest {
  garcom: GarcomTokenPayload
}

/**
 * Middleware para autenticar garçom via JWT token
 */
export async function authenticateGarcom(request: NextRequest): Promise<{
  success: boolean
  garcom?: GarcomTokenPayload
  error?: string
  status?: number
}> {
  try {
    // Extrair token do header Authorization
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        success: false,
        error: 'Token de acesso requerido',
        status: 401
      }
    }

    const token = authHeader.substring(7) // Remove "Bearer "

    // Verificar e decodificar token
    let decoded: GarcomTokenPayload
    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'fallback-secret'
      ) as GarcomTokenPayload
    } catch (jwtError) {
      return {
        success: false,
        error: GARCOM_ERRORS.SESSAO_EXPIRADA,
        status: 401
      }
    }

    // Verificar se é token de garçom
    if (decoded.type !== 'garcom') {
      return {
        success: false,
        error: GARCOM_ERRORS.PERMISSAO_NEGADA,
        status: 403
      }
    }

    // Verificar se token não expirou (verificação adicional)
    if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
      return {
        success: false,
        error: GARCOM_ERRORS.SESSAO_EXPIRADA,
        status: 401
      }
    }

    return {
      success: true,
      garcom: decoded
    }

  } catch (error) {
    console.error('Erro na autenticação do garçom:', error)
    return {
      success: false,
      error: 'Erro interno do servidor',
      status: 500
    }
  }
}

/**
 * Middleware para verificar permissões específicas do garçom
 */
export function checkGarcomPermission(
  garcom: GarcomTokenPayload,
  requiredPermission: keyof GarcomTokenPayload['permissoes']
): boolean {
  return garcom.permissoes[requiredPermission] === true
}

/**
 * Utilitário para extrair informações do garçom do request
 */
export function getGarcomFromRequest(request: NextRequest): Promise<{
  success: boolean
  garcom?: GarcomTokenPayload
  error?: string
  status?: number
}> {
  return authenticateGarcom(request)
}

/**
 * Wrapper para APIs que requerem autenticação de garçom
 */
export function withGarcomAuth<T extends any[]>(
  handler: (request: NextRequest, garcom: GarcomTokenPayload, ...args: T) => Promise<Response>
) {
  return async (request: NextRequest, ...args: T): Promise<Response> => {
    const auth = await authenticateGarcom(request)
    
    if (!auth.success) {
      return new Response(
        JSON.stringify({ error: auth.error }),
        { 
          status: auth.status || 401,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    return handler(request, auth.garcom!, ...args)
  }
}

/**
 * Wrapper para APIs que requerem permissão específica
 */
export function withGarcomPermission<T extends any[]>(
  requiredPermission: keyof GarcomTokenPayload['permissoes'],
  handler: (request: NextRequest, garcom: GarcomTokenPayload, ...args: T) => Promise<Response>
) {
  return withGarcomAuth(async (request: NextRequest, garcom: GarcomTokenPayload, ...args: T) => {
    if (!checkGarcomPermission(garcom, requiredPermission)) {
      return new Response(
        JSON.stringify({ error: GARCOM_ERRORS.PERMISSAO_NEGADA }),
        { 
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    return handler(request, garcom, ...args)
  })
}

/**
 * Utilitário para gerar token de garçom
 */
export function generateGarcomToken(payload: Omit<GarcomTokenPayload, 'type' | 'iat' | 'exp'>): string {
  const tokenPayload: Omit<GarcomTokenPayload, 'iat' | 'exp'> = {
    ...payload,
    type: 'garcom'
  }

  return jwt.sign(
    tokenPayload,
    process.env.JWT_SECRET || 'fallback-secret',
    { 
      expiresIn: '8h',
      issuer: 'comanda-local'
    }
  )
}

/**
 * Utilitário para verificar se token é válido (sem fazer request)
 */
export function verifyGarcomToken(token: string): {
  success: boolean
  garcom?: GarcomTokenPayload
  error?: string
} {
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'fallback-secret'
    ) as GarcomTokenPayload

    if (decoded.type !== 'garcom') {
      return {
        success: false,
        error: GARCOM_ERRORS.PERMISSAO_NEGADA
      }
    }

    return {
      success: true,
      garcom: decoded
    }

  } catch (error) {
    return {
      success: false,
      error: GARCOM_ERRORS.SESSAO_EXPIRADA
    }
  }
}