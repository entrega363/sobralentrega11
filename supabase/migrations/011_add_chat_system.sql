-- Criar tabela de conversas
CREATE TABLE IF NOT EXISTS conversas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pedido_id UUID REFERENCES pedidos(id) ON DELETE SET NULL,
  participantes UUID[] NOT NULL, -- Array de IDs dos participantes
  participantes_nomes TEXT[] NOT NULL, -- Array de nomes dos participantes
  participantes_tipos TEXT[] NOT NULL, -- Array de tipos (consumidor, empresa, entregador, admin)
  titulo TEXT NOT NULL,
  ultima_mensagem TEXT,
  ultima_mensagem_em TIMESTAMP WITH TIME ZONE,
  ativa BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Validações
  CONSTRAINT participantes_length_check CHECK (
    array_length(participantes, 1) = array_length(participantes_nomes, 1) AND
    array_length(participantes, 1) = array_length(participantes_tipos, 1) AND
    array_length(participantes, 1) >= 2
  )
);

-- Criar tabela de mensagens
CREATE TABLE IF NOT EXISTS mensagens (
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

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_conversas_participantes ON conversas USING GIN (participantes);
CREATE INDEX IF NOT EXISTS idx_conversas_pedido_id ON conversas(pedido_id);
CREATE INDEX IF NOT EXISTS idx_conversas_ativa ON conversas(ativa);
CREATE INDEX IF NOT EXISTS idx_conversas_updated_at ON conversas(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_mensagens_conversa_id ON mensagens(conversa_id);
CREATE INDEX IF NOT EXISTS idx_mensagens_remetente_id ON mensagens(remetente_id);
CREATE INDEX IF NOT EXISTS idx_mensagens_created_at ON mensagens(created_at);
CREATE INDEX IF NOT EXISTS idx_mensagens_lida ON mensagens(lida);
CREATE INDEX IF NOT EXISTS idx_mensagens_tipo ON mensagens(tipo_mensagem);

-- RLS (Row Level Security)
ALTER TABLE conversas ENABLE ROW LEVEL SECURITY;
ALTER TABLE mensagens ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança para conversas
-- Usuários podem ver conversas das quais fazem parte
CREATE POLICY "Users can view their conversations" ON conversas
  FOR SELECT USING (
    auth.uid() = ANY(participantes)
  );

-- Usuários podem criar conversas
CREATE POLICY "Users can create conversations" ON conversas
  FOR INSERT WITH CHECK (
    auth.uid() = ANY(participantes)
  );

-- Usuários podem atualizar conversas das quais fazem parte
CREATE POLICY "Users can update their conversations" ON conversas
  FOR UPDATE USING (
    auth.uid() = ANY(participantes)
  );

-- Admins podem gerenciar todas as conversas
CREATE POLICY "Admins can manage all conversations" ON conversas
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Políticas de segurança para mensagens
-- Usuários podem ver mensagens de conversas das quais fazem parte
CREATE POLICY "Users can view messages from their conversations" ON mensagens
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversas 
      WHERE conversas.id = mensagens.conversa_id 
      AND auth.uid() = ANY(conversas.participantes)
    )
  );

-- Usuários podem enviar mensagens em conversas das quais fazem parte
CREATE POLICY "Users can send messages to their conversations" ON mensagens
  FOR INSERT WITH CHECK (
    auth.uid() = remetente_id AND
    EXISTS (
      SELECT 1 FROM conversas 
      WHERE conversas.id = mensagens.conversa_id 
      AND auth.uid() = ANY(conversas.participantes)
    )
  );

-- Usuários podem marcar suas mensagens como lidas
CREATE POLICY "Users can mark messages as read" ON mensagens
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM conversas 
      WHERE conversas.id = mensagens.conversa_id 
      AND auth.uid() = ANY(conversas.participantes)
    )
  );

-- Admins podem gerenciar todas as mensagens
CREATE POLICY "Admins can manage all messages" ON mensagens
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Triggers para atualizar updated_at
CREATE OR REPLACE FUNCTION update_conversas_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_conversas_updated_at
  BEFORE UPDATE ON conversas
  FOR EACH ROW
  EXECUTE FUNCTION update_conversas_updated_at();

CREATE OR REPLACE FUNCTION update_mensagens_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_mensagens_updated_at
  BEFORE UPDATE ON mensagens
  FOR EACH ROW
  EXECUTE FUNCTION update_mensagens_updated_at();

-- Trigger para atualizar última mensagem na conversa
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualizar a conversa com a última mensagem
  UPDATE conversas 
  SET 
    ultima_mensagem = NEW.conteudo,
    ultima_mensagem_em = NEW.created_at,
    updated_at = NOW()
  WHERE id = NEW.conversa_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_conversation_last_message_trigger
  AFTER INSERT ON mensagens
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_last_message();

-- Função para criar conversa automaticamente para pedidos
CREATE OR REPLACE FUNCTION create_order_conversation()
RETURNS TRIGGER AS $$
DECLARE
  consumidor_nome TEXT;
  empresa_nome TEXT;
  entregador_nome TEXT;
  participantes_array UUID[];
  nomes_array TEXT[];
  tipos_array TEXT[];
