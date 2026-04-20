# HubContabil - Documentation Index

**Version:** 1.0 | **Updated:** 05/04/2026 | **Purpose:** Central navigation map for IA agents + humans

---

## Quick Start (IA Agents - Read in Order)

1. **Context Acquisition (5 min max):**
   - [ ] `../PROJECT_CONTEXT.md` → Ultra-fast overview (30s)
   - [ ] `context/backend.md` OR `context/frontend.md` OR `context/database.md` → Technical context (2-3min)
   - [ ] `context/errors-solutions.md` → If debugging → Known errors reference

2. **Deep Dive (if needed):**
   - [ ] `backend/API.md` → Complete endpoint reference
   - [ ] `frontend/components.md` → Component library
   - [ ] `database/schema.md` → Full database schema
   - [ ] `calculos/README.md` → Tax/labor calculations reference

3. **Sprint History:**
   - [ ] `sprints/` → Chronological feature development

---

## Directory Structure

```
docs/
├── INDEX.md                      ← You are here (navigation map)
├── README.md                     ← Documentation standards + guide
├── CHANGELOG.md                  ← Chronological change history
│
├── 🎯 context/                   ← AI AGENT CONTEXT FILES (compact, versioned)
│   ├── README.md                 ← How to use context files
│   ├── backend.md                ← Backend stack + endpoints + patterns
│   ├── frontend.md               ← Frontend stack + components + routes
│   ├── database.md               ← Database schema + relations + indexes
│   └── errors-solutions.md       ← Known errors + solutions + prevention
│
├── 🔌 backend/                   ← Backend documentation
│   ├── API.md                    ← Complete API reference (endpoints, requests, responses)
│   ├── API_KEYS.md               ← API key system + permissions
│   ├── AGENDAMENTOS_RPA.md       ← RPA scheduling system
│   ├── LOGS_SISTEMA.md           ← Winston logging system
│   └── ERROR_HANDLING.md         ← Error handling patterns
│
├── 🎨 frontend/                  ← Frontend documentation
│   ├── components.md             ← Component library + usage
│   ├── design-system.md          ← Design tokens + patterns
│   └── color-system.md           ← Color configuration + semantics
│
├── 🗄️ database/                  ← Database documentation
│   └── schema.md                 ← Complete Prisma schema reference
│
├── 🧮 calculos/                  ← Tax/labor calculation references
│   ├── README.md                 ← Calculation index
│   ├── tabelas-tributarias-2026.md ← Tax tables 2026
│   ├── trabalhista/              ← Labor calculations (rescisão, férias, 13º)
│   ├── fiscal/                   ← Tax calculations (Simples, ICMS, ISS)
│   ├── contabil/                 ← Accounting calculations
│   └── previdenciario/           ← Social security calculations
│
├── 📋 sprints/                   ← Chronological feature development
│   ├── SPRINT_1_*.md → SPRINT_44_*.md
│   └── SPRINT_TEMPLATE.md
│
├── 🚀 implementations/           ← New feature documentation
│   ├── README.md
│   └── AAAAMMDD_HHMM_NAME.md
│
├── 📝 modifications/             ← Code modification records
│   ├── README.md
│   └── AAAAMMDD_HHMM_NAME.md
│
├── 🐛 bugs/                      ← Bug reports + solutions
│   ├── README.md
│   └── AAAAMMDD_HHMM_NAME.md
│
├── 🏗️ system-design/             ← Architecture documentation
│   └── DATABASE_SCHEMA.md        ← Legacy schema reference
│
└── _archive/                     ← Legacy/historical files (not actively maintained)
    └── [historical files]
```

---

## File Types & When to Use

### 🎯 Context Files (docs/context/)
**Purpose:** Rapid context acquisition for IA agents (< 5 min)
**Update:** Every code change
**Read:** Before ANY work on the project
**Format:** Compact (2-3 pages), versioned, structured

