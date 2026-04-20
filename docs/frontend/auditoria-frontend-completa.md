# Auditoria Completa do Frontend - HubContabil

**Data:** 05 de abril de 2026  
**Arquivos analisados:** 70+ arquivos JSX/CSS/JS  
**Escopo:** UI/UX, Performance, Acessibilidade, Responsividade, Código, Segurança

---

## 📊 Resumo Executivo

| Categoria | P0 (Urgente) | P1 (Importante) | P2 (Nice-to-have) | Total |
|-----------|:-----------:|:---------------:|:-----------------:|:-----:|
| **Performance** | 4 | 8 | 3 | 15 |
| **UI/UX** | 2 | 6 | 4 | 12 |
| **Acessibilidade** | 3 | 2 | 2 | 7 |
| **Responsividade** | 1 | 4 | 2 | 7 |
| **Código** | 5 | 8 | 10 | 23 |
| **Segurança** | 1 | 2 | 0 | 3 |
| **TOTAL** | **16** | **30** | **21** | **67** |

---

## 🚨 TOP 10 AÇÕES IMEDIATAS (P0)

| # | Problema | Impacto | Arquivo | Solução |
|---|----------|---------|---------|---------|
| 1 | **3 bibliotecas de toast** (react-toastify + react-hot-toast + sonner) | ~30KB extra, UX inconsistente | `package.json`, `main.jsx`, `App.jsx` | Unificar para sonner |
| 2 | **Zero lazy loading de rotas** - 50+ páginas importadas estaticamente | Bundle inicial enorme, first load lento | `App.jsx` | `React.lazy()` + `Suspense` |
| 3 | **PDF.js 2MB carregado no topo** | +2MB no bundle mesmo sem uso | `DocumentosCliente.jsx` | Import dinâmica: `await import('pdfjs-dist')` |
| 4 | **Tailwind classes dinâmicas quebradas** | Grid não funciona, layout quebrado | `StickyNotes.jsx` | Mapeamento explícito de classes |
| 5 | **Falta massiva de aria-labels** | Inacessível para screen readers | Todo o projeto | Adicionar `aria-label`, `role`, `scope` |
| 6 | **Sem focus trap em modais** | Navegação teclado quebrada | Todos os modais | Usar `@radix-ui/react-dialog` |
| 7 | **DocumentosCliente.jsx 1587 linhas** | Re-renders desnecessários, difícil manutenção | `DocumentosCliente.jsx` | Extrair sub-componentes |
| 8 | **9 instâncias axios com interceptors duplicados** | DRY violado, manutenção difícil | 9 arquivos `services/` | Consolidar em módulo único |
| 9 | **alert() nativo em produção** | UX inconsistente, bloqueia thread | `DocumentosCliente.jsx` | Substituir por toast/modal |
| 10 | **Dashboard sem acentos** | Aparece para TODOS os usuários | `Dashboard.jsx` | Corrigir encoding/textos |

---

## ⚡ PERFORMANCE (15 problemas)

### P0 - Crítico

| # | Problema | Arquivo | Solução |
|---|----------|---------|---------|
| 1.1 | Componente 1587 linhas sem split | `DocumentosCliente.jsx` | Extrair: `UploadQueue`, `FilePreview`, `FolderBrowser`, `DocumentList` |
| 1.2 | Upload queue re-renderiza a cada 1% sem memo | `DocumentosCliente.jsx` | `React.memo` nos items, `useCallback` handlers |
| 1.3 | 3 libs de toast simultâneas | `package.json` | Unificar para sonner |
| 1.4 | Grid Tailwind dinâmico não funciona | `StickyNotes.jsx` | Mapeamento: `{ pequeno: 'grid-cols-2...', medio: '...', ... }` |

### P1 - Importante

| # | Problema | Arquivo | Solução |
|---|----------|---------|---------|
| 1.5 | `formatarEventos` recriado sem memo | `CalendarioDefinitivo.jsx` | `useMemo` com deps `[eventos, eventosUsuario, mapaTipos]` |
| 1.6 | `useCallback` mas widgets sem `React.memo` | `Dashboard.jsx` | Envolver `WidgetS`, `WidgetM`, `WidgetL` com `React.memo` |
| 1.7 | Polling de notificações sem verificar auth | `NotificationBell.jsx` | Verificar token antes de iniciar polling |
| 1.8 | `JSON.parse(localStorage)` a cada render | `AppHeader.jsx` | `useState(() => JSON.parse(...))` lazy init |
| 1.9 | Zero `React.memo` em componentes UI base | `components/ui/*` | Envolver todos com `memo()` |
| 1.10 | Sem virtualização para listas longas | `Clientes.jsx`, `StickyNotes.jsx` | `@tanstack/react-virtual` para listas >50 itens |
| 1.11 | PDF.js sem lazy loading | `DocumentosCliente.jsx` | `const pdfjsLib = await import('pdfjs-dist')` |
| 1.12 | 50+ imports estáticos no App.jsx | `App.jsx` | `React.lazy(() => import('./pages/...'))` |

### P2 - Nice-to-have

| # | Problema | Arquivo | Solução |
|---|----------|---------|---------|
| 1.13 | Tooltip com `getBoundingClientRect` inline | `SidebarNavItem.jsx` | `@floating-ui/react` com posicionamento async |
| 1.14 | Sem skeleton loaders | Vários | Criar `<Skeleton />` e `<SkeletonLoader />` |
| 1.15 | Busca sem debounce | `Clientes.jsx`, `CalendarioDefinitivo.jsx` | Custom hook `useDebounce` 300ms |

---

## 🎨 UI/UX (12 problemas)

### P0 - Crítico

| # | Problema | Arquivo | Solução |
|---|----------|---------|---------|
| 2.1 | Toasts duplicados/inconsistentes | `main.jsx`, `App.jsx` | Unificar para sonner |
| 2.2 | Uso de `alert()` nativo | `DocumentosCliente.jsx` (7x) | Substituir por `toast.error()` |

### P1 - Importante

| # | Problema | Arquivo | Solução |
|---|----------|---------|---------|
| 2.3 | Textos sem acentos no Dashboard | `Dashboard.jsx` | Corrigir encoding: "Próximas Obrigações", "Visão da Semana" |
| 2.4 | Loading states inconsistentes | Vários | Criar `<PageLoader />` padrão |
| 2.5 | Modais não impedem scroll do body | `CalendarioDefinitivo.jsx`, `StickyNotes.jsx` | `document.body.style.overflow = 'hidden'` no useEffect |
| 2.6 | Link "Esqueceu senha?" sem handler | `Login.jsx` | Remover ou implementar |
| 2.7 | Botões "Em breve" que não funcionam | `Clientes.jsx` | Remover ou implementar |
| 2.8 | Sem confirmação visual para deletes | Vários | Criar `<ConfirmDialog />` reutilizável |

### P2 - Nice-to-have

| # | Problema | Arquivo | Solução |
|---|----------|---------|---------|
| 2.9 | Sem breadcrumbs em páginas internas | Vários | Criar `<Breadcrumb />` component |
| 2.10 | Sem empty states visuais | Vários | Ilustrações + texto amigável para listas vazias |
| 2.11 | Sem feedback de ação bem-sucedida | Vários | Toasts de sucesso após CRUD |
| 2.12 | Placeholders genéricos em inputs | Formulários | Placeholders descritivos com exemplos |

---

## ♿ ACESSIBILIDADE (7 problemas)

### P0 - Crítico

| # | Problema | Arquivo | Solução |
|---|----------|---------|---------|
| 3.1 | ~23 `aria-label` em todo o projeto | Todo | Adicionar em botões, inputs, selects, links |
| 3.2 | Sem focus trap em modais | Todos modais | `@radix-ui/react-dialog` ou focus trap manual |
| 3.3 | Tabela sem `role="table"`, `scope="col"` | `Clientes.jsx` | Adicionar roles e scopes semânticos |

### P1 - Importante

| # | Problema | Arquivo | Solução |
|---|----------|---------|---------|
| 3.4 | Sem `aria-live` em regiões dinâmicas | `Dashboard.jsx`, `NotificationBell.jsx` | `aria-live="polite"` nos KPIs |
| 3.5 | Ícones decorativos sem `aria-hidden` | Todo projeto | `aria-hidden="true"` nos icons |

### P2 - Nice-to-have

| # | Problema | Arquivo | Solução |
|---|----------|---------|---------|
| 3.6 | Contraste insuficiente (`text-gray-400`) | `Dashboard.jsx` | Usar `text-gray-600` mínimo |
| 3.7 | Skip navigation link ausente | `Layout.jsx` | `<a href="#main" className="sr-only focus:not-sr-only">` |

---

## 📱 RESPONSIVIDADE (7 problemas)

### P0 - Crítico

| # | Problema | Arquivo | Solução |
|---|----------|---------|---------|
| 4.1 | Tooltip overflow em telas pequenas | `SidebarNavItem.jsx` | `@floating-ui/react` com boundary detection |

### P1 - Importante

| # | Problema | Arquivo | Solução |
|---|----------|---------|---------|
| 4.2 | Tabelas sem scroll horizontal mobile | `DocumentosCliente.jsx` | `<div className="overflow-x-auto">` |
| 4.3 | Grid pode colapsar mal em telas intermediárias | `Dashboard.jsx` | Ajustar breakpoints ou `minmax()` |
| 4.4 | FullCalendar overflow horizontal mobile | `CalendarioDefinitivo.jsx` | `overflow-x-auto` ou `height: '100vh'` |
| 4.5 | Modais sem `max-height` e scroll interno | `CalendarioDefinitivo.jsx` | `max-h-[80vh] overflow-y-auto` |

### P2 - Nice-to-have

| # | Problema | Arquivo | Solução |
|---|----------|---------|---------|
| 4.6 | Sidebar não anima bem em resize | `Layout.jsx` | Adicionar listener de resize para sidebar state |
| 4.7 | Touch targets < 44px em mobile | Botões pequenos | `min-h-[44px] min-w-[44px]` para touch targets |

---

## 💻 CÓDIGO (23 problemas)

