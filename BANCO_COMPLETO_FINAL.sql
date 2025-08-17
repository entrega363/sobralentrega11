-- =====================================================
-- SCRIPT COMPLETO DO BANCO DE DADOS - SISTEMA ENTREGA SOBRAL
-- Execute este script no SQL Editor do Supabase
-- =====================================================

-- 1. EXTENSÕES E TIPOS
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'empresa', 'entregador', 'consumidor', 'garcom');
CREATE TYPE empresa_status AS ENUM ('pendente', 'aprovada', 'rejeitada', 'suspensa');
CREATE TYPE entregador_status AS ENUM ('pendente', 'aprovado', 'rejeitado', 'suspenso', 'ativo', 'inativo');
CREATE TYPE pedido_status AS ENUM ('pendente', 'aceito', 'preparando', 'pronto', 'saiu_entrega', 'entregue', 'cancelado', 'recusado');
CREATE TYPE tipo_entrega AS ENUM ('sistema', 'proprio');
CREATE TYPE notification_type AS ENUM ('pedido', 'entrega', 'avaliacao', 'sistema');

-- 2. TABELAS PRINCIPAIS
-- =====================================================

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role user_role NOT NULL DEFAULT 'consumidor',
  email VARCHAR,
  nome VARCHAR,
  telefone VARCHAR,
  status VARCHAR DEFAULT 'active',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Empresas table
CREATE TABLE IF NOT EXISTS empresas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  nome VARCHAR NOT NULL,
  cnpj VARCHAR UNIQUE NOT NULL,
  categoria VARCHAR NOT NULL,
  responsavel VARCHAR,
  telefone VARCHAR,
  status empresa_status DEFAULT 'pendente',
  endereco JSONB NOT NULL DEFAULT '{}',
  contato JSONB NOT NULL DEFAULT '{}',
  configuracoes JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Entregadores table
CREATE TABLE IF NOT EXISTS entregadores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  nome VARCHAR NOT NULL,
  cpf VARCHAR UNIQUE NOT NULL,
  endereco JSONB NOT NULL DEFAULT '{}',
  contato JSONB NOT NULL DEFAULT '{}',
  veiculo JSONB NOT NULL DEFAULT '{}',
  status entregador_status DEFAULT 'pendente',
  disponivel BOOLEAN DEFAULT false,
  localizacao_atual JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Consumidores table
CREATE TABLE IF NOT EXISTS consumidores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  nome VARCHAR NOT NULL,
  telefone VARCHAR,
  endereco JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Garcons table (para sistema de comanda)
CREATE TABLE IF NOT EXISTS garcons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  nome VARCHAR NOT NULL,
  codigo VARCHAR UNIQUE NOT NULL,
  senha VARCHAR NOT NULL,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Produtos table
CREATE TABLE IF NOT EXISTS produtos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  nome VARCHAR NOT NULL,
  descricao TEXT,
  preco DECIMAL(10,2) NOT NULL CHECK (preco > 0),
  categoria VARCHAR NOT NULL,
  imagem_url VARCHAR,
  disponivel BOOLEAN DEFAULT true,
  tempo_preparacao INTEGER CHECK (tempo_preparacao > 0),
  ingredientes TEXT[],
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pedidos table
CREATE TABLE IF NOT EXISTS pedidos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  consumidor_id UUID REFERENCES consumidores(id) ON DELETE CASCADE,
  status pedido_status DEFAULT 'pendente',
  total DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (total >= 0),
  taxa_entrega DECIMAL(10,2) DEFAULT 0,
  endereco_entrega JSONB NOT NULL,
  observacoes TEXT,
  forma_pagamento VARCHAR,
  tipo_entrega tipo_entrega DEFAULT 'sistema',
  entregador_id UUID REFERENCES entregadores(id),
  garcom_id UUID REFERENCES garcons(id),
  mesa_numero INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pedido_itens table
CREATE TABLE IF NOT EXISTS pedido_itens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pedido_id UUID REFERENCES pedidos(id) ON DELETE CASCADE,
  produto_id UUID REFERENCES produtos(id),
  empresa_id UUID REFERENCES empresas(id),
  quantidade INTEGER NOT NULL CHECK (quantidade > 0),
  preco_unitario DECIMAL(10,2) NOT NULL CHECK (preco_unitario > 0),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Avaliacoes table
CREATE TABLE IF NOT EXISTS avaliacoes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pedido_id UUID REFERENCES pedidos(id) ON DELETE CASCADE,
  consumidor_id UUID REFERENCES consumidores(id) ON DELETE CASCADE,
  empresa_id UUID REFERENCES empresas(id),
  entregador_id UUID REFERENCES entregadores(id),
  nota_empresa INTEGER CHECK (nota_empresa >= 1 AND nota_empresa <= 5),
  nota_entregador INTEGER CHECK (nota_entregador >= 1 AND nota_entregador <= 5),
  comentario_empresa TEXT,
  comentario_entregador TEXT,
  comentario_geral TEXT,
  resposta_empresa TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);