| File | Read When |
|------|-----------|
| `backend.md` | Working on API, endpoints, controllers, services |
| `frontend.md` | Working on React components, pages, routes |
| `database.md` | Working on Prisma schema, queries, migrations |
| `errors-solutions.md` | Debugging, finding errors |

---

### 🔌 Backend Files (docs/backend/)
**Purpose:** Complete backend system reference
**Update:** When backend changes
**Read:** When implementing/modifying backend features

| File | Content |
|------|---------|
| `API.md` | All endpoints, request/response formats, auth |
| `API_KEYS.md` | External API key system, permissions |
| `AGENDAMENTOS_RPA.md` | Robot scheduling system |
| `LOGS_SISTEMA.md` | Winston logging system |
| `ERROR_HANDLING.md` | Error patterns, codes, middleware |

---

### 🎨 Frontend Files (docs/frontend/)
**Purpose:** Frontend component reference
**Update:** When UI/UX changes
**Read:** When implementing/modifying frontend features

| File | Content |
|------|---------|
| `components.md` | Component library, usage patterns |
| `design-system.md` | Design tokens, typography, spacing |
| `color-system.md` | Color configuration, semantics |

---

### 🗄️ Database Files (docs/database/)
**Purpose:** Database schema reference
**Update:** When schema changes
**Read:** When working with Prisma models, queries

| File | Content |
|------|---------|
| `schema.md` | All models, relations, indexes, RLS |

---

### 🧮 Calculos Files (docs/calculos/)
**Purpose:** Tax/labor calculation reference
**Update:** When tax laws change (2026)
**Read:** When working on calculation features

| File | Content |
|------|---------|
| `tabelas-tributarias-2026.md` | All tax tables, rates, thresholds |
| `trabalhista/` | Rescisão, férias, 13º, insalubridade |
| `fiscal/` | Simples Nacional, ICMS, ISS, IRPF |
| `contabil/` | Depreciação, contabilidade |
| `previdenciario/` | Aposentadoria, INSS |

---

### 📋 Sprints (docs/sprints/)
**Purpose:** Historical feature development
**Update:** Each completed sprint
**Read:** To understand feature evolution

**Format:** `SPRINT_#_NAME.md`

---

### 🚀 Implementations (docs/implementations/)
**Purpose:** New feature deep-dives
**Update:** Each new feature
**Read:** To understand how features work

**Format:** `AAAAMMDD_HHMM_NAME.md`

---

### 📝 Modifications (docs/modifications/)
**Purpose:** Code change records
**Update:** Each code modification
**Read:** To understand why code changed

**Format:** `AAAAMMDD_HHMM_NAME.md`

---

### 🐛 Bugs (docs/bugs/)
**Purpose:** Bug reports + solutions
**Update:** Each bug found + solved
**Read:** When debugging similar issues

**Format:** `AAAAMMDD_HHMM_NAME.md`

---

## Documentation Maintenance

### When Creating New Features:
1. Create `implementations/AAAAMMDD_HHMM_NAME.md`
2. Create/update `sprints/SPRINT_#_NAME.md`
3. Update `context/backend.md` or `context/frontend.md`
4. Update `CHANGELOG.md`

### When Fixing Bugs:
1. Create `bugs/AAAAMMDD_HHMM_NAME.md`
2. Update `context/errors-solutions.md`
3. Update `CHANGELOG.md`

### When Modifying Code:
1. Create `modifications/AAAAMMDD_HHMM_NAME.md`
2. Update affected `context/` files
3. Update `CHANGELOG.md`

---

## Legacy Files (_archive/)

Files in `_archive/` are historical records and are **NOT actively maintained**. They exist for:
- Historical reference
- Understanding past decisions
- Troubleshooting old issues

**Do NOT use as primary reference.** Use `context/` and active documentation instead.

---

*Index created as part of documentation reorganization (Sprint 45)*
