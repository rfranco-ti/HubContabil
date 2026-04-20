# Frontend Context - HubContabil
# Versão: 1.0 | 05/04/2026
# PROPÓSITO: Contexto rápido para IA entender frontend

## Stack
React 19 + Vite + Tailwind CSS + shadcn/ui | Lucide React icons | react-hot-toast

## Configuração Central
`frontend/src/config/frontend.js` exporta:
- `THEME`: cores (backgrounds, borders, text, interactive, status)
- `LAYOUT`: header h-16/z-50, sidebar w-72/z-40, main p-6
- `TYPOGRAPHY`: font sizes (xs→2xl), weights (400-700)
- `ANIMATIONS`: fast(150ms), normal(200ms), slow(300ms)

## Cores Principais
- Primary: #2563eb (blue-600)
- Secondary: #64748b (slate-500)
- Accent: #0ea5e9 (sky-500)
- Status: success #10b981, error #ef4444, warning #f59e0b, info #3b82f6
- Backgrounds: page #f8fafc (gray-50), sidebar #0f172a (slate-900), card #fff

## Design System
- Font: Inter (text), JetBrains Mono (code)
- Acessibilidade: WCAG 2.1 AA, 4.5:1 contrast, focus visible, aria-labels, keyboard nav
- Toasts: react-hot-toast, top-right, 4s duration
- CSS: Tailwind utilitário (90%), arquivo .css separado (complexo), NUNCA inline JSX

## Arquitetura de Componentes
```
shadcn/ui (base) → Componentes Customizados → Páginas
```

## Componentes Principais
- `AppSidebar` - Sidebar colapsável (288px ↔ 72px), 8 grupos de menu, Ctrl+B toggle
- `AppHeader` - Header fixo com user dropdown, notification bell
- `Layout` - Wrapper principal (sidebar + header + content)
- `NotificationBell` - Badge dinâmico, dropdown, polling 60s
- `UserDropdown` - Perfil, Painel Admin (só admin), logout

## Rotas Protegidas
Todas as rotas exceto `/login` exigem auth (JWT em localStorage)
- `/admin` → `PainelAdmin.jsx` (só cargo Admin/Administrador)
- `/configuracoes` → Abas: Geral, Usuários, Agendamentos, APIs, Logs

## Estrutura de Pastas
```
frontend/src/
├── components/     # Componentes reutilizáveis (Sidebar, Header, UI)
├── pages/          # Páginas principais
├── services/       # API services (axios)
├── config/         # Configuração central (frontend.js)
├── utils/          # Helpers
└── context/        # React context (auth)
```

## API Services (axios)
```js
// Pattern base
import api from '../services/api'
const response = await api.get('/clientes')
const data = await api.post('/clientes', payload)
// Error handling
try { await api... } catch (error) { toast.error(error.response?.data?.message || 'Erro') }
```

## Sidebar (8 Grupos de Menu)
1. Principal: Dashboard
2. Financeiro: Clientes, Recibos
3. Calendário: Calendário Contábil
4. Automação: RPA, Agendamentos
5. Pesquisas: CNAE, NBS, CNPJ
6. Documentos: GED, Gerador de Documentos
7. Produtividade: Sticky Notes
8. Administração: Usuários, Configurações

**Config centralizada em:** `data/menuConfig.js`
**Persistência:** localStorage `sidebar-collapsed`
**Acessibilidade:** ARIA labels, Escape fecha dropdowns, focus management

## Calendário Profissional
- Tipos de evento dinâmicos do DB (6 tipos: trabalhista, tributario, feriado, datas_comemorativas, lembrete, tarefa)
- Cores do DB (hex → hexToRgba para background alpha)
- ZERO categorias hardcoded
- Legado mapeado: `CATEGORIA_PARA_TIPO` ("Feriados"→feriado, etc)
- Feriados com abrangência: NACIONAL, ESTADUAL (exige UF), MUNICIPAL (exige município+UF)
- Endpoint: `/api/feriados/relevantes?uf=SP&municipio=Sao+Paulo&ano=2026`

## Sticky Notes
- CRUD completo com drag-and-drop reorder
- Cores, tamanhos (S/M/L), prioridades
- Persistência em localStorage + DB
- Página: `/notas`

## Dashboard
- 6 KPIs Small: Clientes, Honorários, Certificados, Obrigações, Documentos, Notificações
- 5 Widgets Medium: Próximas Obrigações, Visão Semana, Resumo Mês, Atividades Recentes, Certificados Expirando
- 1 Widget Large: Calendário mensal completo
- Backend: `/api/dashboard/kpis`, `/api/dashboard/semana`, `/api/dashboard/atividades`, `/api/dashboard`
- `Promise.allSettled` para tolerância a falhas

## Simulador Rescisão
- Página: `/simulador-rescisao`
- Seções colapsáveis (principal + adicionais/descontos)
- Campos: jornada, insalubridade, periculosidade, adic. noturno, HE+DSR, faltas, VT, outros descontos
- Resultados detalhados com totais e alíquotas efetivas
- Base legal documentada em `docs/calculos/`

## Responsividade
- Mobile (< 768px): Sidebar overlay, menu hamburger
- Tablet (768-1024px): Sidebar colapsada
- Desktop (> 1024px): Sidebar expandida/colapsável

## Regras Críticas
- SEMPRE usar classes Tailwind (NUNCA inline JSX style)
- SEMPRE usar componentes shadcn/ui como base
- SEMPRE tratar erros com toast.error
- SEMPRE validar inputs antes de submit
- Documentar TODA modificação em docs/ (ver COMPORTAMENTO_IA.md)

## Pendências Frontend
- [ ] Testes automatizados (Playwright)
- [ ] Dark mode toggle
- [ ] mais acessibilidade em formulários complexos


## Sistema de Tema (Dark/Light Mode)
- **Contexto:** `frontend/src/context/index.js` (barreira de exportação)
- **ThemeProvider:** Envolve toda a aplicação em `main.jsx`
- **Hook:** `useTheme()` para acessar `{ theme, toggleTheme }`
- **Persistência:** localStorage `hub-theme`
- **Toggle:** Componente `ThemeToggle` no `AppHeader`
- **Classes Tailwind:** `dark:` prefix para modo escuro
- **Implementação:** Classes adicionadas/removidas do `document.documentElement`