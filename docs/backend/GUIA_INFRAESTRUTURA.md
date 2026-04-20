# Guia de Infraestrutura - Hub Contábil

## Decisões de Arquitetura e Configuração

### 1. Autenticação e RLS (Row Level Security)

#### Situação Atual
- ✅ **Backend usa JWT próprio** (jsonwebtoken) para autenticação
- ⚠️ **Migrations SQL criam RLS policies** usando `auth.role() = 'authenticated'`
- ⚠️ **Supabase Auth NÃO está sendo utilizado**

#### Impacto
As RLS policies criadas nas migrations **não funcionam como esperado** porque:
1. Policies esperam contexto de autenticação do Supabase (`auth.uid()`, `auth.role()`)
2. Backend usa JWT próprio e se conecta via `SUPABASE_SERVICE_KEY`
3. `SERVICE_KEY` bypass RLS automaticamente (tem acesso total)

#### Opções de Resolução

**Opção A: Manter Auth Próprio (Recomendado para projeto atual)** ✅
- **Prós:** Simples, já funciona, controle total
- **Contras:** RLS policies não são usadas, segurança depende do backend
- **Ação:** Remover RLS policies das migrations OU manter como documentação

**Opção B: Migrar para Supabase Auth**
- **Prós:** RLS funciona nativamente, segurança em múltiplas camadas
- **Contras:** Refatoração significativa do sistema de auth
- **Ação:** Implementar Supabase Auth no frontend e backend

**Decisão:** Manter Opção A (auth próprio). RLS policies podem ser mantidas nas migrations como documentação de intenção, mas não são necessárias para o funcionamento atual.

---

### 2. Configuração SSL para Supabase

#### Situação Atual
```
DATABASE_URL=...&sslmode=require&sslaccept=accept_invalid_certs
DIRECT_URL=...&sslmode=require&sslaccept=accept_invalid_certs
```

#### O que significa
- `sslmode=require`: SSL é obrigatório para conexão
- `sslaccept=accept_invalid_certs`: **Aceita certificados inválidos** (workaround para Windows)

#### Problema
Esta configuração **reduz segurança** ao aceitar certificados SSL inválidos, deixando vulnerável a ataques man-in-the-middle.

#### Soluções

**Para Desenvolvimento (aceitável):**
Manter configuração atual. O problema é conhecido e aceitável em ambiente de desenvolvimento.

**Para Produção (recomendado):**
```
DATABASE_URL=...&sslmode=require&sslrootcert=./certs/supabase-ca.pem
```

**Como obter certificado válido:**
1. Download do CA certificate do Supabase: https://github.com/supabase/supabase/tree/master/docker/volumes/db/certs
2. Colocar em `backend/certs/supabase-ca.pem`
3. Atualizar connectionString para apontar para o certificado

**Alternativa (variável de ambiente):**
```bash
# Apenas em produção com certificados válidos
NODE_TLS_REJECT_UNAUTHORIZED=1
```

#### Decisão
- **Desenvolvimento:** Manter `sslaccept=accept_invalid_certs`
- **Produção:** Instalar certificado CA válido antes de deploy

---

### 3. Estrutura de Banco de Dados

#### Modelos Prisma (16 modelos)
| Modelo | Tabela SQL | Finalidade |
|--------|-----------|------------|
| User | users | Usuários do sistema |
| Client | clients | Empresas clientes |
| CnaeSecundario | client_cnaes_secundarios | CNAEs secundários |
| ClientQsa | client_qsa | Quadro societário |
| Contato | contatos | Contatos múltiplos |
| PastaDocumento | pasta_documentos | Pastas hierárquicas |
| Documento | documentos | Documentos no storage |
| ReciboModelo | recibo_modelos | Modelos de recibos |
| Recibo | recibos | Recibos gerados |
| Template | templates | Templates de documentos |
| TemplateVersao | template_versoes | Versionamento de templates |
| StickyNote | sticky_notes | Notas adesivas |
| CalendarioEvento | calendario_eventos | Eventos do calendário |
| **CnpjCache** | **cnpj_cache** | **Cache de consultas CNPJ** ✅ NOVO |
| **FiscalObligation** | **fiscal_obligations** | **Obrigações fiscais recorrentes** ✅ NOVO |
| **HolidayCache** | **holiday_cache** | **Cache de feriados** ✅ NOVO |

