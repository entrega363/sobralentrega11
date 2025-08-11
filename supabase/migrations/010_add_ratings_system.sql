-- Estender tabela de avaliações existente
ALTER TABLE avaliacoes ADD COLUMN IF NOT EXISTS avaliador_id UUID REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE avaliacoes ADD COLUMN IF NOT EXISTS avaliador_nome TEXT;
ALTER TABLE avaliacoes ADD COLUMN IF NOT EXISTS avaliado_id UUID REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE avaliacoes ADD COLUMN IF NOT EXISTS avaliado_nome TEXT;
ALTER TABLE avaliacoes ADD COLUMN IF NOT EXISTS tipo_avaliacao TEXT CHECK (tipo_avaliacao IN ('empresa', 'entregador', 'consumidor'));

-- Notas adicionais (1-5)
ALTER TABLE avaliacoes ADD COLUMN IF NOT EXISTS nota_geral INTEGER CHECK (nota_geral >= 1 AND nota_geral <= 5);
ALTER TABLE avaliacoes ADD COLUMN IF NOT EXISTS nota_qualidade INTEGER CHECK (nota_qualidade >= 1 AND nota_qualidade <= 5);
ALTER TABLE avaliacoes ADD COLUMN IF NOT EXISTS nota_atendimento INTEGER CHECK (nota_atendimento >= 1 AND nota_atendimento <= 5);
ALTER TABLE avaliacoes ADD COLUMN IF NOT EXISTS nota_pontualidade INTEGER CHECK (nota_pontualidade >= 1 AND nota_pontualidade <= 5);
ALTER TABLE avaliacoes ADD COLUMN IF NOT EXISTS nota_embalagem INTEGER CHECK (nota_embalagem >= 1 AND nota_embalagem <= 5);

-- Feedback textual
ALTER TABLE avaliacoes ADD COLUMN IF NOT EXISTS pontos_positivos TEXT[]; -- Array de strings
ALTER TABLE avaliacoes ADD COLUMN IF NOT EXISTS pontos_negativos TEXT[]; -- Array de strings

-- Resposta do avaliado
ALTER TABLE avaliacoes ADD COLUMN IF NOT EXISTS resposta TEXT;
ALTER TABLE avaliacoes ADD COLUMN IF NOT EXISTS respondido_em TIMESTAMP WITH TIME ZONE;

-- Garantir que cada usuário só pode avaliar um pedido uma vez (se não existir)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'avaliacoes_pedido_id_avaliador_id_key'
    ) THEN
        ALTER TABLE avaliacoes ADD CONSTRAINT avaliacoes_pedido_id_avaliador_id_key UNIQUE(pedido_id, avaliador_id);
    END IF;
END $$;

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_avaliacoes_pedido_id ON avaliacoes(pedido_id);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_avaliador_id ON avaliacoes(avaliador_id);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_avaliado_id ON avaliacoes(avaliado_id);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_tipo ON avaliacoes(tipo_avaliacao);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_nota_geral ON avaliacoes(nota_geral);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_created_at ON avaliacoes(created_at DESC);

-- RLS (Row Level Security)
ALTER TABLE avaliacoes ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
-- Usuários podem ver avaliações públicas
CREATE POLICY "Anyone can view ratings" ON avaliacoes
  FOR SELECT USING (true);

-- Usuários podem criar avaliações para pedidos que participaram
CREATE POLICY "Users can create ratings for their orders" ON avaliacoes
  FOR INSERT WITH CHECK (
    auth.uid() = avaliador_id AND
    EXISTS (
      SELECT 1 FROM pedidos p
      WHERE p.id = avaliacoes.pedido_id
      AND p.status = 'entregue'
      AND (
        (tipo_avaliacao = 'empresa' AND p.consumidor_id = auth.uid()) OR
        (tipo_avaliacao = 'entregador' AND p.consumidor_id = auth.uid()) OR
        (tipo_avaliacao = 'consumidor' AND (
          EXISTS (SELECT 1 FROM pedido_itens pi JOIN empresas e ON pi.empresa_id = e.id WHERE pi.pedido_id = p.id AND e.profile_id = auth.uid()) OR 
          p.entregador_id = auth.uid()
        ))
      )
    )
  );

-- Usuários podem responder suas próprias avaliações
CREATE POLICY "Users can reply to their own ratings" ON avaliacoes
  FOR UPDATE USING (
    auth.uid() = avaliado_id AND
    resposta IS NULL -- Só pode responder se ainda não respondeu
  )
  WITH CHECK (
    auth.uid() = avaliado_id AND
    resposta IS NOT NULL -- Deve estar adicionando uma resposta
  );

-- Admins podem ver e gerenciar todas as avaliações
CREATE POLICY "Admins can manage all ratings" ON avaliacoes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_avaliacoes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_avaliacoes_updated_at
  BEFORE UPDATE ON avaliacoes
  FOR EACH ROW
  EXECUTE FUNCTION update_avaliacoes_updated_at();

