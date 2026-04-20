# Sprint 48 - Refatoração Adapters CNPJ
**Data:** 06/04/2026 | **Hora:** 16:00 | **Status:** ✅ | **Tipo:** Refactor

## Objetivo
Refatorar completamente os adapters CNPJ: remover BrasilAPI (redundante), adicionar Invertexto, corrigir URLs e formatos reais de cada API, nova ordem de fallback.

## Implementado

### Backend - Adapters
- **Deletado** `BrasilApiAdapter.js` (BrasilAPI é wrapper da Minha Receita)
- **Reescrito** `OpenCnpjAdapter.js` → URL: `api.opencnpj.org/{cnpj}`, formato flat (sem `company.*`)
- **Criado** `InvertextoAdapter.js` → URL: `api.invertexto.com/v1/cnpj/{cnpj}?token=`, token do `.env`
- **Reescrito** `CnpjaAdapter.js` → URL: `open.cnpja.com/office/{cnpj}`, dados `company.simples`, `company.simei`, telefones/emails corrigidos
- **Validado** `MinhaReceitaAdapter.js` → já estava OK

### Backend - Orquestrador
- **Reescrito** `index.js` → Nova ordem: OpenCNPJ → Invertexto → Minha Receita → Cnpja (rate limit 5/min)

### Frontend
- **Atualizado** `DetalheEmpresa.jsx` → Labels de `apiUsed` para novas APIs

## Arquivos
| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `backend/src/services/cnpj/adapters/BrasilApiAdapter.js` | Deletado | Redundante com Minha Receita |
| `backend/src/services/cnpj/adapters/OpenCnpjAdapter.js` | Reescrito | URL e formato reais |
| `backend/src/services/cnpj/adapters/InvertextoAdapter.js` | Criado | Novo adapter com token |
| `backend/src/services/cnpj/adapters/CnpjaAdapter.js` | Reescrito | Dados completos |
| `backend/src/services/cnpj/index.js` | Reescrito | Nova ordem de fallback |
| `frontend/src/pages/DetalheEmpresa.jsx` | Modificado | Labels atualizados |

## Nova Ordem de Fallback
| # | API | URL | Token | Vantagem | Desvantagem |
|---|-----|-----|-------|----------|-------------|
| 1 | OpenCNPJ | `api.opencnpj.org` | Não | Dados tributários, QSA, telefones | CNAE secundário só código |
| 2 | Invertexto | `api.invertexto.com` | Sim (.env) | Dados completos, CNAE descrição | Requer token |
| 3 | Minha Receita | `minhareceita.org` | Não | Open source, estável, QSA completo | Sem dados tributários |
| 4 | Cnpja | `open.cnpja.com` | Não | Mais atualizado, IE, emails | Rate limit 5/min |

## Métricas
- **Tempo:** 1h | **Erros:** 0 | **Files:** +1/~1
- **Testes:** Build ✅ | Manual: pendente