#### Migrations Aplicadas
1. `20260331_create_calendar_tables` - Tabelas de calendário e obrigações
2. `20260331_create_cnpj_cache` - Tabela de cache CNPJ
3. `20260331_insert_obrigacoes_2026` - Dados de obrigações 2026
4. `20260401_add_contatos_table` - Tabela de contatos
5. `20260401_create_recibo_models` - Modelos de recibos
6. `20260403_create_calendario_eventos` - Eventos do calendário

---

### 4. Supabase Storage

#### Buckets Configurados
| Bucket | Público | Limite | Finalidade |
|--------|---------|--------|------------|
| `documentos` | Sim | 5 MB | Documentos contábeis, PDFs, contratos |
| `thumbnails` | Sim | 100 KB | Thumbnails de imagens para preview |

#### Estrutura de Paths
```
documentos/
  clientes/{cnpj}/{pasta}/{timestamp}_{nome}.{ext}
  ged/{timestamp}_{nome}.{ext}
  documentos-gerados/{tipo}_{timestamp}.pdf

thumbnails/
  thumbs/{timestamp}_{nome}.png
```

#### Operações Disponíveis
- `storage.upload(bucket, path, buffer, options)`
- `storage.download(bucket, path)`
- `storage.getPublicUrl(bucket, path)`
- `storage.delete(bucket, paths)`
- `storage.list(bucket, folderPath, options)`

---

### 5. Conexão com Banco de Dados

#### Arquitetura de Conexão
```
┌─────────────────┐
│  Prisma Client  │
└────────┬────────┘
         │
         │ DATABASE_URL (PgBouncer :6543)
         │ Para queries do dia-a-dia
         ▼
┌─────────────────┐
│   PgBouncer     │  Pool de conexões
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   PostgreSQL    │  Supabase (us-east-1)
└─────────────────┘

┌─────────────────┐
│  Prisma Migrate │
└────────┬────────┘
         │
         │ DIRECT_URL (Direta :5432)
         │ Apenas para migrations
         ▼
┌─────────────────┐
│   PostgreSQL    │  Supabase (us-east-1)
└─────────────────┘
```

#### Por que duas URLs?
- **PgBouncer (:6543):** Pool de conexões, eficiente para queries simultâneas
- **Direta (:5432):** Necessária para migrations Prisma (não funciona via PgBouncer)

---

## Verificações de Saúde

### ✅ Checklist de Infraestrutura

- [x] Buckets do Supabase existem e estão acessíveis
- [x] Modelos Prisma sincronizados com tabelas SQL
- [x] Conexão com banco funcionando (SSL configurado)
- [x] Arquivos duplicados removidos
- [x] Mongoose legado removido
- [x] .env.example atualizado com todas as variáveis
- [ ] RLS policies decididas (manter ou remover)
- [ ] SSL para produção resolvido (instalar certificado)

---

## Scripts Úteis

```bash
# Verificar buckets do Supabase
node scripts/check-supabase-buckets.js

# Regenerar cliente Prisma
npm run prisma:generate

# Aplicar migrations
npm run prisma:migrate

# Reset de banco (cuidado: deleta dados!)
npx prisma migrate reset

# Seed de dados iniciais
npm run seed
```

---

## Monitoramento

### Logs
- **Arquivo:** `backend/logs/combined.log` (todos os logs)
- **Erros:** `backend/logs/error.log` (apenas erros)
- **Formato:** JSON estruturado com Winston

### Métricas Importantes
- Tempo de resposta de queries Prisma
- Taxa de acertos do cache CNPJ
- Uso de storage (buckets documentos/thumbnails)
- Número de uploads por dia

---

**Última atualização:** Abril 2026  
**Versão:** 2.0.0
