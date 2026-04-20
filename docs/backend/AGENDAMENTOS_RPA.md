# Backend - Agendamentos RPA

## Visão Geral
Sistema de agendamento para execução automática de robôs (RPA).

## Model Prisma
```prisma
model AgendamentoRpa {
  id              String   @id @default(uuid())
  usuarioId       String
  nome            String
  tipoRobo        TipoRobo          // SIMPLES_NACIONAL | SEFAZ_BA
  cnpj            String
  recorrencia     RecorrenciaAgendamento
  diasSemana      Int?              // bitmask ou array [0-6]
  horaExecucao    String            // "HH:MM"
  vezesPorDia     Int      @default(1)
  vezesPorSemana  Int      @default(0)
  proximaExecucao DateTime?
  ativo           Boolean  @default(true)
  ultimoResultado Json?    @default("{}")
  totalExecucoes  Int      @default(0)
  criadoPorId     String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

enum TipoRobo {
  SIMPLES_NACIONAL
  SEFAZ_BA
}

enum RecorrenciaAgendamento {
  unica
  diaria
  semanal
  mensal
  x_vezes_dia
  x_vezes_semana
}
```

## Endpoints

### Listar Agendamentos
```
GET /api/agendamentos
Authorization: Bearer {token}
```

### Criar Agendamento
```
POST /api/agendamentos
Authorization: Bearer {token}
Content-Type: application/json

{
  "nome": "Consulta Simples - Empresa X",
  "tipoRobo": "SIMPLES_NACIONAL",
  "cnpj": "12345678000190",
  "recorrencia": "semanal",
  "horaExecucao": "08:00",
  "diasSemana": [1, 3, 5],
  "ativo": true
}
```

### Atualizar
```
PUT /api/agendamentos/{id}
```

### Excluir
```
DELETE /api/agendamentos/{id}
```

### Executar Manualmente
```
POST /api/agendamentos/{id}/executar
```
**Nota:** Atualmente execução é simulada. Integração com Puppeteer será feita em sprint futura.

## Validações (Zod)
- `nome`: mínimo 2 caracteres
- `tipoRobo`: enum válido
- `cnpj`: mínimo 14 dígitos
- `recorrencia`: enum válido
- `horaExecucao`: regex `^([01]\d|2[0-3]):[0-5]\d$`
- `diasSemana`: número ou array de 0-6 (opcional)
- `vezesPorDia`: 1-24 (opcional)
- `vezesPorSemana`: 0-168 (opcional)

## Lógica de Próxima Execução
- Calculada automaticamente na criação/atualização
- Para semanal: encontra próximo dia válido na lista
- Se horário já passou hoje, agenda para amanhã

## Status Atual
- ✅ CRUD completo
- ✅ Execução manual simulada
- ⏳ Integração real com Puppeteer (futuro)
- ⏳ Scheduler automático (cron jobs)
- ⏳ Notificações de conclusão
