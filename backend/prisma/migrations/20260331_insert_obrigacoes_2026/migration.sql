-- =====================================================
-- MIGRATION: Obrigações Acessórias 2026 (Calendário Mensal)
-- =====================================================
-- Data: 2026-03-31
-- Fonte: docs/Calendário Mensal-Obrigações Acessórias.md
-- =====================================================

-- Limpar obrigações existentes (opcional)
-- DELETE FROM fiscal_obligations WHERE level = 'federal';

-- =====================================================
-- OBRIGAÇÕES MENSAIS (Vencimento Fixo)
-- =====================================================

INSERT INTO fiscal_obligations (name, description, day_of_month, month, applies_to, level, color, is_active) VALUES
-- Dia 7
('GFIP/SEFIP', 'Guia de Recolhimento do FGTS e Informações à Previdência Social', 7, NULL, 'all', 'federal', '#EF4444', true),

-- Dia 10 (10º dia útil do 2º mês subsequente)
('EFD-Contribuições', 'Escrituração Fiscal Digital das Contribuições', 10, NULL, 'lucro_presumido', 'federal', '#F59E0B', true),

-- Dia 15
('eSocial', 'Escrituração Digital das Obrigações Fiscais e Previdenciárias', 15, NULL, 'all', 'federal', '#F97316', true),
('EFD-Reinf', 'Escrituração Fiscal Digital de Retenções e Outras Informações Fiscais', 15, NULL, 'all', 'federal', '#F97316', true),
('INSS Individual', 'Contribuição Previdenciária do Contribuinte Individual', 15, NULL, 'individual', 'federal', '#EF4444', true),

-- Dia 20
('PGDAS-D', 'Programa Gerador do Documento de Arrecadação do Simples Nacional', 20, NULL, 'simples', 'federal', '#EF4444', true),
('DAS', 'Documento de Arrecadação do Simples Nacional', 20, NULL, 'simples', 'federal', '#EF4444', true),
('DIRBI', 'Declaração de Informações Relativas às Instituições Beneficentes de Assistência Social', 20, NULL, 'all', 'federal', '#3B82F6', true),

-- Dia 25
('IPI', 'Imposto sobre Produtos Industrializados', 25, NULL, 'industria', 'federal', '#F59E0B', true),
('PIS', 'Programa de Integração Social', 25, NULL, 'all', 'federal', '#F59E0B', true),
('COFINS', 'Contribuição para o Financiamento da Seguridade Social', 25, NULL, 'all', 'federal', '#F59E0B', true);

-- =====================================================
-- OBRIGAÇÕES MENSAIS (Último dia útil)
-- =====================================================

-- DCTFWeb (último dia útil - vamos usar dia 31 e ajustar no código)
INSERT INTO fiscal_obligations (name, description, day_of_month, month, applies_to, level, color, is_active) VALUES
('DCTFWeb', 'Declaração de Débitos e Créditos Tributários Federais Previdenciários', 31, NULL, 'all', 'federal', '#EF4444', true);

-- =====================================================
-- OBRIGAÇÕES ANUAIS 2026
-- =====================================================

INSERT INTO fiscal_obligations (name, description, day_of_month, month, applies_to, level, color, is_active) VALUES
-- Janeiro
('Opção Simples Nacional', 'Prazo para opção pelo Simples Nacional', 31, 1, 'all', 'federal', '#10B981', true),

-- Março
('DEFIS', 'Declaração de Informações Socioeconômicas e Fiscais - MEI', 31, 3, 'mei', 'federal', '#3B82F6', true),
('IRPF', 'Declaração de Ajuste Anual do Imposto de Renda Pessoa Física', 31, 5, 'individual', 'federal', '#3B82F6', true),

-- Maio
('ECD', 'Escrituração Contábil Digital', 31, 5, 'all', 'federal', '#3B82F6', true),

-- Julho
('ECF', 'Escrituração Contábil Fiscal', 31, 7, 'lucro_presumido', 'federal', '#3B82F6', true),
('ECF', 'Escrituração Contábil Fiscal', 31, 7, 'lucro_real', 'federal', '#3B82F6', true);

-- =====================================================
-- OBRIGAÇÕES ESPECÍFICAS POR MÊS (2026)
-- =====================================================

-- Estas são obrigações com datas específicas que podem mudar por ano
-- Vamos criar eventos diretos no calendar_events para 2026

