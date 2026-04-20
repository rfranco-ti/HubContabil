-- =====================================================
-- MIGRATION: Tabela de Contatos Múltiplos
-- =====================================================
-- Data: 2026-04-01
-- Descrição: Adiciona suporte para múltiplos contatos por cliente
-- =====================================================

-- Criar tabela de contatos múltiplos se não existir
CREATE TABLE IF NOT EXISTS contatos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  telefone VARCHAR(20),
  cargo VARCHAR(100),
  eh_principal BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_contatos_client ON contatos(client_id);
CREATE INDEX IF NOT EXISTS idx_contatos_principal ON contatos(eh_principal);

-- Comentário
COMMENT ON TABLE contatos IS 'Contatos múltiplos dos clientes (um cliente pode ter vários contatos)';
