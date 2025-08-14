import { NextRequest } from 'next/server'

interface RateLimitConfig {
  windowMs: number // Janela de tempo em milissegundos
  maxRequests: number // Máximo de requests por janela
}

// Store simples em memória (em produção, usar Redis)
const requestCounts = new Map<string, { count: number; resetTime: number }>()

export function rateLimit(config: RateLimitConfig) {
  return (request: NextRequest) => {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const key = `${ip}:${request.nextUrl.pathname}`
    const now = Date.now()
    
    // Limpar entradas expiradas
    requestCounts.forEach((v, k) => {
      if (now > v.resetTime) {
        requestCounts.delete(k)
      }
    })
    
    const current = requestCounts.get(key)
    
    if (!current) {
      // Primeira request
      requestCounts.set(key, {
        count: 1,
        resetTime: now + config.windowMs
      })
      return { allowed: true, remaining: config.maxRequests - 1 }
    }
    
    if (now > current.resetTime) {
      // Janela expirou, resetar
      requestCounts.set(key, {
        count: 1,
        resetTime: now + config.windowMs
      })
      return { allowed: true, remaining: config.maxRequests - 1 }
    }
    
    if (current.count >= config.maxRequests) {
      // Limite excedido
      return { 
        allowed: false, 
        remaining: 0,
        resetTime: current.resetTime
      }
    }
    
    // Incrementar contador
    current.count++
    requestCounts.set(key, current)
    
    return { 
      allowed: true, 
      remaining: config.maxRequests - current.count 
    }
  }
}

// Configurações pré-definidas
export const rateLimitConfigs = {
  // API geral: 100 requests por minuto
  general: { windowMs: 60 * 1000, maxRequests: 100 },
  
  // Login: 5 tentativas por minuto
  auth: { windowMs: 60 * 1000, maxRequests: 5 },
  
  // Criação de recursos: 20 por minuto
  create: { windowMs: 60 * 1000, maxRequests: 20 },
  
  // Upload de arquivos: 10 por minuto
  upload: { windowMs: 60 * 1000, maxRequests: 10 },
}