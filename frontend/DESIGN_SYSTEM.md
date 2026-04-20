# 🎨 Design System Guidelines - HubContabil Frontend

> **Diretriz Central:** Design é código visual. Cada decisão de UI é um contrato técnico entre experiência, performance e manutenibilidade.
> **Regra Nº1: Mobile-First SEMPRE.** Se não funciona em 360px, não funciona.

---

## 1. 📱 Mobile-First Architecture (MANDATÓRIO)

| Princípio | Regra | Implementação |
|-----------|-------|---------------|
| **Base** | Inicie em `360px`. Mobile primeiro, sempre. | Tailwind `sm:`, `md:`, `lg:`, `xl:` |
| **Touch Targets** | Mínimo `44×44px` | `min-h-[44px] min-w-[44px]` em botões, links, inputs, selects |
| **Breakpoints** | Baseados em colapso, não em devices | Tailwind padrão: `640px`, `768px`, `1024px`, `1280px` |
| **Performance** | JS crítico ≤ 50KB gzip, imagens otimizadas | Lazy loading, code splitting por rota |

### Padrão de Tabelas Responsivas (MANDATÓRIO)

**Tabelas NUNCA devem ser usadas como layout principal em mobile.** Em vez disso, use o padrão **Card Mobile → Tabela Desktop**:

```jsx
// Padrão obrigatório para tabelas de dados
<div>
  {/* Cards mobile (visível apenas em telas < 768px) */}
  <div className="md:hidden space-y-2">
    {data.map((item) => (
      <CardMobile key={item.id} data={item} />
    ))}
  </div>

  {/* Tabela desktop (visível apenas em telas ≥ 768px) */}
  <div className="hidden md:block bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
    <table className="w-full text-left border-collapse">
      <thead>
        <tr className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider border-b border-slate-200 dark:border-slate-600">
          {/* Colunas */}
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-sm">
        {/* Linhas */}
      </tbody>
    </table>
  </div>
</div>
```

### Componente CardMobile Padrão
```jsx
function CardMobile({ data, expandido, setExpandido }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      {/* Header expansível (sempre visível) */}
      <button
        onClick={() => setExpandido(!expandido)}
        className="w-full text-left p-4 flex items-start gap-3 min-h-[44px]"
      >
        <div className="flex-1 min-w-0">
          {/* Informações principais sempre visíveis */}
          <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
            {data.nome}
          </p>
          {/* Badges/status */}
        </div>
        {/* Chevron de expansão */}
      </button>

      {/* Detalhes expansíveis */}
      {expandido && (
        <div className="px-4 pb-4 space-y-2 text-sm border-t border-slate-100 dark:border-slate-700 pt-3">
          <InfoRowMobile label="Label" value={data.valor} />
        </div>
      )}
    </div>
  );
}

function InfoRowMobile({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs font-semibold text-slate-400 uppercase">{label}</span>
      <span className="text-sm text-slate-700 dark:text-slate-300">{value}</span>
    </div>
  );
}
```

### Regras de Ouro para Mobile
1. **NUNCA use `overflow-x-auto` em tabelas** como solução mobile — use o padrão Card/Tabela acima
2. **Botões sempre ≥ 44px** de altura para toque confortável
3. **Inputs/selects sempre ≥ 44px** de altura
4. **Espaçamento mínimo entre elementos interativos:** `gap-2` (8px)
5. **Texto legível em mobile:** mínimo `text-sm` para corpo, `text-xs` apenas para labels/badges

---

## 2. 🎨 Color Palette & Visual Hierarchy

### Paleta Principal (60-30-10)
| Uso | Cor | Tailwind |
|-----|-----|----------|
| **60% Fundo/Neutro** | Cinzas neutros | `bg-white`, `bg-slate-50`, `dark:bg-slate-900` |
| **30% Estrutura** | Bordas, textos secundários | `border-slate-200`, `text-slate-500`, `dark:border-slate-700` |
| **10% Ação/Primária** | Azul HubContabil | `bg-blue-600`, `text-blue-600`, `hover:bg-blue-700` |

