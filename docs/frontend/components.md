# Frontend Components - HubContabil

**Version:** 1.0 | **Updated:** 05/04/2026 | **Purpose:** Component library + usage patterns

---

## Stack
- React 19 + Vite
- Tailwind CSS (utility-first)
- shadcn/ui (base components)
- Lucide React (icons)
- react-hot-toast (notifications)

---

## Core Components

### Layout Components

#### AppSidebar
**Location:** `src/components/Sidebar.jsx`
**Purpose:** Main navigation sidebar (collapsible)

**Features:**
- 8 menu groups (config: `data/menuConfig.js`)
- Collapsible: 288px ↔ 72px
- Keyboard shortcut: `Ctrl+B`
- Persistence: localStorage `sidebar-collapsed`
- Mobile: overlay mode

**Menu Groups:**
1. Principal: Dashboard
2. Financeiro: Clientes, Recibos
3. Calendário: Calendário Contábil
4. Automação: RPA, Agendamentos
5. Pesquisas: CNAE, NBS, CNPJ
6. Documentos: GED, Gerador
7. Produtividade: Sticky Notes
8. Administração: Usuários, Configurações

**Usage:**
```jsx
import { AppSidebar } from '@/components/Sidebar'
<AppSidebar />
```

---

#### AppHeader
**Location:** `src/components/Header.jsx`
**Purpose:** Top navigation bar

**Features:**
- Fixed height: h-16, z-50
- User dropdown (profile, admin panel, logout)
- Notification bell (polling 60s)
- Mobile: hamburger menu

**Usage:**
```jsx
import { AppHeader } from '@/components/Header'
<AppHeader />
```

---

#### Layout
**Location:** `src/components/Layout.jsx`
**Purpose:** Main page wrapper

**Structure:**
```jsx
<div className="min-h-screen bg-gray-50">
  <AppHeader />
  <AppSidebar />
  <main className="ml-72 mt-16 p-6">
    {children}
  </main>
</div>
```

---

### Notification Components

#### NotificationBell
**Location:** `src/components/NotificationBell.jsx`
**Purpose:** User notifications with badge

**Features:**
- Dynamic badge count
- Dropdown with notifications
- Polling: 60s
- Endpoints: `/api/notificacoes`, `/api/notificacoes/count`

**Usage:**
```jsx
import { NotificationBell } from '@/components/NotificationBell'
<NotificationBell />
```

---

### Calendar Components

#### MiniCalendar
**Purpose:** Small calendar widget for dashboard

**Features:**
- Highlights days with events
- Month navigation
- Fetches from `/api/calendario/dashboard`

---

#### CalendarioContabil
**Location:** `src/pages/CalendarioContabil.jsx`
**Purpose:** Full accounting calendar

**Features:**
- Dynamic event types from DB
- Color from DB (hex → rgba alpha)
- ZERO hardcoded categories
- Legacy mapping: `CATEGORIA_PARA_TIPO`
- Holiday filtering by geography

---

### Dashboard Components

#### KPI Cards
**Purpose:** Dashboard metrics

**6 Small KPIs:**
- Clientes, Honorários, Certificados, Obrigações, Documentos, Notificações

**5 Medium Widgets:**
- Próximas Obrigações, Visão Semana, Resumo Mês, Atividades Recentes, Certificados Expirando

**1 Large Widget:**
- Full monthly calendar

**Data:** `/api/dashboard/kpis`, `/api/dashboard`, `/api/dashboard/semana`
**Pattern:** `Promise.allSettled` for fault tolerance

---

### Form Components

#### Sticky Notes
**Location:** `src/pages/StickyNotes.jsx`
**Features:**
- CRUD with drag-and-drop reorder
- Colors, sizes (S/M/L), priorities
- localStorage + DB persistence

---

#### Simulador Rescisão
**Location:** `src/pages/SimuladorRescisao.jsx`
**Features:**
- Collapsible sections (main + additional/discounts)
- Fields: jornada, insalubridade, periculosidade, adic. noturno, HE+DSR, faltas, VT
- Detailed results with effective rates
- Legal base banners

---

### Admin Components

#### PainelAdmin
**Location:** `src/pages/PainelAdmin.jsx`
**Access:** cargo "Admin"/"Administrador" (case-insensitive)
**Tabs:**
- Tipos de Evento
- Feriados

**Middleware:** `adminOnly` → 403 for non-admins

---

#### GestãoUsuarios
**Location:** `src/components/configuracoes/GestaoUsuarios.jsx`
**Tab:** Configurações → Usuários
**Features:** User table, search, CRUD modal, 4 cargos

