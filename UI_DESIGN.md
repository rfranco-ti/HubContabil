# HubContábil — UI Design System (Guia)

Este documento define os padrões de UI do HubContábil para manter consistência visual, acessibilidade e previsibilidade entre telas.

## Princípios

- Consistência acima de “criatividade por tela”: reutilize componentes e estilos.
- Responsivo por padrão: mobile-first; evitar layouts que dependem de cálculos manuais por página.
- Estados claros: hover, focus, disabled, loading e error devem ser visíveis.
- Acessibilidade mínima: foco visível, áreas clicáveis com 44px, contraste adequado.

## Paleta e tema

- Base: Tailwind + paleta do projeto em [tailwind.config.js](file:///d:/Projetos_Dev/HubContabil/frontend/tailwind.config.js).
- Tokens oficiais (referência): [frontend.js](file:///d:/Projetos_Dev/HubContabil/frontend/src/config/frontend.js).

Regras práticas:

- Primário: `blue-600` (hover `blue-700`).
- Texto principal: `slate-900` (dark: `slate-100`).
- Texto secundário: `slate-600` (dark: `slate-300/400`).
- Bordas padrão: `slate-200` (dark: `slate-800`).
- Fundo página: `slate-50` (dark: `slate-950`).
- Sidebar: `slate-950`.

## Componentes (obrigatório reutilizar)

Os componentes reutilizáveis ficam em:

- [components/ui](file:///d:/Projetos_Dev/HubContabil/frontend/src/components/ui)

### Button

Usar [Button.jsx](file:///d:/Projetos_Dev/HubContabil/frontend/src/components/ui/Button.jsx).

Variantes:

- `primary`: ações principais (salvar, confirmar, criar).
- `secondary`: ações secundárias (voltar, cancelar, navegar).
- `outline`: ações neutras.
- `ghost`: ações em toolbars/listas (ícones).
- `success`, `warning`, `error`: estados específicos.

Regras:

- Preferir `Button` em vez de `<button className="...">` em páginas.
- `loading` deve ser usado para evitar double-click e indicar processamento.

### Input

Usar [Input.jsx](file:///d:/Projetos_Dev/HubContabil/frontend/src/components/ui/Input.jsx).

Regras:

- Inputs com label e helperText devem usar o componente.
- Erros de validação devem preencher `error`.

### Table

Usar [Table.jsx](file:///d:/Projetos_Dev/HubContabil/frontend/src/components/ui/Table.jsx).

Regras:

- Tabelas devem estar sempre em container com `overflow-x-auto`.
- Em telas pequenas, preferir “cards” quando a tabela tiver muitas colunas.

## Layout: Navbar + Sidebar (padrão)

Arquitetura:

- Layout principal: [Layout.jsx](file:///d:/Projetos_Dev/HubContabil/frontend/src/components/Layout.jsx)
- Navbar: [AppHeader.jsx](file:///d:/Projetos_Dev/HubContabil/frontend/src/components/layout/AppHeader.jsx)
- Sidebar: [AppSidebar.jsx](file:///d:/Projetos_Dev/HubContabil/frontend/src/components/layout/AppSidebar.jsx)

Regras:

- Navbar é fixa no topo (`h-16`).
- Sidebar em desktop é fixa e o conteúdo principal desloca usando `--sidebar-width`.
- Em mobile: sidebar é overlay a partir de `top-16`.

## Responsividade (breakpoints)

- `sm` < 640px
- `md` >= 768px
- `lg` >= 1024px

Regras:

- Mobile-first: comece pelo layout vertical/stack.
- Evitar `position: fixed` dentro de páginas (exceto modais e overlays do layout).
- Quando houver listas longas, usar `overflow-x-auto`/`overflow-y-auto` local ao componente, não no body.

## Estados de interação (padrão)

- Focus: sempre com `ring` visível.
- Disabled: opacidade e cursor `not-allowed`.
- Hover: mudança sutil de background/borda.
- Links ativos (sidebar): `bg-blue-600/10`, `text-blue-400` e indicador lateral.

## Checklist de tela nova

- Usa `components/ui` (Button/Input/Table) quando aplicável.
- Sem cores hardcoded que fujam do slate/blue/green/yellow/red/cyan.
- Responsivo no mobile sem overflow horizontal inesperado.
- Estados loading/error tratados (componente ou padrão).