INSERT INTO calendar_events (title, description, event_type, start_date, all_day, color, status, metadata) VALUES
-- Janeiro 2026
('GFIP', 'Competência dezembro/2025', 'obligation', '2026-01-07', true, '#EF4444', 'pending', '{"recurrent": true, "competence": "2025-12"}'),
('EFD-Reinf', 'Competência dezembro/2025', 'obligation', '2026-01-15', true, '#F97316', 'pending', '{"recurrent": true, "competence": "2025-12"}'),
('EFD-Contribuições', 'Competência novembro/2025', 'obligation', '2026-01-15', true, '#F59E0B', 'pending', '{"recurrent": true, "competence": "2025-11"}'),
('PGDAS-D/DAS', 'Competência dezembro/2025', 'obligation', '2026-01-20', true, '#EF4444', 'pending', '{"recurrent": true, "competence": "2025-12"}'),
('DIRBI', 'Competência dezembro/2025', 'obligation', '2026-01-20', true, '#3B82F6', 'pending', '{"recurrent": true, "competence": "2025-12"}'),
('DCTFWeb', 'Competência dezembro/2025', 'obligation', '2026-01-31', true, '#EF4444', 'pending', '{"recurrent": true, "competence": "2025-12"}'),

-- Fevereiro 2026
('GFIP', 'Competência janeiro/2026', 'obligation', '2026-02-06', true, '#EF4444', 'pending', '{"recurrent": true, "competence": "2026-01"}'),
('EFD-Reinf', 'Competência janeiro/2026', 'obligation', '2026-02-13', true, '#F97316', 'pending', '{"recurrent": true, "competence": "2026-01"}'),
('EFD-Contribuições', 'Competência dezembro/2025', 'obligation', '2026-02-13', true, '#F59E0B', 'pending', '{"recurrent": true, "competence": "2025-12"}'),
('PGDAS-D/DAS', 'Competência janeiro/2026', 'obligation', '2026-02-20', true, '#EF4444', 'pending', '{"recurrent": true, "competence": "2026-01"}'),
('DIRBI', 'Competência janeiro/2026', 'obligation', '2026-02-20', true, '#3B82F6', 'pending', '{"recurrent": true, "competence": "2026-01"}'),
('DCTFWeb', 'Competência janeiro/2026', 'obligation', '2026-02-27', true, '#EF4444', 'pending', '{"recurrent": true, "competence": "2026-01"}'),

-- Março 2026
('GFIP', 'Competência fevereiro/2026', 'obligation', '2026-03-06', true, '#EF4444', 'pending', '{"recurrent": true, "competence": "2026-02"}'),
('EFD-Reinf', 'Competência fevereiro/2026', 'obligation', '2026-03-13', true, '#F97316', 'pending', '{"recurrent": true, "competence": "2026-02"}'),
('EFD-Contribuições', 'Competência janeiro/2026', 'obligation', '2026-03-13', true, '#F59E0B', 'pending', '{"recurrent": true, "competence": "2026-01"}'),
('PGDAS-D/DAS', 'Competência fevereiro/2026', 'obligation', '2026-03-20', true, '#EF4444', 'pending', '{"recurrent": true, "competence": "2026-02"}'),
('DCTFWeb', 'Competência fevereiro/2026', 'obligation', '2026-03-31', true, '#EF4444', 'pending', '{"recurrent": true, "competence": "2026-02"}'),
('DEFIS', 'Ano-calendário 2025', 'obligation', '2026-03-31', true, '#3B82F6', 'pending', '{"recurrent": true, "year": "2025"}'),

-- Abril 2026
('GFIP', 'Competência março/2026', 'obligation', '2026-04-07', true, '#EF4444', 'pending', '{"recurrent": true, "competence": "2026-03"}'),
('EFD-Reinf', 'Competência março/2026', 'obligation', '2026-04-15', true, '#F97316', 'pending', '{"recurrent": true, "competence": "2026-03"}'),
('EFD-Contribuições', 'Competência fevereiro/2026', 'obligation', '2026-04-15', true, '#F59E0B', 'pending', '{"recurrent": true, "competence": "2026-02"}'),
('PGDAS-D/DAS', 'Competência março/2026', 'obligation', '2026-04-20', true, '#EF4444', 'pending', '{"recurrent": true, "competence": "2026-03"}'),
('DCTFWeb', 'Competência março/2026', 'obligation', '2026-04-30', true, '#EF4444', 'pending', '{"recurrent": true, "competence": "2026-03"}'),

