# Sprint 41 - Simulador de Rescisão Trabalhista Completo

**Data:** 05/04/2026 | **Hora:** 14:00 | **Status:** ✅ Concluída
**Tipo:** Feature

## Objetivo
Criar simulador de rescisão trabalhista completo com todos os campos profissionais: adicionais, horas extras com DSR, descontos, configurações de jornada.

## Implementado
- **Adicionais:** Insalubridade (10/20/40% sobre SM, NR-15), Periculosidade (30% salário base, NR-16), Adicional Noturno (min. 20%, Art. 73 CLT)
- **Horas Extras:** HE com percentual customizável (50/100%), DSR = (Total HE × DSRs) ÷ dias úteis, reflexos em 13º (média HE × meses/12), férias + 1/3, FGTS
- **Salário Base:** Salário + Insalubridade + Periculosidade + Adic. Noturno (nota: insalubridade e periculosidade não acumulam na prática)
- **Descontos:** Faltas (dias e minutos), adiantamento, VT (6%), outros descontos
- **Configurações:** Jornada mensal (220h padrão ou custom), divisor salarial (30 dias)
- **Verbas com INSS/IRRF isolados:** INSS progressivo 7,5%-14% (teto R$ 8.475,55), IRRF com redutor Lei 15.270/2025 (isento ≤ R$ 5.000)
- Formulário com seções colapsáveis (principal + adicionais/descontos)

## Arquivos
| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `backend/src/services/calculoRescisaoService.js` | Reescrito | Todos campos avançados + fórmulas |
| `backend/src/controllers/calculoRescisaoController.js` | Modificado | Novos campos |
| `frontend/src/pages/SimuladorRescisao.jsx` | Modificado | Formulário completo com seções colapsáveis |

## Métricas
- **Tempo:** 4h | **Erros:** 0 | **Files:** ~3 modificados
- **Testes:** Build ✅ | Fórmulas DSR ✅ | INSS/IRRF isolados ✅
