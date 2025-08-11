-- Analytics System Migration
-- Tabelas para métricas e analytics

-- Tabela de eventos de analytics
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  event_data JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de métricas agregadas
CREATE TABLE IF NOT EXISTS analytics_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_name VARCHAR(100) NOT NULL,
  metric_value DECIMAL(15,2) NOT NULL,
  metric_type VARCHAR(50) NOT NULL, -- 'count', 'sum', 'avg', 'percentage'
  period_type VARCHAR(20) NOT NULL, -- 'hourly', 'daily', 'weekly', 'monthly'
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  filters JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de KPIs personalizados
CREATE TABLE IF NOT EXISTS custom_kpis (
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

-- Tabela de relatórios salvos
CREATE TABLE IF NOT EXISTS saved_reports (
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

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_metrics_name ON analytics_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_analytics_metrics_period ON analytics_metrics(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_custom_kpis_user_id ON custom_kpis(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_reports_user_id ON saved_reports(user_id);

-- Views para métricas comuns
CREATE OR REPLACE VIEW pedidos_metrics AS
SELECT 
  DATE_TRUNC('day', created_at) as date,
  COUNT(*) as total_pedidos,
  COUNT(*) FILTER (WHERE status = 'entregue') as pedidos_entregues,
  COUNT(*) FILTER (WHERE status = 'cancelado') as pedidos_cancelados,
  AVG(valor_total) as ticket_medio,
  SUM(valor_total) as receita_total
FROM pedidos
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY date DESC;

CREATE OR REPLACE VIEW entregadores_metrics AS
SELECT 
  e.id,
  e.nome,
  COUNT(p.id) as total_entregas,
  COUNT(p.id) FILTER (WHERE p.status = 'entregue') as entregas_concluidas,
  AVG(r.rating) as rating_medio,
  AVG(EXTRACT(EPOCH FROM (p.updated_at - p.created_at))/60) as tempo_medio_entrega
FROM entregadores e
LEFT JOIN pedidos p ON e.id = p.entregador_id
LEFT JOIN ratings r ON p.id = r.pedido_id AND r.tipo_avaliado = 'entregador'
GROUP BY e.id, e.nome;

CREATE OR REPLACE VIEW empresas_metrics AS
SELECT 
  emp.id,
  emp.nome,
  COUNT(p.id) as total_pedidos,
  SUM(p.valor_total) as receita_total,
  AVG(r.rating) as rating_medio,
  COUNT(DISTINCT p.consumidor_id) as clientes_unicos
FROM empresas emp
LEFT JOIN pedidos p ON emp.id = p.empresa_id
LEFT JOIN ratings r ON p.id = r.pedido_id AND r.tipo_avaliado = 'empresa'
GROUP BY emp.id, emp.nome;

-- Função para registrar eventos de analytics
CREATE OR REPLACE FUNCTION track_analytics_event(
  p_user_id UUID,
  p_event_type VARCHAR(50),
  p_event_data JSONB DEFAULT '{}',
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  event_id UUID;
BEGIN
  INSERT INTO analytics_events (user_id, event_type, event_data, metadata)
  VALUES (p_user_id, p_event_type, p_event_data, p_metadata)
  RETURNING id INTO event_id;
  
  RETURN event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para calcular métricas agregadas
CREATE OR REPLACE FUNCTION calculate_metric(
  p_metric_name VARCHAR(100),
  p_period_start TIMESTAMP WITH TIME ZONE,
  p_period_end TIMESTAMP WITH TIME ZONE,
  p_filters JSONB DEFAULT '{}'
)
RETURNS DECIMAL(15,2) AS $$
DECLARE
  result DECIMAL(15,2);
BEGIN
  CASE p_metric_name
    WHEN 'total_pedidos' THEN
      SELECT COUNT(*) INTO result
      FROM pedidos
      WHERE created_at BETWEEN p_period_start AND p_period_end;
      
    WHEN 'receita_total' THEN
      SELECT COALESCE(SUM(valor_total), 0) INTO result
      FROM pedidos
      WHERE created_at BETWEEN p_period_start AND p_period_end
      AND status = 'entregue';
      
    WHEN 'ticket_medio' THEN
      SELECT COALESCE(AVG(valor_total), 0) INTO result
      FROM pedidos
      WHERE created_at BETWEEN p_period_start AND p_period_end
      AND status = 'entregue';
      
    WHEN 'taxa_entrega' THEN
      SELECT COALESCE(
        COUNT(*) FILTER (WHERE status = 'entregue') * 100.0 / NULLIF(COUNT(*), 0),
        0
      ) INTO result
      FROM pedidos
      WHERE created_at BETWEEN p_period_start AND p_period_end;
      
    ELSE
      result := 0;
  END CASE;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para atualizar métricas automaticamente
CREATE OR REPLACE FUNCTION update_analytics_metrics()
RETURNS TRIGGER AS $$
BEGIN
  -- Registrar evento baseado na operação
  IF TG_OP = 'INSERT' THEN
    PERFORM track_analytics_event(
      NEW.consumidor_id,
      'pedido_criado',
      jsonb_build_object(
        'pedido_id', NEW.id,
        'empresa_id', NEW.empresa_id,
        'valor_total', NEW.valor_total
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aplicar trigger na tabela pedidos
DROP TRIGGER IF EXISTS trigger_analytics_pedidos ON pedidos;
CREATE TRIGGER trigger_analytics_pedidos
  AFTER INSERT OR UPDATE ON pedidos
  FOR EACH ROW EXECUTE FUNCTION update_analytics_metrics();

-- RLS Policies
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_reports ENABLE ROW LEVEL SECURITY;

-- Políticas para analytics_events
CREATE POLICY "Users can view their own analytics events" ON analytics_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own analytics events" ON analytics_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas para analytics_metrics (todos podem ver métricas agregadas)
CREATE POLICY "Authenticated users can view metrics" ON analytics_metrics
  FOR SELECT USING (auth.role() = 'authenticated');

-- Políticas para custom_kpis
CREATE POLICY "Users can manage their own KPIs" ON custom_kpis
  FOR ALL USING (auth.uid() = user_id);

-- Políticas para saved_reports
CREATE POLICY "Users can manage their own reports" ON saved_reports
  FOR ALL USING (auth.uid() = user_id);

-- Admins podem ver tudo
CREATE POLICY "Admins can view all analytics" ON analytics_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can view all KPIs" ON custom_kpis
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can view all reports" ON saved_reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );