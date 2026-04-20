# 📚 Guia de Documentação - HubContabil

**Última atualização:** 05 de abril de 2026
**Versão:** 1.0

---

## 🎯 Propósito

Este documento serve como **guia central** para toda documentação do projeto HubContabil. Ele explica:
- **POR QUE** documentamos tudo
- **O QUE** deve ser documentado
- **ONDE** documentar cada tipo de informação
- **COMO** documentar (templates e exemplos)
- **QUANDO** documentar (checklists)

---

## 🚨 REGRA DE OURO

> **NENHUMA ENTREGA É CONSIDERADA COMPLETA SEM DOCUMENTAÇÃO.**

Esta regra é **NÃO NEGOCIÁVEL**. Se você implementou algo mas não documentou, **não terminou o trabalho**.

---

## 📁 Estrutura de Documentação

```
HubContabil/
├── PROJECT_CONTEXT.md            # Contexto geral do projeto (resumo 1 página)
├── QWEN.md                       # Memórias técnicas da IA + checklist de docs
├── COMPORTAMENTO_IA.md           # Regras completas de documentação (Seção 0)
│
└── docs/
    ├── README.md                 # Guia rápido da pasta docs/
    ├── VISAO_GERAL.md            # Documentação completa do sistema
    ├── CHANGELOG.md              # Histórico cronológico de TODAS as mudanças
    │
    ├── sprints/                  # 📋 Cada sprint tem arquivo detalhado
    │   ├── README.md
    │   ├── SPRINT_1_*.md
    │   └── ...
    │
    ├── implementations/          # 🚀 TODA implementação nova
    │   ├── README.md
    │   └── AAAAMMDD_HHMM_NOME.md
    │
    ├── modifications/            # 📝 TODA modificação de código existente
    │   ├── README.md
    │   └── AAAAMMDD_HHMM_NOME.md
    │
    ├── bugs/                     # 🐛 TODO bug encontrado e sua solução
    │   ├── README.md
    │   └── AAAAMMDD_HHMM_NOME.md
    │
    ├── system-design/            # 🏗️ Arquitetura do sistema
    │   ├── DATABASE_SCHEMA.md
    │   └── ...
    │
    ├── backend/                  # 🔌 Backend
    │   ├── API_REFERENCE.md
    │   └── ...
    │
    ├── frontend/                 # 🎨 Frontend
    │   └── ...
    │
    └── calculos/                 # 🧮 Cálculos trabalhistas/tributários
        └── ...
```

---

## 📋 O QUE Documentar (5 Tipos)

### 1. 🚀 IMPLEMENTAÇÕES NOVAS
**Quando:** Criar feature/functionality do zero

**Onde:** `docs/implementations/AAAAMMDD_HHMM_NOME.md`

**Template:** Ver `docs/implementations/README.md`

**Exemplo:**
```
docs/implementations/20260405_1430_sistema-notificacoes.md
```

**Checklist:**
- [ ] Criar arquivo com template completo
- [ ] Documentar backend (endpoints, models, services)
- [ ] Documentar frontend (componentes, páginas, rotas)
- [ ] Listar todos os arquivos criados/modificados
- [ ] Documentar testes realizados
- [ ] Criar/atualizar sprint correspondente
- [ ] Atualizar `PROJECT_CONTEXT.md`
- [ ] Atualizar `docs/CHANGELOG.md`
- [ ] Notificar usuário

---

### 2. 📝 MODIFICAÇÕES
**Quando:** Alterar código existente (refatoração, otimização, breaking changes)

**Onde:** `docs/modifications/AAAAMMDD_HHMM_NOME.md`

**Template:** Ver `docs/modifications/README.md`

**Exemplo:**
```
docs/modifications/20260405_1500_refactor-auth-middleware.md
```

**Checklist:**
- [ ] Criar arquivo com antes/depois
- [ ] Explicar justificativa da mudança
- [ ] Listar todos os arquivos afetados
- [ ] Documentar impacto (breaking changes?)
- [ ] Verificar build e testes
- [ ] Atualizar `docs/CHANGELOG.md`
- [ ] Notificar usuário

---

### 3. 🐛 BUGS E ERROS
**Quando:** Encontrar qualquer bug/erro no código

**Onde:** `docs/bugs/AAAAMMDD_HHMM_NOME.md`

**Template:** Ver `docs/bugs/README.md`

**Exemplo:**
```
docs/bugs/20260405_1430_error-prisma-relation.md
```

**Checklist:**
- [ ] Criar arquivo descrevendo bug
- [ ] Documentar causa raiz
- [ ] Documentar solução aplicada (com código antes/depois)
- [ ] Documentar pesquisa realizada
- [ ] Incluir lição aprendida
- [ ] Listar prevenção futura
- [ ] Atualizar `docs/CHANGELOG.md`
- [ ] Notificar usuário

---

### 4. 📋 SPRINTS
**Quando:** Finalizar qualquer sprint/feature

**Onde:** `docs/sprints/SPRINT_X_NOME.md`

**Template:** Ver `docs/sprints/SPRINT_TEMPLATE.md`

**Exemplo:**
```
docs/sprints/SPRINT_44_NOVA_FEATURE.md
```

**Checklist:**
- [ ] Criar arquivo com objetivo, tarefas, métricas, resultado
- [ ] Atualizar `PROJECT_CONTEXT.md` (número de sprints)
- [ ] Atualizar `docs/VISAO_GERAL.md` (se mudar arquitetura)
- [ ] Atualizar `docs/CHANGELOG.md`
- [ ] Notificar usuário

