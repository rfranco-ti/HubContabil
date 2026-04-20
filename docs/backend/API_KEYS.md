# Backend - API Keys

## Visão Geral
Sistema de API Keys para acesso externo ao sistema Hub Contábil.

## Model Prisma
```prisma
model ApiKey {
  id              String     @id @default(uuid())
  usuarioId       String
  nome            String
  chave           String     @unique  // hash SHA-256
  prefixo         String              // primeiros 12 chars para exibição
  permissoes      Json       @default("[]")
  ultimaUtilizacao DateTime?
  totalRequisicoes Int       @default(0)
  expiraEm        DateTime?
  ativa           Boolean    @default(true)
  createdAt       DateTime   @default(now())
  updatedAt       DateTime   @updatedAt
}
```

## Endpoints

### Listar API Keys
```
GET /api/api-keys
Authorization: Bearer {token}
```
**Resposta:** Lista de chaves do usuário (sem o hash completo).

### Criar API Key
```
POST /api/api-keys
Authorization: Bearer {token}
Content-Type: application/json

{
  "nome": "Integração externa",
  "permissoes": ["read:clientes", "write:documentos"],
  "expiraEm": "2027-01-01T00:00:00Z" // opcional
}
```
**Resposta 201:** Inclui `chaveCompleta` (única vez que é exibida).

### Revogar API Key
```
DELETE /api/api-keys/{id}
Authorization: Bearer {token}
```

### Ativar/Desativar
```
PUT /api/api-keys/{id}/toggle
Authorization: Bearer {token}
```

## Autenticação via API Key
```
GET /api/clientes
X-API-Key: sk_live_abc123...
```

Ou via query param:
```
GET /api/clientes?api_key=sk_live_abc123...
```

## Middleware `authApiKey`
- Verifica header `X-API-Key` ou query param `api_key`
- Hash da chave e busca no banco
- Verifica se está ativa e não expirada
- Atualiza `ultimaUtilizacao` e incrementa `totalRequisicoes`
- Define `req.usuario` com dados do dono da chave

## Permissões Disponíveis
| Permissão | Descrição |
|-----------|-----------|
| `read:clientes` | Listar/ver clientes |
| `write:clientes` | Criar/editar clientes |
| `read:documentos` | Listar documentos |
| `write:documentos` | Upload documentos |
| `read:calendario` | Ver calendário |
| `write:calendario` | Criar eventos |
| `read:recibos` | Listar recibos |
| `write:recibos` | Gerar recibos |

## Segurança
- ✅ Chaves armazenadas como hash SHA-256
- ✅ Prefixo de 12 caracteres para identificação
- ✅ Chave completa mostrada apenas na criação
- ✅ Expiração configurável
- ✅ Revogação imediata
