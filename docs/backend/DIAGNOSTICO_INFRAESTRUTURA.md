# Diagnóstico de Infraestrutura - Hub Contábil

## Problemas Identificados e Correções Aplicadas

### 🔴 CRÍTICO - Arquivos Duplicados
**Problema:** Existem cópias idênticas de controllers, services, configs em:
- `backend/config/` e `backend/src/config/`
- `backend/controllers/` e `backend/src/controllers/`
- `backend/services/` e `backend/src/services/`
- `backend/middlewares/` e `backend/src/middlewares/`
- `backend/routes/` e `backend/src/routes/`

**Impacto:** Dependendo de qual versão é importada, comportamento pode ser diferente. Manutenção dobrada, bugs difíceis de rastrear.

**Solução:** 
- Manter apenas `backend/src/` como fonte verdadeira
- Remover pastas antigas da raiz do `backend/`
- Atualizar imports conforme necessário

---

### 🔴 CRÍTICO - Mongoose Legado
**Arquivo:** `backend/config/db.js`
**Problema:** Ainda referencia MongoDB/Mongoose após migração para Supabase
**Solução:** Remover arquivo completamente

---

### 🔴 ALTO - Migrations SQL sem Modelos Prisma
**Tabelas criadas via SQL mas sem modelo no schema.prisma:**
1. `fiscal_obligations` - Obrigações fiscais recorrentes
2. `holiday_cache` - Cache de feriados
3. `cnpj_cache` - Cache de consultas CNPJ
4. `calendar_events` vs `calendario_eventos` - Schemas diferentes

**Solução:** Adicionar modelos ao schema.prisma OU remover migrations SQL não utilizadas

---

### 🟡 MÉDIO - RLS Policies com Auth Supabase
**Problema:** Migrations criam RLS policies usando `auth.role() = 'authenticated'` mas projeto usa JWT próprio, não Supabase Auth.

**Impacto:** RLS policies podem não funcionar como esperado quando acessadas via `SUPABASE_SERVICE_KEY` (que bypass RLS).

**Solução:**
- Opção 1: Usar Supabase Auth em vez de JWT próprio
- Opção 2: Remover RLS policies e controlar acesso via backend
- Opção 3: Usar `service_role` key consistentemente

---

### 🟡 MÉDIO - Configuração SSL
**Problema:** `sslaccept=accept_invalid_certs` reduz segurança

**Solução:** Para produção, instalar certificados SSL válidos ou usar variável de ambiente `NODE_TLS_REJECT_UNAUTHORIZED=0` apenas em desenvolvimento.

---

### 🟢 BAIXO - Buckets não verificados
**Problema:** Nenhum código verifica se buckets `documentos` e `thumbnails` existem

**Solução:** Criar script de verificação/criação automática de buckets

---

## Status Atual da Infraestrutura

### Banco de Dados
- ✅ **Provider:** Supabase PostgreSQL (us-east-1)
- ✅ **ORM:** Prisma 5.22.0
- ✅ **Conexão:** PgBouncer (porta 6543) para queries, direta (5432) para migrations
- ✅ **SSL:** Configurado com `sslmode=require`
- ⚠️ **Migrations:** 6 aplicadas, mas desalinhadas com schema.prisma

### Armazenamento (Supabase Storage)
- ✅ **Bucket 1:** `documentos` (máx 5MB por arquivo)
- ✅ **Bucket 2:** `thumbnails` (máx 100KB por arquivo)
- ✅ **Wrapper:** Operações upload, download, delete, getPublicUrl, list
- ✅ **Estrutura de paths:** `clientes/{cnpj}/{pasta}/{timestamp}_{nome}.{ext}`
- ⚠️ **Verificação:** Nenhum código verifica existência dos buckets

### Autenticação
- ✅ **Backend:** JWT próprio (jsonwebtoken)
- ✅ **Frontend:** Token armazenizado e enviado via Bearer
- ⚠️ **Supabase Auth:** NÃO utilizado (apesar de RLS policies dependerem disto)

---

## Plano de Ação

### Imediato (Fazer Agora)
1. ✅ Remover arquivos duplicados
2. ✅ Remover db.js com Mongoose
3. ✅ Adicionar modelos Prisma faltando
4. ✅ Criar script de verificação de buckets
5. ✅ Atualizar .env.example

### Curto Prazo (Próxima Semana)
6. Sincronizar migrations SQL com schema.prisma
7. Decidir estratégia de RLS (Supabase Auth vs Auth próprio)
8. Melhorar configuração SSL para produção

### Longo Prazo (Futuro)
9. Migrar para Supabase Auth (opcional)
10. Implementar cache Redis
11. Adicionar monitoramento de banco

---

**Data da Análise:** Abril 2026  
**Versão do Sistema:** 2.0.0
