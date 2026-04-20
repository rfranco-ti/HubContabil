# Sprint 50 - Refatoração API CNPJ

**Data:** 06 de abril de 2026  
**Status:** ✅ Concluída

---

## 🎯 Objetivo

Refatorar o serviço de consulta de CNPJ com arquitetura resiliente usando Circuit Breaker, Retry e fallback automático entre múltiplas APIs.

---

## ✅ Implementado

### Backend - `cnpjService.js`

**Padrão Circuit Breaker:**
- Desativa API após 3-5 falhas consecutivas
- Reativa após timeout (60-120 segundos)
- Previne chamadas desnecessárias a APIs indisponíveis

**Retry com Backoff Exponencial:**
- Tentativas: 3 por API
- Delay: 500ms → 1s → 2s
- Timeout por API: Minha Receita (5s), OpenCNPJ (5s), BrasilAPI (8s)

**Fallback entre APIs:**
```
1. Minha Receita (minhareceita.org) - Open source, estável
2. OpenCNPJ (opencnpj.cloud) - Gratuita
3. BrasilAPI (brasilapi.com.br) - Fallback
```

**Cache em Camadas:**
- Cache de banco de dados (24 horas)
- Retorna dados em cache se todas as APIs falharem

### Frontend - Hook `useCnpj`

```javascript
const { data, loading, error, apiUsed, consultar, reset } = useCnpj();
```

**Features:**
- Estados: `data`, `loading`, `error`, `apiUsed`
- Validação de CNPJ (14 dígitos)
- Mensagens de erro claras
- Retry automático via hook

---

## 📊 APIs Configuradas

| API | URL | Timeout | Threshold | Status |
|-----|-----|---------|-----------|--------|
| **Minha Receita** | `minhareceita.org/{cnpj}` | 5s | 5 falhas | ✅ Principal |
| **OpenCNPJ** | `opencnpj.cloud/v1/cnpj/{cnpj}` | 5s | 5 falhas | ✅ Fallback 1 |
| **BrasilAPI** | `brasilapi.com.br/api/cnpj/v1/{cnpj}` | 8s | 3 falhas | ✅ Fallback 2 |

---

## 🛡️ Circuit Breaker

```
Estado Fechado → Normal, API sendo usada
Estado Aberto → API desativada temporariamente
Estado Meio-Aberto → Testando se API voltou
```

### Configuração por API

| API | Threshold | Timeout |
|-----|-----------|---------|
| Minha Receita | 5 falhas | 60s |
| OpenCNPJ | 5 falhas | 60s |
| BrasilAPI | 3 falhas | 120s |

---

## 🔄 Fluxo de Consulta

```
1. Validar CNPJ (14 dígitos)
2. Verificar cache local (banco de dados, TTL: 24h)
3. Tentar Minha Receita (3 retries com backoff)
4. Se falhar → OpenCNPJ (3 retries)
5. Se falhar → BrasilAPI (3 retries)
6. Se tudo falhar → Erro: "APIs indisponíveis"
```

---

## 📂 Arquivos Modificados

| Arquivo | Mudança |
|---------|---------|
| `cnpjService.js` | Circuit breaker, retry, fallback, timeout |
| `hooks/useCnpj.js` | Hook customizado para consulta |
| `DetalheEmpresa.jsx` | Uso do hook, validação, feedback |

---

## ✅ Critérios de Aceite

- [x] Circuit breaker implementado
- [x] Retry com backoff exponencial
- [x] Timeout por API
- [x] Fallback automático entre APIs
- [x] Cache local (24 horas)
- [x] Hook useCnpj criado
- [x] Validação de CNPJ no frontend
- [x] Mensagens de erro claras
- [x] Build passa sem erros
