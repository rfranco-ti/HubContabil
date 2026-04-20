#!/usr/bin/env node

/**
 * Script de Automação de Documentação - HubContabil
 * 
 * Este script ajuda a criar documentos automaticamente seguindo os templates padronizados.
 * Uso: node scripts/create-doc.js [type] [name]
 * 
 * Types: bug, implementation, modification, sprint
 * 
 * Exemplos:
 *   node scripts/create-doc.js bug error-prisma-relation
 *   node scripts/create-doc.js implementation sistema-notificacoes
 *   node scripts/create-doc.js modification refactor-auth
 *   node scripts/create-doc.js sprint 44-nova-feature
 */

const fs = require('fs');
const path = require('path');

// Configuração
const DOCS_DIR = path.join(__dirname, '..', 'docs');
const TYPES = {
  bug: {
    dir: 'bugs',
    prefix: 'Bug:',
    template: 'bug'
  },
  implementation: {
    dir: 'implementations',
    prefix: 'Implementação:',
    template: 'implementation'
  },
  modification: {
    dir: 'modifications',
    prefix: 'Modificação:',
    template: 'modification'
  },
  sprint: {
    dir: 'sprints',
    prefix: 'Sprint',
    template: 'sprint'
  }
};

// Gerar timestamp formatado
function getTimestamp() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  
  return {
    filename: `${year}${month}${day}_${hours}${minutes}`,
    display: `${day}/${month}/${year} ${hours}:${minutes}`
  };
}

// Obter data atual formatada
function getCurrentDate() {
  const months = [
    'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
  ];
  const now = new Date();
  return `${now.getDate()} de ${months[now.getMonth()]} de ${now.getFullYear()}`;
}

// Templates
const TEMPLATES = {
  bug: (name, timestamp) => `# Bug: ${name.replace(/-/g, ' ').toUpperCase()}

**Data:** ${timestamp.display}
**Tipo:** Bug
**Severidade:** 🔴 Crítica | 🟡 Alta | 🟢 Baixa
**Status:** 🔄 Em Investigação | ✅ Resolvido

---

## 🐛 Descrição do Bug

[O que aconteceu - descrever o comportamento inesperado]

## 🔍 Causa Raiz

[Por que aconteceu - explicação técnica]

**Localização:**
- **Arquivo:** \`caminho/arquivo.js\`
- **Linha:** X (se aplicável)
- **Função/Método:** nomeFuncao()

## ✅ Solução Aplicada

[Como foi resolvido - passo a passo técnico]

\`\`\`js
// Antes (com bug)
[código com problema]

// Depois (corrigido)
[código corrigido]
\`\`\`

## 📁 Arquivos Modificados

| Arquivo | Mudança |
|---------|---------|
| \`caminho/arquivo.js\` | [Descrição] |

## 📚 Pesquisa e Referências

[O que foi pesquisado para entender o bug]
- Link 1
- Link 2

## 💡 Lição Aprendida

[Como evitar este bug no futuro]

## 🛡️ Prevenção Futura

- [ ] Adicionar teste automatizado (se aplicável)
- [ ] Adicionar validação (se aplicável)
- [ ] Atualizar documentação

---

*Documento gerado automaticamente como parte do sistema de documentação obrigatória (COMPORTAMENTO_IA.md v5.0)*
`,

  implementation: (name, timestamp) => `# Implementação: ${name.replace(/-/g, ' ').toUpperCase()}

**Data:** ${timestamp.display}
**Tipo:** Implementação Nova
**Sprint:** #X
**Status:** ✅ Concluída

---

## 🎯 Objetivo

[Descrição de 1-2 frases do que foi implementado]

## 📋 Funcionalidades

1. ✅ [Feature 1]
2. ✅ [Feature 2]
3. ✅ [Feature 3]

## 🛠️ Como Funciona

### Fluxo Principal
[Descrição do fluxo/lógica]

### Backend
- **Endpoints criados:** \`GET/POST /api/...\`
- **Models criados:** [Lista]
- **Services criados:** [Lista]

### Frontend
- **Componentes criados:** [Lista]
- **Páginas criadas:** [Lista]
- **Rotas adicionadas:** [Lista]

## 📁 Arquivos

### Criados
| Arquivo | Descrição |
|---------|-----------|
| \`caminho/arquivo.js\` | [Descrição] |

### Modificados
| Arquivo | Mudança |
|---------|---------|
| \`caminho/arquivo.js\` | [O que mudou] |

## 🧪 Testes

| Teste | Status |
|-------|--------|
| Unitários | ✅ Passou |
| Integração | ✅ Passou |
| Manual | ✅ Testado |

## 📚 Referências

- [Base legal/documentação se aplicável]
- [Links úteis]

## ⚠️ Notas Importantes

[Qualquer informação relevante para futuros desenvolvedores]

---

*Documento gerado automaticamente como parte do sistema de documentação obrigatória (COMPORTAMENTO_IA.md v5.0)*
`,

  modification: (name, timestamp) => `# Modificação: ${name.replace(/-/g, ' ').toUpperCase()}

**Data:** ${timestamp.display}
**Tipo:** Modificação
**Sprint:** #X (se aplicável)
**Status:** ✅ Concluída

---

## 📝 O Que Mudou

**Antes:**
[Descrição do estado anterior]

**Depois:**
[Descrição do estado atual]

## 🎯 Por Que Mudou

[Motivo/justificativa da modificação]

## 📁 Arquivos Afetados

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| \`caminho/arquivo.js\` | Modificado | [O que mudou] |

## ⚠️ Impacto

- **Breaking changes:** [Sim/Não + descrição]
- **Migração necessária:** [Sim/Não + passos]
- **Testes necessários:** [Lista de testes]

## ✅ Verificação

- [ ] Build passou
- [ ] Testes passaram
- [ ] Funcionalidade testada manualmente
- [ ] Documentação relacionada atualizada

---

*Documento gerado automaticamente como parte do sistema de documentação obrigatória (COMPORTAMENTO_IA.md v5.0)*
`,

  sprint: (name, timestamp) => `# Sprint ${name} - ${name.split('-').slice(1).join(' ').toUpperCase()}

## 🎯 Objetivo
[1-2 frases]

## 📋 Tarefas
- [x] Tarefa 1
- [x] Tarefa 2

## 📊 Métricas
- **Tempo estimado:** Xh
- **Tempo real:** Xh
- **Erros encontrados:** X
- **Arquivos criados:** X
- **Arquivos modificados:** X

## ✅ Resultado
[O que foi implementado e como testar]

---

*Documento gerado automaticamente como parte do sistema de documentação obrigatória (COMPORTAMENTO_IA.md v5.0)*
`
};

