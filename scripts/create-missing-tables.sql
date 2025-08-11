-- Criar tabela de garçons (do sistema de comanda)
CREATE TABLE IF NOT EXISTS garcons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  empresa_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  telefone VARCHAR(20),
  senha_hash VARCHAR(255) NOT NULL,
  ativo BOOLEAN DEFAULT true,
  ultimo_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para garçons
CREATE INDEX IF NOT EXISTS idx_garcons_empresa_id ON garcons(empresa_id);
CREATE INDEX IF NOT EXISTS idx_garcons_email ON garcons(email);
CREATE INDEX IF NOT EXISTS idx_garcons_ativo ON garcons(ativo);

-- Tabela de logs de atividade dos garçons
CREATE TABLE IF NOT EXISTS garcom_activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  garcom_id UUID NOT NULL REFERENCES garcons(id) ON DELETE CASCADE,
  acao VARCHAR(100) NOT NULL,
  detalhes JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para logs
CREATE INDEX IF NOT EXISTS idx_garcom_activity_logs_garcom_id ON garcom_activity_logs(garcom_id);
CREATE INDEX IF NOT EXISTS idx_garcom_activity_logs_created_at ON garcom_activity_logs(created_at DESC);

-- Tabela de vínculos empresa-entregador (sistema de entregadores fixos)
CREATE TABLE IF NOT EXISTS empresa_entregador_vinculos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  empresa_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  entregador_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'aceito', 'recusado', 'cancelado')),
  data_convite TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_resposta TIMESTAMP WITH TIME ZONE,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Garantir que não haja vínculos duplicados
  UNIQUE(empresa_id, entregador_id)
);

-- Índices para vínculos
CREATE INDEX IF NOT EXISTS idx_empresa_entregador_vinculos_empresa_id ON empresa_entregador_vinculos(empresa_id);
CREATE INDEX IF NOT EXISTS idx_empresa_entregador_vinculos_entregador_id ON empresa_entregador_vinculos(entregador_id);
CREATE INDEX IF NOT EXISTS idx_empresa_entregador_vinculos_status ON empresa_entregador_vinculos(status);

-- Adicionar campos ao pedidos para suporte a pedidos locais
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS tipo VARCHAR(20) DEFAULT 'delivery' CHECK (tipo IN ('delivery', 'local'));
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS garcom_id UUID REFERENCES garcons(id);
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS mesa VARCHAR(10);

-- Adicionar campo de status de disponibilidade aos entregadores
ALTER TABLE entregadores ADD COLUMN IF NOT EXISTS status_disponibilidade VARCHAR(20) DEFAULT 'indisponivel' CHECK (status_disponibilidade IN ('disponivel', 'ocupado', 'indisponivel', 'pausado'));

-- RLS para garçons
ALTER TABLE garcons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Empresas can manage their own garcons" ON garcons
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'empresa'
      AND profiles.id = garcons.empresa_id
    )
  );

CREATE POLICY "Garcons can view their own data" ON garcons
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM garcons g
      WHERE g.id = garcons.id
      AND g.email = auth.jwt() ->> 'email'
    )
  );

-- RLS para logs de atividade
ALTER TABLE garcom_activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Empresas can view their garcons logs" ON garcom_activity_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM garcons g
      JOIN profiles p ON p.id = g.empresa_id
      WHERE g.id = garcom_activity_logs.garcom_id
      AND p.id = auth.uid()
      AND p.role = 'empresa'
    )
  );

-- RLS para vínculos empresa-entregador
ALTER TABLE empresa_entregador_vinculos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Empresas can manage their own vinculos" ON empresa_entregador_vinculos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'empresa'
      AND profiles.id = empresa_entregador_vinculos.empresa_id
    )
  );

CREATE POLICY "Entregadores can view and respond to their vinculos" ON empresa_entregador_vinculos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'entregador'
      AND profiles.id = empresa_entregador_vinculos.entregador_id
    )
  );

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_garcons_updated_at
    BEFORE UPDATE ON garcons
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_empresa_entregador_vinculos_updated_at
    BEFORE UPDATE ON empresa_entregador_vinculos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();