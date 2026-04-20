# 📊 Análise: Banco de Dados Relacional vs JSONB para Hub Contábil

## 🎯 Contexto Atual

O sistema Hub Contábil precisa armazenar:
- **Clientes** (dados fixos + variáveis)
- **Contatos** (1 a N por cliente)
- **QSA - Quadro Societário** (1 a N sócios)
- **CNAEs Secundários** (0 a N atividades)
- **Documentos** (0 a N arquivos)
- **Pastas** (0 a N, hierárquico)

---

## 🔍 Opções de Modelagem

### Opção 1: **Modelo Relacional Puro** (Atual)

```sql
-- Tabelas separadas para cada entidade
CREATE TABLE clients (
  id UUID PRIMARY KEY,
  cnpj VARCHAR(14) UNIQUE,
  razao_social VARCHAR(255),
  -- ... campos fixos
);

CREATE TABLE contatos (
  id UUID PRIMARY KEY,
  client_id UUID REFERENCES clients(id),
  nome VARCHAR(255),
  email VARCHAR(255),
  telefone VARCHAR(20),
  cargo VARCHAR(100)
);

CREATE TABLE client_qsa (
  id UUID PRIMARY KEY,
  client_id UUID REFERENCES clients(id),
  nome VARCHAR(255),
  cpf_cnpj VARCHAR(18),
  qualificacao VARCHAR(100),
  participacao DECIMAL
);

CREATE TABLE cnaes_secundarios (
  id UUID PRIMARY KEY,
  client_id UUID REFERENCES clients(id),
  codigo VARCHAR(10),
  descricao TEXT
);
```

**Vantagens:**
- ✅ **Integridade referencial** garantida pelo banco
- ✅ **Queries complexas** eficientes (JOINs, WHERE em campos específicos)
- ✅ **Índices** em qualquer campo
- ✅ **Validação** de tipos nativa do PostgreSQL
- ✅ **Normalização** - sem duplicação de dados
- ✅ **Atualizações** parciais eficientes
- ✅ **Prisma ORM** funciona perfeitamente

**Desvantagens:**
- ❌ **Múltiplas tabelas** - mais complexo inicialmente
- ❌ **Múltiplos INSERTs** para salvar um cliente completo
- ❌ **JOINs** necessários para buscar dados completos
- ❌ **Schema rígido** - mudanças requerem migration

**Performance:**
- Leitura com JOIN: ~5-15ms para cliente completo
- Escrita (4 tabelas): ~10-20ms
- Índice em qualquer campo: ~1-2ms para buscas

---

### Opção 2: **JSONB Puro**

```sql
CREATE TABLE clients (
  id UUID PRIMARY KEY,
  cnpj VARCHAR(14) UNIQUE,
  razao_social VARCHAR(255),
  dados_completos JSONB  -- TUDO aqui
);
```

**Exemplo de JSON:**
```json
{
  "cnpj": "34509314000136",
  "razao_social": "JOPAN...",
  "contatos": [
    {"nome": "João", "email": "joao@...", "telefone": "..."},
    {"nome": "Maria", "email": "maria@...", "telefone": "..."}
  ],
  "qsa": [
    {"nome": "João", "cpf": "...", "qualificacao": "Sócio"}
  ],
  "cnaes_secundarios": [
    {"codigo": "4712100", "descricao": "..."}
  ]
}
```

**Vantagens:**
- ✅ **Schema flexível** - adiciona campos sem migration
- ✅ **INSERT único** - salva tudo de uma vez
- ✅ **Sem JOINs** - busca em uma tabela só
- ✅ **Fácil evolução** - novos campos no JSON

**Desvantagens:**
- ❌ **Sem integridade referencial** - dados órfãos possíveis
- ❌ **Queries limitadas** - difícil filtrar dentro do JSON
- ❌ **Índices limitados** - só GIN index (mais lento que B-tree)
- ❌ **Validação manual** - você precisa validar estrutura
- ❌ **Atualizações parciais** - precisa reescrever JSON inteiro
- ❌ **Prisma ORM** não tipa campos do JSON
- ❌ **Dados duplicados** - mesmo CPF em múltiplos clientes

**Performance:**
- Leitura simples: ~2-5ms (mais rápido que JOIN)
- Busca dentro do JSON: ~50-100ms (MUITO mais lento)
- Escrita única: ~5-10ms
- Sem índice em campos internos do JSON

