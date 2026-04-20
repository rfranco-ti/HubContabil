# 📦 Plano de Migração: MongoDB → Supabase

## 🎯 Visão Geral

**Objetivo:** Migrar backend do MongoDB Atlas para Supabase (PostgreSQL + Storage) mantendo-se no **Free Tier**.

**Limites Free Tier:**
- Database: 500 MB
- Storage: 1 GB
- Transferência: 5 GB/mês
- Auth users: 50.000/mês

---

## 📅 Cronograma de Implementação

### Fase 1: Setup Inicial (2-3 horas)
- [ ] Criar projeto no Supabase
- [ ] Configurar banco de dados
- [ ] Criar buckets de storage
- [ ] Instalar dependências no backend

### Fase 2: Backend - Models e Database (4-5 horas)
- [ ] Configurar Prisma ORM
- [ ] Criar schema.prisma
- [ ] Gerar migrations
- [ ] Implementar 4 models principais

### Fase 3: Backend - Controllers (5-6 horas)
- [ ] Adaptar authController (JWT → Supabase Auth ou manter JWT)
- [ ] Adaptar clientController (Mongoose → Prisma)
- [ ] Adaptar documentoController (Mongoose → Prisma + Storage)
- [ ] Adaptar gedController (upload para Supabase Storage)

### Fase 4: Frontend (2-3 horas)
- [ ] Atualizar chamadas de API (se necessário)
- [ ] Implementar upload com compressão otimizada
- [ ] Adicionar feedback de limite de storage

### Fase 5: Migração de Dados (2-3 horas)
- [ ] Script de migração MongoDB → PostgreSQL
- [ ] Upload de arquivos para Supabase Storage
- [ ] Validação de dados migrados

### Fase 6: Testes e Deploy (3-4 horas)
- [ ] Testes de integração
- [ ] Testes de upload/download
- [ ] Deploy em produção
- [ ] Monitoramento de uso

**Total Estimado:** 18-24 horas

---

## 🛠️ Stack Tecnológico

### Atual
```
MongoDB Atlas → Mongoose → Node.js → Express
Arquivos: uploads/ (local)
```

### Novo
```
Supabase PostgreSQL → Prisma ORM → Node.js → Express
Arquivos: Supabase Storage (buckets: documentos, thumbnails)
```

---

## 📦 Dependências Necessárias

### Instalar (backend)
```bash
npm install @supabase/supabase-js @prisma/client sharp
npm install -D prisma
npx prisma init
```

### Manter
```
bcryptjs, jsonwebtoken, multer, dotenv, express, cors
```

### Remover
```
mongoose, multer (substituir por upload direto)
```

---

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais

| Tabela | Colunas | Relacionamentos |
|--------|---------|-----------------|
| `users` | 7 | - |
| `clients` | 30 | `usuario_responsavel_id` → users |
| `client_cnaes_secundarios` | 5 | `client_id` → clients (cascade) |
| `client_qsa` | 6 | `client_id` → clients (cascade) |
| `pasta_documentos` | 8 | `client_id` → clients, `pasta_pai_id` → auto |
| `documentos` | 16 | `client_id` → clients, `pasta_id` → pastas |

### Otimizações Implementadas

1. **Campos fixos** ao invés de nested objects (menor overhead)
2. **JSONB** apenas para dados variáveis (senhas_portais)
3. **Tabelas separadas** para arrays (CNAEs, QSA)
4. **Indexes** em todas as colunas de busca
5. **Triggers** para updated_at automático
6. **Views** para dashboard (performance)

---

## 📁 Estratégia de Storage

### Buckets Supabase

```
🗂️ Supabase Storage
├─ documentos/          (bucket público)
│  └─ {client_id}/
│     └─ {uuid}_{filename}
└─ thumbnails/          (bucket público)
   └─ {client_id}/
      └─ {uuid}_{filename}
```

### Política de Compressão

| Tipo | Ação | Tamanho Max | Economia Esperada |
|------|------|-------------|-------------------|
| **PNG/JPG** | Compress + resize | 2 MB | 60-80% |
| **PDF** | Otimizar (remover metadados) | 5 MB | 30-50% |
| **DOC/DOCX** | Manter original | 5 MB | 0% |
| **Thumbnail** | Resize 150x150 | 50 KB | 90%+ |

