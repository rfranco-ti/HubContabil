# Frontend - Componentes de Configurações

## Visão Geral
Componentes reutilizáveis para a página de Configurações com sistema de abas.

## Estrutura de Abas
```
Configurações/
├── Geral (nativo) - API, Upload, Notificações, Backup
├── Usuários → GestaoUsuarios.jsx
├── Agendamentos → AgendamentosRpa.jsx
├── APIs → GestaoApis.jsx
└── Logs → LogsSistema.jsx
```

## Componentes Criados

### GestaoUsuarios.jsx
**Local:** `src/components/Configuracoes/GestaoUsuarios.jsx`
**Funcionalidades:**
- Listagem de usuários em tabela responsiva
- Busca por nome, email ou cargo
- Modal de criação/edição (ModalUsuario.jsx)
- Ações: editar, excluir com confirmação
- Avatar com inicial do nome

### ModalUsuario.jsx
**Local:** `src/components/Configuracoes/ModalUsuario.jsx`
**Funcionalidades:**
- Formulário com validação (nome, email, senha, cargo)
- Senha opcional na edição
- 4 cargos: Contador, Administrador, Auxiliar, Estagiário
- Fecha com ESC ou clique fora

### AgendamentosRpa.jsx
**Local:** `src/components/Configuracoes/AgendamentosRpa.jsx`
**Funcionalidades:**
- Cards visuais com tipo de robô (🏛️/📋)
- CNPJ formatado, recorrência, horário
- Contador de execuções, status (ativo/inativo)
- Botões: executar, editar, excluir
- Banner informativo sobre execução simulada

### ModalAgendamento.jsx
**Local:** `src/components/Configuracoes/ModalAgendamento.jsx`
**Funcionalidades:**
- Seleção visual de tipo de robô
- Máscara automática de CNPJ
- 6 tipos de recorrência com opções dinâmicas
- Seletor de dias da semana (botões)
- Toggle ativo/inativo

### GestaoApis.jsx
**Local:** `src/components/Configuracoes/GestaoApis.jsx`
**Funcionalidades:**
- Seção de documentação da API com link para Swagger UI
- Lista de endpoints disponíveis
- Cards de API keys com prefixo, permissões, stats
- Destaque especial para chave recém-criada com botão copiar
- Banner de segurança sobre armazenamento hash

### ModalApiKey.jsx
**Local:** `src/components/Configuracoes/ModalApiKey.jsx`
**Funcionalidades:**
- 8 permissões granulares com checkboxes
- Botão "Selecionar todas"
- Data de expiração opcional
- Validação de formulário

### LogsSistema.jsx
**Local:** `src/pages/LogsSistema.jsx`
**Funcionalidades:**
- 4 cards de estatísticas clicáveis (Total, Info, Warnings, Erros)
- Clique filtra logs pelo nível
- Badge indicando filtro ativo
- Modal de detalhes do log com dados tratados
- Download TXT/CSV
- Filtros avançados (nível, limite, busca)
- Botão limpar logs antigos

## Serviços de API Criados
| Serviço | Arquivo | Endpoints |
|---------|---------|-----------|
| `usuariosAPI` | `src/services/usuariosAPI.js` | CRUD /api/usuarios |
| `agendamentosAPI` | `src/services/agendamentosAPI.js` | CRUD /api/agendamentos |
| `apiKeysAPI` | `src/services/apiKeysAPI.js` | CRUD /api/api-keys |
| `logsAPI` | `src/services/logsAPI.js` | Logs + stats + download |

## Padrão de Comunicação
```js
// Request
const response = await api.get('/api-keys');
return response.data; // { success: true, data: [...] }

// Error handling
try {
  await api.post('/api-keys', dados);
} catch (error) {
  toast.error(error.response?.data?.message || 'Erro');
}
```
