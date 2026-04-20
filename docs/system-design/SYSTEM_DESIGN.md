# 🏗️ System Design - HubContabil

**Última atualização:** 01 de abril de 2026  
**Versão:** 1.0

---

## 1. Visão Geral da Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                         USUÁRIO                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (React 19)                           │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐    │
│  │   Páginas   │  │ Componentes  │  │   Serviços de API   │    │
│  │             │  │  (shadcn/ui) │  │    (Axios)          │    │
│  └─────────────┘  └──────────────┘  └─────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   BACKEND (Node.js/Express)                      │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐    │
│  │ Controllers │→ │   Services   │→ │  Prisma ORM         │    │
│  │             │  │              │  │  (Repository)       │    │
│  └─────────────┘  └──────────────┘  └─────────────────────┘    │
│         │                │                                       │
│         ▼                ▼                                       │
│  ┌─────────────┐  ┌──────────────┐                              │
│  │   Middlewares│  │ Externas    │                              │
│  │  (Auth,     │  │ (APIs CNPJ, │                              │
│  │   Upload)   │  │  Puppeteer) │                              │
│  └─────────────┘  └──────────────┘                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│               SUPABASE (PostgreSQL + Storage)                    │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐    │
│  │  Database   │  │   Storage    │  │      Auth (opc)     │    │
│  │  (Prisma)   │  │  (Documentos)│  │                     │    │
│  └─────────────┘  └──────────────┘  └─────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Componentes Principais

### 2.1 Frontend

| Componente | Descrição |
|------------|-----------|
| **Páginas** | Rotas principais (Clientes, Documentos, Dashboard, etc.) |
| **Componentes** | shadcn/ui + customizados |
| **Serviços de API** | Axios com interceptors para JWT |
| **Hooks** | Lógica reutilizável |

### 2.2 Backend

| Componente | Descrição |
|------------|-----------|
| **Controllers** | Recebem requests, validam inputs, retornam respostas |
| **Services** | Regras de negócio, integrações externas |
| **Prisma ORM** | Acesso a dados (repository pattern) |
| **Middlewares** | Auth (JWT), Upload (Multer), Error handling |

### 2.3 Database (Supabase PostgreSQL)

| Tabela | Descrição |
|--------|-----------|
| `users` | Usuários do sistema |
| `clients` | Clientes (empresas) |
| `contatos` | Múltiplos contatos por cliente |
| `client_cnaes_secundarios` | CNAEs secundários |
| `client_qsa` | Quadro societário |
| `pasta_documentos` | Pastas de documentos (hierárquico) |
| `documentos` | Documentos do GED |
| `cnpj_cache` | Cache de consultas CNPJ (24h) |

### 2.4 Serviços Externos

| Serviço | Propósito |
|---------|-----------|
| **APIs de CNPJ** | open.cnpja.com (primário), invertexto.com (fallback) |
| **bff.cnpja.com** | Pesquisa de empresas |
| **Supabase** | Database, Storage, Auth |
| **Puppeteer** | RPA (Simples Nacional, SEFAZ) |

---

## 3. Fluxos Principais

### 3.1 Autenticação

```
1. Usuário → POST /api/auth/login
2. Backend → Valida credenciais
3. Backend → Gera JWT token
4. Backend → Retorna token + dados usuário
5. Frontend → Armazena token (localStorage)
6. Frontend → Inclui token em requests (Authorization: Bearer)
7. Backend → Middleware valida token
8. Backend → Libera acesso a rotas protegidas
```

### 3.2 Consulta CNPJ

```
1. Usuário → Digita CNPJ
2. Frontend → GET /api/clientes/consulta/:cnpj
3. Backend → Verifica cache (cnpj_cache)
4. Se cache existe → Retorna do cache
5. Se não → Consulta open.cnpja.com
6. Se erro → Fallback invertexto.com
7. Backend → Salva no cache (24h)
8. Backend → Retorna dados
```

