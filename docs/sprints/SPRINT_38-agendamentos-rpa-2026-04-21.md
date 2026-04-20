# Sprint 38 - Agendamentos RPA

**Data:** 05/04/2026 | **Hora:** 14:00 | **Status:** ✅ Concluída
**Tipo:** Feature

## Objetivo
Permitir agendamento de robôs RPA para execução automática em horários definidos com recorrência.

## Implementado
- Model `AgendamentoRpa` com enums `TipoRobo`, `RecorrenciaAgendamento` (única, diária, semanal, mensal, X vezes/dia/semana)
- CRUD completo: criar, listar, executar manualmente, editar, excluir
- Cards visuais com tipo de robô, CNPJ, horário, próxima execução, total de execuções
- Componente `AgendamentosRpa.jsx` com modal `ModalAgendamento.jsx` para seleção de recorrência e dias
- Aba "Agendamentos" em Configurações, banner informativo sobre execução simulada (integração futura com Puppeteer)

## Arquivos
| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `backend/prisma/schema.prisma` | Modificado | Models `AgendamentoRpa` + enums |
| `backend/src/controllers/agendamentoRpaController.js` | Novo | CRUD + execução manual |
| `backend/src/routes/agendamentoRpaRoutes.js` | Novo | Rotas /api/agendamentos |
| `frontend/src/pages/AgendamentosRpa.jsx` | Novo | Cards visuais + modal |
| `frontend/src/pages/Configuracoes.jsx` | Modificado | Aba "Agendamentos" |

## Métricas
- **Tempo:** 2.5h | **Erros:** 2 (relação Prisma ambígua, migrate shadow db) | **Files:** +5 criados, ~3 modificados
- **Testes:** Build ✅ | CRUD ✅ | Execução manual ✅