### Cores Semânticas
| Tipo | Light | Dark |
|------|-------|------|
| **Sucesso** | `text-emerald-600 bg-emerald-50` | `text-emerald-400 dark:bg-emerald-900/20` |
| **Aviso** | `text-amber-600 bg-amber-50` | `text-amber-400 dark:bg-amber-900/20` |
| **Erro** | `text-red-600 bg-red-50` | `text-red-400 dark:bg-red-900/20` |
| **Info** | `text-cyan-600 bg-cyan-50` | `text-cyan-400 dark:bg-cyan-900/20` |

### Regra de Contraste
- Texto normal sobre fundo: ≥ `4.5:1`
- Texto grande (≥18px): ≥ `3:1`
- Nunca use cor como única forma de comunicar informação

---

## 3. 🔤 Typography & Readability

### Escala Tipográfica
| Elemento | Classe | Uso |
|----------|--------|-----|
| `text-xs` | `0.75rem` (12px) | Labels, badges, metadados |
| `text-sm` | `0.875rem` (14px) | Corpo, tabelas, descrições |
| `text-base` | `1rem` (16px) | Corpo principal |
| `text-lg` | `1.125rem` (18px) | Subtítulos |
| `text-xl` | `1.25rem` (20px) | Títulos de seção |
| `text-2xl` | `1.5rem` (24px) | Títulos de página |

### Pesos e Espaçamento
| Peso | Classe | Uso |
|------|--------|-----|
| Normal | `font-normal` | Corpo de texto |
| Médio | `font-medium` | Links, labels |
| Semibold | `font-semibold` | Botões, subtítulos |
| Bold | `font-bold` | Títulos, KPIs |
| Black | `font-black` | Títulos principais, hero |

### Legibilidade
- Máx `65-75` caracteres por linha: `max-w-[65ch]` em blocos de texto
- `leading-relaxed` ou `leading-tight` conforme contexto
- **Nunca mais de 2 famílias tipográficas** (use font-sistema do Tailwind)

---

## 4. 📐 Layout & Spacing System

### Grid e Espaçamento
| Token | Valor | Uso |
|-------|-------|-----|
| `gap-1` | `4px` | Espaçamento mínimo entre elementos inline |
| `gap-2` | `8px` | Espaçamento entre ícones e textos |
| `gap-3` | `12px` | Espaçamento entre campos de form |
| `gap-4` | `16px` | Gap padrão de cards |
| `gap-6` | `24px` | Gap entre seções |
| `gap-8` | `32px` | Gap entre seções grandes |

### Layout Padrão de Páginas
```jsx
<div className="p-4 md:p-6 xl:p-8 max-w-[1600px] mx-auto">
  {/* Header da página */}
  <div className="flex items-center justify-between mb-6">
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Título</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400">Descrição</p>
    </div>
  </div>
  {/* Conteúdo */}
</div>
```

### Cards Padrão
```jsx
<div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
  {/* Conteúdo do card */}
</div>
```

---

## 5. ⚡ Interaction, Motion & Micro-UX

### Transições Padrão
| Elemento | Duração | Easing |
|----------|---------|--------|
| Botões | `150ms` | `transition-colors` |
| Hover cards | `200ms` | `transition-all` |
| Modais/Overlays | `300ms` | `transition-opacity` |
| Sidebar | `150ms` | `transition-[width]` |

### 4 Estados Obrigatórios
Todos os elementos interativos devem ter:
1. `default` — Estado padrão
2. `hover` — `hover:bg-slate-100 dark:hover:bg-slate-700`
3. `active` — `active:scale-95` (se aplicável)
4. `disabled` — `disabled:opacity-50 disabled:cursor-not-allowed`

### Feedback Imediato
- Toda ação com duração > 50ms deve ter feedback visual
- Use **skeletons** para carregamento de conteúdo, **spinners** para ações
- Respeite `prefers-reduced-motion`: use `motion-safe:` prefix

---

## 6. 🧩 Component Library

