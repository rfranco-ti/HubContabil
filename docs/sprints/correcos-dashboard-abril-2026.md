# Correções Dashboard - Abril 2026

## ✅ Implementado

### 1. Ícones de Tamanho Médio
- **Clientes Ativos**: ícone `size={20}` (antes 16)
- **Certificados Válidos**: ícone `size={20}` (antes 16)
- WidgetS agora aceita prop `iconSize` padrão 16

### 2. Calendário Funcional
- **Antes**: Não mostrava dados do calendário contábil
- **Depois**: 
  - Busca `dados.proximas` do endpoint `/api/calendario/dashboard`
  - Marca dias com obrigações (bolinha azul)
  - Marca dias com feriados/RH (bolinha vermelha)
  - Dias com ambos: gradiente azul → vermelho
  - Tooltip com nome do evento ao passar o mouse
  - Navegação entre meses funcional

### 3. Encoding UTF-8 pt-BR
- Dashboard reescrito com encoding correto
- Todos os textos com acentos: "Próximas Obrigações", "Visão da Semana", "Resumo do Mês", "Concluídas", etc.

### 4. Backend Ajustado
- `/api/calendario/dashboard` agora retorna `proximas` com campos `dia`, `mes`, `ano`
- Formato compatível com o calendário do Dashboard

### 5. Performance
- Sem chamadas extras de API (reusa dados existentes)
- Indicadores visuais com CSS puro (sem JS extra)
- Tooltips nativos via `title` attribute (sem biblioteca)
- Build: 6.06s

## 📊 Resultado

| Métrica | Valor |
|---------|-------|
| **JS Dashboard** | 18.55 kB (5.20 kB gz) |
| **Build Time** | 6.06s |
| **API Calls** | 4 (mesmas de antes) |
| **Encoding** | UTF-8 pt-BR correto |
