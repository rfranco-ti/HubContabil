# 🎨 Design System - HubContábil Frontend

> **Última atualização:** 06 de abril de 2026
> **Versão:** 1.0.0
>
> **IMPORTANTE:** Este documento deve ser consultado SEMPRE que qualquer interface for modificada. Em caso de melhoria, altere este documento para refletir o novo padrão.

---

## 📐 Espaçamento (Spacing)

### Sistema de Espaçamento (Tailwind)

| Nome | Classe | Valor | Uso |
|------|--------|-------|-----|
| xs | `gap-2`, `p-2`, `m-2` | 8px | Espaçamento interno de elementos pequenos (ícones, badges) |
| sm | `gap-3`, `p-3`, `m-3` | 12px | Espaçamento entre elementos relacionados |
| md | `gap-4`, `p-4`, `m-4` | 16px | Espaçamento padrão de containers |
| lg | `gap-6`, `p-6`, `m-6` | 24px | Espaçamento entre seções |
| xl | `gap-8`, `p-8`, `m-8` | 32px | Espaçamento entre grandes seções |

### Padrões de Container

```jsx
// Container de página
<div className="p-4 md:p-6 lg:p-8 h-full flex flex-col overflow-y-auto">

// Card/Card container
<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">

// Header de página
<div className="mb-6">
  <h1 className="text-2xl font-bold text-gray-900">Título</h1>
  <p className="text-sm text-gray-500 mt-1">Descrição</p>
</div>
```

---

## 🎨 Cores

### Paleta Primária

| Nome | Hex | Tailwind | Uso |
|------|-----|----------|-----|
| Blue 50 | `#eff6ff` | `bg-blue-50` | Backgrounds de elementos primários |
| Blue 100 | `#dbeafe` | `bg-blue-100`, `border-blue-100` | Bordas, badges |
| Blue 500 | `#3b82f6` | `text-blue-500`, `bg-blue-500` | Ícones, botões secundários |
| Blue 600 | `#2563eb` | `text-blue-600`, `bg-blue-600` | Botões primários, links |
| Blue 700 | `#1d4ed8` | `hover:bg-blue-700` | Hover de botões |

### Paleta Neutra

| Nome | Hex | Tailwind | Uso |
|------|-----|----------|-----|
| Gray 50 | `#f9fafb` | `bg-gray-50` | Backgrounds de cards alternativos |
| Gray 100 | `#f3f4f6` | `bg-gray-100` | Backgrounds de hover |
| Gray 200 | `#e5e7eb` | `border-gray-200` | Bordas padrão |
| Gray 400 | `#9ca3af` | `text-gray-400` | Textos secundários, placeholders |
| Gray 500 | `#6b7280` | `text-gray-500` | Descrições, labels |
| Gray 600 | `#4b5563` | `text-gray-600` | Textos de corpo |
| Gray 700 | `#374151` | `text-gray-700` | Títulos secundários |
| Gray 800 | `#1f2937` | `text-gray-800` | Títulos principais |
| Gray 900 | `#111827` | `text-gray-900` | Títulos principais, headings |

### Cores de Status

| Status | Hex | Tailwind | Uso |
|--------|-----|----------|-----|
| Success | `#10b981` | `text-green-600`, `bg-green-50` | Sucesso, ativo, positivo |
| Warning | `#f59e0b` | `text-amber-600`, `bg-amber-50` | Aviso, pendente, atenção |
| Error | `#ef4444` | `text-red-600`, `bg-red-50` | Erro, inativo, negativo |
| Info | `#3b82f6` | `text-blue-600`, `bg-blue-50` | Informação, neutro |

---

## 🔤 Tipografia

### Fontes

```
Font Family: Inter, system-ui, -apple-system, sans-serif
```

### Escala Tipográfica

| Elemento | Classe | Tamanho | Peso | Uso |
|----------|--------|---------|------|-----|
| Heading 1 | `text-2xl font-bold` | 24px | 700 | Títulos de página |
| Heading 2 | `text-lg font-semibold` | 18px | 600 | Títulos de seção/card |
| Body | `text-sm` | 14px | 400 | Texto de corpo padrão |
| Body Medium | `text-sm font-medium` | 14px | 500 | Labels, títulos de card |
| Small | `text-xs` | 12px | 400 | Textos secundários, badges |
| Small Medium | `text-xs font-medium` | 12px | 500 | Labels pequenos |
| Small Bold | `text-xs font-bold` | 12px | 700 | Números, destaques |
| Mono | `font-mono text-sm` | 14px | 400 | CNPJ, CPF, códigos |

### Padrões de Texto

```jsx
// Título de página
<h1 className="text-2xl font-bold text-gray-900">Título</h1>
<p className="text-sm text-gray-500 mt-1">Descrição da página</p>

// Título de card/seção
<h2 className="text-lg font-semibold text-gray-900">Título da Seção</h2>

// Texto de corpo
<p className="text-sm text-gray-600">Texto padrão</p>

// Texto secundário/descrição
<p className="text-xs text-gray-500">Descrição secundária</p>

// Label
<label className="block text-sm font-medium text-gray-700 mb-1">Label</label>

// Placeholder
<input placeholder="Ex: Exemplo de texto..." />
```

---

## 📦 Componentes

### Cards

