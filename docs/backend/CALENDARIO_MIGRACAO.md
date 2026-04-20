# Calendário Contábil - Migração para Banco de Dados

## ✅ Implementação Concluída

O calendário contábil foi migrado de arquivos JSON para o banco de dados Supabase PostgreSQL, trazendo mais robustez, flexibilidade e escalabilidade ao sistema.

---

## 📊 O Que Foi Feito

### 1. Novos Modelos Prisma Criados

#### `CalendarioObrigacao`
Tabela para armazenar todas as obrigações contábeis (impostos, declarações, pagamentos, etc).

**Campos:**
- `id` (UUID)
- `ano` (Int)
- `mes` (Int: 1-12)
- `dia` (Int: 1-31)
- `nomeEvento` (String)
- `periodoApuracao` (String?) - Ex: "12/2025"
- `baseLegal` (String?) - Ex: "CLT, art. 459"
- `categoria` (String) - Ex: "Tributário Federal"
- `isFeriado` (Boolean)
- `isPontoFacultativo` (Boolean)
- `createdAt`, `updatedAt`

**Índices:** ano, mes, categoria, isFeriado

#### `CalendarioFeriado`
Tabela para armazenar feriados nacionais, estaduais e municipais.

**Campos:**
- `id` (UUID)
- `data` (DateTime, unique)
- `nome` (String)
- `tipo` (String: nacional/estadual/municipal)
- `municipio` (String?)
- `estado` (String?)
- `ano` (Int)

**Índices:** ano, tipo, data

### 2. Script de Seed Criado

**Arquivo:** `scripts/seed-calendario-contabil.js`

**Funcionalidades:**
- ✅ Lê o arquivo JSON original
- ✅ Faz parse de todos os dados
- ✅ Insere em batch (performance otimizada)
- ✅ Evita duplicatas
- ✅ Permite substituir dados existentes

**Dados populados:**
- 167 obrigações contábeis para 2026
- 14 feriados

### 3. Controller Refatorado

**Arquivo:** `src/controllers/calendarioContabilController.js`

**Antes:**
- Lia arquivo JSON do filesystem
- Path relativo causava bugs
- Sem possibilidade de edição

**Depois:**
- Busca dados do banco via Prisma
- Suporta filtros (ano, mes)
- Retorna dados no formato compatível com frontend
- Adiciona metadata (totais, categorias, anos)

### 4. Novos Endpoints Criados

| Método | Endpoint | Auth | Descrição |
|--------|----------|------|-----------|
| GET | `/api/calendario/contabil` | ❌ | Obter calendário (com filtros opcionais) |
| GET | `/api/calendario/contabil/estatisticas` | ❌ | Estatísticas do calendário |
| POST | `/api/calendario/contabil` | ✅ | Criar nova obrigação |
| PUT | `/api/calendario/contabil/:id` | ✅ | Atualizar obrigação |
| DELETE | `/api/calendario/contabil/:id` | ✅ | Deletar obrigação |

### 5. Documentação Swagger

Todas as rotas estão documentadas no Swagger UI em `/api-docs`.

---

## 🚀 Como Usar

### Seed (Popular dados)

```bash
cd backend
node scripts/seed-calendario-contabil.js
```

### Testar Endpoint

```bash
# Obter calendário completo
curl http://localhost:3000/api/calendario/contabil

# Filtrar por ano
curl http://localhost:3000/api/calendario/contabil?ano=2026

# Filtrar por mês
curl http://localhost:3000/api/calendario/contabil?mes=1

# Estatísticas
curl http://localhost:3000/api/calendario/contabil/estatisticas
```

### Formato da Resposta

```json
{
  "2026": {
    "Janeiro": {
      "15": [
        {
          "eventName": "eSocial (Dez/25)",
          "eventPeriod": "- Período de Apuração: 12/2025",
          "eventBase": "",
          "calendar": "Trabalhista e Previdenciário"
        }
      ]
    }
  },
  "_meta": {
    "totalObrigacoes": 167,
    "totalFeriados": 14,
    "anos": [2026],
    "categorias": ["Tributário Federal", "Trabalhista e Previdenciário", "Feriados", "RH - Recursos Humanos"]
  }
}
```

---

## ✅ Benefícios da Migração

| Benefício | Descrição |
|-----------|-----------|
| **Centralização** | Dados no banco, não dependentes de arquivos |
| **Performance** | Índices otimizam queries |
| **Edição** | Possibilidade de editar via painel admin |
| **Multi-usuário** | Múltiplos anos suportados |
| **Backup** | Backup automático do Supabase |
| **Filtros** | Queries flexíveis (ano, mês, categoria) |
| **Estatísticas** | Métricas em tempo real |
| **Bug Resolvido** | Sem mais problemas de path de arquivo |

---

## 🔄 Próximos Passos (Opcionais)

- [ ] Criar painel admin para editar obrigações
- [ ] Adicionar notificações de vencimento
- [ ] Importar calendários de outros anos
- [ ] Adicionar recorrência automática
- [ ] Exportar para PDF/Excel

---

**Data da Implementação:** Abril 2026  
**Versão:** 2.0.0  
**Status:** ✅ Produ
