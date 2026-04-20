# Busca por CNAEs - Documentação Técnica

**Criado:** 07/04/2026 | **Sprint:** 49 | **Status:** ✅ Implementado

---

## Arquitetura

```
tabela_cnae_completa.csv (1.325 linhas)
    ↓ scripts/convertCnaeCsv.mjs
frontend/src/data/cnaes.json (~150KB, gzip ~60KB)
    ↓ import estático
hooks/useCnaeFilters.js (lógica pura)
    ↓
pages/BuscaCnaes.jsx (tabela desktop + cards mobile)
```

**Decisão:** Dados estáticos no frontend (client-side). Sem API, sem dependências extras.

## Por que client-side?

| Critério | Client-Side (nosso caso) | API REST |
|----------|-------------------------|----------|
| Payload | ~60KB gzip (único request) | Sob demanda, mas com latência |
| Filtros | CPU do usuário (< 10ms para 1.325 itens) | DB indexado, mas round-trip |
| Atualização | Re-rodar script + deploy | Update no DB |
| Complexidade | Zero backend | Servidor, DB, cache, monitoramento |
| Custo | Zero | Mensal (hosting + DB) |
| Offline | Funciona após 1º load | Requer rede |

**Regra de migração futura:** Se dataset > 5.000 itens OU atualizações diárias OU múltiplos apps consumidores → migrar para API.

## Estrutura de Arquivos

| Arquivo | Função |
|---------|--------|
| `tabela_cnae_completa.csv` | Fonte de dados original (raiz do projeto) |
| `scripts/convertCnaeCsv.mjs` | Script de conversão CSV → JSON com limpeza |
| `frontend/src/data/cnaes.json` | Dados normalizados (gerado pelo script) |
| `frontend/src/hooks/useCnaeFilters.js` | Lógica de filtros, paginação, debounce |
| `frontend/src/pages/BuscaCnaes.jsx` | UI: tabela desktop + cards mobile |

## Filtros Implementados

| Campo | Tipo | Lógica |
|-------|------|--------|
| Busca Global | Texto + debounce 300ms | Código OU Descrição |
| Tipo de Atividade | Multi-select | OR entre selecionados |
| Simples Nacional | Dropdown (Sim/Não/Todos) | AND |
| Anexo Simples | Multi-select (I-VI) | OR entre selecionados |
| Alíquota | Dropdown | AND |
| Precisa Inscrição Estadual | Dropdown (Sim/Não/Todos) | AND |
| Observação IE | Checkbox + busca textual | AND |

**Combinação:** AND entre categorias diferentes, OR dentro de multi-select.

## Otimizações já Aplicadas

| Otimização | Como | Benefício |
|------------|------|-----------|
| **Debounce 300ms** | Busca textual aguarda 300ms | Evita re-filter a cada tecla |
| **useMemo** | Dados filtrados memoizados | Re-render só quando filtros mudam |
| **React.memo** | Linhas e cards memoizados | Evita re-render desnecessário |
| **Paginação** | 20/50/100 por página | DOM leve, scroll rápido |
| **Cards mobile accordion** | Expandir/colapsar por item | Scroll eficiente, sem tabela horizontal |
| **Filtros colapsáveis** | Botão "Filtros" no mobile | Espaço prioritário para busca |
| **Zero dependências** | Usa stack existente | Bundle não cresce |

## Melhorias Futuras (Priorizadas)

### Alta Prioridade (quando necessário)
1. **Virtualização** (`@tanstack/react-virtual`) — Se paginação não for suficiente
2. **URL Sync** — Persistir filtros em `?busca=&tipo=Industria&anexo=I` para bookmark/share
3. **Web Worker** — Se filtro combinado ultrapassar 50ms em dispositivos fracos

### Média Prioridade
4. **Índices invertidos** — `Map<valor, Set<indice>>` para filtros O(1) ao invés de O(N)
5. **Cache de resultados** — LRU cache (`Map`) para combinações frequentes de filtros
6. **PWA/Offline** — Service Worker com stale-while-revalidate para o JSON

### Baixa Prioridade (só se escalar para API)
7. **Abstração DataProvider** — Interface injetável para trocar JSON → API sem refatorar UI
8. **Validação Zod** — Schema validation no boot para detectar CSV corrompido
9. **Versionamento do JSON** — `cnaes-v1.0.json` → `cnaes-v1.1.json` com hash check

## Como Atualizar os Dados

Quando a tabela de CNAEs for atualizada pelo governo:

```bash
# 1. Substituir o CSV atual
cp nova_tabela_cnae.csv tabela_cnae_completa.csv

# 2. Re-rodar conversão
node scripts/convertCnaeCsv.mjs

# 3. Commit + deploy
git add frontend/src/data/cnaes.json
git commit -m "Atualizar CNAEs para versão X"
```

## Segurança

| Aspecto | Status |
|---------|--------|
| Dados públicos (governo) | ✅ Sem risco de vazamento |
| HTTPS obrigatório | ✅ Já configurado no projeto |
| CSP headers | ✅ Já configurado no backend |
| XSS via dados | ✅ Dados sanitizados na conversão (trim, filter) |

## Métricas Atuais

| Métrica | Valor |
|---------|-------|
| CNAEs carregados | 1.325 |
| JSON size (raw) | ~150KB |
| JSON size (gzip) | ~60KB |
| Tempo de filtro estimado | < 10ms |
| Novas dependências | 0 |
| Build size adicional | ~15KB gzip |
