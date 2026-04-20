# Sprint 1 - Migração para Supabase

**Data:** 05/04/2026 | **Hora:** 14:00 | **Status:** ✅ Concluída
**Tipo:** Refactor

## Objetivo
Migrar banco de dados de MongoDB para PostgreSQL (Supabase) com Prisma ORM e implementar cache de CNPJ.

## Implementado
- Schema PostgreSQL: 8 tabelas no Supabase — `users`, `clients` (30 colunas), `contatos`, `client_cnaes_secundarios`, `client_qsa`, `pasta_documentos`, `documentos`, `cnpj_cache`
- Prisma ORM configurado: 8 models inter-relacionados, índices para performance, cascade delete, UUID support
- Cache de CNPJ: `cnpjCacheService.js` com TTL 24h no PostgreSQL, chave = CNPJ limpo (apenas números)
- Fallback de APIs: primário `open.cnpja.com` (grátis), fallback `invertexto.com` (pago), troca automática em erro

## Arquivos
| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `backend/config/prisma.js` | Novo | PrismaClient com SSL |
| `backend/config/supabase.js` | Novo | Cliente Supabase + helpers |
| `backend/prisma/schema.prisma` | Novo | 8 models Prisma |
| `backend/supabase/schema.sql` | Novo | Schema PostgreSQL completo |
| `backend/services/cnpjCacheService.js` | Novo | Cache 24h |
| `backend/services/cnpjService.js` | Novo | Fallback de APIs |
| `backend/.env` | Modificado | Credenciais Supabase |

## Métricas
- **Tempo:** 6h | **Erros:** 0 | **Files:** +6 criados, ~1 modificado
- **Testes:** Conexão Supabase ✅ | Migration ✅ | Cache ✅ | Fallback ✅ | CRUD ✅