```jsx
// Card padrão
<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
  Conteúdo
</div>

// Card com header
<div className="bg-white rounded-xl shadow-sm border border-gray-200">
  <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
    <h3 className="text-sm font-semibold text-gray-900">Título</h3>
  </div>
  <div className="p-4">Conteúdo</div>
</div>
```

### Botões

```jsx
// Botão primário
<button className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
  <Icon size={16} className="mr-2" />
  Texto
</button>

// Botão secundário/outline
<button className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
  <Icon size={16} className="mr-2" />
  Texto
</button>

// Botão de ícone
<button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
  <Icon size={18} className="text-gray-600" />
</button>

// Botão desabilitado
<button disabled className="... disabled:opacity-50 disabled:cursor-not-allowed">
  Texto
</button>
```

### Inputs

```jsx
// Input padrão
<input
  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
  placeholder="Ex: Exemplo..."
/>

// Input com ícone
<div className="relative">
  <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
  <input className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
</div>

// Select
<select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all">
  <option value="">Selecione...</option>
</select>
```

### Badges

```jsx
// Badge de status
<span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
  Ativo
</span>

// Badge de informação
<span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
  Info
</span>

// Badge de aviso
<span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
  Pendente
</span>

// Badge de erro
<span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
  Erro
</span>
```

### Tabelas

```jsx
<div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead className="bg-gray-50 border-b border-gray-200">
        <tr>
          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Coluna</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        <tr className="hover:bg-gray-50 transition-colors">
          <td className="px-4 py-3 text-sm text-gray-900">Dado</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
```

### Loading States

```jsx
// Loading spinner centralizado
<div className="flex items-center justify-center py-12">
  <div className="text-center">
    <Loader2 size={32} className="animate-spin text-gray-400 mx-auto" />
    <p className="mt-3 text-sm text-gray-500">Carregando...</p>
  </div>
</div>

// Skeleton loading
<div className="animate-pulse space-y-3">
  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
</div>
```

### Empty States

```jsx
<div className="flex flex-col items-center justify-center py-12 text-center">
  <Icon size={48} className="text-gray-300 mb-4" />
  <h3 className="text-lg font-semibold text-gray-900 mb-1">Nenhum resultado</h3>
  <p className="text-sm text-gray-500">Descrição do estado vazio</p>
</div>
```

---

## 📱 Responsividade

### Breakpoints (Tailwind)

| Nome | Classe | Valor | Uso |
|------|--------|-------|-----|
| sm | `sm:` | 640px | Mobile landscape |
| md | `md:` | 768px | Tablet |
| lg | `lg:` | 1024px | Desktop |
| xl | `xl:` | 1280px | Desktop grande |
| 2xl | `2xl:` | 1536px | Desktop extra grande |

### Padrões Responsivos

```jsx
// Container de página
<div className="p-4 md:p-6 lg:p-8">

// Grid responsivo
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">

// Texto responsivo
<h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">

// Espaçamento responsivo
<div className="space-y-4 md:space-y-6 lg:space-y-8">

// Esconder/mostrar por breakpoint
<div className="hidden md:block">Apenas desktop</div>
<div className="md:hidden">Apenas mobile/tablet</div>
```

### Grid de Cards

```jsx
// 1 coluna mobile, 2 colunas tablet, 3 colunas desktop
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

// 1 coluna mobile, 2 colunas tablet+
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
```

---

## 🎭 Ícones

### Biblioteca
- **Lucide React** (`lucide-react`)
- Tamanho padrão: `size={18}` para ícones de ação, `size={16}` para ícones pequenos
- Cor padrão: `text-gray-600` para ícones neutros

### Tamanhos de Ícone

| Uso | Tamanho | Classe |
|-----|---------|--------|
| Botão de ação | 18 | `size={18}` |
| Ícone pequeno (badge, tabela) | 14-16 | `size={14}` ou `size={16}` |
| Ícone de card | 20-24 | `size={20}` ou `size={24}` |
| Empty state | 48 | `size={48}` |

### Cores de Ícone por Contexto

| Contexto | Cor |
|----------|-----|
| Neutro | `text-gray-600` |
| Primário | `text-blue-600` |
| Sucesso | `text-green-600` |
| Aviso | `text-amber-600` |
| Erro | `text-red-600` |

---

## 🎨 Sombras

```jsx
// Sombra leve (cards)
shadow-sm

// Sombra média (dropdowns, popovers)
shadow-md

// Sombra forte (modais, dialogs)
shadow-xl

// Sombra com cor (botões primários)
shadow-blue-500/20
```

---

## 🔄 Transições

```jsx
// Transição padrão
transition-colors

// Transição suave (transform + opacity)
transition-all duration-200

// Hover com transform
hover:scale-105 transition-transform

// Focus ring
focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
```

---

## 📋 Checklist de Revisão de Interface

Sempre verificar antes de commitar mudanças na interface:

- [ ] Espaçamento consistente (usar sistema de spacing do Tailwind)
- [ ] Cores seguindo a paleta definida
- [ ] Tipografia seguindo a escala tipográfica
- [ ] Responsividade testada (mobile, tablet, desktop)
- [ ] Ícones com tamanho e cor apropriados
- [ ] Estados de loading implementados
- [ ] Estados vazios (empty states) implementados
- [ ] Transições e animações suaves
- [ ] Acessibilidade básica (labels, aria-labels)
- [ ] Hover e focus states definidos
- [ ] Bordas e sombras consistentes
