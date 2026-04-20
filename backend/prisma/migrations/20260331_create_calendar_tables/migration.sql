-- =====================================================
-- MIGRATION: Calendário Contábil
-- =====================================================
-- Data: 2026-03-31
-- Descrição: Tabelas para calendário de obrigações fiscais e eventos
-- =====================================================

-- Tabela de Obrigações Fiscais (template recorrente)
CREATE TABLE IF NOT EXISTS fiscal_obligations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  day_of_month INTEGER, -- Dia do mês (1-31)
  month INTEGER, -- NULL = mensal, 1-12 = anual
  applies_to VARCHAR(50) DEFAULT 'all', -- 'all', 'mei', 'simples', 'lucro_real', 'industria', 'comercio'
  level VARCHAR(20), -- 'federal', 'estadual', 'municipal'
  color VARCHAR(7) DEFAULT '#EF4444',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Eventos do Calendário
CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  event_type VARCHAR(50) NOT NULL, -- 'holiday', 'obligation', 'client', 'meeting', 'rpa', 'document'
  start_date DATE NOT NULL,
  end_date DATE,
  all_day BOOLEAN DEFAULT true,
  is_recurring BOOLEAN DEFAULT false,
  recurrence_pattern VARCHAR(20), -- 'daily', 'weekly', 'monthly', 'yearly'
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  color VARCHAR(7) DEFAULT '#3B82F6',
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'completed', 'cancelled', 'late'
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cache de Feriados (fallback para API)
CREATE TABLE IF NOT EXISTS holiday_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year INTEGER NOT NULL,
  ibge_code INTEGER, -- NULL = nacional
  uf VARCHAR(2), -- NULL = nacional
  data JSONB NOT NULL,
  source VARCHAR(50) DEFAULT 'api', -- 'api', 'json_local', 'manual'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(year, ibge_code, uf)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_calendar_events_start ON calendar_events(start_date);
CREATE INDEX IF NOT EXISTS idx_calendar_events_type ON calendar_events(event_type);
CREATE INDEX IF NOT EXISTS idx_calendar_events_client ON calendar_events(client_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_status ON calendar_events(status);
CREATE INDEX IF NOT EXISTS idx_holiday_cache_year ON holiday_cache(year, ibge_code, uf);
CREATE INDEX IF NOT EXISTS idx_fiscal_obligations_active ON fiscal_obligations(is_active);

-- Comentários
COMMENT ON TABLE fiscal_obligations IS 'Obrigações fiscais recorrentes (DAS, DCTFWeb, eSocial, etc.)';
COMMENT ON TABLE calendar_events IS 'Eventos do calendário (feriados, obrigações, clientes, reuniões, etc.)';
COMMENT ON TABLE holiday_cache IS 'Cache de feriados para fallback quando API estiver indisponível';

-- =====================================================
-- INSERT: Obrigações Fiscais Padrão
-- =====================================================

-- Federais Mensais
INSERT INTO fiscal_obligations (name, description, day_of_month, month, applies_to, level, color) VALUES
('DAS MEI', 'Documento de Arrecadação do Simples Nacional - MEI', 20, NULL, 'mei', 'federal', '#EF4444'),
('DCTFWeb', 'Declaração de Débitos e Créditos Tributários Federais', 15, NULL, 'all', 'federal', '#EF4444'),
('eSocial', 'Escrituração Digital das Obrigações Fiscais', 15, NULL, 'all', 'federal', '#F97316'),
('IPI', 'Imposto sobre Produtos Industrializados', 25, NULL, 'industria', 'federal', '#F59E0B'),
('PIS', 'Programa de Integração Social', 25, NULL, 'all', 'federal', '#F59E0B'),
('COFINS', 'Contribuição para o Financiamento da Seguridade Social', 25, NULL, 'all', 'federal', '#F59E0B');

-- Federais Anuais
INSERT INTO fiscal_obligations (name, description, day_of_month, month, applies_to, level, color) VALUES
('DIRF', 'Declaração do Imposto de Renda Retido na Fonte', 28, 2, 'all', 'federal', '#3B82F6'),
('DPI', 'Declaração de Informações Econômico-Fiscais da Pessoa Jurídica', 31, 3, 'all', 'federal', '#3B82F6'),
('DEFIS', 'Declaração de Informações Socioeconômicas e Fiscais - MEI', 31, 3, 'mei', 'federal', '#3B82F6'),
('RAIS', 'Relação Anual de Informações Sociais', 31, 3, 'all', 'federal', '#3B82F6'),
('DCTF', 'Declaração de Débitos e Créditos Tributários Federais', 31, 3, 'all', 'federal', '#3B82F6');

-- Estaduais (BA)
INSERT INTO fiscal_obligations (name, description, day_of_month, month, applies_to, level, color) VALUES
('ICMS BA', 'Imposto sobre Circulação de Mercadorias e Serviços - Bahia', 20, NULL, 'comercio', 'estadual', '#F59E0B'),
('DAE BA', 'Documento de Arrecadação de Receitas Estaduais - BA', 20, NULL, 'all', 'estadual', '#F59E0B');

-- Municipais
INSERT INTO fiscal_obligations (name, description, day_of_month, month, applies_to, level, color) VALUES
('ISS', 'Imposto Sobre Serviços', 15, NULL, 'all', 'municipal', '#10B981'),
('DAM', 'Documento de Arrecadação Municipal', 15, NULL, 'all', 'municipal', '#10B981');

-- =====================================================
-- VIEW: Estatísticas do Calendário
-- =====================================================

CREATE OR REPLACE VIEW view_calendar_stats AS
SELECT 
  event_type,
  status,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE start_date >= CURRENT_DATE) as upcoming,
  COUNT(*) FILTER (WHERE start_date < CURRENT_DATE AND status = 'pending') as overdue
