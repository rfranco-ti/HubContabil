# 🚚 ICMS 2026 - Cálculo Completo

**Última atualização:** 05 de abril de 2026  
**Versão:** 1.0  
**Status:** ✅ Documentado

## ⚖️ Base Legal
| Norma | Descrição |
|-------|-----------|
| **LC 87/96 (Lei Kandir)** | Base legal do ICMS |
| **CF/88, Art. 155, II** | Base constitucional |
| **Convênios CONFAZ** | Alíquotas interestaduais e benefícios |
| **Leis Estaduais** | Alíquotas internas por UF |

## 📊 Alíquotas 2026

### Internas por Estado (Principais)
| UF | Alíquota | UF | Alíquota |
|----|----------|----|----------|
| SP | 18% | RJ | 22% |
| MG | 18% | RS | 17% |
| PR | 18% | SC | 17% |
| BA | 18% | PE | 18% |

### Interestaduais (Saída)
| Origem → Destino | Alíquota |
|------------------|----------|
| Sul/Sudeste → Norte/Nordeste/CO | 7% |
| Demais combinações | 12% |
| Importados | 4% |

## 🧮 Cálculos

### ICMS Próprio (Débito)
```
ICMS = Valor Operação × Alíquota Interna
```

### ICMS Créditos
```
Crédito = Valor Entrada × Alíquota Interna UF origem
```

### DIFAL (Diferencial de Alíquota)
```
DIFAL = Valor Operação × (Alíquota Destino - Alíquota Origem Interestadual)

Para consumidor final: 100% para destino
Para contribuinte: 40% origem / 60% destino (2026)
```

### Substituição Tributária
```
MVA = (1 + ICMS Interestadual) × (1 + ICMS Interno Destino) - 1
Base ST = Valor Produto × (1 + MVA)
ICMS ST = (Base ST × Alíquota Destino) - ICMS Próprio
```
