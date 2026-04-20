# Database Schema - HubContabil

**Version:** 1.0 | **Updated:** 05/04/2026 | **Purpose:** Complete Prisma schema reference

---

## Database Info
- **Type:** PostgreSQL (Supabase)
- **ORM:** Prisma
- **RLS:** Enabled (Row Level Security)
- **Migrations:** `backend/prisma/migrations/`

---

## Models

### User
**Purpose:** System users with authentication
```prisma
id          String    @id @default(cuid())
nome        String
email       String    @unique
senha       String    // bcrypt hash
cargo       String    @default("Contador")  // "Administrador", "Contador", "Auxiliar", "Estagiario"
createdAt   DateTime  @default(now())
updatedAt   DateTime  @updatedAt

// Relations
clientes          Client[]
eventos           CalendarioEvento[]
documentos        Documento[]
stickyNotes       StickyNote[]
templates         Template[]
recibos           Recibo[]
agendamentosRpa   AgendamentoRpa[]
notificacoes      Notificacao[]
```

### Client
**Purpose:** Company clients with CNPJ
```prisma
id               String    @id @default(cuid())
cnpj             String    @unique  // 14 digits
razaoSocial      String
nomeFantasia     String?
regimeTributario String    // "Simples Nacional", "Lucro Presumido", "Lucro Real"
status           String    @default("Ativo")  // "Ativo", "Inativo", "Suspenso"
createdAt        DateTime  @default(now())
updatedAt        DateTime  @updatedAt

// Relations
usuarioId    String  // FK to User (optional, client ownership)
documentos   Documento[]
pastas       PastaDocumento[]
contatos     Contato[]
recibos      Recibo[]
templates    Template[]
cnaes        CnaeSecundario[]
qsa          Qsa[]
```

### CalendarioObrigacao
**Purpose:** Tax obligations + deadlines (167 records for 2026)
```prisma
id               String   @id @default(cuid())
ano              Int
mes              Int
dia              Int
nomeEvento       String
periodoApuracao  String?  // "Mensal", "Trimestral", "Anual"
baseLegal        String?  // Legal reference
categoria        String   // "Federal", "Estadual", "Municipal", "Trabalhista"
isFeriado        Boolean  @default(false)
isPontoFacultativo Boolean @default(false)

@@index([ano, mes, categoria])
```

### CalendarioEvento
**Purpose:** User-created calendar events
```prisma
id         String   @id @default(cuid())
usuarioId  String   // FK to User (CASCADE DELETE)
titulo     String
data       DateTime
tipoId     String   // FK to TipoEvento
ufId       String?  // State code (SP, RJ, etc)
municipio  String?  // City name
cor        String?  // Hex color
lembrete   Boolean  @default(false)

@@index([usuarioId, data])
```

### TipoEvento
**Purpose:** Event types (6 protected defaults)
```prisma
id          String   @id @default(cuid())
nome        String   @unique  // "trabalhista", "tributario", "feriado", "datas_comemorativas", "lembrete", "tarefa"
descricao   String?
cor         String   // Hex color
ehPadrao    Boolean  @default(false)  // true = protected from deletion
```

### CalendarioFeriado
**Purpose:** Geographic holidays
```prisma
id            String   @id @default(cuid())
nome          String
data          DateTime
abrangencia   String   // "NACIONAL", "ESTADUAL", "MUNICIPAL"
uf            String?  // Required if ESTADUAL
municipio     String?  // Required if MUNICIPAL
recorrente    Boolean  @default(true)  // Repeats yearly
setorAfetado  String[] // Affected sectors

@@index([abrangencia, uf, municipio])
```

### Notificacao
**Purpose:** User notifications
```prisma
id          String    @id @default(cuid())
usuarioId   String    // FK to User
titulo      String
mensagem    String
tipoAlerta  String    // "UM_DIA_ANTE", "NO_DIA"
lida        Boolean   @default(false)
expiresAt   DateTime  // UM_DIA_ANTE: 48h, NO_DIA: 24h
createdAt   DateTime  @default(now())

// Auto-cleanup: lidas > 7 dias deleted by cron
```

### Documento
**Purpose:** Uploaded documents with OCR
```prisma
id            String   @id @default(cuid())
clientId      String   // FK to Client (CASCADE DELETE)
nomeOriginal  String
storagePath   String   // Supabase Storage path
mimetype      String
tamanhoBytes  Int
pastaId       String?  // FK to PastaDocumento (optional)
ocrRealizado  Boolean  @default(false)

@@index([clientId])
```

### PastaDocumento
**Purpose:** Document folder organization
```prisma
id        String   @id @default(cuid())
clientId  String   // FK to Client
nome      String
paiId     String?  // Self-ref for sub-folders

@@index([clientId])
```

