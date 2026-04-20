-- =====================================================
-- MIGRATION: Tabela de Eventos do Calendário Contábil
-- =====================================================
-- Data: 2026-04-03
-- Descrição: Armazena eventos personalizados dos usuários
-- =====================================================

-- Tabela de eventos do usuário
CREATE TABLE IF NOT EXISTS calendario_eventos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  data DATE NOT NULL,
  categoria VARCHAR(100) NOT NULL DEFAULT 'Outros',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_calendario_eventos_usuario ON calendario_eventos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_calendario_eventos_data ON calendario_eventos(data);
CREATE INDEX IF NOT EXISTS idx_calendario_eventos_categoria ON calendario_eventos(categoria);

-- Comentário na tabela
COMMENT ON TABLE calendario_eventos IS 'Eventos personalizados dos usuários para o calendário contábil';
COMMENT ON COLUMN calendario_eventos.titulo IS 'Título do evento';
COMMENT ON COLUMN calendario_eventos.descricao IS 'Descrição detalhada do evento';
COMMENT ON COLUMN calendario_eventos.data IS 'Data do evento';
COMMENT ON COLUMN calendario_eventos.categoria IS 'Categoria do evento (Fiscal, Departamento Pessoal, etc)';
