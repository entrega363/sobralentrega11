-- =====================================================
-- BANCO DE DADOS COMPLETO - SISTEMA DE DELIVERY
-- =====================================================
-- Este script cria todo o banco de dados do zero
-- Execute no SQL Editor do Supabase

-- =====================================================
-- 1. EXTENSÕES E TIPOS
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'empresa', 'entregador', 'consumidor');
CREATE TYPE empresa_status AS ENUM ('pendente', 'aprovada', 'rejeitada', 'suspensa');
CREATE TYPE entregador_status AS ENUM ('pendente', 'aprovado', 'rejeitado', 'suspenso', 'ativo', 'inativo');
CREATE TYPE pedido_status AS ENUM ('pendente', 'aceito', 'preparando', 'pronto', 'saiu_entrega', 'entregue', 'cancelado', 'recusado');
CREATE TYPE tipo_entrega AS ENUM ('sistema', 'proprio');

-- =====================================================
-- 2. TABELAS PRINCIPAIS
-- =====================================================

-- Create profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role user_role NOT NULL,
  status_disponibilidade VARCHAR(30) DEFAULT 'disponivel_sistema' 
    CHECK (status_disponibilidade IN ('disponivel_sistema', 'disponivel_empresa', 'indisponivel_empresa', 'indisponivel_total')),
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
  tipo_pedido VARCHAR(20) DEFAULT 'delivery' CHECK (tipo_pedido IN ('delivery', 'local')),
  garcom_id UUID,
  mesa VARCHAR(20),
  observacoes_garcom TEXT,
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

-- =====================================================
-- 3. SISTEMA DE AVALIAÇÕES
-- =====================================================

CREATE TABLE avaliacoes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pedido_id UUID REFERENCES pedidos(id) ON DELETE CASCADE,
  consumidor_id UUID REFERENCES consumidores(id) ON DELETE CASCADE,
  empresa_id UUID REFERENCES empresas(id),
  entregador_id UUID REFERENCES entregadores(id),
  avaliador_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  avaliador_nome TEXT,
  avaliado_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  avaliado_nome TEXT,
  tipo_avaliacao TEXT CHECK (tipo_avaliacao IN ('empresa', 'entregador', 'consumidor')),
  
  -- Notas (1-5)
  nota_empresa INTEGER CHECK (nota_empresa >= 1 AND nota_empresa <= 5),
  nota_entregador INTEGER CHECK (nota_entregador >= 1 AND nota_entregador <= 5),
  nota_geral INTEGER CHECK (nota_geral >= 1 AND nota_geral <= 5),
  nota_qualidade INTEGER CHECK (nota_qualidade >= 1 AND nota_qualidade <= 5),
  nota_atendimento INTEGER CHECK (nota_atendimento >= 1 AND nota_atendimento <= 5),
  nota_pontualidade INTEGER CHECK (nota_pontualidade >= 1 AND nota_pontualidade <= 5),
  nota_embalagem INTEGER CHECK (nota_embalagem >= 1 AND nota_embalagem <= 5),
  
  -- Comentários
  comentario_empresa TEXT,
  comentario_entregador TEXT,
  comentario_geral TEXT,
  comentario TEXT,
  pontos_positivos TEXT[],
  pontos_negativos TEXT[],
  sentimento TEXT,
  
  -- Resposta
  resposta TEXT,
  respondido_em TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT avaliacoes_pedido_id_avaliador_id_key UNIQUE(pedido_id, avaliador_id)
);

-- =====================================================
-- 4. SISTEMA DE NOTIFICAÇÕES PUSH
-- =====================================================

CREATE TABLE push_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription JSONB NOT NULL,
  user_type TEXT NOT NULL CHECK (user_type IN ('consumidor', 'empresa', 'entregador', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- =====================================================
-- 5. SISTEMA DE RASTREAMENTO DE ENTREGA
-- =====================================================

CREATE TABLE delivery_locations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pedido_id UUID NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
  entregador_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  accuracy DECIMAL(8, 2) DEFAULT 0,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(pedido_id)
);

-- =====================================================
-- 6. SISTEMA DE CHAT
-- =====================================================

CREATE TABLE conversas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pedido_id UUID REFERENCES pedidos(id) ON DELETE SET NULL,
  participantes UUID[] NOT NULL,
  participantes_nomes TEXT[] NOT NULL,
  participantes_tipos TEXT[] NOT NULL,
  titulo TEXT NOT NULL,
  ultima_mensagem TEXT,
  ultima_mensagem_em TIMESTAMP WITH TIME ZONE,
  ativa BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT participantes_length_check CHECK (
    array_length(participantes, 1) = array_length(participantes_nomes, 1) AND
    array_length(participantes, 1) = array_length(participantes_tipos, 1) AND
    array_length(participantes, 1) >= 2
  )
);

