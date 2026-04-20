# Sprint 2 - Calendário Contábil 2026

**Data:** 05/04/2026 | **Hora:** 14:00 | **Status:** ✅ Concluída
**Tipo:** Feature

## Objetivo
Implementar calendário fiscal com feriados nacionais, estaduais e municipais, além de obrigações acessórias.

## Implementado
- FullCalendar v6 integrado: visualização mensal/semanal/diária, navegação entre meses, eventos coloridos por tipo
- 911 feriados carregados: nacionais, estaduais (BA), municipais (Salvador + 417 municípios) via BrasilAPI/IBGE
- 60+ obrigações fiscais cadastradas: DAS MEI, DASN-SIMEI, DEFIS, PGDAS, SINCOM, etc.
- Filtros: por tipo (feriado/obrigação), estado/município, header fixo com scroll

## Arquivos
| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `frontend/src/pages/Calendario.jsx` | Novo | Página do calendário |
| `frontend/src/services/calendarAPI.js` | Novo | Endpoints de calendário |
| `backend/src/controllers/calendarController.js` | Novo | API de calendário |
| `docs/feriados_municipais_2026.json` | Novo | 911 feriados |

## Métricas
- **Tempo:** 8h | **Erros:** 0 | **Files:** +5 criados, ~1 modificado
- **Testes:** Build ✅ | 911 feriados ✅ | 60+ obrigações ✅ | Filtros ✅
