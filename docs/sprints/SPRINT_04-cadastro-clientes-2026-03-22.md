# Sprint 4 - Cadastro de Clientes

**Data:** 05/04/2026 | **Hora:** 14:00 | **Status:** ✅ Concluída
**Tipo:** Feature

## Objetivo
Implementar cadastro de clientes com auto-preenchimento via CNPJ, múltiplos contatos e QSO dinâmico.

## Implementado
- Auto-preenchimento CNPJ: busca automática ao digitar, fallback múltiplas APIs, cache 24h
- Múltiplos contatos: adicionar/remover, marcar principal, campos nome/email/telefone/cargo
- QSO dinâmico: adicionar/remover sócios, campos nome/CPF-CNPJ/qualificação/participação
- Campos adicionais: NIRE, Situação SEFAZ, Regime tributário, Honorários
- UI/UX: toast notifications (sem alerts), validações tempo real, máscaras de input, loading states

## Arquivos
| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `frontend/src/pages/NovoCliente.jsx` | Novo | Formulário de cadastro |
| `backend/src/controllers/clientController.js` | Modificado | CRUD com Prisma |
| `backend/src/services/cnpjService.js` | Novo | Fallback de APIs |
| `frontend/utils/masks.js` | Novo | Máscaras de input |

## Métricas
- **Tempo:** 6h | **Erros:** 0 | **Files:** +4 criados, ~1 modificado
- **Testes:** Build ✅ | CNPJ auto ✅ | Contatos ✅ | QSO ✅ | Validações ✅
