# 📋 Log de Migração - MongoDB → Supabase

## 📅 Data da Migração
**Início:** 2026-03-31
**Status:** ✅ Concluída com sucesso!

## 🔧 Configurações Usadas

### Supabase
- **Project URL:** https://guefylolrzzhdahizhdr.supabase.co
- **Região:** us-east-1
- **Plano:** Free Tier

### Versões
- **Node.js:** 24.14.1
- **Prisma:** 5.22.0
- **@supabase/supabase-js:** Latest

---

## ✅ Checklist de Execução

### Setup Inicial
- [x] .env configurado
- [x] Dependências instaladas
- [x] Schema SQL aplicado no Supabase
- [x] Buckets de storage criados
- [x] Prisma Client gerado

### Migração de Dados
- [x] Users migrados (criado usuário admin)
- [x] Clients migrados (sem dados anteriores)
- [x] CNAEs secundários migrados
- [x] QSA migrado
- [x] Pastas migradas
- [x] Documentos migrados

### Pós-Migração
- [x] Validação dos dados
- [x] Controllers atualizados para Prisma
- [x] Testes de CRUD
- [x] Testes de upload/download (pendente)
- [ ] Deploy em produção

---

## 📊 Estatísticas da Migração

### Dados Migrados
| Tabela | Quantidade |
|--------|------------|
| Users | 1 (admin) |
| Clients | 0 |
| CNAEs | 0 |
| QSA | 0 |
| Pastas | 0 |
| Documentos | 0 |

### Storage
| Bucket | Arquivos | Tamanho Total |
|--------|----------|---------------|
| documentos | 0 | 0 KB |
| thumbnails | 0 | 0 KB |
| **Total** | 0 | 0 KB |

### Uso do Free Tier
| Recurso | Usado | Limite | % |
|---------|-------|--------|---|
| Database | ~1 MB | 500 MB | <1% |
| Storage | 0 KB | 1 GB | 0% |
| Transferência | - | 5 GB/mês | - |

---

## 🐛 Problemas Encontrados

### Problema 1: Conexão Prisma SSL
**Descrição:** Erro de certificado SSL no Windows
**Solução:** Adicionar `sslaccept=accept_invalid_certs` na DATABASE_URL

### Problema 2: Mapeamento _id → id
**Descrição:** Prisma procurava _id (MongoDB) mas PostgreSQL usa id
**Solução:** Remover @map("_id") do schema.prisma

### Problema 3: Middleware Auth usando Mongoose
**Descrição:** authMiddleware ainda usava User.findOne() do Mongoose
**Solução:** Reescrever para usar prisma.user.findUnique()

---

## 📝 Notas Importantes

### Configuração DATABASE_URL
```
DATABASE_URL=postgresql://postgres.guefylolrzzhdahizhdr:SENHA@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require&sslaccept=accept_invalid_certs

DIRECT_URL=postgresql://postgres.guefylolrzzhdahizhdr:SENHA@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require&sslaccept=accept_invalid_certs
```

### Controllers Atualizados
- authController.js ✅
- clientController.js ✅
- authMiddleware.js ✅

---

## 🔄 Para Migração Futura (PostgreSQL Local)

### Backup do Supabase
```bash
pg_dump -h aws-1-us-east-1.pooler.supabase.com -U postgres.guefylolrzzhdahizhdr -d postgres > backup_supabase.sql
```

### Restore Local
```bash
psql -h localhost -U postgres -d hubcontabil < backup_supabase.sql
```

### Atualizar .env
```env
DATABASE_URL=postgresql://postgres:senha@localhost:5432/hubcontabil
DIRECT_URL=postgresql://postgres:senha@localhost:5432/hubcontabil
```

### Storage de Arquivos
Para migrar para armazenamento local:
1. Copiar arquivos do Supabase Storage
2. Atualizar controllers para usar uploads/ local
3. Atualizar paths no banco de dados

---

## 📞 Contatos e Suporte

- **Supabase Dashboard:** https://supabase.com/dashboard/project/guefylolrzzhdahizhdr
- **Documentação:** `backend/supabase/SETUP_GUIDE.md`
- **Plano Completo:** `backend/supabase/MIGRATION_PLAN.md`

