# 📋 Planejamento: API Fallback + Cache

## 🎯 Visão Geral

Implementar sistema de resiliência para consultas de CNPJ com múltiplas APIs e cache de resultados.

---

## 🏗️ Arquitetura Proposta

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend                             │
│  (Consulta CNPJ)                                        │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Backend - CNPJ Service                     │
│  ┌─────────────────────────────────────────────────┐   │
│  │              1. Cache Layer                      │   │
│  │  - Verifica se já existe em cache               │   │
│  │  - Retorna se válido (TTL: 24h)                 │   │
│  └────────────────────┬────────────────────────────┘   │
│                       │ (cache miss)                    │
│                       ▼                                 │
│  ┌─────────────────────────────────────────────────┐   │
│  │            2. Primary API                        │   │
│  │  - open.cnpja.com/office/{cnpj}                 │   │
│  │  - Timeout: 10s                                 │   │
│  │  - Retry: 2x                                    │   │
│  └────────────────────┬────────────────────────────┘   │
│                       │ (falha)                         │
│                       ▼                                 │
│  ┌─────────────────────────────────────────────────┐   │
│  │            3. Fallback API                       │   │
│  │  - bff.cnpja.com/search?query={cnpj}            │   │
│  │  - Timeout: 15s                                 │   │
│  │  - Retry: 1x                                    │   │
│  └────────────────────┬────────────────────────────┘   │
│                       │ (sucesso)                       │
│                       ▼                                 │
│  ┌─────────────────────────────────────────────────┐   │
│  │            4. Update Cache                       │   │
│  │  - Salva resultado                              │   │
│  │  - Define TTL                                   │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Supabase PostgreSQL                        │
│  - Tabela: cnpj_cache                                  │
│  - Campos: cnpj, dados, created_at, expires_at         │
└─────────────────────────────────────────────────────────┘
```

---

## 📅 Fases de Implementação

### Fase 1: Cache Simples (2-3 horas)
**Complexidade:** Baixa  
**Impacto:** Alto (reduz chamadas repetidas)

#### 1.1 Criar Tabela de Cache
```sql
CREATE TABLE cnpj_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cnpj VARCHAR(14) UNIQUE NOT NULL,
  dados JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX idx_cnpj_cache_cnpj ON cnpj_cache(cnpj);
CREATE INDEX idx_cnpj_cache_expires ON cnpj_cache(expires_at);
```

#### 1.2 Service de Cache
```javascript
// backend/services/cnpjCacheService.js
const prisma = require('../config/prisma');

const CACHE_TTL_HOURS = 24;

async function get(cnpj) {
  const cached = await prisma.cnpjCache.findUnique({
    where: { cnpj },
  });
  
  if (!cached) return null;
  
  // Verifica se expirou
  if (new Date() > cached.expiresAt) {
    await prisma.cnpjCache.delete({ where: { cnpj } });
    return null;
  }
  
  return cached.dados;
}

async function set(cnpj, dados) {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + CACHE_TTL_HOURS);
  
  await prisma.cnpjCache.upsert({
    where: { cnpj },
    update: { dados, expiresAt },
    create: { cnpj, dados, expiresAt },
  });
}

module.exports = { get, set };
```

#### 1.3 Integrar no Controller
```javascript
// backend/controllers/clientController.js
const cnpjCache = require('../services/cnpjCacheService');

const consultarCnpjApi = async (req, res) => {
  const { cnpj } = req.params;
  
  // Tenta cache primeiro
  const cached = await cnpjCache.get(cnpj);
  if (cached) {
    return res.json({ ...cached, fromCache: true });
  }
  
  // Consulta API
  const response = await fetch(`https://open.cnpja.com/office/${cnpj}`);
  const data = await response.json();
  
  // Salva no cache
  await cnpjCache.set(cnpj, data);
  
  return res.json(data);
};
```

---

### Fase 2: API Fallback (3-4 horas)
**Complexidade:** Média  
**Impacto:** Alto (mais confiabilidade)

#### 2.1 Service com Fallback
```javascript
// backend/services/cnpjService.js
const cnpjCache = require('./cnpjCacheService');

class CnpjService {
  async consultar(cnpj) {
    const cleanCnpj = cnpj.replace(/\D/g, '');
    
    // 1. Cache
    const cached = await cnpjCache.get(cleanCnpj);
    if (cached) {
      console.log(`[CNPJ] Cache hit: ${cleanCnpj}`);
      return { ...cached, fromCache: true };
    }
    
    console.log(`[CNPJ] Cache miss: ${cleanCnpj}`);
    
    // 2. Primary API
    try {
      console.log(`[CNPJ] Tentando API primária...`);
      const data = await this._consultarOpenCnpja(cleanCnpj);
      await cnpjCache.set(cleanCnpj, data);
      return data;
    } catch (error) {
      console.log(`[CNPJ] API primária falhou: ${error.message}`);
    }
    
    // 3. Fallback API
    try {
      console.log(`[CNPJ] Tentando API fallback...`);
      const data = await this._consultarBffCnpja(cleanCnpj);
      await cnpjCache.set(cleanCnpj, data);
      return data;
    } catch (error) {
      console.log(`[CNPJ] API fallback falhou: ${error.message}`);
    }
    
    throw new Error('Todas as APIs de CNPJ falharam');
  }
  
