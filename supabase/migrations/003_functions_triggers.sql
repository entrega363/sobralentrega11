-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

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

-- Function to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role)
  VALUES (NEW.id, 'consumidor'); -- Default role
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to calculate pedido total
CREATE OR REPLACE FUNCTION calculate_pedido_total(pedido_uuid UUID)
RETURNS DECIMAL AS $$
DECLARE
  total_value DECIMAL(10,2);
BEGIN
  SELECT COALESCE(SUM(quantidade * preco_unitario), 0)
  INTO total_value
  FROM pedido_itens
  WHERE pedido_id = pedido_uuid;
  
  RETURN total_value;
END;
$$ LANGUAGE plpgsql;

-- Function to update pedido total when items change
CREATE OR REPLACE FUNCTION update_pedido_total()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

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

-- Function to get empresa statistics
CREATE OR REPLACE FUNCTION get_empresa_stats(empresa_uuid UUID)
RETURNS JSON AS $$
DECLARE
  stats JSON;
BEGIN
  SELECT json_build_object(
    'total_produtos', (
      SELECT COUNT(*) FROM produtos WHERE empresa_id = empresa_uuid
    ),
    'produtos_ativos', (
      SELECT COUNT(*) FROM produtos WHERE empresa_id = empresa_uuid AND disponivel = true
    ),
    'total_pedidos', (
      SELECT COUNT(DISTINCT p.id) 
      FROM pedidos p
      JOIN pedido_itens pi ON p.id = pi.pedido_id
      WHERE pi.empresa_id = empresa_uuid
    ),
    'pedidos_pendentes', (
      SELECT COUNT(DISTINCT p.id) 
      FROM pedidos p
      JOIN pedido_itens pi ON p.id = pi.pedido_id
      WHERE pi.empresa_id = empresa_uuid AND p.status = 'pendente'
    ),
    'receita_total', (
      SELECT COALESCE(SUM(pi.quantidade * pi.preco_unitario), 0)
      FROM pedidos p
      JOIN pedido_itens pi ON p.id = pi.pedido_id
      WHERE pi.empresa_id = empresa_uuid AND p.status = 'entregue'
    ),
    'avaliacao_media', (
      SELECT COALESCE(AVG(nota_empresa), 0)
      FROM avaliacoes
      WHERE empresa_id = empresa_uuid
    )
  ) INTO stats;
  
  RETURN stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get entregador statistics
CREATE OR REPLACE FUNCTION get_entregador_stats(entregador_uuid UUID)
RETURNS JSON AS $$
DECLARE
  stats JSON;
BEGIN
  SELECT json_build_object(
    'total_entregas', (
      SELECT COUNT(*) FROM pedidos WHERE entregador_id = entregador_uuid AND status = 'entregue'
    ),
    'entregas_pendentes', (
      SELECT COUNT(*) FROM pedidos WHERE entregador_id = entregador_uuid AND status IN ('saiu_entrega')
    ),
    'avaliacao_media', (
      SELECT COALESCE(AVG(nota_entregador), 0)
      FROM avaliacoes
      WHERE entregador_id = entregador_uuid
    )
  ) INTO stats;
  
  RETURN stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;