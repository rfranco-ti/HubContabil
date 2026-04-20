# Hub Contábil - API Documentation

API RESTful completa para o sistema Hub Contábil, fornecendo gestão de clientes, documentos, automação robótica (RPA), calendário contábil e muito mais.

## 🚀 Tecnologias

- **Runtime:** Node.js
- **Framework:** Express.js v5
- **Banco de Dados:** PostgreSQL (Supabase)
- **ORM:** Prisma
- **Autenticação:** JWT (JSON Web Tokens)
- **Validação:** Zod
- **Logging:** Winston
- **Documentação:** Swagger/OpenAPI 3.0
- **Storage:** Supabase Storage
- **RPA:** Puppeteer, Tesseract.js

## 📋 Pré-requisitos

- Node.js >= 18.x
- PostgreSQL (Supabase)
- npm ou yarn

## ⚙️ Instalação

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas credenciais

# Gerar cliente Prisma
npm run prisma:generate

# Executar migrações
npm run prisma:migrate

# Seed do banco (dados iniciais)
npm run seed
```

## 🏃‍♂️ Execução

```bash
# Desenvolvimento (com auto-reload)
npm run dev

# Produção
npm start

# Testes
npm test

# Testes com watch
npm run test:watch
```

## 📚 Documentação Interativa

A API possui documentação interativa via Swagger UI:

```
http://localhost:3000/api-docs
```

## 🔐 Autenticação

A API utiliza autenticação via JWT (JSON Web Token).

### Como autenticar:

1. **Registrar usuário:**
```http
POST /api/auth/registrar
Content-Type: application/json

{
  "nome": "João Silva",
  "email": "joao@exemplo.com",
  "senha": "123456",
  "cargo": "Contador"
}
```

2. **Fazer login:**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "joao@exemplo.com",
  "senha": "123456"
}
```

3. **Usar token em requisições:**
```http
Authorization: Bearer <token_jwt>
```

## 📂 Endpoints da API

### Base URL
```
http://localhost:3000/api
```

---

## 1️⃣ Autenticação (`/api/auth`)

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/api/auth/registrar` | Registrar novo usuário | ❌ |
| POST | `/api/auth/login` | Autenticar usuário | ❌ |

---

## 2️⃣ Clientes (`/api/clientes`)

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/api/clientes` | Listar todos os clientes | ✅ |
| POST | `/api/clientes` | Criar novo cliente | ✅ |
| GET | `/api/clientes/:id` | Buscar cliente por ID | ✅ |
| PUT | `/api/clientes/:id` | Atualizar cliente | ✅ |
| DELETE | `/api/clientes/:id` | Deletar cliente | ✅ |
| GET | `/api/clientes/consulta/:cnpj` | Consultar CNPJ em APIs externas | ✅ |
| GET | `/api/clientes/pesquisa?query=termo` | Pesquisar empresas por nome | ✅ |

### Exemplo - Criar Cliente:
```json
POST /api/clientes
{
  "cnpj": "12345678000190",
  "razao_social": "Empresa Exemplo LTDA",
  "nome_fantasia": "Exemplo Corp",
  "categoria": "Serviços",
  "status": "Ativo"
}
```

---

## 3️⃣ RPA - Automação Robótica (`/api/rpa`)

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/api/rpa/simples-nacional` | Consultar situação no Simples Nacional | ❌ |
| POST | `/api/rpa/sefaz-ba` | Consultar cadastro na SEFAZ BA | ❌ |
| POST | `/api/rpa/sefaz-ba/inscricao` | Consultar Inscrição Estadual SEFAZ BA | ❌ |

**Nota:** Estes endpoints utilizam Puppeteer para automação de navegação web.

---

## 4️⃣ GED - Gestão Eletrônica de Documentos (`/api/ged`)

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/api/ged/upload` | Upload de documento | ❌ |
| POST | `/api/ged/ocr` | Processar OCR em documento | ❌ |
| POST | `/api/ged/gerar-contrato` | Gerar contrato em PDF | ❌ |

### Upload de Arquivo:
```http
POST /api/ged/upload
Content-Type: multipart/form-data

documento: <arquivo.pdf>
```

---

## 5️⃣ Documentos (`/api/documentos`)

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/api/documentos` | Listar todos os documentos | ✅ |
| POST | `/api/documentos/upload` | Upload de documento único | ✅ |
| POST | `/api/documentos/upload-multiplo` | Upload múltiplo (máx 10) | ✅ |
| GET | `/api/documentos/cliente/:clienteId` | Documentos de um cliente | ✅ |
| GET | `/api/documentos/:id` | Buscar documento | ✅ |
| PUT | `/api/documentos/:id` | Atualizar documento | ✅ |
| DELETE | `/api/documentos/:id` | Deletar documento | ✅ |
| GET | `/api/documentos/:id/download` | Download do documento | ✅ |
| POST | `/api/documentos/pastas` | Criar pasta | ✅ |
| GET | `/api/documentos/pastas/:clienteId` | Listar pastas do cliente | ✅ |
| GET | `/api/documentos/pastas/detalhe/:id` | Buscar pasta | ✅ |
| PUT | `/api/documentos/pastas/:id` | Atualizar pasta | ✅ |
| DELETE | `/api/documentos/pastas/:id` | Deletar pasta | ✅ |

---

## 6️⃣ Recibos (`/api/recibo`)

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/api/recibo/modelos` | Listar modelos de recibo | ✅ |
| POST | `/api/recibo/modelos` | Criar modelo de recibo | ✅ |
| GET | `/api/recibo/modelos/:id` | Buscar modelo | ✅ |
| DELETE | `/api/recibo/modelos/:id` | Deletar modelo | ✅ |
| POST | `/api/recibo/gerar` | Gerar recibo em PDF | ✅ |
| GET | `/api/recibo/recibos` | Listar recibos gerados | ✅ |
| GET | `/api/recibo/recibos/:id` | Buscar recibo | ✅ |

