# Sprint 47 - Botão Toggle Sidebar

**Data:** 05/04/2026 | **Hora:** 14:00 | **Status:** ✅ Concluída
**Tipo:** UI

## Objetivo
Mover botão toggle (hamburger) do header para topo da sidebar, tornando interface mais intuitiva.

## Implementado
- Botão `PanelLeftClose` no canto superior direito do header da sidebar (expandida)
- Botão escondido quando colapsada (usuário usa `Ctrl+B`)
- Header simplificado: só logo adaptativo + busca + notificações + usuário
- Tooltip: `title="Recolher menu (Ctrl+B)"`

## Arquivos
| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `AppSidebar.jsx` | Modificado | Botão PanelLeftClose + prop onToggleCollapsed |
| `AppHeader.jsx` | Modificado | Removido botão hamburger |
| `Layout.jsx` | Modificado | Passa onToggleCollapsed para sidebar |

## Métricas
- **Tempo:** 0.5h | **Erros:** 0 | **Files:** ~3 modificados
- **Testes:** Build ✅ | Manual ✅