CREATE TABLE mensagens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversa_id UUID NOT NULL REFERENCES conversas(id) ON DELETE CASCADE,
  remetente_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  remetente_nome TEXT NOT NULL,
  remetente_tipo TEXT NOT NULL CHECK (remetente_tipo IN ('consumidor', 'empresa', 'entregador', 'admin')),
  conteudo TEXT NOT NULL,
  tipo_mensagem TEXT DEFAULT 'texto' CHECK (tipo_mensagem IN ('texto', 'imagem', 'arquivo', 'localizacao')),
  anexo_url TEXT,
  anexo_nome TEXT,
  lida BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 7. SISTEMA DE ANALYTICS
-- =====================================================

CREATE TABLE analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  event_data JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE analytics_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_name VARCHAR(100) NOT NULL,
  metric_value DECIMAL(15,2) NOT NULL,
  metric_type VARCHAR(50) NOT NULL,
  period_type VARCHAR(20) NOT NULL,
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  filters JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE custom_kpis (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  query_config JSONB NOT NULL,
  display_config JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE saved_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  report_config JSONB NOT NULL,
  schedule_config JSONB DEFAULT '{}',
  is_scheduled BOOLEAN DEFAULT false,
  last_generated TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 8. SISTEMA DE COMANDA (GARÇONS)
-- =====================================================

CREATE TABLE garcons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  nome VARCHAR(100) NOT NULL,
  usuario VARCHAR(50) UNIQUE NOT NULL,
  senha_hash VARCHAR(255) NOT NULL,
  ativo BOOLEAN DEFAULT true,
  permissoes JSONB DEFAULT '{"criar_pedidos": true, "editar_pedidos": true, "cancelar_pedidos": false}',
  ultimo_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE garcon_atividades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  garcom_id UUID REFERENCES garcons(id) ON DELETE CASCADE,
  acao VARCHAR(50) NOT NULL,
  detalhes JSONB,
  pedido_id UUID REFERENCES pedidos(id),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE entregador_status_historico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entregador_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status_anterior VARCHAR(30),
  status_novo VARCHAR(30),
  motivo TEXT,
  empresa_id UUID REFERENCES empresas(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE empresa_entregador_fixo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  entregador_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'ativo', 'inativo')),
  data_convite TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_resposta TIMESTAMP WITH TIME ZONE,
  data_vinculo TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(empresa_id, entregador_id)
);

-- Adicionar referência de garcom na tabela pedidos
ALTER TABLE pedidos ADD CONSTRAINT fk_pedidos_garcom FOREIGN KEY (garcom_id) REFERENCES garcons(id);

-- =====================================================
-- 9. ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Profiles
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_status_disponibilidade ON profiles(status_disponibilidade);

-- Empresas
CREATE INDEX idx_empresas_profile_id ON empresas(profile_id);
CREATE INDEX idx_empresas_status ON empresas(status);
CREATE INDEX idx_empresas_categoria ON empresas(categoria);

-- Entregadores
CREATE INDEX idx_entregadores_profile_id ON entregadores(profile_id);
CREATE INDEX idx_entregadores_status ON entregadores(status);

-- Consumidores
CREATE INDEX idx_consumidores_profile_id ON consumidores(profile_id);

-- Produtos
CREATE INDEX idx_produtos_empresa_id ON produtos(empresa_id);
CREATE INDEX idx_produtos_categoria ON produtos(categoria);
CREATE INDEX idx_produtos_disponivel ON produtos(disponivel);

-- Pedidos
CREATE INDEX idx_pedidos_consumidor_id ON pedidos(consumidor_id);
CREATE INDEX idx_pedidos_status ON pedidos(status);
CREATE INDEX idx_pedidos_entregador_id ON pedidos(entregador_id);
CREATE INDEX idx_pedidos_created_at ON pedidos(created_at);
CREATE INDEX idx_pedidos_garcom ON pedidos(garcom_id);
CREATE INDEX idx_pedidos_tipo ON pedidos(tipo_pedido);

-- Pedido Itens
CREATE INDEX idx_pedido_itens_pedido_id ON pedido_itens(pedido_id);
CREATE INDEX idx_pedido_itens_produto_id ON pedido_itens(produto_id);
CREATE INDEX idx_pedido_itens_empresa_id ON pedido_itens(empresa_id);

