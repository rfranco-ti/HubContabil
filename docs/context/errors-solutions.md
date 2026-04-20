# Errors & Solutions - HubContabil
# Versão: 1.0 | 05/04/2026
# PROPÓSITO: Catalogar erros conhecidos e soluções para consulta rápida por IA

## Erros de Configuração/Ambiente

### E001: Prisma Client não gera após schema changes
**Sintoma:** `Error: @prisma/client` não encontra model novo
**Causa:** Schema modificado mas `prisma generate` não rodou
**Solução:** `cd backend && npx prisma generate && npx prisma db push`
**Prevenção:** Sempre rodar generate após alterar schema.prisma

### E002: Supabase connection error
**Sintoma:** `Error: Invalid connection string` ou timeout
**Causa:** DATABASE_URL incorreta no .env ou Supabase paused
**Solução:** Verificar .env (DATABASE_URL, SUPABASE_URL, SUPABASE_KEY), verificar status no dashboard Supabase
**Prevenção:** Validar .env antes de iniciar backend

### E003: CORS blocked no frontend
**Sintoma:** `Access to fetch blocked by CORS policy`
**Causa:** Backend não configurado para aceitar origem do frontend
**Solução:** Backend já tem CORS middleware configurado para `http://localhost:5173`
**Prevenção:** Verificar backend rodando na porta 3000

## Erros de Autenticação

### E004: JWT token expired
**Sintoma:** `401 Unauthorized` em rotas protegidas
**Causa:** Token expirou (30 dias) ou não enviado
**Solução:** Re-fazer login, token stored em localStorage
**Prevenção:** Implementar refresh token (pendente)

### E005: API Key permission denied
**Sintoma:** `403 Forbidden` ao usar API key
**Causa:** Key não tem permissão para operação solicitada
**Solução:** Verificar permissões da key em `/api/api-keys`, conceder permissão necessária
**Prevenção:** Documentar permissões necessárias ao criar keys

## Erros de Database

### E006: Prisma P2002 - Unique constraint violation
**Sintoma:** `Unique constraint failed on the fields: ('cnpj')`
**Causa:** Tentando criar registro com valor unique duplicado
**Solução:** Verificar se CNPJ/email já existe antes de criar, ou usar upsert
**Prevenção:** Validar uniqueness antes de mutate operations

### E007: Foreign key constraint violation
**Sintoma:** `Foreign key constraint failed on the field`
**Causa:** Tentando criar registro com FK para registro inexistente
**Solução:** Verificar se registro relacionado existe antes de criar
**Prevenção:** Validar existência de FK antes de operações

## Erros de Frontend

### E008: React 19 + Craft.js incompatibility
**Sintoma:** `Error: Invalid hook call` ou crashes no editor
**Causa:** Craft.js não compatível com React 19
**Solução:** Migrar para Puck.js (React 19 compatible)
**Prevenção:** Verificar compatibilidade de pacotes antes de instalar

### E009: Tailwind classes não aplicam
**Sintoma:** Classes Tailwind não têm efeito visual
**Causa:** tailwind.config.js não inclui paths dos arquivos, ou build cache
**Solução:** Verificar `content` em tailwind.config.js inclui todos os paths, limpar cache `.vite`
**Prevenção:** Sempre adicionar novos diretórios ao content array

### E010: Vite HMR não atualiza
**Sintoma:** Mudanças no código não refletem no browser
**Causa:** Vite dev server com cache corrompido
**Solução:** `rm -rf node_modules/.vite && npm run dev`
**Prevenção:** Limpar cache periodicamente se HMR falhar

## Erros de API Externa

### E011: CNPJ lookup timeout
**Sintoma:** `TimeoutError: The operation was aborted`
**Causa:** API open.cnpja.com indisponível ou lenta (>5s)
**Solução:** Fallback automático para invertexto.com já implementado
**Prevenção:** Timeout de 5s via AbortController, retry logic

### E012: Supabase Storage upload fails
**Sintoma:** `Error: Bucket not found` ou `Unauthorized`
**Causa:** Bucket não criado ou permissions incorretas
**Solução:** Criar bucket no Supabase Dashboard, configurar RLS policies
**Prevenção:** Verificar bucket existe antes de upload

## Erros de RPA

### E013: Puppeteer não instala no Windows
**Sintoma:** `Error: Could not find Chromium revision`
**Causa:** Puppeteer não encontra Chromium ou instalação bloqueada
**Solução:** `npm install puppeteer --ignore-scripts` depois `npx puppeteer browsers install chrome`
**Prevenção:** Documentar instalação específica para Windows

## Erros de Build/Deploy

### E014: Prisma migrations não aplicam em produção
**Sintoma:** `Error: Migration failed`
**Causa:** Conflito de migrations ou DB em estado inconsistente
**Solução:** `npx prisma migrate resolve --applied <migration_name>` ou reset migrations
**Prevenção:** Testar migrations local antes de produção

## Soluções Gerais

### Padrão de Error Handling (Backend)
```js
try {
  const data = await prisma.model.create({ data })
  res.json({ success: true, data })
} catch (error) {
  if (error.code === 'P2002') return res.status(409).json({ success: false, error: 'Already exists' })
  res.status(500).json({ success: false, error: error.message })
}
```

### Padrão de Error Handling (Frontend)
```js
try {
  const response = await api.post('/endpoint', payload)
  toast.success('Sucesso')
} catch (error) {
  toast.error(error.response?.data?.message || 'Erro inesperado')
}
```

## Lições Aprendidas

1. **SEMPRE validar inputs com Zod** antes de operações de DB
2. **SEMPRE usar try/catch** com formato padrão de resposta
3. **SEMPRE verificar compatibilidade** de pacotes antes de instalar (especialmente React 19)
4. **SEMPRE testar migrations** local antes de produção
5. **SEMPRE documentar novos erros** neste arquivo para consulta futura

## Referências
- docs/backend/ERROR_HANDLING.md (estratégia completa)
- docs/sprints/ (erros específicos de sprints)
- docs/bugs/ (bugs documentados com soluções)


### E015: ThemeProvider import error
**Sintoma:** `The requested module '/src/context/ThemeContext.js' does not provide an export named 'ThemeProvider'`
**Causa:** Importação incorreta devido a arquivos duplicados (`themeContext.js` e `ThemeContext.jsx`)
**Solução:** Criar barreira de exportação em `frontend/src/context/index.js` e corrigir imports
**Prevenção:** Sempre usar barreiras de exportação para pastas com múltiplos exports