# 🚀 Guia Passo a Passo: Configuração e Migração para Supabase

## 📋 Pré-requisitos

- [ ] Conta no Supabase (crie em https://supabase.com)
- [ ] Node.js instalado
- [ ] MongoDB com dados (opcional, para migração)

---

## 🔹 Passo 1: Criar Projeto no Supabase (5 min)

1. Acesse https://supabase.com e faça login
2. Clique em **"New Project"**
3. Preencha:
   - **Name:** `hub-contabil` (ou outro)
   - **Database Password:** (guarde em local seguro!)
   - **Region:** Escolha a mais próxima (us-east-1 para Brasil)
4. Clique em **"Create new project"**

⏳ Aguarde 2-5 minutos enquanto o projeto é criado.

---

## 🔹 Passo 2: Configurar Database (5 min)

### 2.1 Obter Connection String

1. No dashboard do Supabase, vá em **Settings** (engrenagem)
2. Clique em **Database**
3. Em **Connection string**, selecione **URI**
4. Copie a string (parecida com):
   ```
   postgresql://postgres.xxxxx:password@aws-0-region.pooler.supabase.com:6543/postgres
   ```

### 2.2 Aplicar Schema SQL

1. No dashboard, vá em **SQL Editor** (menu lateral)
2. Clique em **"New query"**
3. Copie e cole o conteúdo de `backend/supabase/schema.sql`
4. Clique em **"Run"** ou pressione `Ctrl+Enter`

✅ Verifique se apareceu "Success. No rows returned"

### 2.3 Habilitar UUID Extension (se não habilitado)

No SQL Editor, rode:
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

---

## 🔹 Passo 3: Criar Buckets de Storage (3 min)

1. No dashboard, vá em **Storage** (menu lateral)
2. Clique em **"New bucket"**
3. Crie o bucket **documentos**:
   - **Name:** `documentos`
   - **Public:** ✅ Sim
   - **File size limit:** `5242880` (5MB)
4. Repita para o bucket **thumbnails**:
   - **Name:** `thumbnails`
   - **Public:** ✅ Sim
   - **File size limit:** `102400` (100KB)

### 3.1 Configurar Políticas de Storage

Para o bucket **documentos**:

1. Clique no bucket `documentos`
2. Vá em **Policies**
3. Clique em **"New policy"**
4. Selecione **"For full customization"**
5. Cole:
```sql
-- INSERT: usuários autenticados
CREATE POLICY "Usuarios autenticados podem upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documentos');

-- SELECT: público
CREATE POLICY "Publico pode visualizar"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'documentos');

-- DELETE: apenas quem fez upload (ou admin)
CREATE POLICY "Usuarios podem deletar proprios arquivos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'documentos');
```

Repita para o bucket **thumbnails** (mude `bucket_id = 'thumbnails'`).

---

## 🔹 Passo 4: Obter Credenciais da API (2 min)

1. No dashboard, vá em **Settings** > **API**
2. Copie:
   - **Project URL:** `https://xxxxx.supabase.co`
   - **anon/public key:** `eyJhbG...` (começa com eyJhbG)
   - **service_role key:** `eyJhbG...` (chave secreta, não compartilhe!)

---

## 🔹 Passo 5: Configurar Backend (5 min)

### 5.1 Instalar Dependências

No terminal, na pasta `backend`:

```bash
npm install @supabase/supabase-js @prisma/client sharp
npm install -D prisma
npx prisma init
```

### 5.2 Substituir schema.prisma

O arquivo `prisma/schema.prisma` já foi criado. Apenas verifique se existe.

### 5.3 Configurar .env

Edite `backend/.env` e adicione:

```env
# ========== SUPABASE ==========
SUPABASE_URL=https://SEU_PROJETO.supabase.co
SUPABASE_ANON_KEY=eyJhbG... (anon key)
SUPABASE_SERVICE_KEY=eyJhbG... (service_role key)

# ========== DATABASE (Supabase PostgreSQL) ==========
DATABASE_URL=postgresql://postgres.xxxxx:SENHA@aws-0-region.pooler.supabase.com:6543/postgres?connection_limit=1

# ========== AUTH (manter JWT) ==========
JWT_SECRET=sua_chave_secreta_mudar_depois

# ========== STORAGE ==========
STORAGE_BUCKET_DOCUMENTOS=documentos
STORAGE_BUCKET_THUMBNAILS=thumbnails

# ========== MONGODB (apenas para migração) ==========
MONGODB_URI=mongodb+srv://user:pass@database.ttvwjit.mongodb.net/hubcontabil?retryWrites=true&w=majority
```

### 5.4 Gerar Prisma Client

```bash
npx prisma generate
```

### 5.5 Aplicar Migrations (opcional)

Se quiser usar Prisma Migrate:

```bash
npx prisma migrate dev --name init
```

Ou use o schema SQL direto (já aplicado no Passo 2).

---

## 🔹 Passo 6: Migrar Dados do MongoDB (10-30 min)

### 6.1 Verificar Conexões

Teste MongoDB:
```bash
node -e "require('mongoose').connect(process.env.MONGODB_URI).then(() => console.log('✅ MongoDB OK')).catch(console.error)"
```

Teste Supabase:
```bash
node -e "const { PrismaClient } = require('@prisma/client'); new PrismaClient().\$connect().then(() => console.log('✅ Supabase OK'))"
```

### 6.2 Rodar Script de Migração

```bash
node scripts/migrateToSupabase.js
```

Acompanhe o output:
```
🚀 Iniciando migração MongoDB → Supabase

📦 Conectando ao MongoDB...
✅ MongoDB conectado!

🔗 Testando conexão com Supabase...
✅ Supabase conectado!

👥 Migrando usuários...
  ✅ admin@hubcontabil.com
   Total: 1 migrados, 0 erros

🏢 Migrando clientes...
  ✅ Empresa Exemplo LTDA
   Total: 1 migrados, 0 erros

📁 Migrando pastas de documentos...
   Total: 0 migradas, 0 erros

📄 Migrando documentos e arquivos...
  ✅ contrato_social.pdf (245.3 KB)
   Total: 1 migrados, 0 erros, 0 pulados
   Storage: 1 uploads, 0 falhas, 0.24 MB usados
```

### 6.3 Validar Migração

No SQL Editor do Supabase:
```sql
-- Contar registros
SELECT 'users' as tabela, COUNT(*) FROM users
UNION ALL SELECT 'clients', COUNT(*) FROM clients
UNION ALL SELECT 'documentos', COUNT(*) FROM documentos;
```

---

## 🔹 Passo 7: Atualizar Código do Backend

### 7.1 Atualizar index.js

Edite `backend/index.js`:

```javascript
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

// Remover: const connectDB = require('./config/connectDB');
// Remover: connectDB();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ... resto do código
```

### 7.2 Atualizar controllers

Substitua Mongoose por Prisma em todos os controllers.

**Exemplo: clientController.js**

```javascript
const prisma = require('../config/prisma');

// Antes: const Client = require('../models/Client');
// Antes: const clientes = await Client.find({});

// Depois:
const clientes = await prisma.client.findMany({
  orderBy: { razaoSocial: 'asc' }
});
```

### 7.3 Atualizar upload (gedController.js)

```javascript
const { storage } = require('../config/supabase');

// Upload para Supabase Storage
const { data, error } = await storage.upload(
  'documentos',
  `${clienteId}/${filename}`,
  fileBuffer
);
```

---

## 🔹 Passo 8: Testar Localmente (10 min)

### 8.1 Iniciar Backend

```bash
npm run dev
```

### 8.2 Testar Endpoints

```bash
# Testar API
curl http://localhost:3000/api/clientes

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hubcontabil.com","senha":"admin123"}'
```

### 8.3 Testar Frontend

```bash
cd ../frontend
npm run dev
```

Acesse http://localhost:5173 e faça login.

---

## 🔹 Passo 9: Deploy em Produção

### 9.1 Escolher Plataforma

Recomendações:
- **Railway** (fácil, gratuito inicialmente)
- **Render** (free tier)
- **Heroku** (pago, mas confiável)

### 9.2 Configurar Variáveis de Ambiente

No painel da plataforma de deploy, adicione todas as variáveis do `.env`.

### 9.3 Deploy

```bash
# Exemplo Railway
railway up

# Exemplo Render
# Conectar repositório GitHub e deploy automático
```

---

## 🔹 Passo 10: Monitoramento

### 10.1 Dashboard do Supabase

Acesse regularmente:
- **Database:** Rows read/written, size
- **Storage:** Usage, bandwidth
- **API:** Requests, errors

### 10.2 Queries de Monitoramento

```sql
-- Tamanho do banco
SELECT pg_size_pretty(pg_database_size(current_database()));

-- Storage por bucket
SELECT bucket_id, COUNT(*) as files, SUM(metadata->>'size')::bigint / 1024 / 1024 as size_mb
FROM storage.objects
GROUP BY bucket_id;

-- Top 5 clientes por documentos
SELECT c.razao_social, COUNT(d.id) as docs, SUM(d.tamanho_bytes) / 1024 / 1024 as size_mb
FROM clients c
JOIN documentos d ON d.client_id = c.id
GROUP BY c.id
ORDER BY docs DESC
LIMIT 5;
```

---

## ✅ Checklist Final

- [ ] Projeto Supabase criado
- [ ] Schema SQL aplicado
- [ ] Buckets de storage criados
- [ ] .env configurado
- [ ] Prisma instalado e gerado
- [ ] Migração executada
- [ ] Controllers atualizados
- [ ] Testes locais passando
- [ ] Deploy em produção
- [ ] Monitoramento configurado

---

## 🆘 Solução de Problemas

### Erro: "Can't reach database server"

- Verifique DATABASE_URL no .env
- No Supabase: Settings > Database > Connection string
- Verifique se o IP está liberado (Settings > Database > Connection pooling)

### Erro: "relation does not exist"

- Schema SQL não foi aplicado
- Rode o schema.sql no SQL Editor

### Erro: "Bucket not found"

- Crie os buckets no Storage
- Verifique nomes no .env

### Erro: "Prisma Client not generated"

```bash
npx prisma generate
```

### Migração travando em arquivos

- Verifique se arquivos existem em `uploads/`
- Aumente timeout se arquivos forem grandes

---

## 📚 Links Úteis

- [Supabase Dashboard](https://app.supabase.com)
- [Prisma Docs](https://www.prisma.io/docs)
- [Supabase Storage Docs](https://supabase.com/docs/guides/storage)

---

**Tempo total estimado:** 45-60 minutos

**Dúvidas? Consulte a documentação ou abra uma issue!**
