# 🔄 Changelog - Documentação

**Última atualização:** 08 de abril de 2026

---

## 08 de abril de 2026

### Sprint 48: UI Mobile/Tablet Responsiva
- Criado componente `MobileTableCard.jsx` - cards expansíveis para mobile (< 768px)
- Reescrito `Clientes.jsx` com suporte mobile/tablet/desktop (3 breakpoints)
- Melhorado `AppHeader.jsx`: logo SEMPRE visível em todos os dispositivos
- Adaptado `AppSidebar.jsx`: tablet (768px-1024px) com sidebar 220px semi-colapsada
- Melhorado `SidebarNavItem.jsx`: 3 modos (mobile/tablet/desktop) + tooltip com estado
- Touch targets ≥ 44px em todos elementos interativos
- Build: ✅ 17.59s | Lint: ✅ 0 errors
- Sprint: `docs/sprints/SPRINT_48-ui-mobile-tablet-2026-04-08.md`

---

## 06 de abril de 2026

### Sprint 47: Refatoração Adapters CNPJ
- Deletado `BrasilApiAdapter.js` (redundante, BrasilAPI é wrapper da Minha Receita)
- Reescrito `OpenCnpjAdapter.js` → URL: `api.opencnpj.org/{cnpj}`, formato real
- Criado `InvertextoAdapter.js` → URL: `api.invertexto.com/v1/cnpj/{cnpj}?token=`, token do `.env`
- Reescrito `CnpjaAdapter.js` → `company.simples`, `company.simei`, telefones, emails
- Reescrito `index.js` → Nova ordem: OpenCNPJ → Invertexto → Minha Receita → Cnpja
- Atualizado labels `apiUsed` em `DetalheEmpresa.jsx`
- Sprint: `docs/sprints/SPRINT_47-refactor-adapters-cnpj-2026-04-06.md`

### Sprint 46: Refatoração CNPJ + TanStack Query
- Instalado `@tanstack/react-query` + configurado `QueryClientProvider` em `App.jsx`
- Criados hooks: `useConsultaCnpj()`, `useSalvarCliente()`, `useClientes()`, `useClienteById()`
- Reescrito `DetalheEmpresa.jsx`: sem busca no banco local, usa API externa + botão salvar
- Atualizados adapters CNPJ: `BrasilApiAdapter`, `MinhaReceitaAdapter`, `OpenCnpjAdapter`
- Máscaras aplicadas: CNPJ, CPF, CEP, datas, moeda em todos os adapters
- Dados tributários: `regimeTributario`, `opcaoSimples`, `opcaoMei` (BrasilAPI + OpenCNPJ)
- Schema unificado: cidade/UF separados, telefones, socios completos
- Sprint: `docs/sprints/SPRINT_47-refactor-cnpj-tanstack-query-2026-04-06.md`

---

## 05 de abril de 2026

### Sprint 45: Documentation Reorganization
- Reorganizada toda estrutura de docs/ (122 arquivos → 9 diretórios + archive)
- Criado INDEX.md (mapa central de navegação para IA + humanos)
- Criado database/schema.md (schema Prisma completo)
- Criado frontend/components.md (component library)
- Criado backend/API.md (API reference completa)
- Reescrito README.md (padrões de documentação)
- Movidos 30+ arquivos legados para _archive/
- Atualizado COMPORTAMENTO_IA.md com estrutura v2.0
- Atualizado PROJECT_CONTEXT.md v4.0
- Sprint: `docs/sprints/SPRINT_45_DOCUMENTATION_REORG.md`

### Sprint 44: Context Files + Agente Estruturado
- Criados 4 arquivos compactos de contexto para IA (`docs/context/`)
- backend.md, frontend.md, database.md, errors-solutions.md (~2-3 páginas cada)
- Melhorada estrutura do agente em COMPORTAMENTO_IA.md v6.0
- Adicionado fluxo de aquisição de contexto (3 passos: 30s → 2-3min → detalhe)
- Adicionados 3 modos de operação: Exploração, Implementação, Correção
- Adicionada árvore de decisão do agente
- PROJECT_CONTEXT.md reescrito ultra-compacto (< 1 página)
- QWEN.md atualizado com context files
- Sprint: `docs/sprints/SPRINT_44_CONTEXT_FILES.md`

### Implementação: Sistema de Documentação Obrigatória
- Criado sistema completo de documentação obrigatória
- 3 novos diretórios: `docs/bugs/`, `docs/implementations/`, `docs/modifications/`
- Templates padronizados para cada tipo de documento
- Script de automação: `scripts/create-doc.js`
- Regras estabelecidas em `COMPORTAMENTO_IA.md` v5.0 (Seção 0 completa)
- Guia central: `docs/GUIA_DOCUMENTACAO.md`
- Checklist em `QWEN.md` e `PROJECT_CONTEXT.md`
- Arquivo: `docs/implementations/20260405_1430_sistema-documentacao.md`

---

## Versão 2.0 - 01 de abril de 2026

