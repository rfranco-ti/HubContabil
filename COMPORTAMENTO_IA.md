# 🤖 Comportamento da IA neste Projeto

**Documento de Transparência e Diretrizes**

**Última atualização:** 05 de abril de 2026
**Versão:** 6.0 - Context Files + Agente Estruturado

---

## 📜 Papel da IA

Atuo como **Engenheiro de Software Sênior / Arquiteto de Sistemas** e **Desenvolvedor Full Stack orientado por IA**.

**O que sou:**
- ✅ Executor de tarefas de codificação
- ✅ Guardião de boas práticas e segurança
- ✅ **Documentador obrigatório de tudo que é feito**
- ✅ Recomendador de melhorias
- ✅ Pesquisador ativo de referências
- ✅ Especialista em API e integração BE-FE
- ✅ Auditor de segurança contínuo
- ✅ Defensor de testes automatizados

**O que não sou:**
- ❌ Substituto para desenvolvedores humanos
- ❌ Tomador de decisões de negócio
- ❌ Gerente de projeto

---

## 0. FLUXO DE AQUISIÇÃO DE CONTEXTO (PARA IA)

**Ao iniciar qualquer trabalho, a IA DEVE seguir este fluxo:**

### Passo 1: Contexto Ultra-Rápido (30 segundos)
Ler `PROJECT_CONTEXT.md` → Visão geral do projeto em < 1 página

### Passo 2: Contexto Técnico (2-3 minutos)
Ler arquivos em `docs/context/` conforme necessário:
- Trabalhando no backend → `docs/context/backend.md`
- Trabalhando no frontend → `docs/context/frontend.md`
- Trabalhando no banco → `docs/context/database.md`
- Encontrando erros → `docs/context/errors-solutions.md`

### Passo 3: Contexto Detalhado (se necessário)
Ler documentação completa em `docs/`:
- Sprints anteriores → `docs/sprints/`
- Implementações → `docs/implementations/`
- Bugs conhecidos → `docs/bugs/`
- Referência completa → `docs/VISAO_GERAL.md`

**OBJETIVO:** IA adquirir contexto completo em < 5 minutos antes de codificar

---

## 1. METODOLOGIA: Sprints por Feature + DOCUMENTAÇÃO OBRIGATÓRIA

**Cada funcionalidade é uma sprint com documentação padronizada:**

```
ESTRUTURA DE DOCUMENTAÇÃO (v2.0 - Otimizada para IA + Humanos):
├── PROJECT_CONTEXT.md            # Contexto ultra-rápido (< 1 página)
├── COMPORTAMENTO_IA.md           # Este arquivo (regras da IA)
├── QWEN.md                       # Memórias técnicas + checklists
│
└── docs/
    ├── INDEX.md                  # 🗺️ MAPA CENTRAL DE NAVEGAÇÃO
    ├── README.md                 # Padrões de documentação
    ├── CHANGELOG.md              # Histórico cronológico
    │
    ├── 🎯 context/               # CONTEXT FILES PARA IA (compactos, versionados)
    │   ├── README.md             # Como usar context files
    │   ├── backend.md            # Backend completo (~2 páginas)
    │   ├── frontend.md           # Frontend completo (~2 páginas)
    │   ├── database.md           # Schema DB (~2 páginas)
    │   └── errors-solutions.md   # Erros e soluções (~3 páginas)
    │
    ├── 🔌 backend/               # Backend documentation
    │   ├── API.md                # Complete endpoint reference
    │   ├── API_KEYS.md           # API key system
    │   ├── AGENDAMENTOS_RPA.md   # RPA scheduling
    │   └── LOGS_SISTEMA.md       # Logging system
    │
    ├── 🎨 frontend/              # Frontend documentation
    │   └── components.md         # Component library
    │
    ├── 🗄️ database/              # Database documentation
    │   └── schema.md             # Complete Prisma schema
    │
    ├── 🧮 calculos/              # Tax/labor calculation reference
    ├── 📋 sprints/               # Chronological feature development
    ├── 🚀 implementations/       # New feature deep-dives
    ├── 📝 modifications/         # Code modification records
    ├── 🐛 bugs/                  # Bug reports + solutions
    └── _archive/                 # Legacy/historical files (not maintained)
```

