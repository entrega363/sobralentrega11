export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          role: 'admin' | 'empresa' | 'entregador' | 'consumidor'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          role: 'admin' | 'empresa' | 'entregador' | 'consumidor'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          role?: 'admin' | 'empresa' | 'entregador' | 'consumidor'
          created_at?: string
          updated_at?: string
        }
      }
      empresas: {
        Row: {
          id: string
          profile_id: string
          nome: string
          cnpj: string
          categoria: string
          status: 'pendente' | 'aprovada' | 'rejeitada' | 'suspensa'
          endereco: Json
          contato: Json
          configuracoes: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          nome: string
          cnpj: string
          categoria: string
          status?: 'pendente' | 'aprovada' | 'rejeitada' | 'suspensa'
          endereco: Json
          contato: Json
          configuracoes?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          nome?: string
          cnpj?: string
          categoria?: string
          status?: 'pendente' | 'aprovada' | 'rejeitada' | 'suspensa'
          endereco?: Json
          contato?: Json
          configuracoes?: Json
          created_at?: string
          updated_at?: string
        }
      }
      entregadores: {
        Row: {
          id: string
          profile_id: string
          nome: string
          cpf: string
          endereco: Json
          contato: Json
          veiculo: Json
          status: 'pendente' | 'aprovado' | 'rejeitado' | 'suspenso' | 'ativo' | 'inativo'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          nome: string
          cpf: string
          endereco: Json
          contato: Json
          veiculo: Json
          status?: 'pendente' | 'aprovado' | 'rejeitado' | 'suspenso' | 'ativo' | 'inativo'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          nome?: string
          cpf?: string
          endereco?: Json
          contato?: Json
          veiculo?: Json
          status?: 'pendente' | 'aprovado' | 'rejeitado' | 'suspenso' | 'ativo' | 'inativo'
          created_at?: string
          updated_at?: string
        }
      }
      consumidores: {
        Row: {
          id: string
          profile_id: string
          nome: string
          cpf: string
          endereco: Json
          contato: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          nome: string
          cpf: string
          endereco: Json
          contato: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          nome?: string
          cpf?: string
          endereco?: Json
          contato?: Json
          created_at?: string
          updated_at?: string
        }
      }
      produtos: {
        Row: {
          id: string
          empresa_id: string
          nome: string
          descricao: string | null
          preco: number
          categoria: string
          imagem_url: string | null
          disponivel: boolean
          tempo_preparacao: number | null
          ingredientes: string[] | null
          observacoes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          empresa_id: string
          nome: string
          descricao?: string | null
          preco: number
          categoria: string
          imagem_url?: string | null
          disponivel?: boolean
          tempo_preparacao?: number | null
          ingredientes?: string[] | null
          observacoes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          empresa_id?: string
          nome?: string
          descricao?: string | null
          preco?: number
          categoria?: string
          imagem_url?: string | null
          disponivel?: boolean
          tempo_preparacao?: number | null
          ingredientes?: string[] | null
          observacoes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      pedidos: {
        Row: {
          id: string
          consumidor_id: string
          status: 'pendente' | 'aceito' | 'preparando' | 'pronto' | 'saiu_entrega' | 'entregue' | 'cancelado' | 'recusado'
          total: number
          endereco_entrega: Json
          observacoes: string | null
          forma_pagamento: string | null
          tipo_entrega: 'sistema' | 'proprio'
          entregador_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          consumidor_id: string
          status?: 'pendente' | 'aceito' | 'preparando' | 'pronto' | 'saiu_entrega' | 'entregue' | 'cancelado' | 'recusado'
          total: number
          endereco_entrega: Json
          observacoes?: string | null
          forma_pagamento?: string | null
          tipo_entrega?: 'sistema' | 'proprio'
          entregador_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          consumidor_id?: string
          status?: 'pendente' | 'aceito' | 'preparando' | 'pronto' | 'saiu_entrega' | 'entregue' | 'cancelado' | 'recusado'
          total?: number
          endereco_entrega?: Json
          observacoes?: string | null
          forma_pagamento?: string | null
          tipo_entrega?: 'sistema' | 'proprio'
          entregador_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      pedido_itens: {
        Row: {
          id: string
          pedido_id: string
          produto_id: string
          empresa_id: string
          quantidade: number
          preco_unitario: number
          observacoes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          pedido_id: string
          produto_id: string
          empresa_id: string
          quantidade: number
          preco_unitario: number
          observacoes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          pedido_id?: string
          produto_id?: string
          empresa_id?: string
          quantidade?: number
          preco_unitario?: number
          observacoes?: string | null
          created_at?: string
        }
      }
      avaliacoes: {
        Row: {
          id: string
          pedido_id: string
          consumidor_id: string
          empresa_id: string | null
          entregador_id: string | null
          nota_empresa: number | null
          nota_entregador: number | null
          comentario_empresa: string | null
          comentario_entregador: string | null
          comentario_geral: string | null
          created_at: string
        }
        Insert: {
          id?: string
          pedido_id: string
          consumidor_id: string
          empresa_id?: string | null
          entregador_id?: string | null
          nota_empresa?: number | null
          nota_entregador?: number | null
          comentario_empresa?: string | null
          comentario_entregador?: string | null
          comentario_geral?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          pedido_id?: string
          consumidor_id?: string
          empresa_id?: string | null
          entregador_id?: string | null
          nota_empresa?: number | null
          nota_entregador?: number | null
          comentario_empresa?: string | null
          comentario_entregador?: string | null
          comentario_geral?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'admin' | 'empresa' | 'entregador' | 'consumidor'
      empresa_status: 'pendente' | 'aprovada' | 'rejeitada' | 'suspensa'
      entregador_status: 'pendente' | 'aprovado' | 'rejeitado' | 'suspenso' | 'ativo' | 'inativo'
      pedido_status: 'pendente' | 'aceito' | 'preparando' | 'pronto' | 'saiu_entrega' | 'entregue' | 'cancelado' | 'recusado'
      tipo_entrega: 'sistema' | 'proprio'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}