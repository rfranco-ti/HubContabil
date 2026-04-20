-- =====================================================
-- MIGRATION: Cache de CNPJ
-- =====================================================
-- Data: 2026-03-31
-- Descrição: Tabela para cache de consultas de CNPJ
-- TTL: 24 horas
-- =====================================================

-- Tabela de cache de CNPJ
CREATE TABLE IF NOT EXISTS cnpj_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cnpj VARCHAR(14) UNIQUE NOT NULL,
  dados JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_cnpj_cache_cnpj ON cnpj_cache(cnpj);
CREATE INDEX IF NOT EXISTS idx_cnpj_cache_expires ON cnpj_cache(expires_at);

-- Função para limpar cache expirado (opcional, rodar periodicamente)
CREATE OR REPLACE FUNCTION limpar_cache_expirado()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM cnpj_cache
  WHERE expires_at < NOW();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Comentário na tabela
COMMENT ON TABLE cnpj_cache IS 'Cache de consultas de CNPJ para reduzir chamadas às APIs externas';
COMMENT ON COLUMN cnpj_cache.cnpj IS 'CNPJ da empresa (apenas números, 14 dígitos)';
COMMENT ON COLUMN cnpj_cache.dados IS 'Dados completos da empresa em formato JSON';
COMMENT ON COLUMN cnpj_cache.expires_at IS 'Data/hora de expiração do cache (TTL 24h)';