-- View para estatísticas de avaliações por usuário
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
  
  -- Distribuição de notas
  COUNT(CASE WHEN nota_geral = 5 THEN 1 END) as notas_5,
  COUNT(CASE WHEN nota_geral = 4 THEN 1 END) as notas_4,
  COUNT(CASE WHEN nota_geral = 3 THEN 1 END) as notas_3,
  COUNT(CASE WHEN nota_geral = 2 THEN 1 END) as notas_2,
  COUNT(CASE WHEN nota_geral = 1 THEN 1 END) as notas_1,
  
  -- Percentual de respostas
  ROUND(
    (COUNT(CASE WHEN resposta IS NOT NULL THEN 1 END) * 100.0 / COUNT(*)), 1
  ) as percentual_respostas
FROM avaliacoes
GROUP BY avaliado_id, avaliado_nome, tipo_avaliacao;

-- View para avaliações recentes com dados do pedido
CREATE OR REPLACE VIEW recent_ratings_view AS
SELECT 
  a.*,
  p.total as pedido_total,
  p.created_at as pedido_data
FROM avaliacoes a
JOIN pedidos p ON a.pedido_id = p.id
ORDER BY a.created_at DESC;

-- Função para calcular badges baseados na performance
CREATE OR REPLACE FUNCTION calculate_user_badges(user_id UUID, rating_type TEXT)
RETURNS TEXT[] AS $$
DECLARE
  badges TEXT[] := '{}';
  stats RECORD;
BEGIN
  -- Buscar estatísticas do usuário
  SELECT * INTO stats
  FROM user_rating_stats
  WHERE avaliado_id = user_id AND tipo_avaliacao = rating_type;
  
  IF NOT FOUND THEN
    RETURN badges;
  END IF;
  
  -- Badges baseados na média geral
  IF stats.media_geral >= 4.8 THEN
    badges := array_append(badges, 'Excelência');
  END IF;
  
  IF stats.media_geral >= 4.5 THEN
    badges := array_append(badges, 'Qualidade Premium');
  END IF;
  
  -- Badges baseados em critérios específicos
  IF stats.media_pontualidade >= 4.5 THEN
    badges := array_append(badges, 'Sempre Pontual');
  END IF;
  
  IF stats.media_atendimento >= 4.5 THEN
    badges := array_append(badges, 'Atendimento 5 Estrelas');
  END IF;
  
  IF stats.media_qualidade >= 4.5 AND rating_type = 'empresa' THEN
    badges := array_append(badges, 'Comida de Qualidade');
  END IF;
  
  -- Badges baseados no volume
  IF stats.total_avaliacoes >= 100 THEN
    badges := array_append(badges, 'Veterano');
  ELSIF stats.total_avaliacoes >= 50 THEN
    badges := array_append(badges, 'Experiente');
  ELSIF stats.total_avaliacoes >= 10 THEN
    badges := array_append(badges, 'Estabelecido');
  END IF;
  
  -- Badge de responsividade
  IF stats.percentual_respostas >= 80 THEN
    badges := array_append(badges, 'Comunicativo');
  END IF;
  
  RETURN badges;
END;
$$ LANGUAGE plpgsql;

-- Função para análise de sentimento simples (baseada em palavras-chave)
CREATE OR REPLACE FUNCTION analyze_sentiment(texto TEXT)
RETURNS TEXT AS $$
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
  
  -- Contar palavras positivas
  FOREACH palavra IN ARRAY palavras_positivas LOOP
    IF texto_lower LIKE '%' || palavra || '%' THEN
      score_positivo := score_positivo + 1;
    END IF;
  END LOOP;
  
  -- Contar palavras negativas
  FOREACH palavra IN ARRAY palavras_negativas LOOP
    IF texto_lower LIKE '%' || palavra || '%' THEN
      score_negativo := score_negativo + 1;
    END IF;
  END LOOP;
  
  -- Determinar sentimento
  IF score_positivo > score_negativo THEN
    RETURN 'positivo';
  ELSIF score_negativo > score_positivo THEN
    RETURN 'negativo';
  ELSE
    RETURN 'neutro';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger para análise de sentimento automática
ALTER TABLE avaliacoes ADD COLUMN IF NOT EXISTS sentimento TEXT;

CREATE OR REPLACE FUNCTION analyze_rating_sentiment()
RETURNS TRIGGER AS $$
BEGIN
  NEW.sentimento := analyze_sentiment(NEW.comentario);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER analyze_rating_sentiment_trigger
  BEFORE INSERT OR UPDATE ON avaliacoes
  FOR EACH ROW
  EXECUTE FUNCTION analyze_rating_sentiment();

-- Comentários para documentação
COMMENT ON TABLE avaliacoes IS 'Sistema completo de avaliações com múltiplos critérios';
COMMENT ON COLUMN avaliacoes.tipo_avaliacao IS 'Tipo de entidade sendo avaliada (empresa, entregador, consumidor)';
COMMENT ON COLUMN avaliacoes.pontos_positivos IS 'Array de pontos positivos mencionados';
COMMENT ON COLUMN avaliacoes.pontos_negativos IS 'Array de pontos que podem melhorar';
COMMENT ON COLUMN avaliacoes.sentimento IS 'Análise automática de sentimento do comentário';