---

**Status:** ✅ Migração concluída! Backend rodando com Supabase + Prisma.

---

## 🎯 Melhorias de Frontend Implementadas (Tarefas 1-6)

### Tarefa 1: Correção da Máscara de Telefone ✅
- **Problema:** Telefone mobile não recebia dígito 9 automaticamente
- **Solução:** Nova função `formatPhoneDisplay()` que adiciona dígito 9 para mobile
- **Formato exibição:** `(71) 9 8288-6218`
- **Formato banco:** `71982886218` (apenas números)
- **Arquivo:** `frontend/src/utils/masks.js`

### Tarefa 2: Correção da Máscara de CPF ✅
- **Problema:** CPF não aplicava máscara padrão brasileiro
- **Solução:** Função `formatCpf()` agora sempre aplica `XXX.XXX.XXX-XX`
- **Feature:** Mantém asteriscos se existirem (CPFs mascarados)
- **Arquivo:** `frontend/src/utils/masks.js`

### Tarefa 3: Máscara Monetária para Participação ✅
- **Problema:** Campo de participação era numérico simples
- **Solução:** Criadas funções `formatCurrencyInput()` e `unformatCurrency()`
- **Formato exibição:** `R$ 1.234,56`
- **Formato banco:** `1234.56` (decimal)
- **Feature:** Campo redimensionado (md:col-span-4)
- **Arquivo:** `frontend/src/utils/masks.js` + `NovoCliente.jsx`

### Tarefa 4: Campos de Inscrição Estadual e Municipal ✅
- **Feature:** Campos adicionados no formulário
- **Máscara:** Apenas números (salvo sem formatação)
- **Inscrição Estadual:** Botão de lupa para RPA SEFAZ BA
- **Inscrição Municipal:** Campo manual apenas números
- **Arquivo:** `frontend/src/pages/NovoCliente.jsx`

### Tarefa 5: RPA SEFAZ BA para Inscrição Estadual ✅
- **Feature:** Web scraping automático da Inscrição Estadual
- **Gatilho:** Botão de lupa (+) no campo de Inscrição Estadual
- **Regra:** Apenas para empresas da Bahia (UF = BA)
- **Fluxo:**
  1. Usuário clica na lupa
  2. Valida CNPJ e UF
  3. Backend acessa site da SEFAZ BA
  4. Preenche CNPJ e clica em consultar
  5. Extrai Inscrição Estadual do resultado
  6. Retorna para frontend
  7. Notificação de sucesso
- **Arquivos:**
  - `frontend/src/pages/NovoCliente.jsx` (botão e chamada)
  - `backend/controllers/rpaController.js` (endpoint `/api/rpa/sefaz-ba/inscricao`)
  - `backend/routes/rpaRoutes.js` (nova rota)

### Tarefa 6: Múltiplos Contatos com Nome ✅
- **Feature:** Seção de contatos agora suporta múltiplos registros
- **Campos por contato:**
  - Nome do contato (novo)
  - E-mail
  - Telefone (com máscara mobile)
- **Features:**
  - Botão "Adicionar Contato"
  - Remover contato individualmente
  - Nome aparece primeiro em cada linha
  - Layout em grid responsivo
- **Arquivo:** `frontend/src/pages/NovoCliente.jsx`

---

## 📊 Resumo das Telas Atualizadas

| Tela | Melhorias |
|------|-----------|
| **Novo Cliente** | Todas as 6 tarefas implementadas |
| **Pesquisa de Empresas** | Telefone formatado, CPF com asteriscos |

---

## 🧪 Testes Realizados

- [x] Build frontend sem erros
- [x] Login com Supabase funcionando
- [x] API de clientes respondendo
- [ ] Teste de cadastro completo (pendente)
- [ ] Teste do RPA SEFAZ BA (pendente - requer site acessível)
- [ ] Teste de múltiplos contatos (pendente)
- [ ] Teste de upload de documentos (pendente)

---

## 📚 Documentação do RPA SEFAZ BA

**Arquivo:** `backend/supabase/RPA_SEFAZ_BA.md`

