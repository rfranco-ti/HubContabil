# Sprint 24 - Calendário Contábil Avançado

**Data:** 05/04/2026 | **Hora:** 14:00 | **Status:** 🟡 Planejamento
**Tipo:** Feature

## Objetivo
Transformar calendário em ferramenta completa de gestão de eventos e feriados com filtros avançados, cores por tipo, modais e página diária dedicada.

## Planejado
- **Filtros de feriados:** por tipo (Nacional/Estadual/Municipal), dropdown UF, multi-select municípios, botão "Exibir apenas RMS"
- **Cores por tipo:** Nacional (vermelho #EF4444), Estadual (laranja #F97316), Municipal (azul #3B82F6), Evento Usuário (verde #10B981)
- **Modal de descrição:** ao clicar em feriado, mostra descrição completa, tipo, abrangência, lista todos se mesma data
- **Eventos do usuário:** CRUD com model `Evento` no Prisma (título, descrição, data, hora, cor, lembrete), filtro mostrar/ocultar
- **Página diária:** rota `/calendario/:ano/:mes/:dia`, lista eventos/feriados do dia, navegação anterior/próximo, botão adicionar evento
- 6 subsprints, 25h estimadas, ~1500 linhas, complexidade alta

## Arquivos
| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `frontend/src/pages/Calendario.jsx` | Planejado | Modificar com filtros/modais |
| `frontend/src/components/Calendario/FiltrosFeriados.jsx` | Planejado | Novo componente |
| `frontend/src/components/Calendario/ModalFeriado.jsx` | Planejado | Modal descrição |
| `frontend/src/pages/CalendarioDia.jsx` | Planejado | Página diária |
| `backend/src/controllers/eventoController.js` | Planejado | CRUD eventos |
| `backend/prisma/schema.prisma` | Planejado | Model Evento |

## Métricas
- **Tempo estimado:** 25h | **Complexidade:** Alta
- **Arquivos planejados:** +11 novos, ~5 modificados
