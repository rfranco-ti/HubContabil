# Sprint 52 - Correção Busca CNPJ (Cache vs Fresh)

**Data:** 06 de abril de 2026  
**Status:** ✅ Concluída

---

## 🎯 Objetivo

Corrigir o fluxo de busca de CNPJ para sempre buscar das APIs externas quando o usuário pesquisa, ignorando cache. Cache só deve ser usado como fallback quando as APIs externas falham.

---

## ✅ Implementado

### Backend

**Novo endpoint:** `GET /api/clientes/consulta-fresh/:cnpj`
- Ignora cache completamente
- Busca sempre das APIs externas
- Salva resultado em cache para consultas futuras

**Endpoint existente:** `GET /api/clientes/consulta/:cnpj`
- Usa cache primeiro (5 min memória + 24h DB)
- Se cache miss, busca das APIs externas
- Salva em cache

### Fluxo Corrigido

```
Pesquisa Empresas → consulta-fresh/:cnpj (sempre APIs externas)
  ↓
Salva em cache automaticamente
  ↓
Detalhe da Empresa → consulta/:cnpj (usa cache se disponível)
```

### Arquivos Modificados

| Arquivo | Mudança |
|---------|---------|
| `backend/src/services/cnpj/index.js` | Adicionado método `consultarFresh()` |
| `backend/src/controllers/clientController.js` | Adicionado endpoint `consulta-fresh` |
| `backend/src/routes/clientRoutes.js` | Nova rota `/consulta-fresh/:cnpj` |
| `frontend/src/pages/PesquisaEmpresas.jsx` | Usa `/consulta-fresh` |
| `frontend/src/pages/DetalheEmpresa.jsx` | Usa `/consulta-fresh` |

---

## ✅ Critérios de Aceite

- [x] Busca sempre das APIs externas em pesquisa
- [x] Cache ignorado em busca de empresas
- [x] Build passa sem erros
- [x] Documentação atualizada