### Contato
**Purpose:** Client contacts
```prisma
id        String   @id @default(cuid())
clientId  String   // FK to Client
nome      String
email     String?
telefone  String?
cargo     String?
```

### CnaeSecundario
**Purpose:** Client secondary CNAE codes
```prisma
id        String   @id @default(cuid())
clientId  String   // FK to Client
codigo    String
descricao String
```

### Qsa
**Purpose:** Client partners (Quadro de Sócios)
```prisma
id        String   @id @default(cuid())
clientId  String   // FK to Client
nome      String
qualificacao String?
```

### Recibo
**Purpose:** Fee receipts
```prisma
id         String   @id @default(cuid())
usuarioId  String   // FK to User
clienteId  String?  // FK to Client (optional)
modeloId   String?  // FK to ReciboModelo
tipo       String
dados      Json     // Receipt data
pdfUrl     String?  // Supabase Storage URL
valor      Decimal
status     String   // "Gerado", "Enviado", "Pago"
createdAt  DateTime @default(now())
```

### StickyNote
**Purpose:** Sticky notes mural
```prisma
id         String   @id @default(cuid())
usuarioId  String   // FK to User
titulo     String
conteudo   String
cor        String   // Hex color
tamanho    String   // "S", "M", "L"
ordem      Int      @default(0)
posicaoX   Int
posicaoY   Int
createdAt  DateTime @default(now())
updatedAt  DateTime @updatedAt
```

### ApiKey
**Purpose:** External API keys
```prisma
id               String    @id @default(cuid())
nome             String
keyHash          String    // SHA-256 hash
keyPrefix        String    // First 12 chars for display
permissoes       Json      // Array: ["read:clientes", "write:clientes", ...]
ativa            Boolean   @default(true)
expiresAt        DateTime?
ultimaUtilizacao DateTime?
totalRequisicoes Int       @default(0)
createdAt        DateTime  @default(now())
```

### AgendamentoRpa
**Purpose:** RPA job scheduling
```prisma
id               String    @id @default(cuid())
usuarioId        String    // FK to User
tipoRobo         String    // "SIMPLES_NACIONAL", "SEFAZ_BA"
cnpj             String
recorrencia      String    // "unica", "diaria", "semanal", "mensal", "x_vezes_dia", "x_vezes_semana"
diasSemana       Int?      // Bitmask (0-6)
horaExecucao     String    // HH:MM format
proximaExecucao  DateTime?
execucoesCount   Int       @default(0)
ativo            Boolean   @default(true)
createdAt        DateTime  @default(now())
```

---

## Relations Diagram

```
User 1→N Client
User 1→N CalendarioEvento (CASCADE DELETE)
User 1→N Documento
User 1→N StickyNote
User 1→N Template
User 1→N Recibo
User 1→N AgendamentoRpa
User 1→N Notificacao

Client 1→N Documento (CASCADE DELETE)
Client 1→N PastaDocumento
Client 1→N Contato
Client 1→N Recibo
Client 1→N Template
Client 1→N CnaeSecundario
Client 1→N Qsa

TipoEvento 1→N CalendarioEvento
CalendarioFeriado (standalone, seeded)
Notificacao N→1 User
```

---

## Important Indexes

| Model | Fields | Purpose |
|-------|--------|---------|
| User | email (unique) | Auth lookup |
| Client | cnpj (unique) | Client identification |
| Client | razaoSocial | Search |
| Client | status | Filter |
| CalendarioObrigacao | (ano, mes, categoria) | Calendar queries |
| CalendarioEvento | (usuarioId, data) | User events |
| Documento | clientId | Client documents |
| CalendarioFeriado | (abrangencia, uf, municipio) | Geographic filtering |

---

## RLS Policies

| Resource | Policy |
|----------|--------|
| CalendarioEvento | User só vê seus próprios eventos |
| StickyNote | User só vê suas próprias notas |
| Client | Isolamento por usuário/escritório |
| Documento | Restrito por cliente + usuário |

---

## Seeds

| File | Data |
|------|------|
| `seed-tipos-evento.js` | 6 tipos padrão (ehPadrao=true) |
| `seed-feriados-2026.js` | 36+ feriados nacionais/estaduais/municipais |
| `seed-obrigacoes-2026.js` | 167 obrigações contábeis 2026 |

---

## Migration Commands

```bash
# Generate migration after schema changes
cd backend
npx prisma migrate dev --name description

# Apply migrations
npx prisma migrate deploy

# Reset (dev only)
npx prisma migrate reset

# Regenerate Prisma Client
npx prisma generate
```

---

*Part of docs/context/ system. For compact reference, see `context/database.md`*
