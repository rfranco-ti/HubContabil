# Arquitetura da API Hub Contábil

## Visão Geral

A API do Hub Contábil foi refatorada para seguir uma arquitetura modular, desacoplada e documentada, facilitando manutenção e escalabilidade.

## Estrutura de Diretórios

```
backend/
├── src/                          # Código fonte principal
│   ├── app.js                   # Configuração do Express
│   ├── server.js                # Boot do servidor e graceful shutdown
│   ├── config/                  # Configurações
│   │   ├── prisma.js           # Cliente Prisma ORM
│   │   ├── db.js               # Configuração de banco
│   │   └── supabase.js         # Configuração Supabase
│   ├── routes/                  # Definição de rotas HTTP
│   │   ├── index.js            # Registro centralizado de todas as rotas
│   │   ├── authRoutes.js       # Autenticação (login, registro)
│   │   ├── clientRoutes.js     # CRUD de clientes
│   │   ├── rpaRoutes.js        # Automação RPA
│   │   ├── gedRoutes.js        # Gestão de documentos
│   │   ├── documentoRoutes.js  # Documentos contábeis
│   │   ├── reciboRoutes.js     # Recibos
│   │   ├── eventoRoutes.js     # Eventos
│   │   ├── stickyNotesRoutes.js# Notas adesivas
│   │   ├── conversaoRoutes.js  # Conversão de arquivos
│   │   ├── calendarioContabilRoutes.js # Calendário
│   │   └── documentoGeradoRoutes.js    # Docs gerados
│   ├── controllers/             # Lógica de negócio
│   │   └── *.js                # Handlers de requisições HTTP
│   ├── services/                # Serviços externos
│   │   ├── cnpjService.js      # Consulta CNPJ
│   │   ├── puppeteerService.js # Automação browser
│   │   ├── ocrSpaceRPA.js      # OCR
│   │   └── ...
│   ├── middlewares/             # Middlewares Express
│   │   ├── authMiddleware.js   # Autenticação JWT
│   │   ├── uploadMiddleware.js # Upload de arquivos
│   │   ├── logger.js           # Logging estruturado (Winston)
│   │   ├── errorHandler.js     # Handler global de erros
│   │   └── validator.js        # Validação com Zod
│   ├── validators/              # Schemas de validação
│   │   ├── authValidator.js    # Validação auth
│   │   └── clienteValidator.js # Validação clientes
│   ├── utils/                   # Funções auxiliares
│   ├── docs/                    # Documentação
│   │   └── swagger.js          # Configuração OpenAPI/Swagger
│   └── logs/                    # Logs da aplicação (gerado auto)
│       ├── combined.log        # Todos os logs
│       └── error.log           # Apenas erros
├── prisma/
│   └── schema.prisma           # Schema do banco de dados
├── tests/                       # Testes automatizados
├── uploads/                     # Uploads temporários
├── index.js                     # Entry point (delega para src/server.js)
├── package.json                 # Dependências e scripts
├── .env                         # Variáveis de ambiente
└── README.md                    # Documentação da API
```

## Camadas da Arquitetura

### 1. **Entry Point** (`index.js`)
- Ponto de entrada principal
- Delega inicialização para `src/server.js`

### 2. **Server Layer** (`src/server.js`)
- Gerencia ciclo de vida do servidor
- Graceful shutdown (SIGTERM, SIGINT)
- Conexão/desconexão do banco

### 3. **App Layer** (`src/app.js`)
- Configuração do Express
- Registro de middlewares globais
- Configuração de rotas
- Setup do Swagger UI
- Handler de erros global

### 4. **Routes Layer** (`src/routes/`)
- Define endpoints e métodos HTTP
- Aplica middlewares específicos (auth, validação)
- Documentação Swagger inline
- Delega para controllers

### 5. **Controllers Layer** (`src/controllers/`)
- Handlers de requisições HTTP
- Validação de dados de entrada
- Orquestração de serviços
- Formatação de respostas HTTP
- Tratamento de erros específicos

### 6. **Services Layer** (`src/services/`)
- Lógica de negócio complexa
- Integrações externas (APIs, RPA)
- Operações de banco complexas
- Reutilizável por múltiplos controllers

### 7. **Middlewares** (`src/middlewares/`)
- **authMiddleware**: Verifica token JWT
- **uploadMiddleware**: Processa uploads (Multer)
- **logger**: Logging estruturado de requisições
- **errorHandler**: Handler global de erros
- **validator**: Validação com Zod schemas

### 8. **Validators** (`src/validators/`)
- Schemas Zod para validação de entrada
- Body, params, query validation
- Tipagem e documentação automática

## Fluxo de uma Requisição

```
Request
  ↓
[logger] → Log estruturado
  ↓
[authMiddleware] → Verificação JWT (se protegido)
  ↓
[validator] → Validação Zod
  ↓
[route handler] → Endpoint específico
  ↓
[controller] → Lógica de negócio
  ↓
[service] → Operações complexas (opcional)
  ↓
[prisma] → Banco de dados
  ↓
[response] → Resposta formatada
  ↓
[errorHandler] → Se houver erro
```

## Padrões e Convenções

### Nomenclatura
- **Rotas**: `*Routes.js` (ex: `clientRoutes.js`)
- **Controllers**: `*Controller.js` (ex: `clientController.js`)
- **Services**: `*Service.js` (ex: `cnpjService.js`)
- **Validators**: `*Validator.js` (ex: `clienteValidator.js`)

### Formato de Resposta

**Sucesso:**
```json
{
  "id": "uuid",
  "campo": "valor"
}
```

**Erro:**
```json
{
  "success": false,
  "message": "Descrição do erro",
  "errors": [
    { "field": "campo", "message": "detalhe" }
  ]
}
```

### Códigos HTTP
- `200` - OK
- `201` - Created
- `400` - Bad Request (validação)
- `401` - Unauthorized (auth)
- `403` - Forbidden (permissão)
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

## Tecnologias Utilizadas

| Camada | Tecnologia |
|--------|-----------|
| Runtime | Node.js 18+ |
| Framework Web | Express.js v5 |
| Banco | PostgreSQL (Supabase) |
| ORM | Prisma |
| Auth | JWT (jsonwebtoken) |
| Validação | Zod |
| Logging | Winston |
| Docs | Swagger/OpenAPI 3.0 |
| Storage | Supabase Storage |
| RPA | Puppeteer, Tesseract.js |
| Testes | Vitest |

## Melhorias Implementadas

### ✅ Antes
- `index.js` monolítico com 100+ linhas
- Sem documentação da API
- Sem validação de dados
- Tratamento de erros inconsistente
- Logging com `console.log`
- Sem padronização de respostas
- Dependência incompatível (mongoose)

### ✅ Depois
- Estrutura modular e desacoplada
- Documentação Swagger interativa
- Validação automática com Zod
- Handler global de erros
- Logging estruturado (Winston)
- Padronização de respostas
- Stack consistente (Prisma + PostgreSQL)
- Graceful shutdown
- Health check endpoint
- Arquitetura escalável

## Próximos Passos (Opcional)

- [ ] Adicionar rate limiting
- [ ] Implementar caching (Redis)
- [ ] Adicionar testes E2E
- [ ] CI/CD pipeline
- [ ] Versionamento de API (v1, v2)
- [ ] Adicionar mais validators Zod
- [ ] Migrar todos controllers para usar AppError
- [ ] Adicionar métricas (Prometheus/Grafana)

---

**Versão**: 2.0.0  
**Última atualização**: Abril 2026
