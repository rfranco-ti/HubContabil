# Backend Context - HubContabil
# Versão: 1.0 | 05/04/2026
# PROPÓSITO: Contexto rápido para IA entender backend

## Stack
Node.js 24 + Express + Prisma ORM | PostgreSQL (Supabase) | JWT + bcrypt | Winston logs

## Arquitetura
Controllers → Services → Prisma (Repositories)
Camadas: req → middleware → controller → service → prisma → DB

## Auth
- JWT Bearer token (30 dias) no localStorage
- bcrypt para hash senhas
- Middleware: `protect` (rotas protegidas), `adminOnly` (cargo Admin/Administrador case-insensitive)
- API Keys: SHA-256 hash, header `X-API-Key` ou query `api_key`, 8 permissões granulares

## Padrão de Resposta
```js
// Sucesso
res.json({ success: true, data })
// Erro
res.status(400/401/403/404/500).json({ success: false, error, message, code })
```

## Error Codes
- AUTH_TOKEN_MISSING (401) | VALIDATION_ERROR (400) | NOT_FOUND (404)
- ALREADY_EXISTS (409) | FORBIDDEN (403) | INTERNAL_ERROR (500)

## Globais Error Handlers
- Prisma P2002 (unique constraint) → 409
- ZodError → 400
- JsonWebTokenError → 401

## Endpoints Principais
```
POST   /api/auth/login, /api/auth/register
GET/POST /api/clientes (CRUD + busca CNPJ automática)
GET/POST /api/calendario/obrigacoes, /api/calendario/eventos, /api/tipos-evento
GET/POST /api/documentos (upload multipart, OCR Tesseract.js)
GET/POST /api/usuarios (admin CRUD, protected)
GET/POST /api/logs (filtros, download CSV/TXT, cleanup)
GET/POST /api/recibo (gerar PDF)
GET/POST /api/notas (sticky notes CRUD)
GET/POST /api/rpa/simples-nacional, /api/rpa/sefaz-ba
GET/POST /api/agendamentos (CRUD, cron scheduler)
GET/POST /api/api-keys (CRUD, permissões)
POST   /api/calculos/rescisao (simulador trabalhista completo)
GET    /api/dashboard/kpis, /api/dashboard, /api/dashboard/semana
GET    /api/notificacoes, /api/notificacoes/count, PUT /:id/lida
GET    /api/feriados/relevantes?uf=&municipio=&ano= (público)
```

## API Keys
- Model: `ApiKey` (hashed key SHA-256, prefix 12 chars, permissions JSON, expiry, usage tracking)
- 8 permissões: `read/write:clientes, documentos, calendario, recibos`
- Middleware `authApiKey`: hash check → active/expired → update usage → increment counter

## Logging (Winston)
- Arquivos: `logs/combined.log` (todos), `logs/error.log` (só errors)
- Rotação: 5 arquivos × 5MB
- Formato JSON: timestamp, level, message, method, url, statusCode, duration, ip, userAgent, userId
- Middleware auto-log em todas as requests (status >= 400 → warn)

## RPA Scheduling
- Model: `AgendamentoRpa` (tipoRobo: SIMPLES_NACIONAL|SEFAZ_BA)
- Recorrência: unica, diaria, semanal, mensal, x_vezes_dia, x_vezes_semana
- Validação Zod: CNPJ min 14 dígitos, hora regex `^([01]\d|2[0-3]):[0-5]\d$`
- Status: CRUD completo, execução simulada (Puppeteer integration TODO)

## External APIs
- CNPJ lookup: primary open.cnpja.com → fallback invertexto.com
- Timeout: 5s via AbortController
- Validação: Zod schemas para todos os inputs

## Calendars/Notifications
- 6 tipos de evento no DB: trabalhista, tributario, feriado, datas_comemorativas, lembrete, tarefa
- Tipos com `ehPadrao=true` protegidos (não edit/delete)
- Feriados: enum AbrangenciaFeriado (NACIONAL, ESTADUAL, MUNICIPAL)
- Notificações: cron job a cada hora (`0 * * * *`), America/Sao_Paulo
- Alertas: UM_DIA_ANTE (expira 48h), NO_DIA (expira 24h), lidas antigas limpam >7 dias

## Simulador Rescisão
- Endpoint: `POST /api/calculos/rescisao`
- 4 tipos de rescisão, INSS/IRRF progressivos isolados por verba
- Campos: jornada, insalubridade (10/20/40% SM), periculosidade (30%), adic. noturno (20%+), HE+DSR, faltas, VT (6%)
- INSS: tabela progressiva 7,5%-14%, teto R$ 8.475,55 (2026)
- IRRF: redutor Lei 15.270/2025 (isento ≤ R$ 5.000)

## Test Credentials
admin@hubcontabil.com / 123456

## Pendências Backend
- [ ] Integração Puppeteer real para RPA
- [ ] Scheduler cron para agendamentos
- [ ] Helmet security
- [ ] Rate limiting
- [ ] Testes automatizados (Vitest)

## Arquivos Chave
- `backend/src/controllers/` - Controladores
- `backend/src/routes/` - Rotas
- `backend/src/middlewares/` - Auth, validation, logging, API key
- `backend/src/validators/` - Zod schemas
- `backend/prisma/schema.prisma` - Database schema
- `backend/src/config/prisma.js` - Prisma client

## Regras Críticas
- NUNCA usar Mongoose (Prisma + PostgreSQL apenas)
- SEMPRE usar `@prisma/client` para DB access
- SEMPRE validar inputs com Zod
- SEMPRE tratar erros com try/catch e formato padrão
- Documentar TODA modificação em docs/ (ver COMPORTAMENTO_IA.md)