-- Avaliações
CREATE INDEX idx_avaliacoes_pedido_id ON avaliacoes(pedido_id);
CREATE INDEX idx_avaliacoes_consumidor_id ON avaliacoes(consumidor_id);
CREATE INDEX idx_avaliacoes_empresa_id ON avaliacoes(empresa_id);
CREATE INDEX idx_avaliacoes_entregador_id ON avaliacoes(entregador_id);
CREATE INDEX idx_avaliacoes_avaliador_id ON avaliacoes(avaliador_id);
CREATE INDEX idx_avaliacoes_avaliado_id ON avaliacoes(avaliado_id);
CREATE INDEX idx_avaliacoes_tipo ON avaliacoes(tipo_avaliacao);
CREATE INDEX idx_avaliacoes_nota_geral ON avaliacoes(nota_geral);
CREATE INDEX idx_avaliacoes_created_at ON avaliacoes(created_at DESC);

-- Push Subscriptions
CREATE INDEX idx_push_subscriptions_user_id ON push_subscriptions(user_id);
CREATE INDEX idx_push_subscriptions_user_type ON push_subscriptions(user_type);
CREATE INDEX idx_push_subscriptions_created_at ON push_subscriptions(created_at);

-- Delivery Locations
CREATE INDEX idx_delivery_locations_pedido_id ON delivery_locations(pedido_id);
CREATE INDEX idx_delivery_locations_entregador_id ON delivery_locations(entregador_id);
CREATE INDEX idx_delivery_locations_timestamp ON delivery_locations(timestamp DESC);
CREATE INDEX idx_delivery_locations_location ON delivery_locations(latitude, longitude);

-- Conversas e Mensagens
CREATE INDEX idx_conversas_participantes ON conversas USING GIN (participantes);
CREATE INDEX idx_conversas_pedido_id ON conversas(pedido_id);
CREATE INDEX idx_conversas_ativa ON conversas(ativa);
CREATE INDEX idx_conversas_updated_at ON conversas(updated_at DESC);
CREATE INDEX idx_mensagens_conversa_id ON mensagens(conversa_id);
CREATE INDEX idx_mensagens_remetente_id ON mensagens(remetente_id);
CREATE INDEX idx_mensagens_created_at ON mensagens(created_at);
CREATE INDEX idx_mensagens_lida ON mensagens(lida);
CREATE INDEX idx_mensagens_tipo ON mensagens(tipo_mensagem);

-- Analytics
CREATE INDEX idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at);
CREATE INDEX idx_analytics_metrics_name ON analytics_metrics(metric_name);
CREATE INDEX idx_analytics_metrics_period ON analytics_metrics(period_start, period_end);
CREATE INDEX idx_custom_kpis_user_id ON custom_kpis(user_id);
CREATE INDEX idx_saved_reports_user_id ON saved_reports(user_id);

-- Garçons e Sistema de Comanda
CREATE INDEX idx_garcons_empresa_ativo ON garcons(empresa_id, ativo);
CREATE INDEX idx_garcons_usuario ON garcons(usuario);
CREATE INDEX idx_garcon_atividades_garcom_data ON garcon_atividades(garcom_id, created_at);
CREATE INDEX idx_entregador_status_historico_entregador ON entregador_status_historico(entregador_id, created_at);
CREATE INDEX idx_empresa_entregador_fixo_empresa ON empresa_entregador_fixo(empresa_id, status);
CREATE INDEX idx_empresa_entregador_fixo_entregador ON empresa_entregador_fixo(entregador_id, status);

-- =====================================================
-- 10. FUNÇÕES E TRIGGERS
-- =====================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_empresas_updated_at BEFORE UPDATE ON empresas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_entregadores_updated_at BEFORE UPDATE ON entregadores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_consumidores_updated_at BEFORE UPDATE ON consumidores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_produtos_updated_at BEFORE UPDATE ON produtos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pedidos_updated_at BEFORE UPDATE ON pedidos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_avaliacoes_updated_at BEFORE UPDATE ON avaliacoes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_push_subscriptions_updated_at BEFORE UPDATE ON push_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_delivery_locations_updated_at BEFORE UPDATE ON delivery_locations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversas_updated_at BEFORE UPDATE ON conversas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mensagens_updated_at BEFORE UPDATE ON mensagens
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_garcons_updated_at BEFORE UPDATE ON garcons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_empresa_entregador_fixo_updated_at BEFORE UPDATE ON empresa_entregador_fixo
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $
BEGIN
  INSERT INTO public.profiles (id, role)
  VALUES (NEW.id, 'consumidor');
  RETURN NEW;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to calculate pedido total
CREATE OR REPLACE FUNCTION calculate_pedido_total(pedido_uuid UUID)
RETURNS DECIMAL AS $
DECLARE
  total_value DECIMAL(10,2);
BEGIN
  SELECT COALESCE(SUM(quantidade * preco_unitario), 0)
  INTO total_value
  FROM pedido_itens
  WHERE pedido_id = pedido_uuid;
  
  RETURN total_value;
