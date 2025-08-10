-- Criar tabela para relacionamento empresa-entregador fixo
CREATE TABLE IF NOT EXISTS empresa_entregadores_fixos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  empresa_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  entregador_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'aceito', 'recusado', 'inativo')),
  salario_fixo DECIMAL(10,2),
  comissao_por_entrega DECIMAL(5,2),
  observacoes TEXT,
  data_convite TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_resposta TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Garantir que um entregador não tenha relacionamento duplicado com a mesma empresa
  UNIQUE(empresa_id, entregador_id)
);

-- Adicionar campo para controlar disponibilidade do entregador
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS disponibilidade_entrega TEXT DEFAULT 'sistema' 
CHECK (disponibilidade_entrega IN ('sistema', 'empresa_fixa', 'indisponivel'));

-- Adicionar campo para empresa fixa atual (se houver)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS empresa_fixa_id UUID REFERENCES profiles(id) ON DELETE SET NULL;

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_empresa_entregadores_fixos_empresa_id ON empresa_entregadores_fixos(empresa_id);
CREATE INDEX IF NOT EXISTS idx_empresa_entregadores_fixos_entregador_id ON empresa_entregadores_fixos(entregador_id);
CREATE INDEX IF NOT EXISTS idx_empresa_entregadores_fixos_status ON empresa_entregadores_fixos(status);
CREATE INDEX IF NOT EXISTS idx_profiles_disponibilidade_entrega ON profiles(disponibilidade_entrega);
CREATE INDEX IF NOT EXISTS idx_profiles_empresa_fixa_id ON profiles(empresa_fixa_id);

-- RLS (Row Level Security)
ALTER TABLE empresa_entregadores_fixos ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança para empresa_entregadores_fixos
CREATE POLICY "Empresas podem gerenciar seus entregadores fixos" ON empresa_entregadores_fixos
  FOR ALL USING (
    auth.uid() = empresa_id OR 
    auth.uid() = entregador_id OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Função para atualizar disponibilidade do entregador quando aceita/recusa empresa fixa
CREATE OR REPLACE FUNCTION update_entregador_availability()
RETURNS TRIGGER AS $$
BEGIN
  -- Se o entregador aceita trabalhar para empresa fixa
  IF NEW.status = 'aceito' AND OLD.status != 'aceito' THEN
    UPDATE profiles 
    SET 
      disponibilidade_entrega = 'empresa_fixa',
      empresa_fixa_id = NEW.empresa_id,
      updated_at = NOW()
    WHERE id = NEW.entregador_id;
    
  -- Se o entregador recusa ou fica inativo
  ELSIF NEW.status IN ('recusado', 'inativo') AND OLD.status = 'aceito' THEN
    UPDATE profiles 
    SET 
      disponibilidade_entrega = 'sistema',
      empresa_fixa_id = NULL,
      updated_at = NOW()
    WHERE id = NEW.entregador_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar disponibilidade automaticamente
CREATE TRIGGER update_entregador_availability_trigger
  AFTER UPDATE ON empresa_entregadores_fixos
  FOR EACH ROW
  EXECUTE FUNCTION update_entregador_availability();

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_empresa_entregadores_fixos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_empresa_entregadores_fixos_updated_at
  BEFORE UPDATE ON empresa_entregadores_fixos
  FOR EACH ROW
  EXECUTE FUNCTION update_empresa_entregadores_fixos_updated_at();

-- Função para buscar entregadores disponíveis para uma empresa
CREATE OR REPLACE FUNCTION get_available_entregadores_for_empresa(empresa_uuid UUID)
RETURNS TABLE (
  id UUID,
  nome TEXT,
  email TEXT,
  telefone TEXT,
  disponibilidade_entrega TEXT,
  is_empresa_fixa BOOLEAN,
  status_relacionamento TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.nome,
    p.email,
    p.telefone,
    p.disponibilidade_entrega,
    (p.empresa_fixa_id = empresa_uuid) as is_empresa_fixa,
    COALESCE(eef.status, 'sem_relacionamento') as status_relacionamento
  FROM profiles p
  LEFT JOIN empresa_entregadores_fixos eef ON (p.id = eef.entregador_id AND eef.empresa_id = empresa_uuid)
  WHERE p.role = 'entregador'
    AND p.status = 'ativo'
  ORDER BY 
    CASE 
      WHEN p.empresa_fixa_id = empresa_uuid THEN 1
      WHEN p.disponibilidade_entrega = 'sistema' THEN 2
      ELSE 3
    END,
    p.nome;
END;
$$ LANGUAGE plpgsql;

-- Comentários para documentação
COMMENT ON TABLE empresa_entregadores_fixos IS 'Relacionamento entre empresas e seus entregadores fixos';
COMMENT ON COLUMN empresa_entregadores_fixos.status IS 'Status do relacionamento: pendente, aceito, recusado, inativo';
COMMENT ON COLUMN profiles.disponibilidade_entrega IS 'Disponibilidade do entregador: sistema (geral), empresa_fixa (só para empresa fixa), indisponivel';
COMMENT ON COLUMN profiles.empresa_fixa_id IS 'ID da empresa para qual o entregador trabalha exclusivamente (se houver)';

-- Inserir dados de exemplo para teste
INSERT INTO empresa_entregadores_fixos (empresa_id, entregador_id, status, salario_fixo, comissao_por_entrega, observacoes)
SELECT 
  (SELECT id FROM profiles WHERE email = 'matutaria@gmail.com' LIMIT 1),
  (SELECT id FROM profiles WHERE email = 'entregasobrald@gmail.com' LIMIT 1),
  'aceito',
  1200.00,
  5.00,
  'Entregador principal da Matutaria'
WHERE EXISTS (SELECT 1 FROM profiles WHERE email = 'matutaria@gmail.com')
  AND EXISTS (SELECT 1 FROM profiles WHERE email = 'entregasobrald@gmail.com');