# Sprint 6 - Documentos do Cliente

**Data:** 05/04/2026 | **Hora:** 14:00 | **Status:** ✅ Concluída
**Tipo:** Feature

## Objetivo
Implementar tela de documentos por cliente com upload, visualização e organização.

## Implementado
- Upload: input file, upload para backend, progresso, notificação sucesso/erro
- Listagem: documentos do cliente selecionado com nome/data/tipo, ações (visualizar/baixar/excluir)
- Preview: imagens inline, PDF com ícone + download, outros com ícone
- Exclusão: confirmação, remove arquivo físico e do banco

## Arquivos
| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `frontend/src/components/DocumentosCliente.jsx` | Novo | Componente de documentos |
| `backend/src/controllers/documentoController.js` | Novo | CRUD de documentos |
| `backend/models/Documento.js` | Novo | Model Mongoose |

## Métricas
- **Tempo:** 6h | **Erros:** 0 | **Files:** +3 criados
- **Testes:** Build ✅ | Upload ✅ | Listagem ✅ | Preview ✅ | Exclusão ✅
