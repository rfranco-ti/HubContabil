# Sprint 51 - Refatoração Completa API CNPJ (Adapter Pattern)

**Data:** 06 de abril de 2026  
**Status:** ✅ Concluída

---

## 🎯 Objetivo

Refatorar completamente a camada de APIs de CNPJ usando **Adapter Pattern**, **Circuit Breaker**, **Retry com Backoff** e **Cache em camadas** para máxima resiliência e facilidade de manutenção.

---

## ✅ Implementado

### 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│                    CnpjService (Facade)                  │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │              Orchestrator Service                │  │
│  │                                                  │  │
│  │  1. Cache em memória (5 min)                    │  │
│  │  2. Cache em banco (24h)                        │  │
│  │  3. Tentar APIs em ordem com Circuit Breaker   │  │
│  │  4. Normalizar dados via Adapters              │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
│  ┌─────────────┐ ┌──────────┐ ┌─────────────┐         │
│  │ BrasilAPI   │ │  Cnpja   │ │MinhaReceita │         │
│  │ (principal) │ │ (fallback│ │  (fallback  │         │
│  │             │ │    1)    │ │     2)      │         │
│  └─────────────┘ └──────────┘ └─────────────┘         │
└─────────────────────────────────────────────────────────┘
```

### 📂 Estrutura de Arquivos

```
backend/src/services/cnpj/
├── index.js                 # CnpjService (Facade)
├── CircuitBreaker.js        # Circuit Breaker pattern
├── Retry.js                 # Retry com backoff exponencial
├── Cache.js                 # Cache em memória + banco
└── adapters/
    ├── BaseAdapter.js       # Classe base
    ├── BrasilApiAdapter.js  # Adapter BrasilAPI
    ├── CnpjaAdapter.js      # Adapter Cnpja
    ├── MinhaReceitaAdapter.js
    └── OpenCnpjAdapter.js
```

### 🔌 APIs Configuradas (Ordem de Prioridade)

| # | API | URL | Timeout | Circuit Breaker |
|---|-----|-----|---------|-----------------|
| 1 | **BrasilAPI** | `brasilapi.com.br/api/cnpj/v1/{cnpj}` | 8s | 3 falhas / 30s |
| 2 | **Cnpja** | `open.cnpja.com/office/{cnpj}` | 5s | 5 falhas / 60s |
| 3 | **Minha Receita** | `minhareceita.org/{cnpj}` | 5s | 5 falhas / 60s |
| 4 | **OpenCNPJ** | `opencnpj.cloud/v1/cnpj/{cnpj}` | 5s | 5 falhas / 60s |

### 💾 Cache em Camadas

| Camada | TTL | Descrição |
|--------|-----|-----------|
| **Memória (Map)** | 5 min | Cache ultra-rápido para requisições recentes |
| **Banco (PostgreSQL)** | 24h | Cache persistente |

### 🔄 Fluxo de Consulta

```
1. Validar CNPJ (14 dígitos)
2. Verificar cache em memória (5 min TTL)
3. Verificar cache em banco (24h TTL)
4. Tentar BrasilAPI (3 retries, backoff exponencial)
5. Se falhar → Cnpja (3 retries)
6. Se falhar → Minha Receita (3 retries)
7. Se falhar → OpenCNPJ (3 retries)
8. Se tudo falhar → Erro: "APIs indisponíveis"
```

### 📊 Schema Normalizado

Todas as APIs retornam o mesmo formato normalizado:

```json
{
  "cnpj": "12345678000199",
  "razaoSocial": "EMPRESA EXEMPLO LTDA",
  "nomeFantasia": "EXEMPLO",
  "dataAbertura": "2020-01-15",
  "naturezaJuridica": "206-2 - Sociedade Empresária Limitada",
  "cnaePrincipal": {
    "codigo": "1234",
    "descricao": "Descrição do CNAE"
  },
  "endereco": {
    "logradouro": "RUA EXEMPLO",
    "numero": "123",
    "complemento": "SALA 1",
    "bairro": "CENTRO",
    "municipio": "SÃO PAULO",
    "uf": "SP",
    "cep": "01001000"
  },
  "situacao": {
    "codigo": 2,
    "descricao": "ATIVA",
    "data": "2020-01-15"
  },
  "capitalSocial": 100000,
  "porte": "ME"
}
```

---

## 📂 Arquivos Criados

| Arquivo | Descrição |
|---------|-----------|
| `cnpj/CircuitBreaker.js` | Circuit Breaker pattern genérico |
| `cnpj/Retry.js` | Retry com backoff exponencial + jitter |
| `cnpj/Cache.js` | Cache em memória + banco |
| `cnpj/adapters/BaseAdapter.js` | Classe base para adapters |
| `cnpj/adapters/BrasilApiAdapter.js` | Adapter BrasilAPI |
| `cnpj/adapters/CnpjaAdapter.js` | Adapter Cnpja |
| `cnpj/adapters/MinhaReceitaAdapter.js` | Adapter Minha Receita |
| `cnpj/adapters/OpenCnpjAdapter.js` | Adapter OpenCNPJ |
| `cnpj/index.js` | CnpjService (Facade) |
| `hooks/useCnpj.js` | Hook React para consulta CNPJ |

---

## 🛡️ Circuit Breaker

### Estados

```
CLOSED → OPEN → HALF-OPEN → CLOSED
```

### Configuração por API

| API | Threshold | Timeout |
|-----|-----------|---------|
| BrasilAPI | 3 falhas | 30s |
| Cnpja | 5 falhas | 60s |
| Minha Receita | 5 falhas | 60s |
| OpenCNPJ | 5 falhas | 60s |

---

## ⚡ Retry com Backoff

```javascript
// Tentativas: 3
// Delay: 500ms → 1s → 2s (backoff exponencial)
// Jitter: + aleatório até 100ms (evita thundering herd)
```

---

## ✅ Critérios de Aceite

- [x] Adapter pattern implementado
- [x] Circuit Breaker por API
- [x] Retry com backoff exponencial
- [x] Cache em memória (5 min)
- [x] Cache em banco (24h)
- [x] Dados normalizados (mesmo schema para todas APIs)
- [x] Hook useCnpj no frontend
- [x] Build passa sem erros
- [x] API funcionando e retornando dados

---

## 📊 Resultado do Teste

```json
{
  "success": true,
  "data": {
    "cnpj": "34509314000136",
    "razaoSocial": "JOPAN COMERCIAL DE ALIMENTOS LTDA",
    "naturezaJuridica": "Sociedade Empresária Limitada",
    "capitalSocial": 150000,
    "porte": "Microempresa",
    "apiUsed": "cache",
    "fromCache": true
  }
}
```

---

## 🎯 Benefícios

1. **Resiliência:** Se uma API falha, outra assume automaticamente
2. **Performance:** Cache em memória reduz chamadas externas
3. **Manutenibilidade:** Adicionar nova API = criar um adapter
4. **Observabilidade:** Logs de qual API foi usada, circuit breaker stats
5. **Desacoplamento:** Frontend não sabe qual API foi usada
6. **Normalização:** Frontend sempre recebe o mesmo formato
