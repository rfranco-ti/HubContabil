# HubContabil Documentation

**Version:** 2.0 | **Updated:** 05/04/2026 | **Purpose:** Documentation standards + navigation

---

## Quick Navigation

### For IA Agents (Read First)
1. [INDEX.md](INDEX.md) → Complete navigation map
2. [context/](context/) → Compact context files (< 5 min read)
3. [backend/API.md](backend/API.md) → All endpoints
4. [frontend/components.md](frontend/components.md) → Component library
5. [database/schema.md](database/schema.md) → Database schema

### For Humans
- **New to project:** Start with `../PROJECT_CONTEXT.md` (30s) → [context/](context/) (2-3min)
- **Understanding features:** Read [sprints/](sprints/)
- **Debugging:** Check [context/errors-solutions.md](context/errors-solutions.md)
- **Tax calculations:** See [calculos/](calculos/)

---

## Documentation Structure

### 🎯 Context Files (`context/`)
**Audience:** IA agents + developers
**Purpose:** Rapid context acquisition (< 5 min)
**Update:** Every code change

| File | Content |
|------|---------|
| [backend.md](context/backend.md) | Stack, endpoints, patterns |
| [frontend.md](context/frontend.md) | Components, routes, design |
| [database.md](context/database.md) | Schema, relations, indexes |
| [errors-solutions.md](context/errors-solutions.md) | Known errors + solutions |

---

### 🔌 Backend (`backend/`)
**Audience:** Backend developers
**Purpose:** System reference
**Update:** When backend changes

| File | Content |
|------|---------|
| [API.md](backend/API.md) | Complete endpoint reference |
| [API_KEYS.md](backend/API_KEYS.md) | External API key system |
| [AGENDAMENTOS_RPA.md](backend/AGENDAMENTOS_RPA.md) | RPA scheduling |
| [LOGS_SISTEMA.md](backend/LOGS_SISTEMA.md) | Logging system |

---

### 🎨 Frontend (`frontend/`)
**Audience:** Frontend developers
**Purpose:** Component reference
**Update:** When UI changes

| File | Content |
|------|---------|
| [components.md](frontend/components.md) | Component library + usage |

---

### 🗄️ Database (`database/`)
**Audience:** Backend developers
**Purpose:** Schema reference
**Update:** When schema changes

| File | Content |
|------|---------|
| [schema.md](database/schema.md) | Complete Prisma schema |

---

### 🧮 Calculations (`calculos/`)
**Audience:** All developers
**Purpose:** Tax/labor calculation reference
**Update:** When tax laws change (2026)

| File | Content |
|------|---------|
| [README.md](calculos/README.md) | Calculation index |
| [tabelas-tributarias-2026.md](calculos/tabelas-tributarias-2026.md) | Tax tables |
| [trabalhista/](calculos/trabalhista/) | Labor calculations |
| [fiscal/](calculos/fiscal/) | Tax calculations |

---

### 📋 Sprints (`sprints/`)
**Audience:** All developers
**Purpose:** Feature history
**Update:** Each completed sprint

**Pattern:** `SPRINT_#_NAME.md`

---

### 🚀 Implementations (`implementations/`)
**Audience:** All developers
**Purpose:** New feature deep-dives
**Update:** Each new feature

**Pattern:** `AAAAMMDD_HHMM_NAME.md`

---

### 📝 Modifications (`modifications/`)
**Audience:** All developers
**Purpose:** Code change records
**Update:** Each modification

**Pattern:** `AAAAMMDD_HHMM_NAME.md`

---

### 🐛 Bugs (`bugs/`)
**Audience:** All developers
**Purpose:** Bug reports + solutions
**Update:** Each bug found + solved

**Pattern:** `AAAAMMDD_HHMM_NAME.md`

---

## Documentation Rules

### Mandatory (See ../COMPORTAMENTO_IA.md)

**Every change requires:**
1. ✅ Code tested + functional
2. ✅ Documentation created/updated
3. ✅ Context files updated
4. ✅ User notified

### Implementation Checklist
- [ ] Create `implementations/AAAAMMDD_HHMM_NAME.md`
- [ ] Create/update `sprints/SPRINT_#_NAME.md`
- [ ] Update affected `context/` files
- [ ] Update [CHANGELOG.md](CHANGELOG.md)
- [ ] Notify user

### Bug Fix Checklist
- [ ] Create `bugs/AAAAMMDD_HHMM_NAME.md`
- [ ] Add to `context/errors-solutions.md`
- [ ] Update [CHANGELOG.md](CHANGELOG.md)
- [ ] Notify user

### Modification Checklist
- [ ] Create `modifications/AAAAMMDD_HHMM_NAME.md`
- [ ] Update affected `context/` files
- [ ] Update [CHANGELOG.md](CHANGELOG.md)
- [ ] Notify user

---

## Archive

Files in [_archive/] are historical records and are NOT actively maintained. They exist for:
- Historical reference
- Understanding past decisions
- Troubleshooting old issues

**Use context/ and active documentation as primary reference.**

---

## Documentation Principles

1. **Compact over comprehensive:** 2-3 pages > 20+ pages
2. **Structured over freeform:** Tables, lists, code snippets
3. **Versioned over static:** Version + date on top
4. **Updated over created:** Keep docs current, don't let them rot
5. **Accessible over clever:** Any dev/IA should understand in < 5 min

---

*Documentation reorganized Sprint 45 for IA + human coherence*