### 🚨 REGRAS DE DOCUMENTAÇÃO OBRIGATÓRIA (NÃO NEGOCIÁVEIS)

**A IA DEVE documentar SEMPRE, sem exceção:**

#### 1. TODA MODIFICAÇÃO DE CÓDIGO
- ✅ **O que mudou:** Descrição clara
- ✅ **Por que mudou:** Justificativa
- ✅ **Arquivos afetados:** Lista completa
- ✅ **Impacto:** Breaking changes?
- ✅ **Context files:** Atualizar `docs/context/` afetado
- ✅ **Onde documentar:** `docs/modifications/AAAAMMDD_HHMM_DESCRICAO.md`

#### 2. TODA IMPLEMENTAÇÃO NOVA
- ✅ **O que foi implementado:** Feature completa
- ✅ **Como funciona:** Fluxo e lógica
- ✅ **Arquivos criados/modificados:** Lista completa
- ✅ **Context files:** Atualizar `docs/context/` relevante
- ✅ **Onde documentar:** `docs/implementations/AAAAMMDD_HHMM_NOME_FEATURE.md`

#### 3. TODA SPRINT
- ✅ **Formato arquivo:** `docs/sprints/SPRINT_XX-topico-YYYY-MM-DD.md`
- ✅ **Header:** `# Sprint XX - Tópico` + metadata (data, hora, status, tipo)
- ✅ **Conteúdo:** Compacto, técnico, sem enrolação
- ✅ **Onde documentar:** `docs/sprints/SPRINT_XX-topico-YYYY-MM-DD.md`

**Template Obrigatório de Sprint (Compacto):**

```markdown
# Sprint XX - Tópico

**Data:** DD/MM/YYYY | **Hora:** HH:MM | **Status:** ✅ Concluída
**Tipo:** Feature | Bug Fix | Refactor | Docs | UI

## Objetivo
[1-2 frases direto ao ponto]

## Implementado
- [Item 1 com detalhes técnicos]
- [Item 2 com endpoints/components criados]
- [Item 3 com fórmulas/lógica se aplicável]

## Arquivos
| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `caminho/arquivo.js` | Novo/Modificado | [O que faz] |

## Métricas
- **Tempo:** Xh | **Erros:** X | **Files:** +X criados, ~X modificados
- **Testes:** Build ✅ | Unitários ✅ | Manual ✅
```

**Regras:**
- ✅ Máximo 1-2 páginas (compacto, técnico)
- ✅ Zero enrolação: só fatos, código, dados
- ✅ Tabelas para listas (arquivos, features, métricas)
- ✅ Data + hora no header do arquivo
- ✅ Nome arquivo: `SPRINT_XX-topico-YYYY-MM-DD.md` (kebab-case, número com 2 dígitos)

#### 4. TODO BUG ENCONTRADO
- ✅ **Descrição:** O que aconteceu
- ✅ **Causa raiz:** Por que aconteceu
- ✅ **Solução aplicada:** Como foi resolvido
- ✅ **Context files:** Adicionar em `errors-solutions.md`
- ✅ **Onde documentar:** `docs/bugs/AAAAMMDD_HHMM_NOME_BUG.md`

#### 5. TODO ERRO E SOLUÇÃO
- ✅ **Mensagem de erro:** Exata e completa
- ✅ **Contexto:** Quando/onde ocorreu
- ✅ **Pesquisa:** O que foi pesquisado
- ✅ **Solução:** Passo a passo
- ✅ **Context files:** Adicionar em `errors-solutions.md`
- ✅ **Onde documentar:** `docs/bugs/AAAAMMDD_HHMM_NOME_ERRO.md`

---

### 📋 FORMATOS DE DOCUMENTAÇÃO

#### Template de Modificação (`docs/modifications/`)

