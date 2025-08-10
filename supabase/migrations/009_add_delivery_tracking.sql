-- Criar tabela para rastreamento de entregas
CREATE TABLE IF NOT EXISTS delivery_locations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pedido_id UUID NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
  entregador_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  accuracy DECIMAL(8, 2) DEFAULT 0,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Garantir que cada pedido tenha apenas uma localização ativa por vez
  UNIQUE(pedido_id)
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_delivery_locations_pedido_id ON delivery_locations(pedido_id);
CREATE INDEX IF NOT EXISTS idx_delivery_locations_entregador_id ON delivery_locations(entregador_id);
CREATE INDEX IF NOT EXISTS idx_delivery_locations_timestamp ON delivery_locations(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_delivery_locations_location ON delivery_locations(latitude, longitude);

-- RLS (Row Level Security)
ALTER TABLE delivery_locations ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
-- Entregadores podem inserir/atualizar suas próprias localizações
CREATE POLICY "Entregadores can manage their own delivery locations" ON delivery_locations
  FOR ALL USING (
    auth.uid() = entregador_id AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'entregador'
    )
  );

-- Consumidores podem ver localizações de seus pedidos
CREATE POLICY "Consumidores can view their order locations" ON delivery_locations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM pedidos 
      WHERE pedidos.id = delivery_locations.pedido_id 
      AND pedidos.consumidor_id = auth.uid()
    )
  );

-- Empresas podem ver localizações de pedidos de seus produtos
CREATE POLICY "Empresas can view their order locations" ON delivery_locations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM pedidos 
      WHERE pedidos.id = delivery_locations.pedido_id 
      AND pedidos.empresa_id = auth.uid()
    )
  );

-- Admins podem ver todas as localizações
CREATE POLICY "Admins can view all delivery locations" ON delivery_locations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_delivery_locations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_delivery_locations_updated_at
  BEFORE UPDATE ON delivery_locations
  FOR EACH ROW
  EXECUTE FUNCTION update_delivery_locations_updated_at();

-- Função para calcular distância entre dois pontos (Haversine)
CREATE OR REPLACE FUNCTION calculate_distance(
  lat1 DECIMAL, lon1 DECIMAL, 
  lat2 DECIMAL, lon2 DECIMAL
) RETURNS DECIMAL AS $$
DECLARE
  R DECIMAL := 6371; -- Raio da Terra em km
  dLat DECIMAL;
  dLon DECIMAL;
  a DECIMAL;
  c DECIMAL;
BEGIN
  dLat := RADIANS(lat2 - lat1);
  dLon := RADIANS(lon2 - lon1);
  
  a := SIN(dLat/2) * SIN(dLat/2) + 
       COS(RADIANS(lat1)) * COS(RADIANS(lat2)) * 
       SIN(dLon/2) * SIN(dLon/2);
  
  c := 2 * ATAN2(SQRT(a), SQRT(1-a));
  
  RETURN R * c;
END;
$$ LANGUAGE plpgsql;

-- View para localizações de entrega com informações do pedido
CREATE OR REPLACE VIEW delivery_tracking_view AS
SELECT 
  dl.*,
  p.numero as pedido_numero,
  p.consumidor_nome,
  p.empresa_nome,
  p.endereco as destino_endereco,
  p.status as pedido_status,
  prof.nome as entregador_nome,
  prof.telefone as entregador_telefone
FROM delivery_locations dl
JOIN pedidos p ON dl.pedido_id = p.id
JOIN profiles prof ON dl.entregador_id = prof.id
WHERE p.status IN ('saiu_entrega', 'entregue');

-- Comentários para documentação
COMMENT ON TABLE delivery_locations IS 'Armazena as localizações em tempo real dos entregadores durante as entregas';
COMMENT ON COLUMN delivery_locations.pedido_id IS 'ID do pedido sendo entregue';
COMMENT ON COLUMN delivery_locations.entregador_id IS 'ID do entregador';
COMMENT ON COLUMN delivery_locations.latitude IS 'Latitude da localização atual';
COMMENT ON COLUMN delivery_locations.longitude IS 'Longitude da localização atual';
COMMENT ON COLUMN delivery_locations.accuracy IS 'Precisão da localização em metros';
COMMENT ON COLUMN delivery_locations.timestamp IS 'Timestamp da localização (do dispositivo)';

-- Função para notificar quando entregador está próximo do destino
CREATE OR REPLACE FUNCTION check_delivery_proximity()
RETURNS TRIGGER AS $$
DECLARE
  destination_coords RECORD;
  distance_km DECIMAL;
BEGIN
  -- Buscar coordenadas do destino (simuladas por enquanto)
  -- Em produção, você teria uma tabela de endereços com coordenadas
  SELECT 
    -3.6880 + (RANDOM() - 0.5) * 0.1 as lat,
    -40.3492 + (RANDOM() - 0.5) * 0.1 as lng
  INTO destination_coords;
  
  -- Calcular distância
  distance_km := calculate_distance(
    NEW.latitude, NEW.longitude,
    destination_coords.lat, destination_coords.lng
  );
  
  -- Se estiver a menos de 500m, enviar notificação
  IF distance_km < 0.5 THEN
    -- Aqui você pode inserir uma notificação ou chamar uma função
    INSERT INTO notifications (
      user_id, 
      title, 
      message, 
      type,
      data
    )
    SELECT 
      p.consumidor_id,
      'Entregador chegando!',
      'Seu entregador está a menos de 500m do destino',
      'delivery_proximity',
      json_build_object('pedido_id', NEW.pedido_id, 'distance', distance_km)
    FROM pedidos p 
    WHERE p.id = NEW.pedido_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para verificar proximidade
CREATE TRIGGER check_delivery_proximity_trigger
  AFTER INSERT OR UPDATE ON delivery_locations
  FOR EACH ROW
  EXECUTE FUNCTION check_delivery_proximity();