  async _consultarOpenCnpja(cnpj) {
    const response = await fetch(`https://open.cnpja.com/office/${cnpj}`, {
      signal: AbortSignal.timeout(10000), // 10s timeout
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    return await response.json();
  }
  
  async _consultarBffCnpja(cnpj) {
    const response = await fetch(`https://bff.cnpja.com/search?query=${cnpj}`, {
      signal: AbortSignal.timeout(15000), // 15s timeout
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    
    // Transforma formato do fallback para formato padrão
    return this._transformarBffData(data);
  }
  
  _transformarBffData(data) {
    // Transforma dados do bff.cnpja.com para formato compatível
    return {
      company: {
        name: data.office?.company?.name,
        taxId: data.office?.taxId,
      },
      // ... mapear outros campos
    };
  }
}

module.exports = new CnpjService();
```

---

### Fase 3: Monitoramento e Logs (1-2 horas)
**Complexidade:** Baixa  
**Impacto:** Médio (visibilidade)

#### 3.1 Logs de Uso de APIs
```javascript
// backend/services/cnpjService.js
async function logApiUsage(cnpj, api, success, duration) {
  await prisma.cnpjApiLog.create({
    data: {
      cnpj,
      api, // 'open_cnpja' ou 'bff_cnpja'
      success,
      durationMs: duration,
      timestamp: new Date(),
    },
  });
}
```

#### 3.2 Dashboard de Usage
```sql
-- Queries para monitoramento
-- APIs mais usadas
SELECT api, COUNT(*) as total, 
       AVG(duration_ms) as avg_duration
FROM cnpj_api_logs
GROUP BY api;

-- Cache hit rate
SELECT 
  COUNT(*) FILTER (WHERE from_cache = true) as cache_hits,
  COUNT(*) FILTER (WHERE from_cache = false) as cache_misses,
  COUNT(*) FILTER (WHERE from_cache = true)::float / COUNT(*) * 100 as hit_rate_percent
FROM consultas_cnpj;
```

---

### Fase 4: Rate Limiting (1 hora)
**Complexidade:** Baixa  
**Impacto:** Médio (evita bloqueios)

```javascript
// backend/middlewares/rateLimit.js
const rateLimit = require('express-rate-limit');

const cnpjLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 10, // 10 requisições por minuto por IP
  message: {
    error: 'Muitas requisições de CNPJ. Aguarde um momento.'
  },
  keyGenerator: (req) => {
    return req.ip; // ou req.user?.id se autenticado
  }
});

module.exports = cnpjLimiter;

// Uso:
// app.use('/api/clientes/consulta/:cnpj', cnpjLimiter);
```

---

## 📊 Tabela de APIs

| API | Tipo | Limite | Custo | Confiabilidade |
|-----|------|--------|-------|----------------|
| **open.cnpja.com** | Primária | ~60/min | Free | Alta |
| **bff.cnpja.com** | Fallback | ~30/min | Free | Média |
| **Receita WS** | Futuro | Ilimitado | Pago | Alta |

---

## 🗄️ Schema do Banco (Cache + Logs)

```sql
-- Cache de CNPJ
CREATE TABLE cnpj_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cnpj VARCHAR(14) UNIQUE NOT NULL,
  dados JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX idx_cnpj_cache_cnpj ON cnpj_cache(cnpj);
CREATE INDEX idx_cnpj_cache_expires ON cnpj_cache(expires_at);

-- Logs de consultas
CREATE TABLE cnpj_api_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cnpj VARCHAR(14) NOT NULL,
  api VARCHAR(50) NOT NULL, -- 'open_cnpja', 'bff_cnpja'
  success BOOLEAN NOT NULL,
  duration_ms INTEGER,
  error_message TEXT,
  from_cache BOOLEAN DEFAULT false,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_cnpj_logs_cnpj ON cnpj_api_logs(cnpj);
CREATE INDEX idx_cnpj_logs_timestamp ON cnpj_api_logs(timestamp);
CREATE INDEX idx_cnpj_logs_api ON cnpj_api_logs(api);
```

---

## 🧪 Testes

### Teste de Cache
```javascript
test('Deve retornar dados do cache', async () => {
  // Setup
  await cnpjCache.set('34509314000136', { test: 'data' });
  
  // Test
  const result = await cnpjService.consultar('34509314000136');
  
  // Assert
  expect(result.fromCache).toBe(true);
  expect(result.test).toBe('data');
});
```

### Teste de Fallback
```javascript
test('Deve usar fallback quando primária falhar', async () => {
  // Mock da API primária para falhar
  jest.spyOn(global, 'fetch').mockImplementationOnce(() => {
    throw new Error('API down');
  });
  
  // Mock da API fallback para sucesso
  jest.spyOn(global, 'fetch').mockImplementationOnce(() => {
    return Promise.resolve({ json: () => Promise.resolve({ data: 'fallback' }) });
  });
  
  const result = await cnpjService.consultar('34509314000136');
  expect(result.data).toBe('fallback');
});
```

---

## 📈 Métricas de Sucesso

| Métrica | Antes | Depois (Meta) |
|---------|-------|---------------|
| Cache Hit Rate | 0% | 60-80% |
| API Success Rate | 85% | 98%+ |
| Avg Response Time | 3-5s | 1-2s (cache) |
| API Calls/Dia | 1000 | 200-400 (cache) |

---

## 🚀 Cronograma

| Fase | Tempo | Prioridade |
|------|-------|------------|
| **Fase 1: Cache** | 2-3h | 🔴 Alta |
| **Fase 2: Fallback** | 3-4h | 🔴 Alta |
| **Fase 3: Monitoramento** | 1-2h | 🟡 Média |
| **Fase 4: Rate Limit** | 1h | 🟡 Média |

**Total:** 7-10 horas

---

## 📚 Próximos Passos Imediatos

1. **Criar migrations** do cache e logs
2. **Implementar cnpjCacheService**
3. **Implementar cnpjService** com fallback
4. **Atualizar controllers** para usar novo service
5. **Testar** com APIs reais
6. **Monitorar** métricas

---

**Status:** 📋 Planejamento completo - Pronto para implementação