END;
$ LANGUAGE plpgsql;

-- Function to update pedido total when items change
CREATE OR REPLACE FUNCTION update_pedido_total()
RETURNS TRIGGER AS $
BEGIN
  UPDATE pedidos 
  SET total = calculate_pedido_total(
    CASE 
      WHEN TG_OP = 'DELETE' THEN OLD.pedido_id
      ELSE NEW.pedido_id
    END
  )
  WHERE id = (
    CASE 
      WHEN TG_OP = 'DELETE' THEN OLD.pedido_id
      ELSE NEW.pedido_id
    END
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$ LANGUAGE plpgsql;

-- Triggers to update pedido total
CREATE TRIGGER update_pedido_total_on_insert
  AFTER INSERT ON pedido_itens
  FOR EACH ROW EXECUTE FUNCTION update_pedido_total();

CREATE TRIGGER update_pedido_total_on_update
  AFTER UPDATE ON pedido_itens
  FOR EACH ROW EXECUTE FUNCTION update_pedido_total();

CREATE TRIGGER update_pedido_total_on_delete
  AFTER DELETE ON pedido_itens
  FOR EACH ROW EXECUTE FUNCTION update_pedido_total();

-- Função para análise de sentimento
CREATE OR REPLACE FUNCTION analyze_sentiment(texto TEXT)
RETURNS TEXT AS $
DECLARE
  palavras_positivas TEXT[] := ARRAY[
    'excelente', 'ótimo', 'bom', 'maravilhoso', 'perfeito', 'delicioso',
    'rápido', 'pontual', 'educado', 'atencioso', 'recomendo', 'satisfeito'
  ];
  palavras_negativas TEXT[] := ARRAY[
    'ruim', 'péssimo', 'horrível', 'demorado', 'atrasado', 'frio',
    'mal educado', 'insatisfeito', 'decepcionado', 'não recomendo'
  ];
  texto_lower TEXT;
  palavra TEXT;
  score_positivo INTEGER := 0;
  score_negativo INTEGER := 0;
BEGIN
  IF texto IS NULL OR LENGTH(TRIM(texto)) = 0 THEN
    RETURN 'neutro';
  END IF;
  
  texto_lower := LOWER(texto);
  
  FOREACH palavra IN ARRAY palavras_positivas LOOP
    IF texto_lower LIKE '%' || palavra || '%' THEN
      score_positivo := score_positivo + 1;
    END IF;
  END LOOP;
  
  FOREACH palavra IN ARRAY palavras_negativas LOOP
    IF texto_lower LIKE '%' || palavra || '%' THEN
      score_negativo := score_negativo + 1;
    END IF;
  END LOOP;
  
  IF score_positivo > score_negativo THEN
    RETURN 'positivo';
  ELSIF score_negativo > score_positivo THEN
    RETURN 'negativo';
  ELSE
    RETURN 'neutro';
  END IF;
END;
$ LANGUAGE plpgsql;

-- Trigger para análise de sentimento automática
CREATE OR REPLACE FUNCTION analyze_rating_sentiment()
RETURNS TRIGGER AS $
BEGIN
  NEW.sentimento := analyze_sentiment(NEW.comentario);
  RETURN NEW;
END;
$ LANGUAGE plpgsql;

CREATE TRIGGER analyze_rating_sentiment_trigger
  BEFORE INSERT OR UPDATE ON avaliacoes
  FOR EACH ROW
  EXECUTE FUNCTION analyze_rating_sentiment();

-- Trigger para atualizar última mensagem na conversa
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $
BEGIN
  UPDATE conversas 
  SET 
    ultima_mensagem = NEW.conteudo,
    ultima_mensagem_em = NEW.created_at,
    updated_at = NOW()
  WHERE id = NEW.conversa_id;
  
  RETURN NEW;
END;
$ LANGUAGE plpgsql;

CREATE TRIGGER update_conversation_last_message_trigger
  AFTER INSERT ON mensagens
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_last_message();

-- Função para registrar atividade do garçom
CREATE OR REPLACE FUNCTION registrar_atividade_garcom()
RETURNS TRIGGER AS $
BEGIN
    IF TG_OP = 'UPDATE' AND OLD.ultimo_login IS DISTINCT FROM NEW.ultimo_login THEN
        INSERT INTO garcon_atividades (garcom_id, acao, detalhes)
        VALUES (NEW.id, 'login', jsonb_build_object('timestamp', NEW.ultimo_login));
    END IF;
    
    RETURN NEW;
END;
$ language 'plpgsql';

CREATE TRIGGER trigger_registrar_atividade_garcom
    AFTER UPDATE ON garcons
    FOR EACH ROW EXECUTE FUNCTION registrar_atividade_garcom();

-- Função para registrar mudanças de status de entregador
CREATE OR REPLACE FUNCTION registrar_mudanca_status_entregador()
RETURNS TRIGGER AS $
BEGIN
    IF TG_OP = 'UPDATE' AND OLD.status_disponibilidade IS DISTINCT FROM NEW.status_disponibilidade THEN
        INSERT INTO entregador_status_historico (entregador_id, status_anterior, status_novo)
        VALUES (NEW.id, OLD.status_disponibilidade, NEW.status_disponibilidade);
    END IF;
    
    RETURN NEW;
END;
$ language 'plpgsql';

CREATE TRIGGER trigger_registrar_mudanca_status_entregador
    AFTER UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION registrar_mudanca_status_entregador();

-- Função para registrar eventos de analytics
CREATE OR REPLACE FUNCTION track_analytics_event(
  p_user_id UUID,
  p_event_type VARCHAR(50),
  p_event_data JSONB DEFAULT '{}',
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $
DECLARE
  event_id UUID;
BEGIN
  INSERT INTO analytics_events (user_id, event_type, event_data, metadata)
  VALUES (p_user_id, p_event_type, p_event_data, p_metadata)
  RETURNING id INTO event_id;
  
  RETURN event_id;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para atualizar métricas automaticamente
CREATE OR REPLACE FUNCTION update_analytics_metrics()
RETURNS TRIGGER AS $
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM track_analytics_event(
      NEW.consumidor_id,
      'pedido_criado',
      jsonb_build_object(
        'pedido_id', NEW.id,
        'valor_total', NEW.total
      )
    );
  ELSIF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    PERFORM track_analytics_event(
      NEW.consumidor_id,
      'pedido_status_changed',
      jsonb_build_object(
        'pedido_id', NEW.id,
        'status_anterior', OLD.status,
        'status_novo', NEW.status
      )
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_analytics_pedidos
  AFTER INSERT OR UPDATE ON pedidos
  FOR EACH ROW EXECUTE FUNCTION update_analytics_metrics();

-- =====================================================
-- 11. VIEWS PARA RELATÓRIOS
-- =====================================================

-- View para estatísticas de usuários
CREATE OR REPLACE VIEW user_rating_stats AS
SELECT 
  avaliado_id,
  avaliado_nome,
  tipo_avaliacao,
  COUNT(*) as total_avaliacoes,
  ROUND(AVG(nota_geral), 1) as media_geral,
  ROUND(AVG(nota_qualidade), 1) as media_qualidade,
  ROUND(AVG(nota_atendimento), 1) as media_atendimento,
  ROUND(AVG(nota_pontualidade), 1) as media_pontualidade,
  ROUND(AVG(nota_embalagem), 1) as media_embalagem,
  COUNT(CASE WHEN nota_geral = 5 THEN 1 END) as notas_5,
  COUNT(CASE WHEN nota_geral = 4 THEN 1 END) as notas_4,
  COUNT(CASE WHEN nota_geral = 3 THEN 1 END) as notas_3,
  COUNT(CASE WHEN nota_geral = 2 THEN 1 END) as notas_2,
  COUNT(CASE WHEN nota_geral = 1 THEN 1 END) as notas_1,
  ROUND(
    (COUNT(CASE WHEN resposta IS NOT NULL THEN 1 END) * 100.0 / COUNT(*)), 1
  ) as percentual_respostas
FROM avaliacoes
GROUP BY avaliado_id, avaliado_nome, tipo_avaliacao;

-- View para métricas de pedidos
CREATE OR REPLACE VIEW pedidos_metrics AS
SELECT 
  DATE_TRUNC('day', created_at) as date,
  COUNT(*) as total_pedidos,
  COUNT(*) FILTER (WHERE status = 'entregue') as pedidos_entregues,
  COUNT(*) FILTER (WHERE status = 'cancelado') as pedidos_cancelados,
  AVG(total) as ticket_medio,
  SUM(total) as receita_total
FROM pedidos
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY date DESC;

-- View para métricas de entregadores
CREATE OR REPLACE VIEW entregadores_metrics AS
SELECT 
  e.id,
  e.nome,
  COUNT(p.id) as total_entregas,
  COUNT(p.id) FILTER (WHERE p.status = 'entregue') as entregas_concluidas,
  AVG(r.nota_geral) as rating_medio,
  AVG(EXTRACT(EPOCH FROM (p.updated_at - p.created_at))/60) as tempo_medio_entrega
FROM entregadores e
LEFT JOIN pedidos p ON e.id = p.entregador_id
LEFT JOIN avaliacoes r ON p.id = r.pedido_id AND r.tipo_avaliacao = 'entregador'
GROUP BY e.id, e.nome;

-- View para métricas de empresas
CREATE OR REPLACE VIEW empresas_metrics AS
SELECT 
  emp.id,
  emp.nome,
  COUNT(p.id) as total_pedidos,
  SUM(p.total) as receita_total,
  AVG(r.nota_geral) as rating_medio,
  COUNT(DISTINCT p.consumidor_id) as clientes_unicos
FROM empresas emp
LEFT JOIN pedido_itens pi ON emp.id = pi.empresa_id
LEFT JOIN pedidos p ON pi.pedido_id = p.id
LEFT JOIN avaliacoes r ON p.id = r.pedido_id AND r.tipo_avaliacao = 'empresa'
GROUP BY emp.id, emp.nome;

-- =====================================================
-- 12. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE entregadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE consumidores ENABLE ROW LEVEL SECURITY;
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedido_itens ENABLE ROW LEVEL SECURITY;
ALTER TABLE avaliacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversas ENABLE ROW LEVEL SECURITY;
ALTER TABLE mensagens ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE garcons ENABLE ROW LEVEL SECURITY;
ALTER TABLE garcon_atividades ENABLE ROW LEVEL SECURITY;
ALTER TABLE entregador_status_historico ENABLE ROW LEVEL SECURITY;
ALTER TABLE empresa_entregador_fixo ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 13. POLÍTICAS DE SEGURANÇA (RLS POLICIES)
-- =====================================================

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Empresas policies
CREATE POLICY "Empresas can view own data" ON empresas
  FOR SELECT USING (
    profile_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Empresas can update own data" ON empresas
  FOR UPDATE USING (profile_id = auth.uid());

CREATE POLICY "Empresas can insert own data" ON empresas
  FOR INSERT WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Admin can manage empresas" ON empresas
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Public can view approved empresas" ON empresas
  FOR SELECT USING (status = 'aprovada');

-- Entregadores policies
CREATE POLICY "Entregadores can view own data" ON entregadores
  FOR SELECT USING (
    profile_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Entregadores can update own data" ON entregadores
  FOR UPDATE USING (profile_id = auth.uid());

CREATE POLICY "Entregadores can insert own data" ON entregadores
  FOR INSERT WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Admin can manage entregadores" ON entregadores
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Consumidores policies
CREATE POLICY "Consumidores can view own data" ON consumidores
  FOR SELECT USING (
    profile_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Consumidores can update own data" ON consumidores
  FOR UPDATE USING (profile_id = auth.uid());

CREATE POLICY "Consumidores can insert own data" ON consumidores
  FOR INSERT WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Admin can manage consumidores" ON consumidores
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Produtos policies
CREATE POLICY "Empresas can manage own produtos" ON produtos
  FOR ALL USING (
    empresa_id IN (
      SELECT id FROM empresas WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "Public can view available produtos" ON produtos
  FOR SELECT USING (
    disponivel = true AND
    empresa_id IN (
      SELECT id FROM empresas WHERE status = 'aprovada'
    )
  );

CREATE POLICY "Admin can view all produtos" ON produtos
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Pedidos policies
CREATE POLICY "Consumidores can view own pedidos" ON pedidos
  FOR SELECT USING (
    consumidor_id IN (
      SELECT id FROM consumidores WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "Consumidores can create pedidos" ON pedidos
  FOR INSERT WITH CHECK (
    consumidor_id IN (
      SELECT id FROM consumidores WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "Empresas can view pedidos with their produtos" ON pedidos
  FOR SELECT USING (
    id IN (
      SELECT DISTINCT pi.pedido_id 
      FROM pedido_itens pi
      JOIN empresas e ON pi.empresa_id = e.id
      WHERE e.profile_id = auth.uid()
    )
  );

CREATE POLICY "Empresas can update pedidos with their produtos" ON pedidos
  FOR UPDATE USING (
    id IN (
      SELECT DISTINCT pi.pedido_id 
      FROM pedido_itens pi
      JOIN empresas e ON pi.empresa_id = e.id
      WHERE e.profile_id = auth.uid()
    )
  );

CREATE POLICY "Entregadores can view assigned pedidos" ON pedidos
  FOR SELECT USING (
    entregador_id IN (
      SELECT id FROM entregadores WHERE profile_id = auth.uid()
    ) OR
    (entregador_id IS NULL AND status IN ('pronto', 'saiu_entrega'))
  );

CREATE POLICY "Entregadores can update assigned pedidos" ON pedidos
  FOR UPDATE USING (
    entregador_id IN (
      SELECT id FROM entregadores WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "Admin can manage all pedidos" ON pedidos
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Pedido_itens policies
CREATE POLICY "Users can view pedido_itens of accessible pedidos" ON pedido_itens
  FOR SELECT USING (
    pedido_id IN (
      SELECT id FROM pedidos
    )
  );

CREATE POLICY "Consumidores can create pedido_itens" ON pedido_itens
  FOR INSERT WITH CHECK (
    pedido_id IN (
      SELECT p.id FROM pedidos p
      JOIN consumidores c ON p.consumidor_id = c.id
      WHERE c.profile_id = auth.uid()
    )
  );

CREATE POLICY "Admin can manage all pedido_itens" ON pedido_itens
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Avaliacoes policies
CREATE POLICY "Anyone can view ratings" ON avaliacoes
  FOR SELECT USING (true);

CREATE POLICY "Users can create ratings for their orders" ON avaliacoes
  FOR INSERT WITH CHECK (
    auth.uid() = avaliador_id AND
    EXISTS (
      SELECT 1 FROM pedidos p
      WHERE p.id = avaliacoes.pedido_id
      AND p.status = 'entregue'
    )
  );

CREATE POLICY "Users can reply to their own ratings" ON avaliacoes
  FOR UPDATE USING (
    auth.uid() = avaliado_id AND
    resposta IS NULL
  )
  WITH CHECK (
    auth.uid() = avaliado_id AND
    resposta IS NOT NULL
  );

CREATE POLICY "Admin can manage all ratings" ON avaliacoes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Push subscriptions policies
CREATE POLICY "Users can manage their own push subscriptions" ON push_subscriptions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all push subscriptions" ON push_subscriptions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Delivery locations policies
CREATE POLICY "Entregadores can manage their own delivery locations" ON delivery_locations
  FOR ALL USING (
    auth.uid() = entregador_id AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'entregador'
    )
  );

CREATE POLICY "Consumidores can view their order locations" ON delivery_locations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM pedidos 
      WHERE pedidos.id = delivery_locations.pedido_id 
      AND pedidos.consumidor_id = auth.uid()
    )
  );

CREATE POLICY "Empresas can view their order locations" ON delivery_locations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM pedidos p
      JOIN pedido_itens pi ON p.id = pi.pedido_id
      JOIN empresas e ON pi.empresa_id = e.id
      WHERE p.id = delivery_locations.pedido_id 
      AND e.profile_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all delivery locations" ON delivery_locations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Conversas policies
CREATE POLICY "Users can view their conversations" ON conversas
  FOR SELECT USING (
    auth.uid() = ANY(participantes)
  );

CREATE POLICY "Users can create conversations" ON conversas
  FOR INSERT WITH CHECK (
    auth.uid() = ANY(participantes)
  );

CREATE POLICY "Users can update their conversations" ON conversas
  FOR UPDATE USING (
    auth.uid() = ANY(participantes)
  );

CREATE POLICY "Admins can manage all conversations" ON conversas
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Mensagens policies
CREATE POLICY "Users can view messages from their conversations" ON mensagens
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversas 
      WHERE conversas.id = mensagens.conversa_id 
      AND auth.uid() = ANY(conversas.participantes)
    )
  );

CREATE POLICY "Users can send messages to their conversations" ON mensagens
  FOR INSERT WITH CHECK (
    auth.uid() = remetente_id AND
    EXISTS (
      SELECT 1 FROM conversas 
      WHERE conversas.id = mensagens.conversa_id 
      AND auth.uid() = ANY(conversas.participantes)
    )
  );

CREATE POLICY "Users can mark messages as read" ON mensagens
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM conversas 
      WHERE conversas.id = mensagens.conversa_id 
      AND auth.uid() = ANY(conversas.participantes)
    )
  );

CREATE POLICY "Admins can manage all messages" ON mensagens
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Analytics policies
CREATE POLICY "Users can view their own analytics events" ON analytics_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own analytics events" ON analytics_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can view metrics" ON analytics_metrics
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can manage their own KPIs" ON custom_kpis
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own reports" ON saved_reports
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all analytics" ON analytics_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Garçons policies
CREATE POLICY "Empresas podem ver seus próprios garçons" ON garcons
    FOR SELECT USING (
        auth.uid() = garcons.empresa_id AND
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'empresa'
        )
    );

CREATE POLICY "Empresas podem inserir garçons" ON garcons
    FOR INSERT WITH CHECK (
        auth.uid() = garcons.empresa_id AND
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'empresa'
        )
    );

CREATE POLICY "Empresas podem atualizar seus garçons" ON garcons
    FOR UPDATE USING (
        auth.uid() = garcons.empresa_id AND
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'empresa'
        )
    );

-- Garcon atividades policies
CREATE POLICY "Empresas podem ver atividades de seus garçons" ON garcon_atividades
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM garcons g
            WHERE g.id = garcon_atividades.garcom_id
            AND g.empresa_id = auth.uid()
            AND EXISTS (
                SELECT 1 FROM profiles p 
                WHERE p.id = auth.uid() 
                AND p.role = 'empresa'
            )
        )
    );

CREATE POLICY "Sistema pode inserir atividades" ON garcon_atividades
    FOR INSERT WITH CHECK (true);

-- Entregador status histórico policies
CREATE POLICY "Entregadores podem ver seu próprio histórico" ON entregador_status_historico
    FOR SELECT USING (entregador_id = auth.uid());

CREATE POLICY "Empresas podem ver histórico de entregadores vinculados" ON entregador_status_historico
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM empresa_entregador_fixo eef
            WHERE eef.entregador_id = entregador_status_historico.entregador_id
            AND eef.empresa_id = auth.uid()
            AND EXISTS (
                SELECT 1 FROM profiles p 
                WHERE p.id = auth.uid() 
                AND p.role = 'empresa'
            )
        )
    );

