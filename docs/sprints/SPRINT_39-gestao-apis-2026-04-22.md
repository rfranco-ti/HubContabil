# Sprint 39 - Gestão de APIs + Logs Dedicado

**Data:** 05/04/2026 | **Hora:** 14:00 | **Status:** ✅ Concluída
**Tipo:** Feature

## Objetivo
Criar aba "APIs" em Configurações com documentação e gestão de tokens, mover Logs para aba dedicada, reorganizar Configurações com 5 abas.

## Implementado
- Model `ApiKey` com hash SHA-256, permissões granulares (read:clientes, write:documentos, etc.), tracking de uso, expiração configurável
- Controller com CRUD + middleware `authApiKey`, header `X-API-Key` para autenticação externa, chave mostrada apenas uma vez na criação
- Configurações reorganizadas: 5 abas (Geral, Usuários, Agendamentos, APIs, Logs)
- Componente `GestaoApis.jsx` com documentação acessível e gestão de tokens, `ModalApiKey.jsx` com seleção de permissões
- Logs com aba dedicada, revogação imediata de chaves

## Arquivos
| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `backend/prisma/schema.prisma` | Modificado | Model `ApiKey` |
| `backend/src/controllers/apiKeyController.js` | Novo | CRUD + middleware auth |
| `backend/src/routes/apiKeyRoutes.js` | Novo | Rotas /api/api-keys |
| `frontend/src/pages/GestaoApis.jsx` | Novo | Documentação + gestão tokens |
| `frontend/src/pages/ModalApiKey.jsx` | Novo | Modal criação com permissões |
| `frontend/src/pages/Configuracoes.jsx` | Modificado | 5 abas reorganizadas |

## Métricas
- **Tempo:** 2.5h | **Erros:** 0 | **Files:** +5 criados, ~3 modificados
- **Testes:** Build ✅ | CRUD API keys ✅ | Auth ✅ | 5 abas ✅