---

## 7️⃣ Eventos (`/api/eventos`)

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/api/eventos` | Listar eventos | ✅ |
| POST | `/api/eventos` | Criar evento | ✅ |
| PUT | `/api/eventos/:id` | Atualizar evento | ✅ |
| DELETE | `/api/eventos/:id` | Excluir evento | ✅ |

---

## 8️⃣ Notas Adesivas (`/api/notas`)

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/api/notas` | Listar notas | ✅ |
| POST | `/api/notas` | Criar nota | ✅ |
| PUT | `/api/notas/:id` | Atualizar nota | ✅ |
| DELETE | `/api/notas/:id` | Excluir nota | ✅ |
| PATCH | `/api/notas/reordenar` | Reordenar notas | ✅ |

---

## 9️⃣ Conversões (`/api/conversoes`)

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/api/conversoes/pdf-para-word` | Converter PDF para Word | ✅ |

---

## 🔟 Calendário (`/api/calendario`)

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/api/calendario/contabil` | Calendário contábil (obrigações/feriados) | ❌ |
| GET | `/api/calendario/eventos` | Listar eventos do usuário | ✅ |
| POST | `/api/calendario/eventos` | Criar evento | ✅ |
| PUT | `/api/calendario/eventos/:id` | Atualizar evento | ✅ |
| DELETE | `/api/calendario/eventos/:id` | Excluir evento | ✅ |

---

## 1️⃣1️⃣ Documentos Gerados (`/api/documentos-gerados`)

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/api/documentos-gerados` | Listar documentos | ✅ |
| POST | `/api/documentos-gerados` | Salvar documento | ✅ |
| GET | `/api/documentos-gerados/estatisticas` | Estatísticas | ✅ |
| GET | `/api/documentos-gerados/:id` | Buscar documento | ✅ |
| GET | `/api/documentos-gerados/:id/download` | Download | ✅ |
| PUT | `/api/documentos-gerados/:id/status` | Atualizar status | ✅ |
| DELETE | `/api/documentos-gerados/:id` | Deletar documento | ✅ |

---

## 📊 Formatos de Resposta

### Sucesso:
```json
{
  "id": "uuid",
  "nome": "valor",
  ...
}
```

### Erro:
```json
{
  "success": false,
  "message": "Descrição do erro",
  "errors": [
    {
      "field": "campo",
      "message": "descrição do erro de validação"
    }
  ]
}
```

---

## 🛠️ Estrutura do Projeto

```
backend/
├── src/
│   ├── app.js                    # Configuração Express
│   ├── server.js                 # Boot do servidor
│   ├── config/                   # Configurações (Prisma, Supabase)
│   ├── routes/                   # Definição de rotas
│   │   ├── index.js             # Registro centralizado
│   │   ├── authRoutes.js
│   │   ├── clientRoutes.js
│   │   └── ...
│   ├── controllers/              # Lógica de negócio
│   ├── services/                 # Serviços externos
│   ├── middlewares/              # Middlewares Express
│   │   ├── authMiddleware.js
│   │   ├── uploadMiddleware.js
│   │   ├── logger.js            # Logging estruturado
│   │   ├── errorHandler.js      # Handler global de erros
│   │   └── validator.js         # Validação Zod
│   ├── validators/               # Schemas Zod
│   ├── utils/                    # Funções auxiliares
│   ├── docs/                     # Documentação
│   │   └── swagger.js
│   └── logs/                     # Logs da aplicação
├── prisma/
│   └── schema.prisma
├── tests/
├── index.js                      # Entry point
└── package.json
```

---

## 🔧 Variáveis de Ambiente

Crie um arquivo `.env` baseado no `.env.example`:

```env
# Servidor
PORT=3000
NODE_ENV=development

# Banco de Dados (Supabase PostgreSQL)
DATABASE_URL="postgresql://user:password@host:port/db?schema=public"

# JWT
JWT_SECRET=sua_chave_secreta_super_segura

# Supabase
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_KEY=sua_chave_de_servico

# Logging
LOG_LEVEL=info
```

---

## 🧪 Testes

```bash
# Executar todos os testes
npm test

# Testes em modo watch
npm run test:watch

# Testes com cobertura
npm run test:coverage
```

---

## 📝 Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `npm start` | Iniciar em produção |
| `npm run dev` | Iniciar em desenvolvimento (auto-reload) |
| `npm test` | Executar testes |
| `npm run test:watch` | Testes em modo watch |
| `npm run test:coverage` | Testes com cobertura |
| `npm run seed` | Popular banco com dados iniciais |
| `npm run prisma:generate` | Gerar cliente Prisma |
| `npm run prisma:migrate` | Executar migrações |

---

## 🚨 Códigos de Status HTTP

| Código | Significado |
|--------|-------------|
| 200 | OK - Requisição bem-sucedida |
| 201 | Created - Recurso criado com sucesso |
| 400 | Bad Request - Dados inválidos |
| 401 | Unauthorized - Não autenticado |
| 404 | Not Found - Recurso não encontrado |
| 409 | Conflict - Conflito de dados |
| 500 | Internal Server Error - Erro interno |

---

## 🔄 Health Check

```http
GET /health
```

Resposta:
```json
{
  "status": "ok",
  "timestamp": "2026-04-04T12:00:00.000Z",
  "uptime": 3600,
  "environment": "development"
}
```

---

## 📄 Licença

ISC

## 👥 Suporte

Para dúvidas ou problemas, abra uma issue no repositório.

---

**Versão da API:** 2.0.0  
**Última atualização:** Abril 2026
