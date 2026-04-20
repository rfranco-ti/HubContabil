# API Reference - HubContabil

**Version:** 1.0 | **Updated:** 05/04/2026 | **Purpose:** Complete API endpoint reference

---

## Base Info
- **Base URL:** `http://localhost:3000/api`
- **Auth:** JWT Bearer token (localStorage, 30 days)
- **Docs:** Swagger at `http://localhost:3000/api-docs`
- **Error format:** `{ success: false, error, message, code }`

---

## Auth

### POST /api/auth/login
**Purpose:** User authentication
```json
// Request
{ "email": "admin@hubcontabil.com", "senha": "123456" }

// Response
{ "success": true, "data": { "token": "jwt...", "user": { "id", "nome", "email", "cargo" } } }
```

### POST /api/auth/register
**Purpose:** User registration
```json
// Request
{ "nome": "João", "email": "joao@email.com", "senha": "123456", "cargo": "Contador" }

// Response
{ "success": true, "data": { "id", "nome", "email", "cargo" } }
```

---

## Clientes

### GET /api/clientes
**Purpose:** List clients with pagination + search
```
Query: ?page=1&limit=10&search=empresa&status=Ativo
Response: { success: true, data: { clientes, total, page, pages } }
```

### POST /api/clientes
**Purpose:** Create client (auto-fetch CNPJ data)
```json
// Request
{ "cnpj": "12345678000190" }  // Auto-fetches from open.cnpja.com

// Response
{ "success": true, "data": { client, cnaes, qsa } }
```

### GET /api/clientes/:id
**Purpose:** Get client details
```
Response: { success: true, data: { client, cnaes, qsa, contatos } }
```

### PUT /api/clientes/:id
**Purpose:** Update client
```json
// Request
{ "razaoSocial": "...", "status": "Ativo" }

// Response
{ "success": true, "data": updatedClient }
```

### DELETE /api/clientes/:id
**Purpose:** Delete client (CASCADE: documentos, pastas, contatos)
```
Response: { success: true, message: "Cliente excluído" }
```

### GET /api/clientes/:id/documentos
**Purpose:** Get client documents
```
Response: { success: true, data: [documentos] }
```

---

## Calendário

### GET /api/calendario/obrigacoes
**Purpose:** Get tax obligations
```
Query: ?ano=2026&mes=4&categoria=Federal
Response: { success: true, data: [obrigacoes] }
```

### GET /api/calendario/eventos
**Purpose:** Get user events
```
Query: ?mes=4&ano=2026
Response: { success: true, data: [eventos] }
```

### POST /api/calendario/eventos
**Purpose:** Create event
```json
// Request
{ "titulo": "Reunião", "data": "2026-04-10T14:00:00Z", "tipoId": "...", "cor": "#3b82f6" }

// Response
{ "success": true, "data": evento }
```

### PUT /api/calendario/eventos/:id
**Purpose:** Update event
```
Response: { success: true, data: updatedEvento }
```

### DELETE /api/calendario/eventos/:id
**Purpose:** Delete event (CASCADE DELETE)
```
Response: { success: true, message: "Evento excluído" }
```

### GET /api/tipos-evento
**Purpose:** Get event types (6 defaults, ehPadrao=true protected)
```
Response: { success: true, data: [{ id, nome, descricao, cor, ehPadrao }] }
```

### GET /api/feriados/relevantes
**Access:** Public
```
Query: ?uf=SP&municipio=Sao+Paulo&ano=2026
Response: { success: true, data: [feriados] }
```

---

## Documentos

### GET /api/documentos
**Purpose:** List documents with filters
```
Query: ?clientId=&pastaId=&page=1&limit=20
Response: { success: true, data: { documentos, total, page } }
```

### POST /api/documentos/upload
**Purpose:** Upload documents (multipart)
```
Form: file, clientId, pastaId (optional)
Response: { success: true, data: { documento, storagePath } }
```

### GET /api/documentos/:id/download
**Purpose:** Download document from Supabase Storage
```
Response: File stream
```

### POST /api/documentos/:id/ocr
**Purpose:** Run OCR on document (Tesseract.js)
```
Response: { success: true, data: { ocrText } }
```

### DELETE /api/documentos/:id
**Purpose:** Delete document (CASCADE from client)
```
Response: { success: true, message: "Documento excluído" }
```

---

## Usuários (Admin Only)

### GET /api/usuarios
**Access:** Admin only (cargo Admin/Administrador)
```
Query: ?search=joao&page=1&limit=10
Response: { success: true, data: { usuarios, total } }
```

### POST /api/usuarios
**Access:** Admin only
```json
// Request
{ "nome": "Maria", "email": "maria@email.com", "senha": "123456", "cargo": "Contador" }

// Response
{ "success": true, "data": user }
```

### PUT /api/usuarios/:id
**Access:** Admin only
```
Response: { success: true, data: updatedUser }
```

### DELETE /api/usuarios/:id
**Access:** Admin only
```
Response: { success: true, message: "Usuário excluído" }
```

---

## Logs

### GET /api/logs
**Purpose:** Get system logs
```
Query: ?level=error&limit=50&search=client&dateFrom=&dateTo=
Response: { success: true, data: { logs, total } }
```

### GET /api/logs/stats
**Purpose:** Get log statistics
```
Response: { success: true, data: { byLevel, total, last24h } }
```

### GET /api/logs/download
**Purpose:** Download logs
```
Query: ?format=csv|txt
Response: File download
```