### Botões
```jsx
// Primário
<button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
  <Icon size={18} /> Texto
</button>

// Secundário
<button className="flex items-center gap-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold px-4 py-2.5 rounded-xl transition-colors">
  <Icon size={18} /> Texto
</button>

// Danger
<button className="flex items-center gap-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 font-semibold px-4 py-2.5 rounded-xl transition-colors">
  <Icon size={18} /> Texto
</button>
```

### Forms e Inputs
```jsx
<label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
  Label
</label>
<input
  type="text"
  className="appearance-none block w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
  placeholder="Placeholder"
/>
```

### Badges e Status
```jsx
<span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400 px-2 py-0.5 rounded-full">
  Ativo
</span>
```

---

## 7. ♿ Accessibility & Compliance

### Checklist Obrigatório
- [ ] Todos os botões têm `aria-label` ou texto visível
- [ ] Todos os ícones decorativos têm `aria-hidden="true"`
- [ ] Contraste validado (≥ 4.5:1 para texto normal)
- [ ] Foco visível em todos elementos interativos
- [ ] Navegação por Tab funcional sem loops
- [ ] Formulários com `label` explícito

### Padrão de Foco
```css
/* Padrão Tailwind já aplicado: focus:outline-none focus:ring-2 focus:ring-blue-500 */
```

---

## 8. 📊 Performance & UX Metrics

### Targets
| Métrica | Target | Como medir |
|---------|--------|------------|
| **LCP** | `< 2.5s` | Lighthouse |
| **CLS** | `< 0.1` | Reserve espaço para imagens e dados dinâmicos |
| **Bundle size** | `< 50KB` gzip por chunk | `npm run build` output |

### Boas Práticas de Performance
- **Code splitting** por rota (já implementado via `lazy()`)
- **Lazy loading** para imagens grandes
- **Memoização** com `useMemo` e `useCallback` para cálculos pesados
- **JSON local** para dados estáticos (feriados, obrigações, CNAEs)

---

## 9. 🛠 Maintainability & Naming

### Naming Convention
- **Componentes:** PascalCase (`WidgetCard`, `InfoField`)
- **Hooks:** camelCase com prefixo `use` (`useApiFetch`, `useFilters`)
- **Variáveis CSS/Tailwind:** kebab-case via classes padrão
- **Nunca nomes subjetivos** (`card-blue`, `btn-big`)

### Estrutura de Arquivos
```
frontend/src/
├── components/     # Componentes reutilizáveis
├── pages/          # Páginas (rotas)
├── hooks/          # Hooks customizados
├── services/       # APIs, utilitários de dados
├── data/           # JSON estático (feriados, CNAEs)
├── context/        # Context API (Theme, Auth)
└── utils/          # Funções utilitárias puras
```

---

## 10. 📱 Dark Mode Nativo

### Padrão de Implementação
```jsx
// Light first, dark via class
<div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
  <div className="border-slate-200 dark:border-slate-700">
    ...
  </div>
</div>
```

### Tokens de Cores por Modo
| Elemento | Light | Dark |
|----------|-------|------|
| Fundo principal | `bg-white` | `dark:bg-slate-900` |
| Fundo card | `bg-white` | `dark:bg-slate-800` |
| Texto primário | `text-slate-900` | `dark:text-white` |
| Texto secundário | `text-slate-500` | `dark:text-slate-400` |
| Borda | `border-slate-200` | `dark:border-slate-700` |

### Implementação do Toggle
O toggle de dark mode já está implementado em `AppHeader.jsx` com persistência via `localStorage` e toggle via classe no `document.documentElement`.

---

## ⚠️ Regras de Ouro

1. **Se não pode ser tokenizado, não entra no sistema.**
2. **Legibilidade > Estética.** Se cansa a vista, o design falhou.
3. **Mobile primeiro.** Sempre teste em 360px antes de desktop.
4. **Acessibilidade não é opcional.** WCAG 2.2 AA é o mínimo.
5. **Performance é UX.** Bundle grande = UX lento = UX quebrado.
6. **Consistência visual.** Mesma spacing, mesma border-radius, mesma sombra em todo o projeto.
