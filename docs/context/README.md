# Context Files - HubContabil
# Versão: 1.0 | 05/04/2026
# PROPÓSITO: Arquivos compactos de contexto para IA

## O Que São Estes Arquivos

Estes arquivos contêm **conhecimento condensado** do projeto para agentes de IA adquirirem contexto rapidamente (~2-3 min de leitura cada).

## Estrutura

| Arquivo | Conteúdo | Quando Ler |
|---------|----------|------------|
| `backend.md` | Stack, endpoints, auth, logging, RPA, simulador | Antes de trabalhar no backend |
| `frontend.md` | Componentes, rotas, design system, serviços | Antes de trabalhar no frontend |
| `database.md` | Schema, models, relações, índices, RLS | Antes de modificar DB ou queries |
| `errors-solutions.md` | Erros conhecidos, soluções, prevenção | Ao encontrar erros ou debugar |

## Como Usar

1. **Agente inicia trabalho** → Ler `PROJECT_CONTEXT.md` (visão ultra-rápida)
2. **Precisa de contexto técnico** → Ler arquivo(s) de contexto relevante(s)
3. **Detalhes profundos** → Ler documentação completa em `docs/` (sprints, implementations, etc)

## Regras de Atualização

**ESTES ARQUIVOS DEVEM SER ATUALIZADOS SEMPRE QUE:**
- ✅ Novo endpoint criado/alterado
- ✅ Novo model/campo no schema
- ✅ Novo componente/página criada
- ✅ Novo erro encontrado e resolvido
- ✅ Mudança de arquitetura

**NÃO PRECISA ATUALIZAR PARA:**
- ❌ Mudanças de CSS/estilo menores
- ❌ Refatoração interna sem mudança de comportamento
- ❌ Correções de 1-2 linhas

## Formato

- **Compacto:** Máximo 2-3 páginas por arquivo
- **Direto ao ponto:** Sem explicações longas, só fatos técnicos
- **Estruturado:** Tabelas, listas, snippets de código
- **Versionado:** Versão e data no topo para rastreabilidade

## Geração Automática

Estes arquivos SÃO gerados/atualizados como parte do sistema de documentação obrigatória.

**Ao finalizar qualquer trabalho:**
1. Atualizar arquivo(s) de contexto afetado(s)
2. Incrementar seção "Últimas Modificações" no topo
3. Atualizar versão (major.minor)

---

*Arquivos de contexto criados como parte do sistema de documentação obrigatória (COMPORTAMENTO_IA.md v6.0)*
