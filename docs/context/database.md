# Database Context - HubContabil
# Versão: 1.0 | 05/04/2026
# PROPÓSITO: Contexto rápido para IA entender schema DB

## Database
PostgreSQL via Supabase | Prisma ORM | RLS (Row Level Security) habilitado

## Models (13 principais)

### User
```prisma
id, nome, email(unique), senha(bcrypt), cargo(default "Contador"), createdAt, updatedAt
Relations → Client[1:N], CalendarioEvento[1:N], Documento[1:N], StickyNote[1:N], Template[1:N], Recibo[1:N]
```

### Client
```prisma
id, cnpj(unique), razaoSocial, nomeFantasia, regimeTributario, status, createdAt, updatedAt
Relations → CnaesSecundarios[1:N], Qsa[1:N], Contatos[1:N], Documentos[1:N], Pastas[1:N], Recibos[1:N], Templates[1:N]
```

### CalendarioObrigacao (167 obrigações 2026)
```prisma
id, ano, mes, dia, nomeEvento, periodoApuracao, baseLegal, categoria, isFeriado, isPontoFacultativo
Indexes → (ano, mes, categoria)
```

### CalendarioEvento
```prisma
id, usuarioId(FK→User CASCADE DELETE), titulo, data, tipoId(FK→TipoEvento), ufId, municipio, cor, lembrete
Indexes → (usuarioId, data)
```

### TipoEvento (6 tipos padrão)
```prisma
id, nome, descricao, cor, ehPadrao(boolean, protected)
Tipos: trabalhista, tributario, feriado, datas_comemorativas, lembrete, tarefa
```

### CalendarioFeriado
```prisma
id, nome, data, abrangencia(NACIONAL|ESTADUAL|MUNICIPAL), uf, municipio, recorrente(default true), setorAfetado(String[])
```

### Notificacao
```prisma
id, usuarioId(FK→User), titulo, mensagem, tipoAlerta(UM_DIA_ANTE|NO_DIA), lida(boolean), expiresAt, createdAt
Expira: UM_DIA_ANTE→48h, NO_DIA→24h, lidas antigas→7 dias
```

### Documento
```prisma
id, clientId(FK→Client CASCADE), nomeOriginal, storagePath(Supabase Storage), mimetype, tamanhoBytes, pastaId, ocrRealizado(boolean)
Indexes → (clientId, tipo)
```

### PastaDocumento
```prisma
id, clientId(FK→Client), nome, paiId(self-ref para sub-pastas)
```

### Recibo
```prisma
id, usuarioId(FK→User), clienteId(FK→Client), modeloId(FK→ReciboModelo), tipo, dados(JSON), pdfUrl, valor(Decimal), status
```

### StickyNote
```prisma
id, usuarioId(FK→User), titulo, conteudo, cor, tamanho(S|M|L), ordem, posicaoX, posicaoY
```

### ApiKey
```prisma
id, nome, keyHash(SHA-256), keyPrefix(12 chars), permissoes(JSON array), ativa(boolean), expiresAt, ultimaUtilizacao, totalRequisicoes
```

### AgendamentoRpa
```prisma
id, usuarioId(FK→User), tipoRobo(SIMPLES_NACIONAL|SEFAZ_BA), cnpj, recorrencia(unica|diaria|semanal|mensal|x_vezes_dia|x_vezes_semana), diasSemana(bitmask), horaExecucao, proximaExecucao, execucoesCount
```

### Log (Winston)
```
Armazenado em arquivos (não DB): logs/combined.log, logs/error.log
Rotação: 5 arquivos × 5MB
```

## Relacionamentos Principais
```
User 1→N Client
User 1→N CalendarioEvento (CASCADE DELETE)
User 1→N Documento
User 1→N StickyNote
User 1→N Template
User 1→N Recibo
Client 1→N Documento (CASCADE DELETE)
Client 1→N PastaDocumento
Client 1→N Contato
Client 1→N Recibo
Client 1→N Template
TipoEvento 1→N CalendarioEvento
CalendarioFeriado (standalone, seed data)
Notificacao N→1 User
ApiKey (standalone, managed via admin)
AgendamentoRpa N→1 User
```

## Índices Importantes
- `User.email` (unique)
- `Client.cnpj` (unique)
- `Client.razaoSocial` (search)
- `Client.status` (filter)
- `CalendarioObrigacao(ano, mes, categoria)` (calendar queries)
- `CalendarioEvento(usuarioId, data)` (user events)
- `Documento(clientId, tipo)` (client documents)

## RLS (Row Level Security)
- User events: usuário só vê seus próprios eventos
- Client isolation: usuário só vê clientes permitidos
- Documentos restritos por usuário/cliente

## Seeds
- `seed-tipos-evento.js` → 6 tipos padrão
- `seed-feriados-2026.js` → 36+ feriados
- `seed-obrigacoes-2026.js` → 167 obrigações contábeis

## Regras Críticas
- NUNCA usar Mongoose (Prisma + PostgreSQL apenas)
- SEMPRE usar `@prisma/client` para DB access
- CASCADE DELETE em CalendarioEvento e Documentos ao deletar User/Client
- SHA-256 hash para API keys (NUNCA armazenar plain text)
- Senhas com bcrypt (NUNCA plain text)
- Documentar TODA mudança de schema em docs/