BEGIN
  -- Só criar conversa quando o pedido for aceito
  IF NEW.status = 'aceito' AND (OLD.status IS NULL OR OLD.status != 'aceito') THEN
    
    -- Buscar nomes dos participantes
    SELECT nome INTO consumidor_nome FROM profiles WHERE id = NEW.consumidor_id;
    SELECT nome INTO empresa_nome FROM profiles WHERE id = NEW.empresa_id;
    
    -- Montar arrays de participantes
    participantes_array := ARRAY[NEW.consumidor_id, NEW.empresa_id];
    nomes_array := ARRAY[COALESCE(consumidor_nome, 'Consumidor'), COALESCE(empresa_nome, 'Empresa')];
    tipos_array := ARRAY['consumidor', 'empresa'];
    
    -- Se houver entregador, adicionar
    IF NEW.entregador_id IS NOT NULL THEN
      SELECT nome INTO entregador_nome FROM profiles WHERE id = NEW.entregador_id;
      participantes_array := participantes_array || NEW.entregador_id;
      nomes_array := nomes_array || COALESCE(entregador_nome, 'Entregador');
      tipos_array := tipos_array || 'entregador';
    END IF;
    
    -- Verificar se já existe conversa para este pedido
    IF NOT EXISTS (SELECT 1 FROM conversas WHERE pedido_id = NEW.id) THEN
      INSERT INTO conversas (
        pedido_id,
        participantes,
        participantes_nomes,
        participantes_tipos,
        titulo,
        ativa
      ) VALUES (
        NEW.id,
        participantes_array,
        nomes_array,
        tipos_array,
        'Pedido ' || NEW.numero,
        true
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_order_conversation_trigger
  AFTER INSERT OR UPDATE ON pedidos
  FOR EACH ROW
  EXECUTE FUNCTION create_order_conversation();

-- View para estatísticas de mensagens
CREATE OR REPLACE VIEW chat_stats AS
SELECT 
  c.id as conversa_id,
  c.titulo,
  c.participantes,
  c.participantes_nomes,
  COUNT(m.id) as total_mensagens,
  COUNT(CASE WHEN NOT m.lida THEN 1 END) as mensagens_nao_lidas,
  MAX(m.created_at) as ultima_atividade,
  COUNT(DISTINCT m.remetente_id) as participantes_ativos
FROM conversas c
LEFT JOIN mensagens m ON c.id = m.conversa_id
WHERE c.ativa = true
GROUP BY c.id, c.titulo, c.participantes, c.participantes_nomes;

-- View para mensagens recentes
CREATE OR REPLACE VIEW recent_messages AS
SELECT 
  m.*,
  c.titulo as conversa_titulo,
  c.participantes as conversa_participantes,
  c.participantes_nomes as conversa_participantes_nomes
FROM mensagens m
JOIN conversas c ON m.conversa_id = c.id
WHERE c.ativa = true
ORDER BY m.created_at DESC;

-- Função para buscar conversas de um usuário
CREATE OR REPLACE FUNCTION get_user_conversations(user_id UUID)
RETURNS TABLE (
  id UUID,
  titulo TEXT,
  participantes UUID[],
  participantes_nomes TEXT[],
  ultima_mensagem TEXT,
  ultima_mensagem_em TIMESTAMP WITH TIME ZONE,
  mensagens_nao_lidas BIGINT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.titulo,
    c.participantes,
    c.participantes_nomes,
    c.ultima_mensagem,
    c.ultima_mensagem_em,
    COUNT(CASE WHEN NOT m.lida AND m.remetente_id != user_id THEN 1 END) as mensagens_nao_lidas,
    c.created_at
  FROM conversas c
  LEFT JOIN mensagens m ON c.id = m.conversa_id
  WHERE user_id = ANY(c.participantes) AND c.ativa = true
  GROUP BY c.id, c.titulo, c.participantes, c.participantes_nomes, c.ultima_mensagem, c.ultima_mensagem_em, c.created_at
  ORDER BY c.updated_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Comentários para documentação
COMMENT ON TABLE conversas IS 'Conversas de chat entre usuários do sistema';
COMMENT ON COLUMN conversas.participantes IS 'Array de UUIDs dos participantes da conversa';
COMMENT ON COLUMN conversas.participantes_nomes IS 'Array de nomes dos participantes';
COMMENT ON COLUMN conversas.participantes_tipos IS 'Array de tipos de usuário (consumidor, empresa, entregador, admin)';
COMMENT ON COLUMN conversas.pedido_id IS 'ID do pedido relacionado (opcional)';

COMMENT ON TABLE mensagens IS 'Mensagens enviadas nas conversas';
COMMENT ON COLUMN mensagens.tipo_mensagem IS 'Tipo da mensagem: texto, imagem, arquivo ou localização';
COMMENT ON COLUMN mensagens.anexo_url IS 'URL do anexo (para imagens e arquivos)';
COMMENT ON COLUMN mensagens.lida IS 'Indica se a mensagem foi lida pelo destinatário';