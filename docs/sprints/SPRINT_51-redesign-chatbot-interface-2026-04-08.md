# Sprint - Redesign Interface do ChatBot

## Objetivo
Reconstruir completamente a interface do ChatBot para ser responsiva, fluida, com dark/light mode e melhor aproveitamento do espaco da tela.

## Problemas Atuais
- ❌ Nao responsivo: em telas medias/grandes, muito espaco inutilizado
- ❌ Sem dark mode: apenas tema padrao do sistema
- ❌ Area de chat limitada: `max-w-4xl` restringe demais em telas grandes
- ❌ Mensagens de boas-vindas muito tecnica (tabelas de comandos)
- ❌ Scroll nao otimizado para conversas longas

## Especificacoes Tecnicas

### Layout Responsivo
| Breakpoint | Comportamento |
|------------|---------------|
| `sm` (640px) | Chat ocupa 100% da largura, padding reduzido |
| `md` (768px) | Chat com maximo de 600px, centralizado |
| `lg` (1024px) | Layout split: sidebar de comandos (280px) + chat (resto) |
| `xl` (1280px) | Layout split: sidebar de comandos (320px) + chat (resto) |

### Dark/Light Mode
- Toggle no header, proximo ao icone de perfil e notificacoes
- Estado persistido no `localStorage`
- Classes Tailwind: `dark:` prefix em todos os componentes
- Tema padrao: light (se usuario nao tiver preferencia)

### Componentes Novos

#### 1. ThemeToggle (Header)
```
[🔔 Notificacoes] [🌙 Tema] [👤 Avatar]
```
- Botao circular com icone de sol/lua
- Transicao suave (300ms) entre temas
- Posicionado entre notificacoes e avatar no header

#### 2. ChatSidebar (telas lg+)
- Lista de comandos rapidos clicaveis
- Historico de conversas recentes (localStorage)
- Botao "Nova conversa"
- Colapsavel em telas menores

#### 3. ChatArea (principal)
- Mensagem de boas-vindas simplificada
- Baloes de mensagem com animacao suave
- Indicador de "digitando..." animado
- Scroll automatico para ultima mensagem
- Botao "copiar" em cada mensagem do bot
- Timestamp em cada mensagem

### Mensagem de Boas-Vindas (Nova)
```
Ola! Sou o assistente do HubContabil. 👋

Posso te ajudar com:
• Dúvidas sobre Simples Nacional, Fator R e MEI
• Calculos de INSS, IRRF e folha de pagamento
• Modelos de contrato e documentos societarios
• Obrigações mensais e prazos
• Busca na web por atualizações legislativas

Digite sua pergunta ou use os comandos rapidos →
```

### Paleta de Cores

#### Light Mode
| Elemento | Cor |
|----------|-----|
| Background | `bg-slate-50` |
| Chat container | `bg-white` |
| Mensagem usuario | `bg-blue-600 text-white` |
| Mensagem bot | `bg-slate-100 text-slate-800` |
| Input | `bg-white border-slate-300` |
| Sidebar | `bg-white border-slate-200` |

#### Dark Mode
| Elemento | Cor |
|----------|-----|
| Background | `dark:bg-slate-950` |
| Chat container | `dark:bg-slate-900` |
| Mensagem usuario | `bg-blue-600 text-white` |
| Mensagem bot | `dark:bg-slate-800 dark:text-slate-200` |
| Input | `dark:bg-slate-800 dark:border-slate-700 dark:text-white` |
| Sidebar | `dark:bg-slate-900 dark:border-slate-800` |

## Arquivos a Criar/Modificar

| Arquivo | Acao | Descricao |
|---------|------|-----------|
| `frontend/src/components/layout/ThemeToggle.jsx` | Criar | Botao dark/light mode no header |
| `frontend/src/components/ChatBot/ChatSidebar.jsx` | Criar | Sidebar de comandos e historico |
| `frontend/src/components/ChatBot/MessageBubble.jsx` | Criar | Componente de balao de mensagem |
| `frontend/src/components/ChatBot/TypingIndicator.jsx` | Criar | Indicador animado de digitacao |
| `frontend/src/pages/ChatBot.jsx` | Reescrever | Interface completamente redesenhada |
| `frontend/src/App.jsx` | Modificar | Adicionar ThemeProvider |
| `frontend/src/styles/globals.css` | Modificar | Variaveis CSS para dark mode |
| `frontend/tailwind.config.js` | Verificar | Dark mode via classe |

## Critérios de Aceite
- [ ] Chat ocupa 100% da tela em mobile
- [ ] Layout split em desktop (sidebar + chat)
- [ ] Dark mode funcional com toggle no header
- [ ] Preferencia de tema persistida no localStorage
- [ ] Transicao suave entre temas
- [ ] Mensagens com animacao de entrada
- [ ] Scroll automatico para ultima mensagem
- [ ] Botao copiar em cada resposta do bot
- [ ] Sidebar colapsavel em telas md/lg
- [ ] Build sem erros
- [ ] Testado em mobile (375px), tablet (768px) e desktop (1920px)

## Estimativa
- **Tempo:** 3-4h
- **Complexidade:** Media
- **Risco:** Baixo (componentes isolados)
