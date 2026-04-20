# Sprint 42 - Dashboard Profissional Completo

**Data:** 05/04/2026 | **Hora:** 14:00 | **Status:** ✅ Concluída
**Tipo:** Feature

## Objetivo
Criar endpoints backend agregados para dashboard profissional com dados reais: KPIs, visão semanal, atividades recentes e dashboard completo com `Promise.allSettled`.

## Implementado
- `GET /api/dashboard/kpis`: KPIs de clientes (total/ativos/inativos), honorários, certificados válidos/expirando, documentos do mês, obrigações (mes/pendentes/passadas), notificações não lidas
- `GET /api/dashboard/semana`: Visão Seg-Dom com obrigações e feriados agrupados por dia, metadata (eHoje, diaSemana), período calculado dinamicamente
- `GET /api/dashboard/atividades`: Últimas 10 atividades (novos clientes, documentos, notas, logs) com tempo relativo ("há 6h"), ícone e cor por tipo
- `GET /api/dashboard`: Agrega todos endpoints com `Promise.allSettled`, campo `parcial` indica falhas, resiliência a erros individuais
- Dados agregados via `count`, `aggregate` do Prisma (não busca em memória)
- Todas rotas protegidas por middleware JWT (`protect`)

## Arquivos
| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `backend/src/controllers/dashboardController.js` | Novo | 4 endpoints agregadores |
| `backend/src/routes/dashboardRoutes.js` | Novo | Rotas protegidas |
| `backend/src/routes/index.js` | Modificado | Registro das rotas |

## Métricas
- **Tempo:** 3h | **Erros:** 0 | **Files:** +2 criados, ~1 modificado
- **Testes:** Build ✅ | Todos 4 endpoints 200 ✅
