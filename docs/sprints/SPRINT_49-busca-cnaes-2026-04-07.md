# Sprint 49 - Busca por CNAEs

**Data:** 07/04/2026 | **Hora:** 15:00 | **Status:** ✅ | **Tipo:** Feature

## Objetivo

Criar página "Busca por CNAEs" na seção Ferramentas: tabela interativa com todos os 1.328 CNAEs, filtros avançados por todos os campos, busca textual, paginação e exportação.

## Análise do Dataset

| Campo | Tipo | Valores Únicos | Observação |
|-------|------|----------------|------------|
| Código CNAE | string | ~1.328 | Formato `XXXX-X/XX` |
| Descrição | string | ~1.328 | Livre, busca textual |
| Tipo Atividade | string | 3-4 | Indústria, Comércio, Serviços, etc. |
| Simples Nacional | string | Sim/Não/"" | Boolean-like |
| Anexo Simples | string | I-VI, "", "II-III", etc. | Multi-select com valores compostos |
| Alíquota | string | ~40 valores | "4%", "4,5%", "6%", "10% a 19,5%", etc. |
| Precisa IE | string | Sim/Não/"" | Boolean-like |
| Observação IE | string | ~50 valores | Livre, busca textual |

**Tamanho do arquivo:** 1.328 linhas — pequeno o suficiente para **client-side completo** (sem necessidade de API).

## Abordagem: CSV → JSON embutido

| Opção | Prós | Contras |
|-------|------|---------|
| **CSV → JSON embutido** | Zero custo, zero latência, offline, sem dependência de API | Bundle +150KB (gzip ~60KB) |
| **API REST** | Flexível, cacheável | Custo de server, latência, manutenção extra |
| **API + CSV importado** | Flexível, mas sem dados novos | Complexidade desnecessária para dados estáticos |

**Decisão:** Converter CSV para JSON + importar no frontend. Dados são **estáticos** (CNAEs não mudam frequentemente). Se houver atualização, basta re-rodar a conversão e fazer deploy.

## Arquitetura

```
frontend/
├── src/
│   ├── data/
│   │   └── cnaes.json              ← Dados convertidos do CSV
│   ├── pages/
│   │   └── BuscaCnaes.jsx          ← Página principal
│   ├── hooks/
│   │   └── useCnaeFilters.js       ← Lógica de filtros + URL sync
│   └── components/
│       └── CnaeTable/
│           ├── CnaeFilterBar.jsx   ← Barra de filtros
│           ├── CnaeTableRow.jsx    ← Linha memoizada
│           └── CnaePagination.jsx  ← Paginação
```

## Stack Utilizada

| Camada | Tecnologia | Justificativa |
|--------|-----------|---------------|
| Framework | React 18 (já no projeto) | Reaprove estrutura existente |
| Roteamento | react-router-dom (já existe) | `/ferramentas/busca-cnaes` |
| Estilização | Tailwind CSS (já existe) | Dark mode automático |
| Estado URL | URLSearchParams nativo | Sem dependência extra |
| Paginação | Client-side simples | 1.328 registros = trivial |
| Debounce | `setTimeout` manual | Sem dependência extra |

**Sem novas dependências.** Tudo usa o que já existe no projeto.

## Filtros Implementados

| Campo | Tipo de Filtro | Comportamento |
|-------|----------------|---------------|
| **Busca Global** | Campo texto + debounce 300ms | Busca em Código + Descrição |
| **Código CNAE** | Campo texto | Match parcial (ex: `0111` encontra `0111-3/01`) |
| **Descrição** | Campo texto | `includes` case-insensitive, debounce 300ms |
| **Tipo Atividade** | Multi-select | Indústria, Comércio, Serviços (OR lógico) |
| **Simples Nacional** | Dropdown | Sim, Não, Todos |
| **Anexo Simples** | Multi-select | I, II, III, IV, V, VI (OR lógico) |
| **Alíquota** | Dropdown | Todas as faixas encontradas no CSV |
| **Precisa IE** | Dropdown | Sim, Não, Todos |
| **Observação IE** | Checkbox + busca | "Apenas com observação" + campo texto |

### Lógica de Combinação
```
(BuscaGlobal OR (Código match AND Descrição match))
AND (Tipo IN [selecionados] OR todos)
AND (Simples == selecionado OR todos)
AND (Anexo IN [selecionados] OR todos)
AND (Alíquota == selecionada OR todas)
AND (IE == selecionada OR todas)
AND (Obs preenchida == true OU campo vazio)
```

## Conversão CSV → JSON

