# Sprint 14 - Gerador/Editor de Documentos WYSIWYG

**Data:** 05/04/2026 | **Hora:** 14:00 | **Status:** 🟡 Planejamento
**Tipo:** Feature

## Objetivo
Implementar editor visual de documentos com drag-and-drop, exportação PDF/DOCX client-side, e gestão de templates.

## Planejado
- **Stack:** Craft.js (DnD), dnd-kit (performance), TipTap (rich text), @react-pdf/renderer (PDF), docx-templates (DOCX), react-resizable, uuid
- **Editor:** Canvas Craft.js com nodes arrastáveis, sidebar com blocks (Text, DynamicField, Image, Divider, Spacer), props panel, preview tempo real
- **Placeholders:** Sintaxe `{{campo}}`, mapeamento automático com dados do cliente, clique/arrastar para inserir
- **Exportação PDF:** @react-pdf/renderer, layout A4 300 DPI, download blob
- **Exportação DOCX:** docx-templates, placeholders `+++campo+++`, conversão JSON→.docx
- **Templates:** CRUD backend, 3 templates pré-definidos (recibos), versionamento com `TemplateVersao`
- **Schema Prisma:** `Template` (id, nome, tipo, estrutura JSON, thumbnail, usuarioId, clienteId, isDefault, isPublic) + `TemplateVersao`
- **API:** GET/POST/PUT/DELETE `/api/templates`, POST/GET `/:id/versions`
- 4 semanas planejadas (100-120h), ~1500 linhas

## Arquivos
| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `frontend/src/components/DocumentEditor/` | Planejado | Editor, Sidebar, PropsPanel, blocks |
| `backend/src/controllers/templateController.js` | Planejado | CRUD templates |
| `backend/src/routes/templateRoutes.js` | Planejado | Rotas templates |
| `backend/prisma/schema.prisma` | Planejado | Models Template + TemplateVersao |

## Métricas
- **Tempo estimado:** 100-120h (4 semanas) | **Complexidade:** Alta
- **Arquivos planejados:** ~16 novos, ~5 modificados