### DELETE /api/logs
**Purpose:** Clean old logs
```
Query: ?days=30
Response: { success: true, message: "X logs excluídos" }
```

---

## Recibos

### POST /api/recibo
**Purpose:** Generate fee receipt PDF
```json
// Request
{ "clienteId": "...", "valor": 1500.00, "tipo": "Honorários", "dados": { ... } }

// Response
{ "success": true, data: { pdfUrl } }
```

### GET /api/recibos
**Purpose:** List receipts
```
Query: ?clienteId=&status=Gerado&page=1
Response: { success: true, data: [recibos] }
```

---

## Sticky Notes

### GET /api/notas
**Purpose:** Get user sticky notes
```
Response: { success: true, data: [notas] }
```

### POST /api/notas
**Purpose:** Create note
```json
// Request
{ "titulo": "Lembrete", "conteudo": "...", "cor": "#fef3c7", "tamanho": "M", "posicaoX": 100, "posicaoY": 200 }

// Response
{ "success": true, "data": nota }
```

### PUT /api/notas/:id
**Purpose:** Update note
```
Response: { success: true, data: updatedNota }
```

### PUT /api/notas/reorder
**Purpose:** Reorder notes (drag-and-drop)
```json
// Request
{ "notes": [{ "id": "...", "ordem": 0 }, { "id": "...", "ordem": 1 }] }

// Response
{ "success": true, data: [notas] }
```

### DELETE /api/notas/:id
**Purpose:** Delete note
```
Response: { success: true, message: "Nota excluída" }
```

---

## RPA

### POST /api/rpa/simples-nacional
**Purpose:** Run Simples Nacional robot (Puppeteer)
```json
// Request
{ "cnpj": "12345678000190" }

// Response
{ "success": true, "data": { resultado } }
```

### POST /api/rpa/sefaz-ba
**Purpose:** Run SEFAZ-BA robot (Puppeteer)
```
Request/Response similar to Simples Nacional
```

### GET /api/agendamentos
**Purpose:** Get scheduled RPA jobs
```
Response: { success: true, data: [agendamentos] }
```

### POST /api/agendamentos
**Purpose:** Schedule RPA job
```json
// Request
{ "tipoRobo": "SIMPLES_NACIONAL", "cnpj": "...", "recorrencia": "semanal", "diasSemana": 1, "horaExecucao": "08:00" }

// Response
{ "success": true, data: agendamento }
```

---

## API Keys

### GET /api/api-keys
**Purpose:** List API keys
```
Response: { success: true, data: [{ id, nome, keyPrefix, permissoes, ativa, expiresAt }] }
```

### POST /api/api-keys
**Purpose:** Create API key
```json
// Request
{ "nome": "Integration", "permissoes": ["read:clientes", "write:clientes"], "expiresAt": "2027-01-01" }

// Response
{ "success": true, data: { key: "full_key_shown_once", prefix: "abc123..." } }
```

### DELETE /api/api-keys/:id
**Purpose:** Revoke API key
```
Response: { success: true, message: "Key revogada" }
```

---

## Notificações

### GET /api/notificacoes
**Purpose:** Get user notifications
```
Response: { success: true, data: [notificacoes] }
```

### GET /api/notificacoes/count
**Purpose:** Get unread count
```
Response: { success: true, data: { count } }
```

### PUT /api/notificacoes/:id/lida
**Purpose:** Mark as read
```
Response: { success: true, data: notificacao }
```

### PUT /api/notificacoes/lidar-todas
**Purpose:** Mark all as read
```
Response: { success: true, message: "Todas marcadas como lidas" }
```

---

## Cálculos

### POST /api/calculos/rescisao
**Purpose:** Calculate labor resignation
```json
// Request
{ "tipo": "Pedido de Demissão", "salario": 3000, "dataAdmissao": "2024-01-01", "dataDemissao": "2026-04-01", "jornadaMensal": 220 }

// Response
{ "success": true, "data": { verbas, inss, irrf, fgts, totais } }
```

---

## Dashboard

### GET /api/dashboard/kpis
**Purpose:** Get dashboard KPIs
```
Response: { success: true, data: { clientesCount, honorariosMonth, certificadosExpirando, obrigatoriasPending, documentosCount, notificacoesCount } }
```

### GET /api/dashboard
**Purpose:** Get full dashboard data
```
Response: { success: true, data: { proximasObrigacoes, feriadosProximos, resumoMes, diasComEventos } }
```

### GET /api/dashboard/semana
**Purpose:** Get week overview
```
Response: { success: true, data: { events } }
```

### GET /api/dashboard/atividades
**Purpose:** Get recent activities
```
Response: { success: true, data: [atividades] }
```

---

## Error Codes

| Code | Meaning | Example |
|------|---------|---------|
| 400 | Validation error | Invalid input format |
| 401 | Unauthorized | Missing/invalid JWT |
| 403 | Forbidden | Non-admin accessing admin route |
| 404 | Not found | Resource doesn't exist |
| 409 | Conflict | Unique constraint violation (P2002) |
| 500 | Internal error | Unhandled exception |

---

## Middleware

| Name | Purpose |
|------|---------|
| `protect` | JWT authentication |
| `adminOnly` | Admin authorization (case-insensitive cargo check) |
| `authApiKey` | API key validation + permission check |
| Winston logger | Auto-logs all requests (status >= 400 → warn) |

---

*Part of docs/backend/ system. For compact reference, see `context/backend.md`*