---

### 5. 🔄 CHANGELOG GLOBAL
**Quando:** QUALQUER mudança no código (implementação, bug fix, modificação, sprint)

**Onde:** `docs/CHANGELOG.md`

**Formato:** Adicionar entrada no topo com data e descrição

**Exemplo:**
```markdown
## 05 de abril de 2026

### Implementação: Sistema de Notificações
- Criado sistema completo de notificações com cron job
- Frontend: NotificationBell com badge dinâmico
- Backend: 4 endpoints novos
- Arquivo: docs/implementations/20260405_1430_sistema-notificacoes.md

### Bug Fix: Error Prisma Relation
- Corrigido erro de relação many-to-many no Prisma
- Arquivo: docs/bugs/20260405_1500_error-prisma-relation.md
```

---

## 🛠️ Ferramentas de Automação

### Script de Criação de Documentos

```bash
# Criar documentação de bug
node scripts/create-doc.js bug nome-do-bug

# Criar documentação de implementação
node scripts/create-doc.js implementation nome-da-feature

# Criar documentação de modificação
node scripts/create-doc.js modification nome-da-mudanca

# Criar documentação de sprint
node scripts/create-doc.js sprint 44-nome-sprint
```

**O script:**
- ✅ Cria arquivo no diretório correto
- ✅ Usa template padronizado
- ✅ Inclui timestamp automático
- ✅ Segue formato de nomenclatura correto

---

## 📝 Templates Rápidos

### Template de Bug (Resumo)
```markdown
# Bug: [NOME]

**Data:** [DATA]
**Severidade:** 🔴/🟡/🟢
**Status:** ✅ Resolvido

## 🐛 O Que Aconteceu
[Descrição]

## 🔍 Causa Raiz
[Explicação]

## ✅ Solução
[Como resolveu]

## 💡 Lição
[Como evitar]
```

### Template de Implementação (Resumo)
```markdown
# Implementação: [NOME]

**Data:** [DATA]
**Sprint:** #X

## 🎯 Objetivo
[1-2 frases]

## 🛠️ Como Funciona
[Fluxo principal]

## 📁 Arquivos
- Criados: [lista]
- Modificados: [lista]

## 🧪 Testes
- [ ] Unitários passaram
- [ ] Manual testado
```

---

## ✅ Checklist Universal

**SEMPRE ao finalizar qualquer trabalho:**

1. [ ] Documentação criada no formato correto
2. [ ] CHANGELOG.md atualizado
3. [ ] PROJECT_CONTEXT.md atualizado (se significativo)
4. [ ] Usuário notificado com resumo de docs criados

---

## 🚫 Exceções (Mínimas)

**NÃO precisa de documentação completa quando:**
- Correção de bug de 1-2 linhas (apenas registrar em CHANGELOG.md)
- Mudança de CSS/estilo menor (apenas registrar em CHANGELOG.md)
- Refatoração interna sem mudança de comportamento visível

**MAS ainda precisa de:**
- ✅ Entrada em CHANGELOG.md
- ✅ Commit message clara

---

## 📊 Métricas de Documentação

**Boa saúde de documentação:**
- ✅ Todos os arquivos em `docs/implementations/` têm correspondentes em `docs/sprints/`
- ✅ CHANGELOG.md atualizado semanalmente
- PROJECT_CONTEXT.md reflete estado atual do projeto
- ✅ Zero bugs documentados sem solução
- ✅ Todos os endpoints em API_REFERENCE.md existem no código

**Má saúde de documentação:**
- ❌ Arquivos de sprint sem detalhes de implementação
- ❌ CHANGELOG.md desatualizado (> 1 semana)
- ❌ Bugs documentados sem solução
- ❌ Endpoints em produção mas não em API_REFERENCE.md

---

## 🎓 Para Novos Desenvolvedores

**Se você é novo no projeto:**

1. Leia `PROJECT_CONTEXT.md` para visão geral rápida
2. Leia `docs/VISAO_GERAL.md` para entender o sistema completo
3. Leia `docs/sprints/` para ver evolução do projeto
4. Leia `docs/bugs/` para entender problemas conhecidos
5. Leia `docs/backend/API_REFERENCE.md` para conhecer endpoints
6. Leia `docs/system-design/DATABASE_SCHEMA.md` para entender banco

**Tempo estimado para onboarding: < 30 minutos com boa documentação**

---

## 🔗 Links Úteis

| Recurso | Localização |
|---------|-------------|
| Regras Completas de Documentação | `COMPORTAMENTO_IA.md` (Seção 0) |
| Templates | `docs/{bugs,implementations,modifications}/README.md` |
| Script de Automação | `scripts/create-doc.js` |
| Changelog | `docs/CHANGELOG.md` |
| Visão Geral do Sistema | `docs/VISAO_GERAL.md` |
| Schema do Banco | `docs/system-design/DATABASE_SCHEMA.md` |
| Referência de APIs | `docs/backend/API_REFERENCE.md` |

---

## 📈 Evolução da Documentação

**Versão 1.0 (05/04/2026):**
- ✅ Criado sistema completo de documentação obrigatória
- ✅ 3 novos diretórios: bugs/, implementations/, modifications/
- ✅ Templates padronizados para cada tipo
- ✅ Script de automação `scripts/create-doc.js`
- ✅ Regras estabelecidas em COMPORTAMENTO_IA.md v5.0
- ✅ Checklists obrigatórios definidos

---

*Documento criado como parte do sistema de documentação obrigatória (COMPORTAMENTO_IA.md v5.0)*
