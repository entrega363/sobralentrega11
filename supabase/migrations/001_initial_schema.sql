-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'empresa', 'entregador', 'consumidor');
CREATE TYPE empresa_status AS ENUM ('pendente', 'aprovada', 'rejeitada', 'suspensa');
CREATE TYPE entregador_status AS ENUM ('pendente', 'aprovado', 'rejeitado', 'suspenso', 'ativo', 'inativo');
CREATE TYPE pedido_status AS ENUM ('pendente', 'aceito', 'preparando', 'pronto', 'saiu_entrega', 'entregue', 'cancelado', 'recusado');
CREATE TYPE tipo_entrega AS ENUM ('sistema', 'proprio');

-- Create profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role user_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create empresas table
CREATE TABLE empresas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  nome VARCHAR NOT NULL,
  cnpj VARCHAR UNIQUE NOT NULL,
  categoria VARCHAR NOT NULL,
  status empresa_status DEFAULT 'pendente',
  endereco JSONB NOT NULL DEFAULT '{}',
  contato JSONB NOT NULL DEFAULT '{}',
  configuracoes JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create entregadores table
CREATE TABLE entregadores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  nome VARCHAR NOT NULL,
  cpf VARCHAR UNIQUE NOT NULL,
  endereco JSONB NOT NULL DEFAULT '{}',
  contato JSONB NOT NULL DEFAULT '{}',
  veiculo JSONB NOT NULL DEFAULT '{}',
  status entregador_status DEFAULT 'pendente',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create consumidores table
CREATE TABLE consumidores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  nome VARCHAR NOT NULL,
  cpf VARCHAR UNIQUE NOT NULL,
  endereco JSONB NOT NULL DEFAULT '{}',
  contato JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create produtos table
CREATE TABLE produtos (
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

-- Create pedidos table
CREATE TABLE pedidos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  consumidor_id UUID REFERENCES consumidores(id) ON DELETE CASCADE,
  status pedido_status DEFAULT 'pendente',
  total DECIMAL(10,2) NOT NULL CHECK (total > 0),
  endereco_entrega JSONB NOT NULL,
  observacoes TEXT,
  forma_pagamento VARCHAR,
  tipo_entrega tipo_entrega DEFAULT 'sistema',
  entregador_id UUID REFERENCES entregadores(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create pedido_itens table
CREATE TABLE pedido_itens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pedido_id UUID REFERENCES pedidos(id) ON DELETE CASCADE,
  produto_id UUID REFERENCES produtos(id),
  empresa_id UUID REFERENCES empresas(id),
  quantidade INTEGER NOT NULL CHECK (quantidade > 0),
  preco_unitario DECIMAL(10,2) NOT NULL CHECK (preco_unitario > 0),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create avaliacoes table
CREATE TABLE avaliacoes (
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_empresas_profile_id ON empresas(profile_id);
CREATE INDEX idx_empresas_status ON empresas(status);
CREATE INDEX idx_empresas_categoria ON empresas(categoria);

CREATE INDEX idx_entregadores_profile_id ON entregadores(profile_id);
CREATE INDEX idx_entregadores_status ON entregadores(status);

CREATE INDEX idx_consumidores_profile_id ON consumidores(profile_id);

CREATE INDEX idx_produtos_empresa_id ON produtos(empresa_id);
CREATE INDEX idx_produtos_categoria ON produtos(categoria);
CREATE INDEX idx_produtos_disponivel ON produtos(disponivel);

CREATE INDEX idx_pedidos_consumidor_id ON pedidos(consumidor_id);
CREATE INDEX idx_pedidos_status ON pedidos(status);
CREATE INDEX idx_pedidos_entregador_id ON pedidos(entregador_id);
CREATE INDEX idx_pedidos_created_at ON pedidos(created_at);

CREATE INDEX idx_pedido_itens_pedido_id ON pedido_itens(pedido_id);
CREATE INDEX idx_pedido_itens_produto_id ON pedido_itens(produto_id);
CREATE INDEX idx_pedido_itens_empresa_id ON pedido_itens(empresa_id);

CREATE INDEX idx_avaliacoes_pedido_id ON avaliacoes(pedido_id);
CREATE INDEX idx_avaliacoes_consumidor_id ON avaliacoes(consumidor_id);
CREATE INDEX idx_avaliacoes_empresa_id ON avaliacoes(empresa_id);
CREATE INDEX idx_avaliacoes_entregador_id ON avaliacoes(entregador_id);