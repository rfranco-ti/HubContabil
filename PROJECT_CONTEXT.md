# HubContabil - Project Context
# v4.1 | 07/04/2026 | Ultra-compacto para IA

## O Que É
Sistema full-stack para gestão de escritórios contábeis | 46+ sprints completas | Produção

## Stack Rápida
React 19 + Vite + Tailwind + shadcn/ui | Node 24 + Express + Prisma | PostgreSQL (Supabase) | JWT | Puppeteer | Tesseract.js

## Features Ativas
&#9989; Clientes (CNPJ auto) | &#9989; Dashboard (dados reais) | &#9989; Calendário (167 obrigações + feriados dinâmicos) | &#9989; Simulador Rescisão (INSS/IRRF progressivos) | &#9989; GED (Upload + OCR) | &#9989; RPA (Simples/SEFAZ) | &#9989; Gerador Docs (6+ templates) | &#9989; Recibos PDF | &#9989; Sticky Notes | &#9989; Users Admin | &#9989; Logs | &#9989; Agendamento RPA | &#9989; API Keys | &#9989; Notificações | &#9989; Busca CNAEs | &#9989; Busca CNAEs MEI | &#9989; ChatBot IA (DocLegalBot)

## Documentação (IA - Ler Primeiro)
1. `docs/INDEX.md` &#8594; Mapa completo de navegação
2. `docs/context/` &#8594; Backend/Frontend/Database/Errors (~2-3 páginas cada)
3. `docs/README.md` &#8594; Padrões de documentação
4. `docs/CHANGELOG.md` &#8594; Histórico de mudanças
5. `frontend/DESIGN_SYSTEM.md` &#8594; Diretrizes de design mobile-first

**Regras completas:** `COMPORTAMENTO_IA.md`

## Regras Críticas
- **NUNCA** usar Mongoose &#8594; Prisma + PostgreSQL apenas
- **SEMPRE** usar `@prisma/client` para DB
- **SEMPRE** validar inputs com Zod
- **SEMPRE** try/catch com formato `{ success, data/error }`
- **NUNCA** esconder erros &#8594; analisar e resolver explicitamente
- **NUNCA** encerrar todos processos Node &#8594; PID específico
- **SEMPRE** testar build após alterações
- **SEMPRE** documentar modificações/implementações/bugs
- **MOBILE-FIRST SEMPRE:** Tabelas NUNCA em mobile — usar Card Mobile + Tabela Desktop

## URLs
Frontend: http://localhost:5173 | Backend: http://localhost:3000 | API Docs: http://localhost:3000/api-docs

## Auth
JWT (30 dias) em localStorage | bcrypt | Admin = cargo "Admin"/"Administrador" (case-insensitive)

## Test Credentials
admin@hubcontabil.com / 123456

## Pendências
&#128308; Testes automatizados | &#128993; Helmet/Rate Limit | &#128994; RPA real integration | &#128994; Scheduler

## Modificações Recentes
- **48:** UI Mobile/Tablet Responsiva (MobileTableCard, header logo sempre visível, sidebar tablet 220px)
- **47:** Refatoração Adapters CNPJ + TanStack Query + ChatBot IA
- **46:** Refinamentos Profissionais (sidebar header sempre visível, tooltips getBoundingClientRect, avatar gradiente, hover scale) 