### Limites por Cliente

```javascript
const LIMITES = {
  MAX_ARQUIVOS_POR_CLIENTE: 50,
  MAX_TAMANHO_ARQUIVO: 5 * 1024 * 1024, // 5MB
  MAX_TAMANHO_TOTAL_CLIENTE: 50 * 1024 * 1024, // 50MB
  THUMBNAIL_QUALIDADE: 0.7,
  IMAGE_QUALITY: 0.8
};
```

### Fluxo de Upload Otimizado

```
1. Upload → Backend (multer memory storage)
2. Compressão (Sharp para imagens, pdf-lib para PDFs)
3. Upload Supabase Storage (documentos/)
4. Gerar thumbnail (Sharp)
5. Upload Supabase Storage (thumbnails/)
6. Salvar metadados no PostgreSQL
7. Deletar da memória
```

---

## 🔐 Autenticação

### Opção Escolhida: Manter JWT Atual

**Motivo:** Migração mais simples, sem dependência do Supabase Auth.

**Implementação:**
```javascript
// Manter estrutura atual
const gerarToken = (id) => jwt.sign({ id }, JWT_SECRET, { expiresIn: '30d' });

// Middleware protect continua igual
const protect = async (req, res, next) => {
  // Verifica token JWT
  // Busca user no PostgreSQL via Prisma
};
```

**Vantagens:**
- Menos mudanças no frontend
- Controle total do auth
- Fácil migração para Supabase Auth depois

---

## 📝 Mudanças no Código

### Backend

#### 1. Configuração do Database
```javascript
// config/database.js (novo)
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = prisma;
```

#### 2. Models (exemplo: Client)
```javascript
// Antes (Mongoose)
const Client = mongoose.model('Client', ClientSchema);
const clients = await Client.find({});

// Depois (Prisma)
const clients = await prisma.client.findMany({});
```

#### 3. Controllers (exemplo: authController)
```javascript
// Antes
const user = await User.findOne({ email });
if (user && await user.matchPassword(senha)) { ... }

// Depois
const user = await prisma.user.findUnique({ where: { email } });
if (user && await bcrypt.compare(senha, user.senha)) { ... }
```

#### 4. Upload de Documentos
```javascript
// Antes (multer local)
const upload = multer({ dest: 'uploads/' });
fs.save('uploads/' + filename);

// Depois (Supabase Storage)
const { data, error } = await supabase
  .storage
  .from('documentos')
  .upload(`${clientId}/${filename}`, fileBuffer);
```

### Frontend

#### Mudanças Mínimas Necessárias

**API Client (services/api.js)**
```javascript
// Manter mesma estrutura
// Apenas URLs podem mudar levemente
```

#### Novas Funcionalidades

**Feedback de Storage**
```jsx
// Adicionar em componentes de upload
const [storageInfo, setStorageInfo] = useState({
  usado: 0,
  total: 50 * 1024 * 1024, // 50MB por cliente
  percentual: 0
});
```

---

## 🔄 Script de Migração de Dados

### Estrutura do Script

```javascript
// scripts/migrateToSupabase.js
// 1. Conectar MongoDB
// 2. Conectar Supabase (Prisma)
// 3. Migrar users
// 4. Migrar clients (com nested → tables separadas)
// 5. Migrar pastas
// 6. Migrar documentos (upload files para Storage)
// 7. Validar migração
// 8. Backup MongoDB (opcional)
```

### Validação Pós-Migração

```sql
-- Contar registros
SELECT 'users' as tabela, COUNT(*) FROM users
UNION ALL SELECT 'clients', COUNT(*) FROM clients
UNION ALL SELECT 'documentos', COUNT(*) FROM documentos;

-- Verificar integridade
SELECT c.razao_social, COUNT(d.id) as docs
FROM clients c
LEFT JOIN documentos d ON d.client_id = c.id
GROUP BY c.id;
```

---

## 🧪 Testes

### Checklist de Testes

- [ ] Login de usuário
- [ ] CRUD de clientes completo
- [ ] Upload de documento (imagem, PDF, Word)
- [ ] Download de documento
- [ ] Visualização de thumbnail
- [ ] OCR de documento
- [ ] Criação de pastas
- [ ] Mover documento entre pastas
- [ ] Excluir cliente (cascade)
- [ ] Relatórios do dashboard

