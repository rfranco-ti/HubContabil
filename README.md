# 🏢 Hub Contábil - Sistema de Gestão para Escritórios Contábeis

[![Node.js](https://img.shields.io/badge/Node.js-24.x-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19.x-blue.svg)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-blue.svg)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📖 Sobre

Sistema completo de gestão para escritórios contábeis, desenvolvido com tecnologias modernas e foco na produtividade do contador. **Interface responsiva mobile-first** com suporte completo para celulares, tablets e desktop.

### ✨ Funcionalidades

- 🏢 **Gestão de Clientes** - Cadastro completo com consulta automática de CNPJ (4 adapters)
- 📅 **Calendário Contábil** - Obrigações acessórias, feriados e painel admin
- 🤖 **ChatBot IA** - DocLegalBot com contexto contábil/tributário (Llama 3.1)
- 🤖 **Robôs (RPA)** - Automação SEFAZ e Simples Nacional
- 📄 **Gestão de Documentos** - Upload, OCR, organização por pastas
- 📝 **Gerador de Documentos** - 6+ modelos personalizáveis
- 💰 **Simuladores** - Rescisão, Férias, 13º, Salário Líquido, IRPF, Horas Extras
- 💰 **Recibos** - Geração de recibos de honorários em PDF
- 🗒️ **Sticky Notes** - Mural de notas adesivas
- 👥 **Gestão de Usuários** - CRUD completo + API Keys (admin)
- 📊 **Logs do Sistema** - Monitoramento com download TXT/CSV
- 🔔 **Notificações** - Sistema de alertras em tempo real
- 📱 **Interface Responsiva** - Mobile-first com cards expansíveis + tabelas desktop

### 📚 Documentação

**Este projeto segue sistema de documentação obrigatória.** TODA modificação, implementação, bug e erro é documentado.

- 📖 **Guia Completo:** `docs/GUIA_DOCUMENTACAO.md`
- 🚨 **Regras:** `COMPORTAMENTO_IA.md`
- 📋 **Changelog:** `docs/CHANGELOG.md`
- 🗺️ **Visão Geral:** `docs/VISAO_GERAL.md`
- 🐛 **Bugs Conhecidos:** `docs/bugs/`
- 🚀 **Implementações:** `docs/implementations/`
- 📝 **Modificações:** `docs/modifications/`

---

## 🚀 Início Rápido

### Pré-requisitos
- Node.js 24+
- npm ou yarn
- Conta Supabase (gratuita)

### 1. Clone o repositório
```bash
git clone <url-do-repositorio>
cd HubContabil
```

### 2. Backend
```bash
cd backend
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas credenciais Supabase

# Rodar migrações
npx prisma migrate dev

# Iniciar servidor
npm run dev
# → http://localhost:3000
# → Docs: http://localhost:3000/api-docs
```

### 3. Frontend
```bash
cd ../frontend
npm install

# Iniciar desenvolvimento
npm run dev
# → http://localhost:5173
```

### 4. Login Padrão
```
Email: admin@hubcontabil.com
Senha: Admin@123
```

---

## 📚 Documentação

| Recurso | Link |
|---------|------|
| **Visão Geral** | [docs/VISAO_GERAL.md](docs/VISAO_GERAL.md) |
| **API Reference** | [docs/backend/API_REFERENCE.md](docs/backend/API_REFERENCE.md) |
| **Database Schema** | [docs/system-design/DATABASE_SCHEMA.md](docs/system-design/DATABASE_SCHEMA.md) |
| **Sprints** | [docs/sprints/](docs/sprints/) |
| **Swagger** | http://localhost:3000/api-docs |

---

## 🏗️ Stack Tecnológica

### Backend
- **Node.js** 24+ + Express
- **Prisma ORM** + PostgreSQL (Supabase)
- **JWT** para autenticação (8 horas)
- **Zod** para validação
- **Winston** para logs
- **Swagger** para documentação API
- **node-cron** para tarefas agendadas
- **TanStack Query** para cache frontend

### Frontend
- **React 19** + Vite
- **Tailwind CSS** + shadcn/ui
- **React Router** v6
- **Lucide Icons**
- **Sonner** para toasts
- **Axios** com interceptors
- **FullCalendar** para calendário

### Responsividade
- **Mobile-First:** Cards expansíveis (< 768px)
- **Tablet:** Sidebar semi-colapsada (768px - 1024px)
- **Desktop:** Layout completo (≥ 1024px)
- **Touch Targets:** ≥ 44px em todos elementos interativos

---

## 📁 Estrutura do Projeto

```
HubContabil/
├── backend/              # API Node.js
│   ├── src/
│   │   ├── controllers/  # Controladores
│   │   ├── routes/       # Rotas
│   │   ├── middlewares/  # Auth, logging, validation
│   │   └── validators/   # Schemas Zod
│   └── prisma/
│       └── schema.prisma
│
├── frontend/             # React App
│   └── src/
│       ├── components/   # Componentes
│       ├── pages/        # Páginas
│       └── services/     # API clients
│
└── docs/                 # Documentação completa
```

---

## 🧪 Testes

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm run test
```

---

## 📊 Sprints Completas

| # | Feature | Status |
|---|---------|--------|
| 1-12 | Core do sistema | ✅ |
| 13-16 | Editor de documentos | ✅ |
| 17-22 | CSS + Responsividade | ✅ |
| 24-32 | Tailwind puro + Config | ✅ |
| 33-34 | Sticky Notes | ✅ |
| 35 | Gestão de Usuários | ✅ |
| 36-37 | Logs + Documentação | ✅ |
| 38 | Agendamento RPA | ✅ |
| 39 | Dashboard com Dados Reais | ✅ |
| 40-41 | Simulador Rescisão | ✅ |
| 42 | Dashboard Profissional | ✅ |
| 43-46 | Sidebar + Header Profissional | ✅ |
| 47 | TanStack Query + CNPJ Adapters | ✅ |
| 48 | UI Mobile/Tablet Responsiva | ✅ |

---

## 🔐 Segurança

- ✅ Senhas hash com bcrypt
- ✅ JWT token com expiração
- ✅ Validação de inputs com Zod
- ✅ CORS configurado
- ✅ Row Level Security (Supabase)
- ✅ Logs de auditoria

---

## 🛣️ Roadmap

- [ ] Testes automatizados (Vitest + Playwright)
- [ ] Helmet + Rate Limit
- [ ] RPA real integration
- [ ] Scheduler de tarefas
- [ ] Notificações por email
- [ ] Módulo financeiro (honorários)
- [ ] Integração eSocial
- [ ] App mobile
- [ ] Relatórios avançados

---

## 📞 Suporte

- **Issues:** GitHub Issues
- **Email:** ricardofrancoti@gmail.com.com
- **Documentação:** Pasta `docs/`

---

## 📄 Licença

MIT License - Veja o arquivo [LICENSE](LICENSE) para detalhes.

---

**Desenvolvido com ❤️ para contadores**