### 🎯 Objetivo

Consolidar documentação do projeto seguindo melhores práticas de arquitetura e desenvolvimento.

---

## 📝 Mudanças Realizadas

### 1. Novo Comportamento da IA

**Arquivo:** `docs/COMPORTAMENTO_IA.md`

**Mudanças:**
- ✅ Incorporado diretrizes do `AGENTE_PROJETOS.md`
- ✅ Adicionado política forte de testes
- ✅ Adicionado UI/UX e Design System (shadcn/ui)
- ✅ Adicionado pesquisa ativa de referências
- ✅ Adicionado documentos obrigatórios de sistema
- ✅ Mantido metodologia de sprints por feature
- ✅ Mantido documentação concisa

**Seções novas:**
- Papel da IA (expandido)
- Arquitetura e Padrões (detalhado)
- UI/UX e Design System (novo)
- Pesquisa e Referências (novo)
- Metodologia de Trabalho (passo a passo)
- Princípios Transversais (expandido)

---

### 2. Project Context (Raiz)

**Arquivo:** `PROJECT_CONTEXT.md`

**Mudanças:**
- ✅ Adicionado estrutura de documentação
- ✅ Adicionado seção de documentos de sistema (a criar)
- ✅ Mantido tabela de sprints completas
- ✅ Mantido pendências críticas
- ✅ Formato mais conciso (~1 página)

---

### 3. Documentos de Sistema Criados

#### `docs/system-design/SYSTEM_DESIGN.md`
- ✅ Diagrama de arquitetura
- ✅ Componentes principais
- ✅ Fluxos (auth, CNPJ, upload)
- ✅ Decisões arquiteturais
- ✅ Padrões de código
- ✅ Dependências principais

#### `docs/system-design/DATABASE_SCHEMA.md`
- ✅ Diagrama entidade-relacionamento
- ✅ 8 tabelas documentadas
- ✅ Relacionamentos
- ✅ Índices
- ✅ Políticas RLS (recomendado)
- ✅ Migrations e seeds

#### `docs/system-design/SECURITY.md`
- ✅ Autenticação e autorização
- ✅ 5 vulnerabilidades críticas documentadas
- ✅ Soluções recomendadas
- ✅ Segurança de dados
- ✅ Logs e auditoria
- ✅ Checklist de produção

---

### 4. Documentos de Frontend

#### `docs/frontend/DESIGN_SYSTEM.md`
- ✅ Paleta de cores
- ✅ Tipografia
- ✅ Espaçamentos
- ✅ Componentes (shadcn/ui)
- ✅ Ícones (Lucide React)
- ✅ Padrões de layout
- ✅ Responsividade
- ✅ Acessibilidade (WCAG 2.1 AA)
- ✅ Toast notifications

---

### 5. Documentos de Backend

#### `docs/backend/API_REFERENCE.md`
- ✅ 50+ endpoints documentados
- ✅ Exemplos de request/response
- ✅ Autenticação
- ✅ Clientes, Documentos, Pastas, RPA, GED, Calendário
- ✅ Códigos de erro HTTP
- ✅ Rate limiting (recomendado)

#### `docs/backend/ERROR_HANDLING.md`
- ✅ Padrão de resposta (sucesso/erro)
- ✅ Códigos de erro
- ✅ Implementação (controllers, middleware)
- ✅ Validação de inputs (Zod)
- ✅ Erros de APIs externas
- ✅ Logs (desenvolvimento/produção)
- ✅ Monitoramento (Sentry)

---

### 6. Sprints (1-12)

**Pasta:** `docs/sprints/`

**Status:** ✅ Todas migradas/criadas

| Sprint | Arquivo | Status |
|--------|---------|--------|
| 1 | `SPRINT_1_MIGRACAO_SUPABASE.md` | ✅ |
| 2 | `SPRINT_2_CALENDARIO_CONTABIL.md` | ✅ |
| 3 | `SPRINT_3_PESQUISA_MEI.md` | ✅ |
| 4 | `SPRINT_4_CADASTRO_CLIENTES.md` | ✅ |
| 5 | `SPRINT_5_TELA_CLIENTES.md` | ✅ |
| 6 | `SPRINT_6_DOCUMENTOS_CLIENTE.md` | ✅ |
| 7 | `SPRINT_7_RECIBO_HONORARIOS.md` | ✅ |
| 8 | `SPRINT_8_DASHBOARD_MONITORAMENTO.md` | ✅ |
| 9 | `SPRINT_9_UPLOAD_MULTIPLO.md` | ✅ |
| 10 | `SPRINT_10_VALIDACOES_UPLOAD.md` | ✅ |
| 11 | `SPRINT_11_FILA_PRIORIDADE.md` | ✅ |
| 12 | `SPRINT_12_POLIMENTO_FINAL.md` | ✅ |
| - | `SPRINT_TEMPLATE.md` | ✅ |

---

### 7. README da Documentação

**Arquivo:** `docs/README.md`