---

### Opção 3: **Híbrido (Recomendada)** ⭐

```sql
-- Tabela principal com campos fixos + JSONB para flexibilidade
CREATE TABLE clients (
  id UUID PRIMARY KEY,
  cnpj VARCHAR(14) UNIQUE NOT NULL,
  razao_social VARCHAR(255) NOT NULL,
  nome_fantasia VARCHAR(255),
  data_abertura DATE,
  natureza_juridica VARCHAR(100),
  inscricao_estadual VARCHAR(50),
  inscricao_municipal VARCHAR(50),
  nire VARCHAR(30),
  situacao_sefaz VARCHAR(50),
  regime_tributario VARCHAR(50),
  
  -- Campos fixos de endereço
  endereco_cep VARCHAR(10),
  endereco_logradouro VARCHAR(255),
  endereco_numero VARCHAR(20),
  endereco_bairro VARCHAR(100),
  endereco_cidade VARCHAR(100),
  endereco_uf VARCHAR(2),
  
  -- Contato principal
  contato_email VARCHAR(255),
  contato_telefone VARCHAR(20),
  
  -- Dossiê (JSONB para dados variáveis)
  senhas_portais JSONB DEFAULT '{}',
  certificado_digital JSONB DEFAULT '{}',
  honorarios JSONB DEFAULT '{}',
  
  -- Controle
  categoria VARCHAR(100),
  is_bpo BOOLEAN DEFAULT false,
  observacoes TEXT,
  status VARCHAR(20) DEFAULT 'Ativo',
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabelas relacionais para entidades que precisam de queries
CREATE TABLE contatos (
  id UUID PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  telefone VARCHAR(20),
  cargo VARCHAR(100),
  eh_principal BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE client_qsa (
  id UUID PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  cpf_cnpj VARCHAR(18),
  qualificacao VARCHAR(100),
  participacao DECIMAL(5,2),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE cnaes_secundarios (
  id UUID PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  codigo VARCHAR(10) NOT NULL,
  descricao TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_clients_cnpj ON clients(cnpj);
CREATE INDEX idx_clients_razao_social ON clients(razao_social);
CREATE INDEX idx_clients_status ON clients(status);
CREATE INDEX idx_contatos_client ON contatos(client_id);
CREATE INDEX idx_qsa_client ON client_qsa(client_id);
CREATE INDEX idx_cnaes_client ON cnaes_secundarios(client_id);
```

**Vantagens:**
- ✅ **Melhor dos dois mundos**
- ✅ **Campos fixos** para queries frequentes (CNPJ, razão social, status)
- ✅ **JSONB** para dados variáveis (senhas, certificado, honorários)
- ✅ **Tabelas relacionais** para entidades consultáveis (contatos, QSA, CNAEs)
- ✅ **Integridade referencial** onde importa
- ✅ **Performance otimizada** - JOINs apenas quando necessário
- ✅ **Flexibilidade** - adiciona campos JSON sem migration
- ✅ **Prisma ORM** tipa campos fixos, JSON é `any`

**Desvantagens:**
- ⚠️ **Complexidade média** - requer entendimento de ambos
- ⚠️ **Decisões de design** - o que vai em JSON vs tabela?

**Performance:**
- Leitura cliente básico: ~2-3ms (sem JOIN)
- Leitura cliente completo: ~8-15ms (com JOINs)
- Busca por CNPJ: ~1ms (índice direto)
- Busca por QSA (nome): ~5-10ms (JOIN + índice)

---

## 📊 Comparação de Performance

| Operação | Relacional | JSONB Puro | Híbrido |
|----------|------------|------------|---------|
| **INSERT cliente** | 10-20ms | 5-10ms | 10-15ms |
| **SELECT básico** | 2-5ms | 2-3ms | 2-3ms |
| **SELECT completo** | 8-15ms | 2-3ms | 8-12ms |
| **Busca por CNPJ** | 1-2ms | 1-2ms | 1-2ms |
| **Busca por QSA** | 5-10ms | 50-100ms | 5-10ms |
| **Busca por email contato** | 3-8ms | 50-100ms | 3-8ms |
| **UPDATE parcial** | 5-10ms | 10-20ms | 5-10ms |