FROM calendar_events
GROUP BY event_type, status;

-- =====================================================
-- FUNCTION: Gerar eventos recorrentes do mês
-- =====================================================

CREATE OR REPLACE FUNCTION generate_monthly_events(p_month INTEGER, p_year INTEGER)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER := 0;
  v_event fiscal_obligations%ROWTYPE;
  v_event_date DATE;
  v_day INTEGER;
BEGIN
  -- Para cada obrigação ativa
  FOR v_event IN SELECT * FROM fiscal_obligations WHERE is_active = true LOOP
    -- Determinar dia do vencimento
    v_day := v_event.day_of_month;
    
    -- Ajustar se cair no fim de semana (sábado → sexta, domingo → segunda)
    v_event_date := make_date(p_year, p_month, v_day);
    
    IF EXTRACT(DOW FROM v_event_date) = 0 THEN -- Domingo
      v_event_date := v_event_date + INTERVAL '1 day';
    ELSIF EXTRACT(DOW FROM v_event_date) = 6 THEN -- Sábado
      v_event_date := v_event_date - INTERVAL '1 day';
    END IF;
    
    -- Criar evento se ainda não existir
    INSERT INTO calendar_events (
      title,
      description,
      event_type,
      start_date,
      end_date,
      all_day,
      is_recurring,
      recurrence_pattern,
      color,
      status,
      metadata
    )
    SELECT
      v_event.name,
      v_event.description,
      'obligation',
      v_event_date,
      v_event_date,
      true,
      true,
      'monthly',
      v_event.color,
      'pending',
      jsonb_build_object(
        'obligation_id', v_event.id,
        'applies_to', v_event.applies_to,
        'level', v_event.level,
        'original_day', v_event.day_of_month
      )
    ON CONFLICT DO NOTHING;
    
    GET DIAGNOSTICS v_count = ROW_COUNT;
  END LOOP;
  
  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGER: Updated_at automático
-- =====================================================

CREATE TRIGGER update_calendar_events_updated_at
  BEFORE UPDATE ON calendar_events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE fiscal_obligations ENABLE ROW LEVEL SECURITY;
ALTER TABLE holiday_cache ENABLE ROW LEVEL SECURITY;

-- Policies para calendar_events
CREATE POLICY "Usuários autenticados podem ver eventos"
  ON calendar_events FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem criar eventos"
  ON calendar_events FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar eventos"
  ON calendar_events FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem deletar eventos"
  ON calendar_events FOR DELETE
  TO authenticated
  USING (true);

-- Policies para fiscal_obligations
CREATE POLICY "Usuários autenticados podem ver obrigações"
  ON fiscal_obligations FOR SELECT
  TO authenticated
  USING (true);

-- Policies para holiday_cache
CREATE POLICY "Usuários autenticados podem ver cache de feriados"
  ON holiday_cache FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Sistema pode gerenciar cache de feriados"
  ON holiday_cache FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- Comentários Finais
-- =====================================================

COMMENT ON FUNCTION generate_monthly_events IS 'Gera eventos recorrentes de obrigações fiscais para um determinado mês/ano';
COMMENT ON VIEW view_calendar_stats IS 'Estatísticas de eventos do calendário por tipo e status';
