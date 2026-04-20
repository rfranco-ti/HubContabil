# 🏥 Aposentadoria 2026 - Cálculos Previdenciários

**Última atualização:** 05 de abril de 2026  
**Versão:** 1.0  
**Status:** ✅ Documentado

## ⚖️ Base Legal
| Norma | Descrição |
|-------|-----------|
| **Lei 8.213/91** | Planos de Benefícios da Previdência |
| **EC 103/2019** | Reforma da Previdência |
| **Dec. 3.048/99** | Regulamento da Previdência |
| **Tabela IBGE 2026** | Expectativa de sobrevida |

## 📊 Regras 2026

### Aposentadoria por Idade
| Requisito | Homem | Mulher |
|-----------|-------|--------|
| **Idade Mínima** | 65 anos | 62 anos |
| **Carência** | 15 anos (180 meses) | 15 anos (180 meses) |
| **Coeficiente** | 60% + 2% por ano > 20 | 60% + 2% por ano > 15 |

### Regra de Pontos 2026
| Requisito | Homem | Mulher |
|-----------|-------|--------|
| **Pontos** | 105 (idade + contribuição) | 95 |
| **Carência** | 15 anos | 15 anos |
| **Coeficiente** | 60% + 2% por ano > 20 | 60% + 2% por ano > 15 |

### Pedágio 100%
| Requisito | Homem | Mulher |
|-----------|-------|--------|
| **Idade** | 60 anos | 57 anos |
| **Tempo Contribuição** | 35 anos | 30 anos |
| **Pedágio** | 100% do tempo faltante em 13/11/2019 | |
| **Coeficiente** | 100% da média (sem fator) | |

## 🧮 Cálculo do RMI (Renda Mensal Inicial)

### Passo 1: Média dos Salários
```
Média = média de 100% dos salários de contribuição desde julho/1994
→ Descartar 20% menores contribuições (se benéfico)
→ Atualizar salários pelo índice INSS
```

### Passo 2: Coeficiente
```
Coeficiente Base = 60%

Para Homem:
  + 2% por ano que exceder 20 anos de contribuição
  
Para Mulher:
  + 2% por ano que exceder 15 anos de contribuição

Coeficiente Máximo = 100%
```

### Passo 3: RMI
```
RMI = Média × Coeficiente
Limites:
  Mínimo = 1 salário mínimo (R$ 1.621,00)
  Máximo = Teto INSS (R$ 9.030,34)
```

## 🧮 Fator Previdenciário

### Fórmula
```
f = (Tc × a × Es) / (1 + (Tc × a))

Onde:
  Tc = tempo de contribuição (anos, com 1 casa decimal)
  a = alíquota fixa = 0,31
  Es = expectativa de sobrevida (tabela IBGE, anos inteiros)
```

### Aplicação
```
Regra de transição pedágio 50%:
  RMI = Média × Coeficiente × Fator Previdenciário

Direito adquirido (antes de 13/11/2019):
  RMI = Média × Fator Previdenciário (se benéfico)

Demais regras: NÃO aplica fator previdenciário
```

### Tabela IBGE Expectativa de Sobrevida 2026 (Exemplos)
| Idade | Homens | Mulheres |
|-------|--------|----------|
| 55 | 25,8 | 30,5 |
| 60 | 21,6 | 26,0 |
| 65 | 17,7 | 21,8 |
| 70 | 14,2 | 18,0 |

## 📝 Exemplo Completo

### Aposentadoria por Idade
```
Homem, 65 anos, 30 anos de contribuição
Média dos salários: R$ 5.000

Coeficiente = 60% + (30 - 20) × 2% = 60% + 20% = 80%

RMI = 5.000 × 80% = R$ 4.000,00
```

### Com Fator Previdenciário
```
Homem, 60 anos, 35 anos contribuição
Média: R$ 6.000
Es (IBGE) = 21,6 anos

f = (35 × 0,31 × 21,6) / (1 + (35 × 0,31))
f = 234,36 / 11,85 = 0,849

Coeficiente (pedágio 50%) = 60% + (35-20) × 2% = 90%

RMI = 6.000 × 90% × 0,849 = R$ 4.584,60
```