---

## 🎯 Minha Recomendação: **Modelo Híbrido**

### Por que?

1. **Seu caso de uso específico:**
   - ✅ CNPJ, razão social → **Campos fixos** (busca frequente)
   - ✅ Contatos, QSA, CNAEs → **Tabelas** (precisa buscar/filtrar)
   - ✅ Senhas, certificado → **JSONB** (dados variáveis, sem busca)

2. **Escalabilidade:**
   - ✅ Adiciona campos JSON sem migration
   - ✅ Mantém integridade onde importa
   - ✅ Performance otimizada para queries comuns

3. **Manutenibilidade:**
   - ✅ Prisma ORM funciona bem
   - ✅ Typescript tipa campos fixos
   - ✅ Flexibilidade para evolução

---

## 🔧 Implementação Recomendada

### Campos que DEVEM ser relacionais:

```sql
-- Sempre tabelas separadas
contatos          -- Precisa buscar por email/telefone
qsa               -- Precisa buscar por CPF/nome
cnaes_secundarios -- Precisa filtrar por código
documentos        -- Precisa buscar por tipo/data
pastas            -- Hierarquia requer JOINs
```

### Campos que PODEM ser JSONB:

```sql
-- JSONB é OK para:
senhas_portais       -- Não busca por senha
certificado_digital  -- Não busca por número de certificado
honorarios           -- Estrutura pode mudar
observacoes          -- Texto livre
```

### Campos que DEVEM ser fixos:

```sql
-- Sempre campos na tabela clients
cnpj                 -- Busca única, chave
razao_social         -- Busca frequente
nome_fantasia        -- Exibição
data_abertura        -- Filtros de data
inscricao_estadual   -- Busca por IE
inscricao_municipal  -- Busca por IM
nire                 -- Busca por NIRE
situacao_sefaz       -- Filtro de situação
status               -- Filtro frequente
```

---

## 📝 Próximos Passos

### Imediato (Corrigir erro atual):

1. **Corrigir tipos de dados** no Prisma:
   ```prisma
   cnaePrincipalCodigo   String?  // Era Int, deve ser String
   cnaePrincipalDescricao String?
   ```

2. **Adicionar campos faltantes**:
   ```prisma
   nire            String?
   situacaoSefaz   String?
   inscricaoEstadual String?
   inscricaoMunicipal String?
   ```

3. **Corrigir envio do frontend**:
   ```javascript
   cnae_principal: {
     codigo: String(cnae.codigo), // Converte número para string
     descricao: cnae.descricao
   }
   ```

### Curto Prazo (1-2 semanas):

- [ ] Manter modelo híbrido atual
- [ ] Adicionar campos NIRE e Situação SEFAZ
- [ ] Corrigir tipos de dados
- [ ] Testar performance com dados reais

### Médio Prazo (1-2 meses):

- [ ] Avaliar se JSONB é necessário para algum campo
- [ ] Otimizar índices baseado em queries reais
- [ ] Considerar partitioning se > 100k clientes

---

## ❓ Decisão Necessária

**Você quer que eu:**

### Opção A: Manter Modelo Híbrido Atual (Recomendado)
- ✅ Corrige erro atual (tipos de dados)
- ✅ Adiciona campos NIRE, Situação SEFAZ
- ✅ Mantém tabelas para contatos, QSA, CNAEs
- ✅ Performance boa para seu caso de uso

### Opção B: Migrar para JSONB Puro
- ✅ Simplifica INSERTs (um só)
- ❌ Perde integridade referencial
- ❌ Queries mais lentas dentro do JSON
- ❌ Mais difícil de manter a longo prazo

### Opção C: Normalizar Totalmente
- ✅ Tudo em tabelas separadas
- ❌ Mais complexo (7+ tabelas)
- ❌ Múltiplos JOINs para tudo
- ❌ Overkill para seu caso

---

## 🎯 Minha Recomendação Final

**Opção A: Manter Híbrido**

**Motivos:**
1. Performance boa para queries reais
2. Flexibilidade para evolução
3. Integridade onde importa
4. Prisma ORM funciona bem
5. Fácil de escalar horizontalmente

**Ação:** Vou corrigir o erro atual e adicionar os campos faltantes mantendo a estrutura híbrida.

**Posso prosseguir?**