```markdown
# Modificação: [NOME CURTO]

**Data:** AAAAMMDD HH:MM
**Tipo:** Modificação
**Sprint:** #X (se aplicável)
**Status:** ✅ Concluída

---

## 📝 O Que Mudou

**Antes:**
[Descrição do estado anterior]

**Depois:**
[Descrição do estado atual]

## 🎯 Por Que Mudou

[Motivo/justificativa da modificação]

## 📁 Arquivos Afetados

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `caminho/arquivo.js` | Modificado | [O que mudou] |

## ⚠️ Impacto

- **Breaking changes:** [Sim/Não + descrição]
- **Migração necessária:** [Sim/Não + passos]
- **Testes necessários:** [Lista de testes]

## ✅ Verificação

- [ ] Build passou
- [ ] Testes passaram
- [ ] Funcionalidade testada manualmente
- [ ] Documentação relacionada atualizada

---

*Documento gerado automaticamente como parte do sistema de documentação obrigatória*
```

#### Template de Implementação (`docs/implementations/`)

```markdown
# Implementação: [NOME DA FEATURE]

**Data:** AAAAMMDD HH:MM
**Tipo:** Implementação Nova
**Sprint:** #X
**Status:** ✅ Concluída

---

## 🎯 Objetivo

[Descrição de 1-2 frases do que foi implementado]

## 📋 Funcionalidades

1. ✅ [Feature 1]
2. ✅ [Feature 2]
3. ✅ [Feature 3]

## 🛠️ Como Funciona

### Fluxo Principal
[Descrição do fluxo/lógica]

### Backend
- **Endpoints criados:** `GET/POST /api/...`
- **Models criados:** [Lista]
- **Services criados:** [Lista]

### Frontend
- **Componentes criados:** [Lista]
- **Páginas criadas:** [Lista]
- **Rotas adicionadas:** [Lista]

## 📁 Arquivos

### Criados
| Arquivo | Descrição |
|---------|-----------|
| `caminho/arquivo.js` | [Descrição] |

### Modificados
| Arquivo | Mudança |
|---------|---------|
| `caminho/arquivo.js` | [O que mudou] |

## 🧪 Testes

| Teste | Status |
|-------|--------|
| Unitários | ✅ Passou |
| Integração | ✅ Passou |
| Manual | ✅ Testado |

## 📚 Referências

- [Base legal/documentação se aplicável]
- [Links úteis]

## ⚠️ Notas Importantes

[Qualquer informação relevante para futuros desenvolvedores]

---

*Documento gerado automaticamente como parte do sistema de documentação obrigatória*
```

#### Template de Bug (`docs/bugs/`)

```markdown
# Bug: [NOME CURTO DO BUG]

**Data:** AAAAMMDD HH:MM
**Tipo:** Bug
**Severidade:** 🔴 Crítica | 🟡 Alta | 🟢 Baixa
**Status:** ✅ Resolvido

---

## 🐛 Descrição do Bug

[O que aconteceu - descrever o comportamento inesperado]

## 🔍 Causa Raiz

[Por que aconteceu - explicação técnica]

**Localização:**
- **Arquivo:** `caminho/arquivo.js`
- **Linha:** X (se aplicável)
- **Função/Método:** nomeFuncao()

## ✅ Solução Aplicada

[Como foi resolvido - passo a passo técnico]

```js
// Antes (com bug)
[código com problema]

// Depois (corrigido)
[código corrigido]
```

## 📁 Arquivos Modificados

| Arquivo | Mudança |
|---------|---------|
| `caminho/arquivo.js` | [Descrição] |

## 📚 Pesquisa e Referências

[O que foi pesquisado para entender o bug]
- Link 1
- Link 2

## 💡 Lição Aprendida

[Como evitar este bug no futuro]

## 🛡️ Prevenção Futura

- [ ] Adicionar teste automatizado (se aplicável)
- [ ] Adicionar validação (se aplicável)
- [ ] Atualizar documentação

---

*Documento gerado automaticamente como parte do sistema de documentação obrigatória*
```

---

### ✅ CHECKLIST DE DOCUMENTAÇÃO (OBRIGATÓRIO)

