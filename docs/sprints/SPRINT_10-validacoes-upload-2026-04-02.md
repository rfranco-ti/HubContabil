# Sprint 10 - Validações de Upload

**Data:** 31/03/2026 | **Hora:** 14:00 | **Status:** ✅ Concluída
**Tipo:** Feature

## Objetivo
Implementar validações de upload: limites, tamanhos, tipos e preview de PDFs.

## Implementado
- Limite máximo: 20 arquivos (constante `MAX_FILES = 20`)
- Validação tamanho: 10MB máximo (`MAX_FILE_SIZE = 10 * 1024 * 1024`)
- Validação tipos: `application/pdf`, `image/png`, `image/jpeg`, `application/msword`, `.docx`
- Preview PDFs: ícone vermelho para PDFs, grid responsivo, remoção individual
- Cleanup automático: `useEffect` cleanup com `URL.revokeObjectURL` para imagePreviews e pdfPreviews no unmount

## Arquivos
| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `frontend/src/components/DocumentosCliente.jsx` | Modificado | +100 linhas validações, cleanup unmount |

## Métricas
- **Tempo:** 2.5h | **Erros:** 0 | **Files:** 1 modificado
- **Testes:** 20 files ✅ | 10MB ✅ | PDF ✅ | EXE rejeitado ✅ | Cleanup ✅