---

## 🚀 Deploy

### Variáveis de Ambiente (.env)

```env
# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_KEY=eyJxxx...

# Database (via Supabase)
DATABASE_URL=postgresql://postgres.xxxxx:password@aws-0-region.pooler.supabase.com:6543/postgres

# Auth (manter)
JWT_SECRET=sua_chave_secreta

# Storage
STORAGE_BUCKET_DOCUMENTOS=documentos
STORAGE_BUCKET_THUMBNAILS=thumbnails
```

### Passos de Deploy

1. Deploy backend (Railway, Render, Heroku, etc.)
2. Configurar variáveis de ambiente
3. Rodar migrations: `npx prisma migrate deploy`
4. Iniciar servidor

---

## 📊 Monitoramento de Uso (Free Tier)

### Queries de Monitoramento

```sql
-- Tamanho do banco
SELECT pg_size_pretty(pg_database_size(current_database()));

-- Storage usado por bucket
SELECT bucket_id, SUM(metadata->>'size')::bigint as total_bytes
FROM storage.objects
GROUP BY bucket_id;

-- Top 10 clientes por storage
SELECT c.razao_social, SUM(d.tamanho_bytes) as total_bytes
FROM clients c
JOIN documentos d ON d.client_id = c.id
GROUP BY c.id
ORDER BY total_bytes DESC
LIMIT 10;
```

### Alertas

| Métrica | Alerta em | Ação |
|---------|-----------|------|
| DB Size | 400 MB (80%) | Limpar dados antigos |
| Storage | 800 MB (80%) | Comprimir mais |
| Transferência | 4 GB (80%) | Otimizar CDN |

---

## 💰 Custos e Escalabilidade

### Free Tier (Atual)
- ✅ 500 MB DB
- ✅ 1 GB Storage
- ✅ 5 GB transferência/mês
- ✅ 50k auth users/mês

### Quando Fazer Upgrade?

| Gargalo | Plano Pro | Custo/mês |
|---------|-----------|-----------|
| DB > 500MB | 8 GB | ~$25 USD |
| Storage > 1GB | 100 GB | ~$25 USD |
| Ambos | Combo | ~$50 USD |

### Migração para PostgreSQL Local

**Quando:** Custos ficarem proibitivos ou necessidade de controle total.

**Como:**
```bash
# Backup do Supabase
pg_dump -h aws-0-region.pooler.supabase.com -U postgres > backup.sql

# Restore local
psql -h localhost -U postgres -d hubcontabil < backup.sql
```

**Tempo estimado:** 1-2 horas

---

## ⚠️ Riscos e Mitigações

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| Perda de dados | Alto | Backup MongoDB antes |
| Downtime | Médio | Fazer migração em horário não comercial |
| Bugs na migração | Alto | Testes extensivos em staging |
| Estouro do free tier | Baixo | Monitoramento constante |
| Performance | Médio | Indexes otimizados |

---

## 📚 Documentação de Referência

- [Supabase Docs](https://supabase.com/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Supabase Storage](https://supabase.com/docs/guides/storage)
- [Sharp Docs](https://sharp.pixelplumbing.com/)

---

## ✅ Checklist Final de Migração

### Pré-Migração
- [ ] Backup completo do MongoDB
- [ ] Projeto Supabase criado
- [ ] Schema SQL aplicado
- [ ] Dependências instaladas
- [ ] .env configurado

### Migração
- [ ] Users migrados
- [ ] Clients migrados
- [ ] Documentos migrados (files + DB)
- [ ] Validação concluída

### Pós-Migração
- [ ] Todos testes passando
- [ ] Frontend funcionando
- [ ] Monitoramento configurado
- [ ] Backup MongoDB arquivado
- [ ] Documentação atualizada

---

## 🎯 Próximos Passos Imediatos

1. **Criar projeto no Supabase** (10 min)
2. **Aplicar schema SQL** (5 min)
3. **Instalar Prisma** (10 min)
4. **Configurar .env** (5 min)
5. **Reescrever models** (2-3 horas)
6. **Adaptar controllers** (3-4 horas)
7. **Testar** (2-3 horas)

**Tempo total para MVP:** 8-10 horas

---

**Ready to migrate? 🚀**