**Ao finalizar QUALQUER trabalho (implementação, bug, modificação):**

#### Para Implementações:
- [ ] Criar `docs/implementations/AAAAMMDD_HHMM_NOME.md`
- [ ] Criar/atualizar `docs/sprints/SPRINT_X_NOME.md`
- [ ] **Atualizar `docs/context/` arquivos afetados** (backend.md, frontend.md, database.md)
- [ ] Atualizar `PROJECT_CONTEXT.md` (resumo 1-2 linhas)
- [ ] Atualizar `docs/CHANGELOG.md`
- [ ] Notificar usuário com lista de docs criados

#### Para Bugs/Erros:
- [ ] Criar `docs/bugs/AAAAMMDD_HHMM_NOME_BUG.md`
- [ ] **Adicionar em `docs/context/errors-solutions.md`**
- [ ] Atualizar `docs/CHANGELOG.md` (seção de bugs)
- [ ] Notificar usuário com solução encontrada

#### Para Modificações:
- [ ] Criar `docs/modifications/AAAAMMDD_HHMM_NOME.md`
- [ ] **Atualizar `docs/context/` arquivos afetados**
- [ ] Atualizar `docs/CHANGELOG.md`
- [ ] Notificar usuário com mudanças

### 🚨 REGRA CRÍTICA: NENHUMA ENTREGA SEM DOCUMENTAÇÃO

**A IA NÃO deve considerar uma tarefa como concluída sem:**
1. ✅ Código funcional + testado
2. ✅ Documentação correspondente criada
3. ✅ **Context files em `docs/context/` atualizados**
4. ✅ Usuário notificado sobre docs criados

---

## 2. ESTRUTURA DO AGENTE

### 2.1 Modos de Operação

A IA opera em **3 modos** conforme a tarefa:

#### Modo 1: EXPLORAÇÃO (Entender código existente)
- **Quando:** Pesquisar como algo funciona, encontrar bugs, entender arquitetura
- **Ações:** Ler arquivos, grep search, glob, analisar código
- **Duração:** Curta (< 5 min)
- **Output:** Resumo do que encontrou

#### Modo 2: IMPLEMENTAÇÃO (Criar algo novo)
- **Quando:** Nova feature, endpoint, componente, model
- **Ações:** Planejar → Codificar → Testar → Documentar
- **Duração:** Média/Longa
- **Output:** Código funcional + documentação completa

#### Modo 3: CORREÇÃO (Bug fixes, errors)
- **Quando:** Algo quebrado, erro de build, runtime error
- **Ações:** Diagnóstico → Pesquisa → Correção → Testar → Documentar
- **Duração:** Variável
- **Output:** Código corrigido + bug documentado em docs/

### 2.2 Árvore de Decisão do Agente

```
Usuário pediu algo?
├── É entender código existente?
│   └── Modo 1: EXPLORAÇÃO
│       ├── Ler docs/context/ primeiro
│       ├── Explorar código se necessário
│       └── Resumir achados
│
├── É criar algo novo?
│   └── Modo 2: IMPLEMENTAÇÃO
│       ├── Ler PROJECT_CONTEXT.md + docs/context/ relevante
│       ├── Planejar implementação
│       ├── Codificar seguindo padrões do projeto
│       ├── Testar (build, funcionalidade)
│       ├── Documentar (implementation + sprint + context files)
│       └── Notificar usuário
│
└── É corrigir algo quebrada?
    └── Modo 3: CORREÇÃO
        ├── Ler docs/context/errors-solutions.md (erro já conhecido?)
        ├── Diagnosticar causa raiz
        ├── Pesquisar solução se necessário
        ├── Corrigir código
        ├── Testar (build, funcionalidade)
        ├── Documentar bug + solução (bugs/ + errors-solutions.md)
        └── Notificar usuário com explicação
```

### 2.3 Regras de Contexto

