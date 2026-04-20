# Sprint 5 - Tela de Clientes

**Data:** 05/04/2026 | **Hora:** 14:00 | **Status:** ✅ Concluída
**Tipo:** Feature

## Objetivo
Implementar tela de listagem de clientes com busca, filtros, dropdown de ações e notificações.

## Implementado
- Tabela com colunas: CNPJ, Razão Social/Nome Fantasia, Telefone (nova), Status, Ações (dropdown)
- Dropdown de ações: Visualizar, Editar, Documentos, Recibo, Excluir
- Busca por nome/CNPJ, filtro por status, ordenação
- Toast notifications para cada ação com confirmação de exclusão

## Arquivos
| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `frontend/src/pages/Clientes.jsx` | Novo/Modificado | Listagem de clientes |
| `backend/src/controllers/clientController.js` | Modificado | GET /clientes |

## Métricas
- **Tempo:** 3h | **Erros:** 0 | **Files:** ~2 modificados
- **Testes:** Build ✅ | Listagem ✅ | Busca ✅ | Dropdown ✅ | Toast ✅