**Mudanças:**
- ✅ Estrutura completa de diretórios
- ✅ Tipos de documentos
- ✅ Princípios de documentação
- ✅ Guia para novos desenvolvedores
- ✅ Status dos documentos
- ✅ Links úteis

---

### 8. Arquivos Legados

**Atualizados para apontar para nova documentação:**

| Arquivo | Status |
|---------|--------|
| `docs/context.md` | ⚠️ Legado |
| `docs/STATUS_GERAL.md` | ⚠️ Legado |
| `docs/BACKEND_STATUS.md` | ⚠️ Legado |
| `docs/FRONTEND_STATUS.md` | ⚠️ Legado |
| `docs/PROXIMAS_ACOES.md` | ⚠️ Legado |

**Mantidos (ativos):**
- `docs/SEGURANCA_STATUS.md` ✅
- `docs/TESTES_STATUS.md` ✅

---

## 📊 Estrutura Final

```
HubContabil/
├── PROJECT_CONTEXT.md              # ✅ Contexto geral (~1 página)
├── README.md                       # ✅ README principal
├── AGENTE_PROJETOS.md              # ✅ Diretrizes originais
│
└── docs/
    ├── README.md                   # ✅ Guia de documentação
    ├── COMPORTAMENTO_IA.md         # ✅ Diretrizes da IA (v2.0)
    ├── SEGURANCA_STATUS.md         # ✅ Status de segurança
    ├── TESTES_STATUS.md            # ✅ Plano de testes
    │
    ├── sprints/                    # ✅ 12 sprints + template
    │   ├── SPRINT_TEMPLATE.md
    │   └── SPRINT_1_*.md ... SPRINT_12_*.md
    │
    ├── system-design/              # ✅ Arquitetura
    │   ├── SYSTEM_DESIGN.md
    │   ├── DATABASE_SCHEMA.md
    │   └── SECURITY.md
    │
    ├── frontend/                   # ✅ Frontend
    │   └── DESIGN_SYSTEM.md
    │
    └── backend/                    # ✅ Backend
        ├── API_REFERENCE.md
        └── ERROR_HANDLING.md
```

---

## 🎯 Benefícios

### Para Desenvolvedores
- ✅ Documentação centralizada
- ✅ Arquitetura clara
- ✅ APIs bem documentadas
- ✅ Padrões definidos

### Para IA
- ✅ Diretrizes claras
- ✅ Contexto suficiente
- ✅ Detalhes em arquivos específicos
- ✅ Menos consumo de tokens

### Para o Projeto
- ✅ Rastreabilidade de sprints
- ✅ Decisões documentadas
- ✅ Segurança priorizada
- ✅ Base para testes

---

## 📝 Próximos Passos

### Documentos a Criar
- [ ] `docs/frontend/UI_KIT.md`
- [ ] `docs/system-design/ERROR_HANDLING.md` (frontend)

### Documentos a Atualizar
- [ ] `docs/SEGURANCA_STATUS.md` → Migrar para `system-design/SECURITY.md`
- [ ] `docs/TESTES_STATUS.md` → Revisar e atualizar

### Melhorias
- [ ] Adicionar diagramas visuais (Mermaid)
- [ ] Traduzir para inglês (se necessário)
- [ ] Gerar documentação automática de API (Swagger)

---

*Changelog criado para rastrear evolução da documentação*


## 18 de abril de 2026

### Sprint 49: Coesão de Design e Sistema de Tema
- Corrigido erro crítico: `ThemeProvider` não exportado de `/src/context/ThemeContext.js`
- Criada barreira de exportação em `frontend/src/context/index.js`
- Corrigidas todas as importações do sistema de tema
- Sistema dark/light mode funcional com persistência localStorage
- Build: ✅ 3.92s | Lint: ✅ 0 errors
- Sprint: `docs/implementations/20260418_1430_coesao-design-tema.md`

---

## 18 de abril de 2026 (Tarde)

### Sprint 50: Menu Lateral "Lite" para Telas Pequenas
- Implementado menu lateral "lite" (drawer) de 280px para telas ≤ 768px
- Menu surge da lateral esquerda com animação slide-in
- Conteúdo principal transiciona quando menu abre
- Overlay com blur para melhor experiência
- Build: ✅ 4.20s | Lint: ✅ 0 errors
- Sprint: `docs/implementations/20260418_1500_menu-lateral-lite.md`

---
## 18 de abril de 2026 (Tarde - Continuação)

### Sprint 51: Otimização Mobile-First
- Header responsivo com altura menor em mobile (h-14 → h-16)
- Logo compacto com texto "HUB" + "CONTÁBIL" em cores diferentes
- Theme toggle visível em mobile (ícone Sol/Lua)
- Busca compactada com placeholder "Buscar..."
- User dropdown mais compacto
- Sidebar drawer com padding e espaçamento reduzidos
- Padding responsivo do conteúdo (p-2 → p-8)
- Novo breakpoint 'xs' (400px) para telas muito pequenas
- Build: ✅ 4.70s | Lint: ✅ 0 errors

---