### 3.3 Upload de Documentos

```
1. Usuário → Seleciona arquivos
2. Frontend → Valida (tipo, tamanho, limite)
3. Frontend → Gera thumbnails (preview)
4. Frontend → POST /api/documentos/upload-multiplo
5. Backend → Multer processa arquivos
6. Backend → Gera thumbnails (Sharp)
7. Backend → Upload para Supabase Storage
8. Backend → Salva metadados no PostgreSQL
9. Backend → Retorna sucesso
```

---

## 4. Decisões Arquiteturais

### 4.1 Por que Prisma ORM?

- ✅ Type safety
- ✅ Auto-completion
- ✅ Migrations automáticas
- ✅ Previne SQL injection
- ✅ Fácil manutenção

### 4.2 Por que Supabase?

- ✅ PostgreSQL gerenciado
- ✅ Storage integrado
- ✅ RLS (Row Level Security)
- ✅ Auth opcional
- ✅ Preço acessível

### 4.3 Por que shadcn/ui?

- ✅ Componentes copiáveis (não biblioteca)
- ✅ Totalmente customizável
- ✅ Tailwind CSS nativo
- ✅ Acessibilidade (Radix UI)
- ✅ Design moderno

### 4.4 Por que Node.js + Express?

- ✅ JavaScript fullstack
- ✅ Ecossistema npm
- ✅ Fácil contratação
- ✅ Performance adequada
- ✅ Middleware pattern

---

## 5. Padrões de Código

### 5.1 Backend (Controllers)

```js
// @desc    Descrição
// @route   METHOD /rota
// @access  Private/Public
const funcao = async (req, res) => {
  try {
    // Validação
    // Lógica
    return res.json({ success: true, data });
  } catch (error) {
    console.error('Erro:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};
```

### 5.2 Frontend (Componentes)

```jsx
export default function Componente() {
  // States
  const [state, setState] = useState(initial);
  
  // Handlers
  const handleAction = async () => {
    try {
      const data = await service.execute();
      toast.success('Sucesso');
    } catch (error) {
      toast.error(error.message);
    }
  };
  
  // Render
  return (
    <div>...</div>
  );
}
```

### 5.3 Tratamento de Erros

```js
// Padrão de resposta
{
  success: boolean,
  data?: any,
  error?: string,
  message?: string
}
```

---

## 6. Dependências Principais

### Backend

```json
{
  "express": "^5.2.1",
  "@prisma/client": "5.22.0",
  "@supabase/supabase-js": "^2.101.1",
  "bcryptjs": "^3.0.3",
  "jsonwebtoken": "^9.0.3",
  "multer": "^2.1.1",
  "puppeteer": "^24.40.0",
  "sharp": "^0.34.5",
  "tesseract.js": "^7.0.0"
}
```

### Frontend

```json
{
  "react": "^19.2.4",
  "react-router-dom": "^7.13.2",
  "axios": "^1.14.0",
  "tailwindcss": "^3.4.19",
  "lucide-react": "^1.7.0",
  "react-hot-toast": "^11.0.5",
  "pdfjs-dist": "^3.11.174",
  "fullcalendar": "^6.x"
}
```

---

## 7. Considerações de Performance

### Backend

- ✅ Pool de conexões (pgbouncer)
- ✅ Cache de CNPJ (24h)
- ✅ Índices no PostgreSQL
- ✅ Upload assíncrono

### Frontend

- ✅ Vite (build rápido)
- ✅ Code splitting
- ✅ Lazy loading
- ✅ Cleanup de URLs (memory leak)

---

## 8. Escalabilidade

### Horizontal

- ✅ Backend stateless (JWT)
- ✅ Database gerenciado (Supabase)
- ✅ Storage separado (S3-compatible)

### Vertical

- ✅ Supabase upgrade de plano
- ✅ Mais recursos de servidor

---

*Documento vivo. Atualizar com mudanças arquiteturais.*