---

#### AgendamentosRpa
**Location:** `src/components/configuracoes/AgendamentosRpa.jsx`
**Tab:** Configurações → Agendamentos
**Features:** Visual cards, robot type, CNPJ, recurrence, execution counter

---

#### GestaoApis
**Location:** `src/components/configuracoes/GestaoApis.jsx`
**Tab:** Configurações → APIs
**Features:** API docs, Swagger link, API key cards with prefix/permissions/stats

---

#### LogsSistema
**Location:** `src/components/configuracoes/LogsSistema.jsx`
**Tab:** Configurações → Logs
**Features:** 4 stat cards (clickable filters), detail modal, TXT/CSV download

---

## Configuration

### Central Config
**Location:** `src/config/frontend.js`

**Exports:**
```js
export const THEME = {
  backgrounds: { page: '#f8fafc', sidebar: '#0f172a', card: '#ffffff' },
  borders: { default: '#e2e8f0' },
  text: { primary: '#0f172a', secondary: '#475569' },
  interactive: { primary: '#2563eb', accent: '#0ea5e9' },
  status: { success: '#10b981', error: '#ef4444', warning: '#f59e0b', info: '#3b82f6' }
}

export const LAYOUT = {
  header: { height: '4rem', z: 50 },
  sidebar: { width: '18rem', z: 40 },
  main: { padding: '1.5rem' },
  spacing: { xs: '0.25rem', sm: '0.5rem', md: '1rem', lg: '1.5rem', xl: '2rem' }
}

export const TYPOGRAPHY = {
  sizes: { xs: '0.75rem', sm: '0.875rem', base: '1rem', lg: '1.125rem', xl: '1.25rem', '2xl': '1.5rem' },
  weights: { normal: 400, medium: 500, semibold: 600, bold: 700 }
}

export const ANIMATIONS = {
  fast: '150ms',
  normal: '200ms',
  slow: '300ms'
}
```

---

## Design Tokens

### Colors
| Token | Hex | Usage |
|-------|-----|-------|
| Primary | #2563eb (blue-600) | Buttons, links, interactive |
| Secondary | #64748b (slate-500) | Secondary text, borders |
| Accent | #0ea5e9 (sky-500) | Highlights, accents |
| Success | #10b981 | Success states, badges |
| Error | #ef4444 | Error states, alerts |
| Warning | #f59e0b | Warning states, alerts |
| Info | #3b82f6 | Info states, badges |

### Typography
| Token | Size | Weight | Usage |
|-------|------|--------|-------|
| Display | 36px | 700 | Page titles |
| H1 | 30px | 700 | Section titles |
| H2 | 24px | 600 | Subsection titles |
| H3 | 20px | 600 | Card titles |
| Body | 16px | 400 | Main text |
| Small | 14px | 400 | Secondary text |
| XSmall | 12px | 400 | Captions, badges |

---

## API Services

**Location:** `src/services/api.js`

**Pattern:**
```js
import api from './api'

// GET
const response = await api.get('/clientes')

// POST
const data = await api.post('/clientes', payload)

// PUT
const updated = await api.put(`/clientes/${id}`, payload)

// DELETE
await api.delete(`/clientes/${id}`)

// Error handling
try {
  await api...
} catch (error) {
  toast.error(error.response?.data?.message || 'Erro inesperado')
}
```

---

## Routing

**Protected routes:** All except `/login` require JWT in localStorage

| Route | Component | Access |
|-------|-----------|--------|
| `/login` | Login | Public |
| `/dashboard` | Dashboard | Auth |
| `/clientes` | Clientes | Auth |
| `/calendario` | CalendarioContabil | Auth |
| `/notas` | StickyNotes | Auth |
| `/simulador-rescisao` | SimuladorRescisao | Auth |
| `/admin` | PainelAdmin | Admin only |
| `/configuracoes` | Configuracoes | Auth |

---

## Responsive Breakpoints

| Breakpoint | Width | Behavior |
|------------|-------|----------|
| Mobile | < 768px | Sidebar overlay, hamburger menu |
| Tablet | 768-1024px | Sidebar collapsed |
| Desktop | > 1024px | Sidebar expanded/collapsible |

---

## Accessibility

- WCAG 2.1 AA compliance
- 4.5:1 minimum contrast ratio
- Visible focus indicators
- ARIA labels on interactive elements
- Keyboard navigation (Escape closes dropdowns)
- Screen reader friendly

---

*Part of docs/frontend/ system. For compact reference, see `context/frontend.md`*
