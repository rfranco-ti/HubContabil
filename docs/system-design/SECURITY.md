# 🔒 Security - HubContabil

**Última atualização:** 01 de abril de 2026  
**Versão:** 1.0

---

## 1. Visão Geral

Este documento descreve as políticas de segurança do HubContabil.

**Status Geral:** ⚠️ **ATENÇÃO** - Vulnerabilidades críticas pendentes

---

## 2. Autenticação e Autorização

### 2.1 Autenticação Atual

| Item | Implementação |
|------|---------------|
| **Método** | JWT (JSON Web Token) |
| **Hash** | bcryptjs (salt 10) |
| **Expiração** | 30 dias |
| **Armazenamento** | localStorage (frontend) |

### 2.2 Fluxo de Login

```
1. Usuário → POST /api/auth/login (email, senha)
2. Backend → Busca usuário no banco
3. Backend → Compara senha (bcrypt.compare)
4. Backend → Gera JWT token
5. Backend → Retorna { token, user }
6. Frontend → Armazena token (localStorage)
7. Frontend → Inclui em requests: Authorization: Bearer <token>
```

### 2.3 Middleware de Auth

```js
// backend/middlewares/authMiddleware.js
const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ success: false, error: 'Token não fornecido' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, error: 'Token inválido' });
  }
};
```

### 2.4 Autorização (Supabase RLS)

**Status:** 🔴 Não implementado

**Recomendado:** Ver `docs/system-design/DATABASE_SCHEMA.md`

---

## 3. Vulnerabilidades Críticas

### 3.1 🔴 JWT_SECRET Fraco

**Problema:**
```js
// Código atual
jwt.sign({ id }, process.env.JWT_SECRET || 'chave_super_secreta_padrao_mudar_depois', ...)
```

**Risco:** Qualquer pessoa pode gerar tokens válidos

**Solução:**
```bash
# Gerar secret forte
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

```env
# .env (não versionar!)
JWT_SECRET=abc123... (64 caracteres hex)
```

**Status:** ❌ Pendente

---

### 3.2 🔴 Sem Validação de Inputs

**Problema:** Inputs não são validados/sanitizados

**Risco:** Injeção de código, XSS, dados inconsistentes

**Solução:** Zod ou express-validator

```js
// Exemplo com Zod
import { z } from 'zod';

const createClientSchema = z.object({
  cnpj: z.string().length(14),
  razao_social: z.string().min(3),
  email: z.string().email(),
  // ...
});

app.post('/clientes', (req, res) => {
  const result = createClientSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }
  // ...
});
```

**Status:** ❌ Pendente

---

### 3.3 🟡 Sem Helmet Headers

**Problema:** Headers de segurança não configurados

**Risco:** Clickjacking, XSS, sniffing

**Solução:**
```bash
npm install helmet
```

```js
import helmet from 'helmet';
app.use(helmet());
```

**Status:** ❌ Pendente

---

### 3.4 🟡 Sem Rate Limiting

**Problema:** Sem limite de requisições

**Risco:** DDoS, brute force

**Solução:**
```bash
npm install express-rate-limit
```

```js
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // 100 requisições por IP
});

app.use('/api/', limiter);
```

**Status:** ❌ Pendente

---

### 3.5 🟡 CORS Permissivo

**Problema:**
```js
// Código atual
app.use(cors({ origin: '*' }));
```

**Risco:** Qualquer origem pode fazer requisições

**Solução:**
```js
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
```

**Status:** ❌ Pendente

---

## 4. Segurança de Dados

### 4.1 Senhas

| Item | Implementação |
|------|---------------|
| **Hash** | bcryptjs |
| **Salt Rounds** | 10 |
| **Armazenamento** | Nunca em plain text |

### 4.2 Tokens

| Item | Implementação |
|------|---------------|
| **Tipo** | JWT |
| **Expiração** | 30 dias |
| **Refresh Token** | ❌ Não implementado |

### 4.3 Secrets

| Item | Implementação |
|------|---------------|
| **Gerenciamento** | dotenv (.env) |
| **Versionamento** | ❌ .env não deve ser versionado |
| **Produção** | Variáveis de ambiente do servidor |

---

## 5. Segurança de Banco de Dados

### 5.1 SQL Injection

**Status:** ✅ **Protegido** (Prisma ORM)

Prisma usa parameterized queries, prevenindo SQL injection.

### 5.2 RLS (Row Level Security)

**Status:** ❌ **Não implementado**

**Recomendado:** Ver `docs/system-design/DATABASE_SCHEMA.md`

---

## 6. Segurança de Upload

### 6.1 Validação Atual

| Validação | Implementação |
|-----------|---------------|
| **Tipos permitidos** | ✅ PDF, PNG, JPG, DOC, DOCX |
| **Tamanho máximo** | ✅ 10MB |
| **Limite de arquivos** | ✅ 20 arquivos |

### 6.2 Validações Recomendadas

- [ ] Scan de vírus (ClamAV)
- [ ] Validação de conteúdo (não apenas extensão)
- [ ] Sanitização de nomes de arquivo
- [ ] URLs assinadas para download

---

## 7. Logs e Auditoria

### 7.1 Logs Atuais

```js
console.log('Erro:', error);
```

**Problema:** Logs podem expor dados sensíveis

### 7.2 Logs Recomendados

```js
// Winston ou Pino
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Nunca logar: senhas, tokens, dados sensíveis
logger.error('Erro ao processar', { userId: req.user.id, action: 'upload' });
```

---

## 8. Checklist de Segurança (Produção)

### Antes do Deploy

- [ ] JWT_SECRET forte e único
- [ ] Validação de inputs (Zod)
- [ ] Helmet headers
- [ ] Rate limiting
- [ ] CORS restritivo
- [ ] HTTPS obrigatório
- [ ] .env não versionado
- [ ] Logs sem dados sensíveis
- [ ] RLS implementado
- [ ] Backup automático configurado
- [ ] Monitoramento de erros (Sentry)

### Contínuo

- [ ] `npm audit` semanal
- [ ] Atualizar dependências
- [ ] Revisar logs de erro
- [ ] Testar vulnerabilidades

---

## 9. Resposta a Incidentes

### Em Caso de Vazamento

1. **Identificar:** Qual dado, quantos usuários, origem
2. **Conter:** Revogar tokens, bloquear acesso
3. **Comunicar:** Notificar afetados
4. **Corrigir:** Resolver vulnerabilidade
5. **Documentar:** Registrar lições aprendidas

---

## 10. Referências

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Supabase Security](https://supabase.com/docs/guides/database/security)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)

---

*Documento vivo. Atualizar com novas políticas e correções.*
