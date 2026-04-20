# Bug Fix: Widget Próximos Eventos Dashboard
**Data:** 08/04/2026 | **Hora:** 15:45 | **Status:** ✅ | **Tipo:** Bug Fix

## Problema
Widget "Próximos Eventos" no Dashboard não funcionava porque esperava `dados?.proximosEventos` mas esse campo nunca era calculado/populado.

**Erro:**
```
Uncaught TypeError: obrigacoesMes.forEach is not a function
    at Dashboard.jsx:640:19
```

## Causa Raiz
1. O `calendario` state recebia apenas `feriados` e `obrigacoes` dos JSON locais
2. O widget `WidgetProximosEventos` esperava `proximosEventos` que nunca existia
3. O código do `WidgetCalendarioMensal` também tinha erro ao processar `obrigacoesMes` (objeto ao invés de array)

## Solução

### 1. Função `calcularProximosEventos()`
Criada função no componente `Dashboard` que:
- Pega data atual (hoje)
- Itera sobre todas as obrigações do JSON `obrigacoes_2026.json`
- Calcula `diffDias` entre hoje e cada evento
- Filtra eventos de **hoje até próximos 30 dias**
- Processa também feriados do `feriados_2026.json`
- Ordena por proximidade (menor `diffDias` primeiro)
- Limita a **8 eventos** mais próximos

**Estrutura de cada evento gerado:**
```js
{
  nome: "Envio eSocial (eventos periódicos)",
  categoria: "Trabalhista e Previdenciário",
  periodoApuracao: "Referência: Dezembro/2025",
  baseLegal: "Portaria MTE nº 6.702/2020",
  dia: 15,
  mes: 1,
  ano: 2026,
  data: Date object,
  diffDias: 5,
  quando: "5 dias", // ou "Hoje", "Amanhã", "2 sem"
  tipo: "obrigacao" | "feriado"
}
```

### 2. Correção do `WidgetCalendarioMensal`
- Adicionada verificação `Array.isArray()` para `obrigacoesMes`
- Suporta ambos formatos: `{ dia: [...], ... }` e `{ "15": [{...}] }`
- Fallbacks para propriedades faltando (`ob.eventName || ob.nome`)

### 3. Melhorias no Widget `WidgetProximosEventos`
- **Dark mode completo:** Todas as cores agora têm variante `dark:`
- **Mobile responsivo:** Divider e espaçamentos adaptados
- **Categorias unificadas:** Removida categoria legada "RH - Recursos Humanos"
- **UX melhorada:** 
  - Eventos de hoje com destaque azul (`bg-blue-50/70 border-l-2 border-blue-400`)
  - Eventos de amanhã com destaque âmbar (`bg-amber-50/50 border-l-2 border-amber-400`)
  - Indicador "quando" com cores contextuais

## Arquivos
| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `frontend/src/pages/Dashboard.jsx` | **MODIFICADO** | +80 linhas (calcularProximosEventos + melhorias widget) |

## Métricas
- **Tempo:** 30min | **Erros:** 0 | **Files:** ~1
- **Build:** ✅ 10.46s
- **Teste Manual:** Widget agora exibe eventos corretamente

## Notas Técnicas
- Eventos são recalculados a cada reload do dashboard
- Janela de 30 dias é suficiente para obrigações mensais
- Limitação a 8 eventos evita scroll excessivo no widget
- Cores alinhadas com o Calendário Definitivo (componente principal)
