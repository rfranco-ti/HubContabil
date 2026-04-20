# Sprint 30/31 - Embed Fortes + Extração Dados Obrigações

**Data:** 05/04/2026 | **Hora:** 14:00 | **Status:** ✅ Concluída
**Tipo:** Feature

## Objetivo
Embed do calendário Fortes via iframe e extrair dados da TaxGroup para gerar JSON com obrigações fiscais.

## Implementado
- Tabs na página `/calendario`: "Meu Calendário" (FullCalendar) + "Obrigações Fiscais" (iframe Fortes)
- iframe Fortes: URL `fortestecnologia.com.br`, altura 800px, sandbox `allow-scripts allow-same-origin allow-popups`, link "Abrir em nova aba" como fallback
- Dados extraídos TaxGroup: Março 2026 (8 obrigações), Abril 2026 (7 obrigações + 8 declarações)
- JSON estruturado em `obrigacoes2026.json`: meses com obrigações (data, titulo, descricao, tipo fiscal/dp, tags), declarações separadas

## Arquivos
| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `frontend/src/pages/Calendario.jsx` | Modificado | Tabs + embed Fortes |
| `frontend/src/data/obrigacoes2026.json` | Novo | Dados extraídos TaxGroup |

## Métricas
- **Tempo:** 1h | **Erros:** 1 (JSX structure) | **Files:** +1 criado, ~1 modificado
- **Testes:** Build ✅ | iframe ✅ | Tabs ✅
