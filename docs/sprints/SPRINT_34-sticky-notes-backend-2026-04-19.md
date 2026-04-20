# Sprint 34 - Sticky Notes Backend (Prisma + API)

**Data:** 05/04/2026 | **Hora:** 14:00 | **Status:** ✅ Concluída
**Tipo:** Feature

## Objetivo
Conectar Sticky Notes ao backend com Prisma + PostgreSQL, substituindo localStorage por persistência real com API REST.

## Implementado
- Model `StickyNote`: id (UUID), usuarioId, titulo, conteudo (Text), cor (default "yellow"), ordem, createdAt, updatedAt, relação com User (1:N, cascade delete)
- Endpoints: `GET /api/notas`, `POST /api/notas`, `PUT /api/notas/:id`, `DELETE /api/notas/:id`, `PATCH /api/notas/reordenar` — todos com JWT auth
- Controller: `listarNotas` (filtra por usuarioId), `criarNota` (título obrigatório, ordem automática), `atualizarNota` (campos específicos), `excluirNota`, `reordenarNotas` (transação)
- Frontend: `notasAPI` service em `api.js`, substitui localStorage por chamadas API, loading states, toasts de feedback
- Índices em `usuarioId` e `ordem` para performance

## Arquivos
| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `backend/prisma/schema.prisma` | Modificado | Modelo StickyNote + relação User |
| `backend/src/controllers/stickyNotesController.js` | Novo | 5 funções CRUD |
| `backend/src/routes/stickyNotesRoutes.js` | Novo | Rotas com auth middleware |
| `frontend/src/services/api.js` | Modificado | Adicionado notasAPI |
| `frontend/src/pages/StickyNotes.jsx` | Modificado | Consome API + toasts |

## Métricas
- **Tempo:** 1.5h | **Erros:** 1 (relação User faltando) | **Files:** +2 criados, ~5 modificados
- **Testes:** Build ✅ | CRUD ✅ | Auth ✅
