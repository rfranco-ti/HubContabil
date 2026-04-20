# Sprint 47 - Refatoração CNPJ + TanStack Query
**Data:** 06/04/2026 | **Hora:** 14:30 | **Status:** ✅ | **Tipo:** Refactor + Feature

## Objetivo
Reescrever completamente o sistema de consulta CNPJ e detalhes da empresa: TanStack Query para cache frontend, adapters individuais por API com normalização + máscaras, página de detalhes sem banco local (só API externa + botão salvar).

## Implementado

### Backend - Serviços CNPJ por Adapter
- **`adapters/BrasilApiAdapter.js`** → Atualizado com máscaras (CNPJ, CPF, CEP, datas, moeda), dados tributários (Simples/MEI), cidade/UF separados
- **`adapters/MinhaReceitaAdapter.js`** → Atualizado com máscaras completas, extração de telefones
- **`adapters/OpenCnpjAdapter.js`** → Reescrito para formato real da API (`api.opencnpj.org`), dados tributários, QSA completo com faixa etária
- **`index.js`** → Orquestrador com fallback: BrasilAPI → Cnpja → MinhaReceita → OpenCNPJ + circuit breaker + cache

### Frontend - TanStack Query
- **`@tanstack/react-query`** instalado
- **`App.jsx`** → `QueryClientProvider` com `staleTime: 5min`, `gcTime: 10min`
- **`hooks/useCnpj.js`** → Reescrito com 4 hooks:
  - `useConsultaCnpj(cnpj)` → Query com cache, loading, error nativos
  - `useSalvarCliente()` → Mutation com invalidation automática
  - `useClientes()` → Lista com cache de 2min
  - `useClienteById(id)` → Detalhe com cache

### Frontend - Página DetalheEmpresa
- **`pages/DetalheEmpresa.jsx`** → Reescrito completamente:
  - ❌ Removido busca no banco local
  - ✅ Usa `useConsultaCnpj()` com TanStack Query
  - ✅ Botão "Salvar no Banco" → cadastra empresa pela primeira vez
  - ✅ Botão "Editar Dados" → aparece após salvar
  - ✅ **Seções completas:** Dados Principais, Tributário (Simples/MEI), Endereço (Cidade/UF separados), Contatos, CNAE, Sócios, Honorários, Anotações

## Arquivos
| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `frontend/package.json` | Modificado | +@tanstack/react-query |
| `frontend/src/App.jsx` | Modificado | QueryClientProvider |
| `frontend/src/hooks/useCnpj.js` | Reescrito | 4 hooks com TanStack Query |
| `frontend/src/pages/DetalheEmpresa.jsx` | Reescrito | Sem banco local, API + salvar |
| `backend/src/services/cnpj/adapters/BrasilApiAdapter.js` | Modificado | Máscaras + tributário |
| `backend/src/services/cnpj/adapters/MinhaReceitaAdapter.js` | Modificado | Máscaras + telefones |
| `backend/src/services/cnpj/adapters/OpenCnpjAdapter.js` | Reescrito | Formato real da API |

## Métricas
- **Tempo:** 2h | **Erros:** 0 | **Files:** +7/~3
- **Testes:** Build ✅ | Unitários N/A | Manual: pendente