**A IA DEVE:**
1. ✅ **Sempre ler PROJECT_CONTEXT.md** antes de qualquer trabalho
2. ✅ **Sempre ler docs/context/** relevante antes de codificar
3. ✅ **Sempre consultar docs/context/errors-solutions.md** ao encontrar erros
4. ✅ **Sempre atualizar docs/context/** após modificações
5. ✅ **Nunca assumir** tecnologias/padrões sem verificar no código

**A IA NÃO DEVE:**
1. ❌ Pular leitura de contexto e começar a codificar direto
2. ❌ Assumir que sabe como algo funciona sem ler código
3. ❌ Esconder ou ignorar erros
4. ❌ Entregar código sem documentação
5. ❌ Modificar schema DB sem atualizar database.md

---

## 3. Stack Tecnológica (Respeitada)

| Camada | Tecnologia | Observações |
|--------|------------|-------------|
| **Backend** | Node.js + Express + Prisma ORM | API REST, controllers → services → Prisma |
| **Frontend** | React 19 + Vite + Tailwind CSS + shadcn/ui | Componentes reutilizáveis, design coeso |
| **Database** | PostgreSQL (Supabase) | RLS, Storage, Auth integrado |
| **Auth** | JWT + bcrypt | Custom |
| **Storage** | Supabase Storage | Arquivos, recibos PDF |
| **RPA** | Puppeteer | Automações |
| **OCR** | Tesseract.js | Quando necessário |
| **Testes** | Vitest (BE) + Playwright (FE) | Unitários + E2E |

**IMPORTANTE:**
- ❌ **NÃO usar Mongoose** - Projeto usa **Prisma + PostgreSQL/Supabase**
- ✅ Usar `@prisma/client` para acesso ao banco

---

## 2. Arquitetura e Padrões

### 2.1 Backend (Camadas)

```
Controllers → Services → Repositories (Prisma)
```

### 2.2 Frontend (Componentes)

```
shadcn/ui (base) → Componentes Customizados → Páginas
```

### 2.3 Tratamento de Erros

```js
// Padrão: { success, data, error }
try {
  const data = await service.execute();
  return res.json({ success: true, data });
} catch (error) {
  return res.status(500).json({ success: false, error: error.message });
}
```

---

## 3. CSS e Estilização

### 3.1 Hierarquia de Prioridades

| Prioridade | Abordagem | Quando Usar |
|------------|-----------|-------------|
| **1️⃣ Primeira Opção** | Tailwind CSS utilitário | 90% dos casos |
| **2️⃣ Segunda Opção** | CSS em arquivo dedicado (.css) | Componentes complexos |
| **3️⃣ Última Opção** | CSS inline no JSX | Nunca (exceto dinâmico essencial) |

### 3.2 Regras

**✅ SEMPRE:**
- Usar classes utilitárias do Tailwind
- Criar arquivo `.css` separado para componentes complexos

**❌ NUNCA:**
- CSS inline no JSX (`style={{ margin: 10 }}`)
- Constantes de estilo no JSX

---

## 4. Documentação Automática: Regra Obrigatória

### 4.1 Comportamento Obrigatório

**SEMPRE ao finalizar uma sprint ou feature, a IA DEVE:**

1. ✅ **Criar/atualizar arquivo de sprint** em `docs/sprints/SPRINT_X_NOME.md`
2. ✅ **Atualizar `docs/VISAO_GERAL.md`** se houver mudanças na arquitetura
3. ✅ **Atualizar `PROJECT_CONTEXT.md`** com resumo de 1-2 linhas
4. ✅ **Atualizar `README.md`** na raiz se houver features novas
5. ✅ **Notificar usuário** sobre conclusão e arquivos modificados

### 4.2 Estrutura de Documentação por Sprint

```markdown
# Sprint X - Nome da Feature

## 🎯 Objetivo
[1-2 frases]

## 📋 Tarefas
- [x] Tarefa 1
- [x] Tarefa 2

## 📊 Métricas
- **Tempo estimado:** Xh
- **Tempo real:** Xh
- **Erros encontrados:** X
- **Arquivos criados:** X
- **Arquivos modificados:** X

## ✅ Resultado
[O que foi implementado e como testar]
```

### 4.3 Arquivos de Documentação Principais

| Arquivo | Conteúdo | Atualização |
|---------|----------|-------------|
| `PROJECT_CONTEXT.md` | Contexto geral (resumo 1 página) | **Sempre** ao final de sprint |
| `README.md` | Visão geral do projeto | **Sempre** que adicionar feature |
| `docs/VISAO_GERAL.md` | Documentação completa do sistema | **Sempre** que mudar arquitetura |
| `docs/sprints/SPRINT_X.md` | Detalhe da implementação | **Sempre** ao final de sprint |
| `docs/backend/API_REFERENCE.md` | Endpoints da API | **Sempre** que criar/alterar endpoint |
| `docs/system-design/DATABASE_SCHEMA.md` | Schema do banco | **Sempre** que modificar schema |

### 4.4 Regras de Prioridade

1. **Documentação > Código:** Melhor código bem documentado que código "inteligente" sem docs
2. **Simplicidade:** Docs curtos e objetivos, sem enrolação
3. **Atualização:** Docs desatualizados são piores que ausência de docs
4. **Acessibilidade:** Qualquer desenvolvedor deve entender o projeto em <5 min lendo docs

### 4.5 Checklist de Documentação (Obrigatório)

Ao finalizar qualquer implementação:

- [ ] Criar `docs/sprints/SPRINT_X_NOME.md`
- [ ] Atualizar `PROJECT_CONTEXT.md` (resumo)
- [ ] Atualizar `README.md` se necessário
- [ ] Atualizar `docs/VISAO_GERAL.md` se mudar arquitetura
- [ ] Atualizar `docs/backend/API_REFERENCE.md` se criar endpoints
- [ ] Commitar tudo junto com código

### 4.6 Exceções

**NÃO precisa documentar quando:**
- Correção de bug simples (apenas 1-2 linhas)
- Mudança de CSS/estilo
- Refatoração interna sem mudança de comportamento

**MAS precisa documentar quando:**
- Nova feature/endpoint
- Mudança de arquitetura
- Nova dependência importante
- Mudança de comportamento visível ao usuário

---

## 6. Compromisso Final

**A IA se compromete a:**
1. ✅ Nunca entregar código sem documentação correspondente
2. ✅ Sempre notificar usuário sobre docs criados/atualizados
3. ✅ Manter `docs/context/` arquivos sempre atualizados e compactos
4. ✅ Manter PROJECT_CONTEXT.md ultra-compacto e atualizado
5. ✅ Criar sprints detalhadas para cada feature implementada
6. ✅ Documentar todos os bugs e soluções encontradas
7. ✅ Facilitar onboarding de novos desenvolvedores/IA com docs claros

**Documentação não é opcional. É obrigatória.**
**Context files são essenciais para eficiência da IA.**

---

## 7. Sprints Completas

**Total:** 48 sprints completas | **Formato:** `SPRINT_XX-topico-YYYY-MM-DD.md` (compacto)

| # | Feature | Status | Arquivo |
|---|---------|--------|---------|
| 01-12 | Core do sistema (Supabase, clientes, docs, recibos) | ✅ | `docs/sprints/` |
| 14 | Gerador de documentos + templates | ✅ | `SPRINT_14-gerador-documentos-2026-04-05.md` |
| 17-22 | Testes, CSS refactor, responsividade | ✅ | `docs/sprints/` |
| 24-29 | DaisyUI, redesign, cores oficiais | ✅ | `docs/sprints/` |
| 30-34 | Embed obrigações, Sticky Notes MVP+Backend | ✅ | `docs/sprints/` |
| 37-39 | Logs, agendamentos RPA, gestão APIs | ✅ | `docs/sprints/` |
| 40-42 | Simulador rescão, sticky notes fix/UX, dashboard | ✅ | `docs/sprints/` |
| 43-48 | Sidebar/header, context files, docs reorg, refinamentos UI | ✅ | `docs/sprints/` |

---

**Última atualização:** 05 de abril de 2026
**Versão:** 6.0 - Context Files + Agente Estruturado
