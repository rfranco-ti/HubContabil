# Backend - Logs do Sistema

## Visão Geral
Sistema de logs baseado em Winston com endpoints para visualização e download.

## Arquivos de Log
- `logs/combined.log` - Todos os logs (info, warn, error)
- `logs/error.log` - Apenas erros (nível error)
- Rotação: 5 arquivos de 5MB cada

## Endpoints

### Listar Logs
```
GET /api/logs?level=info&limit=100&search=clientes
Authorization: Bearer {token_admin}
```
**Query Params:**
- `level`: info | warn | error
- `limit`: número de logs (default: 100)
- `search`: busca por mensagem, URL ou método
- `startDate`, `endDate`: filtro por data

### Estatísticas
```
GET /api/logs/stats
```
**Resposta:**
```json
{
  "success": true,
  "data": {
    "total": 1234,
    "errors": 5,
    "info": 1200,
    "warnings": 29,
    "fileSize": { "combined": "2.34 MB", "error": "0.12 MB" },
    "lastUpdate": "2026-04-05T10:30:00Z"
  }
}
```

### Download
```
GET /api/logs/download?format=csv&level=error
```
**Formatos:** `txt` (JSON) ou `csv` (Excel)

### Limpar Logs Antigos
```
DELETE /api/logs?days=7
```

## Middleware de Logging
- Todas as requisições são logadas automaticamente
- Registra: método, URL, status, duração, IP, user-agent, userId
- Nível: `warn` para status >= 400, `info` para outros

## Formato do Log
```json
{
  "timestamp": "2026-04-05 10:30:00",
  "level": "info",
  "message": "GET /api/clientes",
  "method": "GET",
  "url": "/api/clientes",
  "statusCode": 200,
  "duration": "45ms",
  "ip": "127.0.0.1",
  "userAgent": "Mozilla/5.0...",
  "userId": "uuid"
}
```
