# Sprint 38 - Dashboard com Calendário e Próximos Eventos

**Data:** 05/04/2026 | **Hora:** 14:00 | **Status:** ✅ Concluída
**Tipo:** Feature

## Objetivo
Transformar Dashboard para exibir dados reais do calendário contábil, removendo dados mockados e adicionando widgets funcionais.

## Implementado
- Widget "Próximas Obrigações": top 5 obrigações próximos 7 dias, data/nome/categoria/período de apuração, ordenação por data, link para calendário
- Widget "Calendário do Mês": mini calendário visual, destaca dias com obrigações/feriados, tooltip ao hover, navegação mês anterior/próximo
- Widget "Resumo do Mês": total/pendentes/passadas, distribuição por categoria, próximos feriados
- Widget "Feriados Próximos": próximos 3 feriados (nacionais + por UF), data/nome/abrangência/dias restantes
- Backend `GET /api/calendario/dashboard`: agrega obrigações + feriados + eventos do usuário

## Arquivos
| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `backend/src/controllers/calendarioContabilController.js` | Modificado | `getDashboard()` agrega dados |
| `frontend/src/pages/Dashboard.jsx` | Modificado | 4 widgets, zero mock data |

## Métricas
- **Tempo:** 2h | **Erros:** 0 | **Files:** ~2 modificados
- **Testes:** Build ✅ | Dados reais ✅ | Loading ✅