Script em `scripts/convertCnaeCsv.mjs`:
```js
// Lê tabela_cnae_completa.csv
// Gera frontend/src/data/cnaes.json
// Normaliza: trim, lower, mapeia valores vazios para ""
// Ordena por código
```

JSON gerado:
```json
[
  {
    "codigo": "0111-3/01",
    "descricao": "Cultivo de arroz",
    "tipo": "",
    "simples": "Sim",
    "anexo": "I",
    "aliquota": "4%",
    "precisaIE": "Sim",
    "observacaoIE": ""
  }
]
```

## Interface

### Layout Desktop
```
┌─────────────────────────────────────────────────────────────┐
│ 🔍 Busca por CNAEs                                          │
│ Pesquise CNAEs por código, descrição ou atividade econômica │
├─────────────────────────────────────────────────────────────┤
│ [🔍 Buscar por código ou descrição...]                      │
│                                                             │
│ Filtros:                                                    │
│ [Tipo ▾] [Simples ▾] [Anexo ▾] [Alíquota ▾] [IE ▾] [Obs ✓] │
│                                                             │
│ Mostrando 42 de 1.328 CNAEs     [Limpar Filtros] [Exportar]│
├─────────────────────────────────────────────────────────────┤
│ Código      │ Descrição                    │ Tipo │ ...    │
│ 0111-3/01   │ Cultivo de arroz             │      │ ...    │
│ 0111-3/02   │ Cultivo de milho             │      │ ...    │
│ ...         │ ...                          │ ...  │ ...    │
├─────────────────────────────────────────────────────────────┤
│ ◀  1  2  3  4  5  ...  133  ▶                              │
└─────────────────────────────────────────────────────────────┘
```

### Layout Mobile
- Filtros em drawer/botão "Filtros" (colapsável)
- Tabela com scroll horizontal
- Busca sempre visível no topo

## Páginas e Rotas

| Rota | Arquivo | Descrição |
|------|---------|-----------|
| `/ferramentas/busca-cnaes` | `pages/BuscaCnaes.jsx` | Tabela completa |

### Menu (menuConfig.js)
```js
{ text: "Busca CNAEs", icon: List, path: "/ferramentas/busca-cnaes" }
```

## Tarefas da Sprint

| # | Tarefa | Arquivo | Detalhe |
|---|--------|---------|---------|
| 1 | Script de conversão CSV → JSON | `scripts/convertCnaeCsv.mjs` | Lê CSV, gera JSON normalizado |
| 2 | Gerar JSON no `src/data/` | `frontend/src/data/cnaes.json` | ~1.328 itens, ~150KB |
| 3 | Hook `useCnaeFilters.js` | `frontend/src/hooks/useCnaeFilters.js` | Estado, filtros, URL sync |
| 4 | Página `BuscaCnaes.jsx` | `frontend/src/pages/BuscaCnaes.jsx` | Layout, busca, filtros, tabela, paginação |
| 5 | Menu config | `frontend/src/data/menuConfig.js` | Adicionar item em Ferramentas |
| 6 | Rota no App.jsx | `frontend/src/App.jsx` | `/ferramentas/busca-cnaes` |
| 7 | Build + teste | - | Verificar compilação e funcionalidade |

## Estimativa

| Métrica | Valor |
|---------|-------|
| Tempo | ~1-2h (dados simples, sem API externa) |
| Linhas de código | ~400-500 (JSX + lógica) |
| Arquivos novos | 4 (JSON, hook, página, script) |
| Arquivos modificados | 3 (menu, App.jsx, talvez utils) |
| Novas dependências | 0 (usa stack existente) |

## Métricas de Qualidade

- [ ] Tabela carrega em < 1s (1.328 registros client-side)
- [ ] Busca responde em < 300ms (debounce)
- [ ] Todos os 8 campos com filtro funcional
- [ ] Paginação: 20/50/100 por página
- [ ] Contador "Exibindo X de Y resultados"
- [ ] Botão "Limpar Filtros"
- [ ] Exportação CSV (com filtros aplicados)
- [ ] Responsivo mobile
- [ ] Dark mode
- [ ] Build sem erros

## Riscos & Mitigações

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| Valores inconsistentes no CSV | Filtros quebram | Normalização na conversão (trim, mapeamento) |
| Arquivo JSON muito grande | Bundle inchado | 1.328 registros = ~150KB (gzip ~60KB) → aceitável |
| Filtros lentos | UX ruim | Client-side com Array.filter em 1.328 itens = < 10ms |
| Mobile ruim | Abandono | Filtros colapsáveis + scroll horizontal na tabela |
