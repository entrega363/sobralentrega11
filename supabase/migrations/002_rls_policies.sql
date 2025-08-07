-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE entregadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE consumidores ENABLE ROW LEVEL SECURITY;
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedido_itens ENABLE ROW LEVEL SECURITY;
ALTER TABLE avaliacoes ENABLE ROW LEVEL SECURITY;

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
      -- Pedidos policies will handle the access control
    )
  );

CREATE POLICY "Consumidores can create pedido_itens" ON pedido_itens
  FOR INSERT WITH CHECK (
    pedido_id IN (
      SELECT id FROM pedidos p
      JOIN consumidores c ON p.consumidor_id = c.id
      WHERE c.profile_id = auth.uid()
    )
  );

CREATE POLICY "Admin can manage all pedido_itens" ON pedido_itens
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Avaliacoes policies
CREATE POLICY "Consumidores can view own avaliacoes" ON avaliacoes
  FOR SELECT USING (
    consumidor_id IN (
      SELECT id FROM consumidores WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "Consumidores can create avaliacoes" ON avaliacoes
  FOR INSERT WITH CHECK (
    consumidor_id IN (
      SELECT id FROM consumidores WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "Empresas can view avaliacoes about them" ON avaliacoes
  FOR SELECT USING (
    empresa_id IN (
      SELECT id FROM empresas WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "Entregadores can view avaliacoes about them" ON avaliacoes
  FOR SELECT USING (
    entregador_id IN (
      SELECT id FROM entregadores WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "Admin can view all avaliacoes" ON avaliacoes
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );