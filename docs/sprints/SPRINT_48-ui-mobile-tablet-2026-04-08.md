# Sprint 48 - UI Mobile/Tablet Responsiva
**Data:** 08/04/2026 | **Hora:** 14:30 | **Status:** ✅ | **Tipo:** UI/UX

## Objetivo
Melhorar a responsividade da interface para celulares e tablets, adaptando tabelas, header e sidebar para diferentes tamanhos de tela.

## Implementado

### 1. Componente MobileTableCard (Novo)
- Componente reutilizável para exibição de dados tabulares em mobile
- Cards expansíveis com ChevronDown/Up
- Suporte a badges coloridos (green, red, blue, yellow, purple, gray)
- Dropdown de ações com ícones (Ver, Editar, Excluir, etc.)
- Props flexíveis: `primaryField`, `secondaryFields`, `detailFields`, `actions`
- Renderização customizável via `renderHeader` e `renderDetails`
- Touch targets ≥ 44px em todos os elementos interativos

### 2. Página Clientes Responsiva
- **Mobile (< 768px):** Cards expansíveis com MobileTableCard
  - Header: ícone da empresa + nome + badges (CNPJ, Status)
  - Detalhes: telefone, email, endereço com ícones (Phone, Mail, MapPin)
  - Ações: dropdown com 5 opções (Ver, Editar, Documentos, Recibo, Excluir)
- **Desktop (≥ 768px):** Tabela HTML tradicional mantida
- Header da página: botões adaptados (esconde texto em mobile, mostra só ícone)
- Padding responsivo: `p-3 sm:p-4 md:p-6 xl:p-8`

### 3. Header (AppHeader) Melhorado
- **Logo SEMPRE visível** em todos os dispositivos (mobile, tablet, desktop)
  - Mobile: ícone 9x9 + hamburger ao lado
  - Tablet/Desktop: ícone 10x10 + texto "HUB CONTÁBIL"
- Detecção de tablet (768px-1024px) para ajustes de layout
- Posicionamento fluido: `left: 0` (mobile) → `72px` (collapsed) → `220px` (tablet) → `288px` (desktop)
- Theme Toggle escondido em mobile para economizar espaço

### 4. Sidebar Adaptada para Mobile/Tablet
- **Mobile (< 768px):** Overlay fullscreen com search + botão fechar
- **Tablet (768px-1024px):** 
  - Sidebar semi-colapsada por padrão (220px vs 288px desktop)
  - Itens do menu mostram ícone + texto truncado
  - Sem tooltips (não necessário em touch)
  - Submenus colapsáveis funcionais
- **Desktop (≥ 1024px):** Comportamento normal (expandida 288px ou colapsada 72px)
- `SIDEBAR_TABLET = 220` constante intermediária
- Espaçamento entre grupos reduzido no mobile (space-y-3 vs space-y-4)

### 5. SidebarNavItem com Detecção de Tablet
- 3 modos de exibição:
  1. **Mobile:** Texto completo (sidebar aberta)
  2. **Tablet:** Ícone + texto truncado com `truncate`
  3. **Desktop collapsed:** Só ícone com tooltip
- Tooltip agora usa estado (`tooltipPosition`) ao invés de IIFE com ref
- Performance melhorada: `getBoundingClientRect` chamado apenas no mouseEnter

### 6. Layout Principal
- Padding do conteúdo responsivo: `p-3 sm:p-4 md:p-6 xl:p-8`
- Margin left fluido: `0` (mobile) → `72/220/288px` (desktop)
- Detecção de tablet para ajustar sidebar width

## Arquivos
| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `frontend/src/components/ui/MobileTableCard.jsx` | **CRIADO** | Componente principal para tabelas responsivas (311 linhas) |
| `frontend/src/pages/Clientes.jsx` | **MODIFICADO** | Integração MobileTableCard + tabela desktop (525 linhas) |
| `frontend/src/components/layout/AppHeader.jsx` | **MODIFICADO** | Logo sempre visível + detecção tablet |
| `frontend/src/components/layout/AppSidebar.jsx` | **MODIFICADO** | Ajustes mobile/tablet + remoção de props não usadas |
| `frontend/src/components/layout/SidebarNavItem.jsx` | **MODIFICADO** | 3 modos (mobile/tablet/desktop) + tooltip com estado |
| `frontend/src/components/Layout.jsx` | **MODIFICADO** | SIDEBAR_TABLET + padding responsivo + limpeza |

## Breakpoints Utilizados
- **Mobile:** < 768px (cards, overlay sidebar, logo compacta)
- **Tablet:** 768px - 1024px (semi-colapsado, ícone + texto)
- **Desktop:** ≥ 1024px (layout completo)

## Métricas
- **Tempo:** ~2h | **Erros:** 0 | **Files:** +1/~5
- **Build:** ✅ 17.59s (2189 modules, zero errors)
- **Lint:** ✅ 0 errors (warnings menores do React 19 compiler)
- **Mobile First:** ✅ Touch targets ≥ 44px em todos componentes
- **Responsividade:** ✅ 3 breakpoints testados

## Notas Técnicas
- Build passou sem erros após correções de lint
- React 19 warnings sobre setState em useEffect são esperados (padrão para init baseado em window)
- Componente MobileTableCard é reutilizável em outras páginas com tabelas
- Padrão estabeecido para futuras páginas: usar MobileTableCard em mobile + tabela HTML em desktop