CREATE POLICY "Sistema pode inserir histórico" ON entregador_status_historico
    FOR INSERT WITH CHECK (true);

-- Empresa entregador fixo policies
CREATE POLICY "Empresas podem ver seus vínculos" ON empresa_entregador_fixo
    FOR SELECT USING (
        auth.uid() = empresa_entregador_fixo.empresa_id AND
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'empresa'
        )
    );

CREATE POLICY "Entregadores podem ver vínculos com eles" ON empresa_entregador_fixo
    FOR SELECT USING (entregador_id = auth.uid());

CREATE POLICY "Empresas podem criar vínculos" ON empresa_entregador_fixo
    FOR INSERT WITH CHECK (
        auth.uid() = empresa_entregador_fixo.empresa_id AND
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'empresa'
        )
    );

CREATE POLICY "Empresas podem atualizar seus vínculos" ON empresa_entregador_fixo
    FOR UPDATE USING (
        auth.uid() = empresa_entregador_fixo.empresa_id AND
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'empresa'
        )
    );

CREATE POLICY "Entregadores podem responder convites" ON empresa_entregador_fixo
    FOR UPDATE USING (
        entregador_id = auth.uid() 
        AND status = 'pendente'
    );

-- =====================================================
-- 14. DADOS DE EXEMPLO
-- =====================================================

