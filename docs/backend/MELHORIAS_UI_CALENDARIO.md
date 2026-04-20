# Calendário - Melhorias de UI/UX

## ✅ Header Redesenhadado

### Antes
```
┌──────────────────────────────────────────────────────────┐
│ 📅 Calendário Contábil 2026         [📅] [📋]           │
│                                                          │
│ 🔍 Buscar obrigações...  🏷️ Todas Categorias  📊 167   │
└──────────────────────────────────────────────────────────┘
```
- Header azul grande (gradiente)
- Título duplicado (PageHeader + componente)
- Ocupando 2 linhas
- Stats separados

### Depois
```
┌──────────────────────────────────────────────────────────┐
│ Calendário Contábil  [📅 Calendário] [📋 Lista]  🔍.. 🏷️│
│ 167 obrigações • 2026                                    │
└──────────────────────────────────────────────────────────┐
```
- Header branco compacto (56px de altura)
- Título aparece apenas uma vez
- Toggle com labels visíveis
- Busca e filtro integrados
- Stats no subtítulo

---

## 🎨 Novo Design

### Toggle View Amigável
```
┌─────────────────────┐
│ 📅 Calendário │ 📋 Lista │
└─────────────────────┘
```
- **Ícone + Texto**: Usuário leio entende facilmente
- **Destaque visual**: Botão ativo tem fundo branco com shadow
- **Hover**: Feedback visual imediato

### Busca Compacta
```
┌─────────────────┐
│ 🔍 Buscar...    │
└─────────────────┘
```
- Focus com borda azul e glow
- Placeholder sutil
- Largura adaptável

### Dropdown de Categoria
```
┌──────────────────┐
│ Todas         ▼ │
└──────────────────┘
```
- Custom arrow icon
- Focus com glow azul
- Hover sutil

---

## 📐 Dimensões

| Elemento | Altura | Padding |
|----------|--------|---------|
| Header | 56px | 12px 20px |
| Toggle Btn | 31px | 7px 14px |
| Search Box | 32px | 6px 12px |
| Select | 32px | 6px 10px |

**Economia de espaço:** ~60% menos altura no header

---

## 🎯 Cores

| Elemento | Cor |
|----------|-----|
| Fundo Header | #ffffff |
| Borda | #e5e7eb |
| Título | #111827 |
| Subtítulo | #6b7280 |
| Toggle Inativo | #f3f4f6 |
| Toggle Ativo | #ffffff + shadow |
| Search/Select | #f9fafb |
| Focus | #3b82f6 (azul) |

---

## 📱 Responsividade

### Desktop (>1024px)
```
[Calendário Contábil] [📅 Calendário] [📋 Lista] [🔍 Buscar] [Todas ▼]
[167 obrigações • 2026]
```

### Tablet (768-1023px)
```
[Calendário Contábil] [📅] [📋]
[167 obrigações • 2026]
[🔍 Buscar...] [Todas ▼]
```

### Mobile (<768px)
```
[Calendário] [📅] [📋]
[167 • 2026]
[🔍...] [Todas]
```

### Mobile Pequeno (<480px)
```
[Calend] [📅] [📋]
[🔍] [Todas]
```

---

## ✨ Interações

### Hover
- Toggle btn: fundo branco semi-transparente
- Search/Select: borda mais escura

### Focus
- Search: borda azul + glow 3px
- Select: borda azul + glow 3px

### Active (Toggle)
- Fundo branco
- Texto escuro (#111827)
- Font weight 600
- Shadow sutil

---

**Data:** Abril 2026  
**Versão:** 2.1.0  
**Status:** ✅ Produção
