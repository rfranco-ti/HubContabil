# 📊 Lucro Real 2026 - Cálculo Completo

**Última atualização:** 05 de abril de 2026  
**Versão:** 1.0  
**Status:** ✅ Documentado

## ⚖️ Base Legal
| Norma | Descrição |
|-------|-----------|
| **Lei 9.249/95** | Alterações IRPJ/CSLL |
| **Lei 12.973/2014** | Lucro Real e normas contábeis |
| **Dec. 9.580/2018 (RIR)** | Regulamento IR |
| **IN RFB 1.700/2017** | Normas de apuração |

## 📊 Alíquotas
| Tributo | Alíquota | Base |
|---------|----------|------|
| **IRPJ** | 15% + 10% adicional | Lucro Real |
| **CSLL** | 9% (geral) | Lucro Real |

## 🧮 Cálculo

### Lucro Real
```
Lucro Real = Lucro Líquido Contábil
           + Adições (despesas não dedutíveis, etc.)
           - Exclusões (receitas não tributáveis, etc.)
           ± Compensações (prejuízos fiscais)
```

### Adições Comuns (LALUR)
```
- Provisões não dedutíveis
- Despesas sem documentação
- Multas e juros de mora
- Doações não dedutíveis
- Brindes e despesas de entretenimento
- Depreciação acelerada não incentivada
- Diferenças temporárias contábil/fiscal
```

### Exclusões Comuns
```
- Receitas não tributáveis
- Rendimentos com isenção
- Dividendos recebidos
- Juros sobre capital próprio (para IRPJ)
- Compensação de prejuízos fiscais (até 30% do lucro)
```

### Cálculo Final
```
IRPJ Base = Lucro Real × 15%
IRPJ Adicional = max(0, Lucro Real/3 - 20.000) × 10%
CSLL = Lucro Real × 9%

Trimestral: limite adicional R$ 60.000/tri
Mensal: limite adicional R$ 20.000/mês
```

## 📝 Exemplo
```
Lucro Líquido Contábil: R$ 500.000
Adições (LALUR): R$ 80.000
Exclusões: R$ 30.000
Prejuízos Fiscais compensados: R$ 50.000

Lucro Real = 500.000 + 80.000 - 30.000 - 50.000 = R$ 500.000

IRPJ = 500.000 × 15% = R$ 75.000
IRPJ Adicional = (500.000/3 - 20.000) × 10% → (166.667 - 20.000) × 10% = R$ 14.667
CSLL = 500.000 × 9% = R$ 45.000

Total: R$ 134.667
```