-- Inserir usuário admin (você precisa criar este usuário no Supabase Auth primeiro)
-- Depois execute este comando substituindo o UUID pelo ID real do usuário:
-- INSERT INTO profiles (id, role) VALUES ('seu-uuid-aqui', 'admin') ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- Exemplo de empresa
-- INSERT INTO empresas (profile_id, nome, cnpj, categoria, status, endereco, contato) VALUES
-- ('uuid-da-empresa', 'Matutaria Delivery', '12.345.678/0001-90', 'Restaurante', 'aprovada', 
--  '{"rua": "Rua das Flores, 123", "cidade": "Fortaleza", "cep": "60000-000"}',
--  '{"telefone": "(85) 99999-9999", "email": "contato@matutaria.com"}');

-- Exemplo de produtos
-- INSERT INTO produtos (empresa_id, nome, descricao, preco, categoria, disponivel, tempo_preparacao) VALUES
-- ('uuid-da-empresa', 'Hambúrguer Artesanal', 'Hambúrguer com carne 180g, queijo, alface e tomate', 25.90, 'Lanches', true, 20),
-- ('uuid-da-empresa', 'Pizza Margherita', 'Pizza tradicional com molho de tomate, mussarela e manjericão', 35.00, 'Pizzas', true, 30),
-- ('uuid-da-empresa', 'Refrigerante Lata', 'Coca-Cola 350ml', 5.00, 'Bebidas', true, 2);

-- =====================================================
-- SCRIPT COMPLETO CRIADO COM SUCESSO!
-- =====================================================
-- 
-- Este script inclui:
-- ✅ Todas as tabelas do sistema
-- ✅ Índices para performance
-- ✅ Funções e triggers
-- ✅ Views para relatórios
-- ✅ Row Level Security (RLS)
-- ✅ Políticas de segurança
-- ✅ Sistema de avaliações completo
-- ✅ Sistema de chat
-- ✅ Sistema de rastreamento
-- ✅ Sistema de analytics
-- ✅ Sistema de comanda (garçons)
-- ✅ Sistema de notificações push
-- ✅ Sistema de entregadores fixos
-- 
-- Para usar:
-- 1. Copie todo este código
-- 2. Cole no SQL Editor do Supabase
-- 3. Execute o script
-- 4. Crie usuários no Supabase Auth
-- 5. Adicione dados de exemplo conforme necessário
--
-- =====================================================