// Função principal
function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log(`
📝 Script de Automação de Documentação - HubContabil

Uso: node scripts/create-doc.js [type] [name]

Types:
  bug            - Documentação de bug/erro
  implementation - Documentação de implementação nova
  modification   - Documentação de modificação
  sprint         - Documentação de sprint

Exemplos:
  node scripts/create-doc.js bug error-prisma-relation
  node scripts/create-doc.js implementation sistema-notificacoes
  node scripts/create-doc.js modification refactor-auth
  node scripts/create-doc.js sprint 44-nova-feature
`);
    process.exit(1);
  }

  const [type, name] = args;
  
  // Validar tipo
  if (!TYPES[type]) {
    console.error(`❌ Tipo inválido: "${type}"`);
    console.error(`Tipos válidos: ${Object.keys(TYPES).join(', ')}`);
    process.exit(1);
  }

  const config = TYPES[type];
  const timestamp = getTimestamp();
  
  // Gerar nome do arquivo
  const filename = type === 'sprint' 
    ? `SPRINT_${name.toUpperCase().replace(/-/g, '_')}.md`
    : `${timestamp.filename}_${name}.md`;
  
  // Caminho completo
  const filePath = path.join(DOCS_DIR, config.dir, filename);
  
  // Verificar se diretório existe
  if (!fs.existsSync(path.join(DOCS_DIR, config.dir))) {
    console.error(`❌ Diretório não encontrado: docs/${config.dir}`);
    process.exit(1);
  }
  
  // Verificar se arquivo já existe
  if (fs.existsSync(filePath)) {
    console.error(`❌ Arquivo já existe: ${filePath}`);
    process.exit(1);
  }
  
  // Criar arquivo com template
  const content = TEMPLATES[config.template](name, timestamp);
  fs.writeFileSync(filePath, content, 'utf8');
  
  console.log(`
✅ Documento criado com sucesso!

📁 Caminho: ${filePath}
📝 Tipo: ${config.prefix}
🕐 Data: ${timestamp.display}

📋 Próximos passos:
  1. Editar o arquivo e preencher todas as seções
  2. Atualizar docs/CHANGELOG.md
  3. Atualizar PROJECT_CONTEXT.md (se necessário)
  4. Notificar usuário sobre a documentação
`);
}

// Executar
main();