-- Maio 2026
('GFIP', 'Competência abril/2026', 'obligation', '2026-05-07', true, '#EF4444', 'pending', '{"recurrent": true, "competence": "2026-04"}'),
('EFD-Reinf', 'Competência abril/2026', 'obligation', '2026-05-15', true, '#F97316', 'pending', '{"recurrent": true, "competence": "2026-04"}'),
('EFD-Contribuições', 'Competência março/2026', 'obligation', '2026-05-15', true, '#F59E0B', 'pending', '{"recurrent": true, "competence": "2026-03"}'),
('PGDAS-D/DAS', 'Competência abril/2026', 'obligation', '2026-05-20', true, '#EF4444', 'pending', '{"recurrent": true, "competence": "2026-04"}'),
('DCTFWeb', 'Competência abril/2026', 'obligation', '2026-05-29', true, '#EF4444', 'pending', '{"recurrent": true, "competence": "2026-04"}'),
('ECD', 'Ano-calendário 2025', 'obligation', '2026-05-29', true, '#3B82F6', 'pending', '{"recurrent": true, "year": "2025"}'),

-- Junho 2026
('GFIP', 'Competência maio/2026', 'obligation', '2026-06-05', true, '#EF4444', 'pending', '{"recurrent": true, "competence": "2026-05"}'),
('EFD-Reinf', 'Competência maio/2026', 'obligation', '2026-06-15', true, '#F97316', 'pending', '{"recurrent": true, "competence": "2026-05"}'),
('EFD-Contribuições', 'Competência abril/2026', 'obligation', '2026-06-15', true, '#F59E0B', 'pending', '{"recurrent": true, "competence": "2026-04"}'),
('PGDAS-D/DAS', 'Competência maio/2026', 'obligation', '2026-06-19', true, '#EF4444', 'pending', '{"recurrent": true, "competence": "2026-05"}'),
('DCTFWeb', 'Competência maio/2026', 'obligation', '2026-06-30', true, '#EF4444', 'pending', '{"recurrent": true, "competence": "2026-05"}'),

-- Julho 2026
('GFIP', 'Competência junho/2026', 'obligation', '2026-07-07', true, '#EF4444', 'pending', '{"recurrent": true, "competence": "2026-06"}'),
('EFD-Reinf', 'Competência junho/2026', 'obligation', '2026-07-15', true, '#F97316', 'pending', '{"recurrent": true, "competence": "2026-06"}'),
('EFD-Contribuições', 'Competência maio/2026', 'obligation', '2026-07-15', true, '#F59E0B', 'pending', '{"recurrent": true, "competence": "2026-05"}'),
('PGDAS-D/DAS', 'Competência junho/2026', 'obligation', '2026-07-20', true, '#EF4444', 'pending', '{"recurrent": true, "competence": "2026-06"}'),
('DCTFWeb', 'Competência junho/2026', 'obligation', '2026-07-31', true, '#EF4444', 'pending', '{"recurrent": true, "competence": "2026-06"}'),
('ECF', 'Ano-calendário 2025 (Lucro Presumido/Real)', 'obligation', '2026-07-31', true, '#3B82F6', 'pending', '{"recurrent": true, "year": "2025"}');

-- =====================================================
-- ATUALIZAR CONTADOR DE OBRIGAÇÕES
-- =====================================================

-- Verificar total de obrigações
SELECT 
  level,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE is_active = true) as active
FROM fiscal_obligations
GROUP BY level
ORDER BY level;

-- =====================================================
-- COMENTÁRIOS
-- =====================================================

COMMENT ON TABLE fiscal_obligations IS 'Obrigações fiscais recorrentes com base no Calendário Mensal de Obrigações Acessórias 2026';

-- Notas sobre ajustes de datas:
-- 1. Vencimentos que caem em sábado devem ser antecipados para sexta-feira
-- 2. Vencimentos que caem em domingo devem ser postergados para segunda-feira
-- 3. Feriados nacionais e estaduais podem alterar os prazos
-- 4. Para dias úteis específicos (ex: 10º dia útil), usar função de cálculo