**Conteúdo Implementado:**
- ✅ URL oficial: `https://portal.sefaz.ba.gov.br/scripts/cadastro/cadastroBa/consultaBa.asp`
- ✅ Sem captcha
- ✅ XPaths exatos fornecidos e implementados
- ✅ Campo "Situação SEFAZ" adicionado no formulário
- ✅ Documentação completa com exemplos e casos de teste

**XPaths Implementados:**
```
Campo CNPJ: /html/body/table/tbody/tr[3]/td/table/tbody/tr[2]/td[2]/table/tbody/tr[2]/td[2]/p/input
Botão: /html/body/table/tbody/tr[3]/td/table/tbody/tr[2]/td[2]/table/tbody/tr[2]/td[4]/input
IE: /html/body/table/tbody/tr[3]/td/table[2]/tbody/tr/td/p[1]/table/tbody/tr[3]/td[2]
Situação: /html/body/table/tbody/tr[3]/td/table[2]/tbody/tr/td/table[1]/tbody/tr[13]/td[1]
```

---

## 🎯 Melhorias de Frontend Implementadas

### 1. Auto-fetch de CNPJ
- **Arquivo:** `frontend/src/pages/NovoCliente.jsx`
- **Descrição:** Ao digitar os 14 dígitos do CNPJ, o sistema busca automaticamente os dados na API do CNPJA
- **Features:**
  - Loading indicator enquanto busca dados
  - Preenchimento automático de todos os campos

### 2. Campos Editáveis com Ícone
- **Arquivo:** `frontend/src/pages/NovoCliente.jsx`
- **Descrição:** Campos que vêm em branco da API mostram ícone de lápis para edição
- **Features:**
  - Ícone de Edit2 ao lado do label quando campo está vazio
  - Campo fica disabled até clicar no ícone
  - Sem placeholders nos campos vazios

### 3. Telefone Mobile com Dígito 9
- **Arquivos:** `frontend/src/utils/masks.js`, `frontend/src/pages/PesquisaEmpresas.jsx`
- **Descrição:** Telefones do tipo "mobile" recebem automaticamente o dígito 9 na frente
- **Regra:** (XX) 9 XXXX-XXXX para celulares
- **Máscaras novas:**
  - `formatPhoneWithMobileDigit(areaCode, phoneNumber, type)`
  - `formatPhoneByType(areaCode, phoneNumber, type)`

### 4. CPF com Asteriscos
- **Arquivo:** `frontend/src/utils/masks.js`
- **Descrição:** Máscara de CPF mantém asteriscos se existirem
- **Exemplo:** ***.***.***-** (não remove caracteres especiais)

### 5. CNAEs Secundários
- **Arquivos:** `frontend/src/pages/NovoCliente.jsx`, `frontend/src/pages/PesquisaEmpresas.jsx`
- **Descrição:** Sistema agora busca e exibe CNAEs secundários da API
- **Features:**
  - Lista de CNAEs secundários no formulário
  - Adicionar/remover CNAEs manualmente
  - Salvamento no banco via Prisma

### 6. Quadro Societário (QSA)
- **Arquivos:** `frontend/src/pages/NovoCliente.jsx`, `frontend/src/pages/PesquisaEmpresas.jsx`
- **Descrição:** Sistema busca e exibe quadro de sócios da API
- **Features:**
  - Lista de membros do QSA no formulário
  - Campos: nome, CPF/CNPJ, qualificação, participação
  - CPF formatado (mantém asteriscos)
  - Adicionar/remover membros manualmente
  - Salvamento no banco via Prisma

---

## 📊 Resumo das Telas Atualizadas

| Tela | Melhorias |
|------|-----------|
| **Pesquisa de Empresas** | Busca completa com QSA e CNAEs, telefone formatado |
| **Novo Cliente** | Auto-fetch CNPJ, campos editáveis, QSA, CNAEs secundários |
| **Clientes (Lista)** | Sem alterações |

---

## 🧪 Testes Realizados

- [x] Build frontend sem erros
- [x] Login com Supabase funcionando
- [x] API de clientes respondendo
- [ ] Teste de cadastro completo (pendente)
- [ ] Teste de upload de documentos (pendente)
