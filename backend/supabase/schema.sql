-- =====================================================
-- SUPABASE SCHEMA - Hub Contábil
-- =====================================================
-- Otimizado para Free Tier: 500MB DB + 1GB Storage
-- =====================================================

-- Habilitar extensão UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABELA: users
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  senha VARCHAR(255) NOT NULL,
  cargo VARCHAR(100) DEFAULT 'Contador',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index para login rápido
CREATE INDEX idx_users_email ON users(email);

-- =====================================================
-- TABELA: clients
-- =====================================================
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cnpj VARCHAR(18) UNIQUE NOT NULL,
  razao_social VARCHAR(255) NOT NULL,
  nome_fantasia VARCHAR(255),
  data_abertura VARCHAR(20),
  natureza_juridica VARCHAR(100),
  inscricao_estadual VARCHAR(50),
  inscricao_municipal VARCHAR(50),
  regime_tributario VARCHAR(50) DEFAULT 'Outro',
  
  -- CNAE Principal (otimizado: 2 campos fixos)
  cnae_principal_codigo VARCHAR(20),
  cnae_principal_descricao TEXT,
  
  -- Endereço (campos fixos para otimização)
  endereco_cep VARCHAR(10),
  endereco_logradouro VARCHAR(255),
  endereco_numero VARCHAR(20),
  endereco_complemento VARCHAR(100),
  endereco_bairro VARCHAR(100),
  endereco_cidade VARCHAR(100),
  endereco_uf VARCHAR(2),
  
  -- Contato Principal
  contato_email VARCHAR(255),
  contato_telefone VARCHAR(20),
  
  -- Dossiê (JSONB para flexibilidade)
  senhas_portais JSONB DEFAULT '{}'::jsonb,
  certificado_possui BOOLEAN DEFAULT false,
  certificado_senha VARCHAR(255),
  certificado_vencimento DATE,
  
  -- Honorários
  honorarios_valor DECIMAL(10,2) DEFAULT 0,
  honorarios_dia_vencimento INTEGER CHECK (honorarios_dia_vencimento BETWEEN 1 AND 31),
  
  -- Controle
  categoria VARCHAR(100) DEFAULT 'Serviços',
  is_bpo BOOLEAN DEFAULT false,
  observacoes TEXT,
  status VARCHAR(20) DEFAULT 'Ativo' CHECK (status IN ('Ativo', 'Inativo', 'Bloqueado')),
  usuario_responsavel_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes para performance
CREATE INDEX idx_clients_cnpj ON clients(cnpj);
CREATE INDEX idx_clients_razao_social ON clients(razao_social);
CREATE INDEX idx_clients_status ON clients(status);
CREATE INDEX idx_clients_usuario ON clients(usuario_responsavel_id);

-- =====================================================
-- TABELA: client_cnaes_secundarios (1:N otimizado)
-- =====================================================
CREATE TABLE IF NOT EXISTS client_cnaes_secundarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  codigo VARCHAR(20) NOT NULL,
  descricao TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_cnaes_client ON client_cnaes_secundarios(client_id);