### P0 - Crítico

| # | Problema | Arquivo | Solução |
|---|----------|---------|---------|
| 5.1 | 4 `useEffect` separados no Layout | `Layout.jsx` | Consolidar em 1-2 effects com cleanup |
| 5.2 | Validação de token só no mount | `ProtectedRoute.jsx` | Interceptor axios + verificação periódica |
| 5.3 | Duplicação de lógica mobile | `Layout.jsx` + `AppSidebar.jsx` | Usar `useSidebar` hook |
| 5.4 | ~20 arquivos CSS custom competindo com Tailwind | `styles/` | Migrar para Tailwind ou CSS modules |
| 5.5 | CSS morto do template Vite | `styles/App.css` | Remover arquivo |

### P1 - Importante

| # | Problema | Arquivo | Solução |
|---|----------|---------|---------|
| 5.6 | Hooks React em arquivo de utils | `utils/masks.js` | Mover para `hooks/useMasks.js` |
| 5.7 | 9 instâncias axios com interceptor duplicado | 9 arquivos `services/` | Exportar de `api.js`, importar nos outros |
| 5.8 | Stats hardcoded | `Calculos.jsx` | Calcular dinamicamente |
| 5.9 | `window.location.href` ao invés de `navigate` | `Dashboard.jsx` | Usar `useNavigate()` |
| 5.10 | Arquivo `.bak` no source | `pages/Dashboard.jsx.bak` | Remover, adicionar ao `.gitignore` |
| 5.11 | `eventosAPI` duplicado | `eventosAPI.js` + `calendarioAPI.js` | Consolidar em um arquivo |
| 5.12 | localStorage removido no cleanup | `DocumentosCliente.jsx` | Revisar necessidade do cleanup |
| 5.13 | `console.log` de debug em produção | `ModalEvento.jsx`, `CalendarioDefinitivo.jsx` | Remover ou logging condicional |

### P2 - Nice-to-have

| # | Problema | Arquivo | Solução |
|---|----------|---------|---------|
| 5.14 | Inline styles onde Tailwind basta | `PinnedNotesWidget.jsx` | Usar mapeamento de classes |
| 5.15 | Refs desnecessários | `DocumentosCliente.jsx` | Revisar necessidade |
| 5.16 | Import não usado no App.jsx | `App.jsx` | Remover `CalculadoraSalarioLiquido` |
| 5.17 | Keys usando index de array | `Dashboard.jsx` | Usar IDs únicos |
| 5.18 | Sem TypeScript | Todo projeto | Migrar para TS gradualmente |
| 5.19 | Sem testes automatizados | Todo projeto | Vitest + React Testing Library |
| 5.20 | Sem ESLint configurado | `eslint.config.js` | Configurar regras strict |
| 5.21 | Sem Prettier | Todo projeto | Configurar + pre-commit hook |
| 5.22 | Sem Storybook | Componentes UI | Storybook para documentação |
| 5.23 | Sem error boundaries em sub-componentes | Vários | Criar `<ErrorBoundary />` reutilizável |

---

## 🔒 SEGURANÇA (3 problemas)

### P0 - Crítico

| # | Problema | Arquivo | Solução |
|---|----------|---------|---------|
| 6.1 | Token JWT em localStorage (vulnerável XSS) | Todo auth | Mover para httpOnly cookie (requer backend) |

### P1 - Importante

| # | Problema | Arquivo | Solução |
|---|----------|---------|---------|
| 6.2 | `JSON.parse` sem validação | `AppHeader.jsx`, `ProtectedRoute.jsx` | Try-catch ou validação de schema |
| 6.3 | Sem CSRF protection | Backend | Implementar CSRF tokens |

---

## 🎯 ROADMAP DE IMPLEMENTAÇÃO

### Fase 1: Crítico (1-2 semanas)
1. Unificar bibliotecas de toast → sonner
2. Implementar lazy loading de rotas
3. Import dinâmica do PDF.js
4. Corrigir grid dinâmico do Tailwind
5. Corrigir textos sem acentos no Dashboard
6. Remover `alert()` nativo
7. Remover CSS morto e arquivo `.bak`

### Fase 2: Performance (2-3 semanas)
8. `React.memo` em componentes UI base
9. Virtualização de listas longas
10. Consolidar instâncias axios
11. Debounce em buscas
12. Skeleton loaders
13. Split de `DocumentosCliente.jsx`

### Fase 3: Acessibilidade (1-2 semanas)
14. `aria-label` em todos elementos interativos
15. Focus trap em modais
16. `aria-live` em regiões dinâmicas
17. Skip navigation link
18. Contraste mínimo `text-gray-600`

### Fase 4: Responsividade (1 semana)
19. Tabelas com scroll horizontal mobile
20. Tooltips com boundary detection
21. Touch targets mínimos 44px
22. Modais com `max-h-[80vh]`

### Fase 5: Código Limpo (contínuo)
23. ESLint + Prettier configurados
24. Testes unitários (Vitest)
25. TypeScript gradual
26. Storybook para componentes

---

*Auditoria realizada em 05/04/2026. Revisar mensalmente.*
