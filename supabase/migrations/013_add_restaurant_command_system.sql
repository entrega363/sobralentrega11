-- Migration: Add Restaurant Command System
-- Description: Adds tables and extensions for local restaurant command system with waiters

-- Tabela para garçons da empresa
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

-- Extensão da tabela pedidos para incluir informações locais
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS tipo_pedido VARCHAR(20) DEFAULT 'delivery' 
CHECK (tipo_pedido IN ('delivery', 'local'));

ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS garcom_id UUID REFERENCES garcons(id);
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS mesa VARCHAR(20);
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS observacoes_garcom TEXT;

-- Extensão da tabela profiles para status de disponibilidade (para entregadores fixos)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS status_disponibilidade VARCHAR(30) DEFAULT 'disponivel_sistema' 
CHECK (status_disponibilidade IN ('disponivel_sistema', 'disponivel_empresa', 'indisponivel_empresa', 'indisponivel_total'));

-- Tabela para logs de atividade dos garçons
CREATE TABLE garcon_atividades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  garcom_id UUID REFERENCES garcons(id) ON DELETE CASCADE,
  acao VARCHAR(50) NOT NULL, -- 'login', 'logout', 'criar_pedido', 'editar_pedido', 'cancelar_pedido'
  detalhes JSONB,
  pedido_id UUID REFERENCES pedidos(id),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para histórico de mudanças de status de entregadores
CREATE TABLE entregador_status_historico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entregador_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status_anterior VARCHAR(30),
  status_novo VARCHAR(30),
  motivo TEXT,
  empresa_id UUID REFERENCES empresas(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para gerenciar vínculos empresa-entregador fixo
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

-- Índices para otimização de consultas
CREATE INDEX idx_garcons_empresa_ativo ON garcons(empresa_id, ativo);
CREATE INDEX idx_garcons_usuario ON garcons(usuario);
CREATE INDEX idx_pedidos_garcom ON pedidos(garcom_id);
CREATE INDEX idx_pedidos_tipo ON pedidos(tipo_pedido);
CREATE INDEX idx_garcon_atividades_garcom_data ON garcon_atividades(garcom_id, created_at);
CREATE INDEX idx_profiles_status_disponibilidade ON profiles(status_disponibilidade);
CREATE INDEX idx_entregador_status_historico_entregador ON entregador_status_historico(entregador_id, created_at);
CREATE INDEX idx_empresa_entregador_fixo_empresa ON empresa_entregador_fixo(empresa_id, status);
CREATE INDEX idx_empresa_entregador_fixo_entregador ON empresa_entregador_fixo(entregador_id, status);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_garcons_updated_at 
    BEFORE UPDATE ON garcons 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_empresa_entregador_fixo_updated_at 
    BEFORE UPDATE ON empresa_entregador_fixo 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para registrar atividade do garçom automaticamente
CREATE OR REPLACE FUNCTION registrar_atividade_garcom()
RETURNS TRIGGER AS $$
BEGIN
    -- Registrar login quando ultimo_login é atualizado
    IF TG_OP = 'UPDATE' AND OLD.ultimo_login IS DISTINCT FROM NEW.ultimo_login THEN
        INSERT INTO garcon_atividades (garcom_id, acao, detalhes)
        VALUES (NEW.id, 'login', jsonb_build_object('timestamp', NEW.ultimo_login));
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_registrar_atividade_garcom
    AFTER UPDATE ON garcons
    FOR EACH ROW EXECUTE FUNCTION registrar_atividade_garcom();

-- Função para registrar mudanças de status de entregador
CREATE OR REPLACE FUNCTION registrar_mudanca_status_entregador()
RETURNS TRIGGER AS $$
BEGIN
    -- Registrar mudança de status quando status_disponibilidade é alterado
    IF TG_OP = 'UPDATE' AND OLD.status_disponibilidade IS DISTINCT FROM NEW.status_disponibilidade THEN
        INSERT INTO entregador_status_historico (entregador_id, status_anterior, status_novo)
        VALUES (NEW.id, OLD.status_disponibilidade, NEW.status_disponibilidade);
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_registrar_mudanca_status_entregador
    AFTER UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION registrar_mudanca_status_entregador();

-- RLS (Row Level Security) Policies

-- Políticas para tabela garcons
ALTER TABLE garcons ENABLE ROW LEVEL SECURITY;

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

-- Garçons não são profiles, então não precisam desta política
-- A autenticação de garçons é feita via JWT customizado

-- Políticas para tabela garcon_atividades
ALTER TABLE garcon_atividades ENABLE ROW LEVEL SECURITY;

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

-- Políticas para tabela entregador_status_historico
ALTER TABLE entregador_status_historico ENABLE ROW LEVEL SECURITY;

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

-- Políticas para tabela empresa_entregador_fixo
ALTER TABLE empresa_entregador_fixo ENABLE ROW LEVEL SECURITY;

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

-- Comentários para documentação
COMMENT ON TABLE garcons IS 'Tabela para armazenar informações dos garçons de cada empresa';
COMMENT ON TABLE garcon_atividades IS 'Log de atividades dos garçons (login, logout, ações em pedidos)';
COMMENT ON TABLE entregador_status_historico IS 'Histórico de mudanças de status de disponibilidade dos entregadores';
COMMENT ON TABLE empresa_entregador_fixo IS 'Vínculos entre empresas e entregadores fixos';

COMMENT ON COLUMN garcons.permissoes IS 'Permissões do garçom em formato JSON: {"criar_pedidos": true, "editar_pedidos": true, "cancelar_pedidos": false}';
COMMENT ON COLUMN pedidos.tipo_pedido IS 'Tipo do pedido: delivery (padrão) ou local (feito por garçom)';
COMMENT ON COLUMN pedidos.garcom_id IS 'ID do garçom responsável pelo pedido (apenas para pedidos locais)';
COMMENT ON COLUMN pedidos.mesa IS 'Número ou identificação da mesa (apenas para pedidos locais)';
COMMENT ON COLUMN profiles.status_disponibilidade IS 'Status de disponibilidade do entregador para sistema de entregadores fixos';