-- =====================================================
-- TABELA: client_qsa (1:N otimizado)
-- =====================================================
CREATE TABLE IF NOT EXISTS client_qsa (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  cpf_cnpj VARCHAR(18),
  qualificacao VARCHAR(100),
  participacao DECIMAL(5,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_qsa_client ON client_qsa(client_id);

-- =====================================================
-- TABELA: pasta_documentos
-- =====================================================
CREATE TABLE IF NOT EXISTS pasta_documentos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  pasta_pai_id UUID REFERENCES pasta_documentos(id) ON DELETE CASCADE,
  criada_por_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_pastas_client ON pasta_documentos(client_id);
CREATE INDEX idx_pastas_pai ON pasta_documentos(pasta_pai_id);

-- =====================================================
-- TABELA: documentos
-- =====================================================
CREATE TABLE IF NOT EXISTS documentos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  nome_original VARCHAR(255) NOT NULL,
  nome_arquivo VARCHAR(255) NOT NULL,
  
  -- Supabase Storage paths (otimizado)
  storage_path VARCHAR(500) NOT NULL,
  thumbnail_path VARCHAR(500),
  
  -- Metadados do arquivo
  mimetype VARCHAR(100) NOT NULL,
  tamanho_bytes INTEGER NOT NULL,
  tamanho_original_bytes INTEGER, -- Para controle de economia
  
  -- Classificação
  tipo VARCHAR(50) DEFAULT 'documento' CHECK (tipo IN ('documento', 'nota_fiscal', 'contrato', 'certidao', 'outro')),
  descricao TEXT,
  pasta_id UUID REFERENCES pasta_documentos(id) ON DELETE SET NULL,
  
  -- OCR
  ocr_realizado BOOLEAN DEFAULT false,
  ocr_texto TEXT,
  
  -- Auditoria
  uploaded_by_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes críticos para performance
CREATE INDEX idx_documentos_client ON documentos(client_id);
CREATE INDEX idx_documentos_pasta ON documentos(pasta_id);
CREATE INDEX idx_documentos_tipo ON documentos(tipo);
CREATE INDEX idx_documentos_ocr ON documentos(ocr_realizado);

-- =====================================================
-- TRIGGER: updated_at automático
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger em todas as tabelas
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pastas_updated_at BEFORE UPDATE ON pasta_documentos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documentos_updated_at BEFORE UPDATE ON documentos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) - Segurança por linha
-- =====================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_cnaes_secundarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_qsa ENABLE ROW LEVEL SECURITY;
ALTER TABLE pasta_documentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentos ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLICIES (exemplos - ajustar conforme auth)
-- =====================================================

-- Users: cada usuário vê apenas seus dados
CREATE POLICY "Users podem ver próprio registro" ON users
  FOR SELECT USING (auth.uid() = id);

-- Clients: usuários podem ver todos (sistema interno)
CREATE POLICY "Usuários autenticados podem ver clients" ON clients
  FOR ALL USING (auth.role() = 'authenticated');

-- Documentos: acesso baseado no cliente
CREATE POLICY "Usuários autenticados podem gerenciar documentos" ON documentos
  FOR ALL USING (auth.role() = 'authenticated');

-- Pastas: mesmo policy
CREATE POLICY "Usuários autenticados podem gerenciar pastas" ON pasta_documentos
  FOR ALL USING (auth.role() = 'authenticated');

-- =====================================================
-- STORAGE BUCKETS (Supabase Storage)
-- =====================================================
-- Nota: Criar via dashboard ou API:
-- - Bucket: 'documentos' (público, max 2MB por arquivo)
-- - Bucket: 'thumbnails' (público, max 100KB por arquivo)
--
-- Políticas de Storage:
-- INSERT: apenas autenticados
-- SELECT: público (para visualização)
-- UPDATE/DELETE: apenas quem fez upload
-- =====================================================

-- =====================================================
-- FUNÇÕES UTILITÁRIAS
-- =====================================================

-- Função para contar documentos por cliente (controle de limite)
CREATE OR REPLACE FUNCTION count_documentos_por_cliente(p_client_id UUID)
RETURNS BIGINT AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM documentos WHERE client_id = p_client_id);
END;
$$ LANGUAGE plpgsql STABLE;

-- Função para calcular espaço usado por cliente
CREATE OR REPLACE FUNCTION storage_usado_por_cliente(p_client_id UUID)
RETURNS BIGINT AS $$
BEGIN
  RETURN (SELECT COALESCE(SUM(tamanho_bytes), 0) FROM documentos WHERE client_id = p_client_id);
END;
$$ LANGUAGE plpgsql STABLE;

-- =====================================================
-- VIEWS PARA DASHBOARD
-- =====================================================

-- View: Estatísticas de clientes
CREATE OR REPLACE VIEW view_stats_clientes AS
SELECT
  COUNT(*) as total_clientes,
  COUNT(*) FILTER (WHERE status = 'Ativo') as clientes_ativos,
  COUNT(*) FILTER (WHERE status = 'Inativo') as clientes_inativos,
  SUM(honorarios_valor) as honorarios_previstos,
  COUNT(*) FILTER (WHERE certificado_possui = true) as certificados_validos
FROM clients;

-- View: Documentos por mês
CREATE OR REPLACE VIEW view_documentos_por_mes AS
SELECT
  DATE_TRUNC('month', created_at) as mes,
  COUNT(*) as quantidade,
  SUM(tamanho_bytes) as tamanho_total
FROM documentos
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY mes DESC;

-- =====================================================
-- COMENTÁRIOS PARA DOCUMENTAÇÃO
-- =====================================================
COMMENT ON TABLE clients IS 'Empresas clientes do escritório de contabilidade';
COMMENT ON TABLE documentos IS 'Documentos fiscais e contábeis dos clientes';
COMMENT ON TABLE pasta_documentos IS 'Pastas para organização de documentos (suporta hierarquia)';
COMMENT ON COLUMN documentos.tamanho_bytes IS 'Tamanho do arquivo otimizado (após compressão)';
COMMENT ON COLUMN documentos.tamanho_original_bytes IS 'Tamanho original antes da otimização (para métricas)';
