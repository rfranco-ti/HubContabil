# Cálculo de Rescisão Trabalhista 2026

**Última atualização:** 05 de abril de 2026  
**Base Legal:** CLT (Arts. 477-512), Lei nº 12.506/2011, Lei nº 15.270/2025, Portaria MPS/MF nº 13/2026

---

## 1. Tipos de Rescisão

| Tipo | Descrição | Base Legal |
|------|-----------|------------|
| **Dispensa sem justa causa** | Empregador demite sem motivo justo | Art. 487 CLT |
| **Dispensa com justa causa** | Empregador demite por falta grave | Art. 482 CLT |
| **Pedido de demissão** | Empregado pede para sair | Art. 487 CLT |
| **Acordo mútuo (Art. 484-A)** | Negociação entre partes | Art. 484-A CLT |

---

## 2. Verbas Rescisórias por Tipo

| Verba | Sem Justa Causa | Pedido Demissão | Acordo Mútuo | Com Justa Causa |
|-------|:---------------:|:---------------:|:------------:|:---------------:|
| Saldo de salário | ✅ | ✅ | ✅ | ✅ |
| Aviso prévio | ✅ | ❌¹ | ✅ (50%) | ❌ |
| 13º proporcional | ✅ | ✅ | ✅ | ❌ |
| Férias proporcionais + 1/3 | ✅ | ✅ | ✅ | ❌ |
| Férias vencidas + 1/3 | ✅ | ✅ | ✅ | ✅ |
| Multa FGTS | 40% | ❌ | 20% | ❌ |
| Saque FGTS | ✅ | ❌ | Até 80% | ❌ |
| Seguro-desemprego | ✅ | ❌ | ❌ | ❌ |

¹ No pedido de demissão, o empregado deve cumprir aviso prévio (trabalhado), sob desconto de 50% dos dias restantes se não cumprir (Art. 487, §2º CLT).

---

## 3. Fórmulas de Cálculo

### 3.1 Saldo de Salário

**Base Legal:** Art. 477, §1º CLT

```
Saldo de Salário = (Salário Bruto ÷ 30) × Dias trabalhados no mês da rescisão
```

**Exemplo:** Salário R$ 3.000,00, 15 dias trabalhados
```
Saldo = (3.000 ÷ 30) × 15 = R$ 1.500,00
```

**Incidências:** INSS ✅ | IRRF ✅

---

### 3.2 Aviso Prévio

**Base Legal:** Art. 487 CLT, Lei nº 12.506/2011

```
Dias de Aviso Prévio = 30 + (3 × Anos completos de serviço)
Máximo: 90 dias
Valor do Aviso = (Salário ÷ 30) × Dias de aviso
```

**Tabela de Aviso Prévio Proporcional:**
| Anos de Serviço | Dias de Aviso |
|:---------------:|:-------------:|
| 0 – 1 | 30 |
| 1 – 2 | 33 |
| 2 – 3 | 36 |
| 3 – 4 | 39 |
| 4 – 5 | 42 |
| 5 – 6 | 45 |
| ... | ... |
| 20+ | 90 (máximo) |

**Fórmula:**
```
Dias = min(30 + (anos × 3), 90)
```

**Aviso Prévio Indenizado:** Quando o empregador dispensa sem exigir cumprimento, projeta o tempo de serviço para todos os efeitos (13º, férias, FGTS).

**Incidências:** INSS ✅ | IRRF ❌ (indenizado)

---

### 3.3 13º Salário Proporcional

**Base Legal:** Lei nº 4.090/1962, Art. 9º do Dec. 57.155/1965

```
Meses de 13º = Meses trabalhados no ano da rescisão
  (mês conta se trabalhou ≥ 15 dias)
13º Proporcional = (Salário ÷ 12) × Meses de 13º
```

**Exemplo:** Rescisão em abril, admitido em janeiro = 4 meses (jan, fev, mar, abr)
```
13º = (3.000 ÷ 12) × 4 = R$ 1.000,00
```

**Incidências:** INSS ✅ | IRRF ✅ (calculado separadamente do saldo)

---

### 3.4 Férias Proporcionais + 1/3 Constitucional

**Base Legal:** Arts. 129-153 CLT, Art. 7º, XVII CF/88

```
Meses de Férias Prop. = Meses do período aquisitivo incompleto
  (mês conta se trabalhou ≥ 15 dias)
Férias Proporcionais = (Salário ÷ 12) × Meses
1/3 Constitucional = Férias Proporcionais ÷ 3
Total Férias Prop. = Férias Proporcionais + 1/3
```

**Exemplo:** 5 meses do período aquisitivo
```
Férias Prop. = (3.000 ÷ 12) × 5 = R$ 1.250,00
1/3 = 1.250,00 ÷ 3 = R$ 416,67
Total = R$ 1.666,67
```

**Incidências:** INSS ❌ (indenizado) | IRRF ❌ (indenizado – Súmula 386 TST)

---

### 3.5 Férias Vencidas + 1/3 Constitucional

**Base Legal:** Art. 146 CLT, Art. 7º, XVII CF/88

```
Férias Vencidas = Salário integral (período completo não gozado)
1/3 Constitucional = Férias Vencidas ÷ 3
Total Férias Vencidas = Salário + (Salário ÷ 3)
```

**Exemplo:** 1 período vencido completo
```
Total = 3.000 + (3.000 ÷ 3) = R$ 4.000,00
```

**Incidências:** INSS ❌ | IRRF ❌

**Férias Vencidas em Dobro:** Se o empregador não concedeu férias dentro do período concessivo (12 meses após o aquisitivo), paga em dobro (Art. 137 CLT).
```
Férias em Dobro = Salário × 2 + (Salário × 2 ÷ 3)
```

---

### 3.6 Multa do FGTS (40% ou 20%)

**Base Legal:** Art. 18, §1º Lei nº 8.036/1990; Art. 484-A CLT

```
Multa 40% (dispensa s/ justa causa) = Saldo FGTS × 40%
Multa 20% (acordo mútuo) = Saldo FGTS × 20%
```

**Nota:** A multa é depositada via GRRF (Guia de Recolimento do FGTS) e não integra o líquido da rescisão. O trabalhador saca separadamente.

**Cálculo do Saldo FGTS para a multa:**
```
Saldo FGTS para Multa = Saldo existente na conta + Depósitos do aviso prévio indenizado
Depósito aviso = Salário × 8% (sobre dias de aviso indenizado)
```

---

### 3.7 Redução por Faltas (Art. 130 CLT)

As faltas injustificadas reduzem os dias de férias:

| Faltas no período aquisitivo | Dias de férias |
|:----------------------------:|:--------------:|
| Até 5 | 30 dias |
| 6 a 14 | 24 dias |
| 15 a 23 | 18 dias |
| 24 a 32 | 12 dias |
| 33+ | 0 dias (perde o direito) |

**Impacto no cálculo:**
```
Férias Proporcionais = (Salário ÷ 12) × (Meses × Dias de férias ÷ 30)
```

---

## 4. Cálculo do INSS na Rescisão

**Regra Importante:** Na rescisão, cada verba tributável tem o INSS calculado **isoladamente** (não se somam).

### Verbas sujeitas ao INSS:
- Saldo de salário ✅
- Aviso prévio indenizado ✅
- 13º salário proporcional ✅

### Verbas isentas de INSS:
- Férias proporcionais ❌
- Férias vencidas ❌
- 1/3 constitucional ❌
- Multa FGTS ❌

### Fórmula por verba:
```
INSS_verba = min(Salário × Alíquota – Parcela a Deduzir, Teto_INSS × 14%)
```

---

## 5. Cálculo do IRRF na Rescisão

**Regra Importante:** O IRRF também é calculado **separadamente** por verba.

### Verbas sujeitas ao IRRF:
- Saldo de salário ✅
- 13º salário proporcional ✅

### Verbas isentas de IRRF:
- Aviso prévio indenizado ❌
- Férias indenizadas (proporcionais e vencidas) + 1/3 ❌
- Multa FGTS ❌

### Fórmula por verba:
```
Base Cálculo = Verba Tributável – INSS sobre a verba – Deduções (dependentes)
IRRF = Aplicar tabela progressiva na Base de Cálculo
```

**Redutor Lei 15.270/2025:** Se a base de cálculo mensal (somando todas as verbas tributáveis) for ≤ R$ 5.000,00, o IRRF efetivo é zero.

---

## 6. Passo a Passo Completo do Cálculo

### Entradas Necessárias:
1. Data de admissão
2. Data de demissão (último dia trabalhado)
3. Salário bruto
4. Motivo da rescisão
5. Saldo FGTS (informado pelo empregador)
6. Dependentes IR
7. Férias: status (nenhuma, vencida simples, vencida em dobro)
8. Faltas no período aquisitivo
9. Aviso prévio: tipo (indenizado, trabalhado, não aplicável)
10. Horas extras, adicionais (insalubridade, periculosidade, noturno)

### Fluxo de Cálculo:
```
1. Calcular dias trabalhados no mês da rescisão → Saldo de Salário
2. Calcular anos de serviço → Dias de Aviso Prévio → Valor do Aviso
3. Calcular meses de 13º no ano → 13º Proporcional
4. Calcular meses do período aquisitivo → Férias Proporcionais + 1/3
5. Verificar períodos vencidos → Férias Vencidas + 1/3
6. Aplicar reduções por faltas (Art. 130 CLT)
7. Calcular INSS sobre cada verba tributável (isoladamente)
8. Calcular IRRF sobre cada verba tributável (isoladamente)
9. Calcular multa FGTS (40% ou 20%)
10. Somar verbas devidas, subtrair descontos → Líquido
```

---

## 7. Exemplo Prático Completo

### Dados:
- **Admissão:** 15/03/2024
- **Demissão:** 05/04/2026 (sem justa causa)
- **Salário:** R$ 3.000,00
- **Saldo FGTS:** R$ 6.000,00
- **Férias vencidas:** 1 período (2024-2025)
- **Dependentes IR:** 0
- **Aviso prévio:** Indenizado

### Cálculos:

**1. Saldo de Salário (5 dias):**
```
(3.000 ÷ 30) × 5 = R$ 500,00
INSS: (500 × 7,5%) = R$ 37,50
IRRF: Base = 500 – 37,50 = R$ 462,50 → isento (≤ R$ 2.428,80)
```

**2. Aviso Prévio (30 + 3×1 = 33 dias, pois tem 1 ano completo):**
```
(3.000 ÷ 30) × 33 = R$ 3.300,00
INSS: (3.300 × 12%) – 111,40 = R$ 284,60
IRRF: Isento (indenizado)
```

**3. 13º Proporcional (3 meses: jan, fev, mar):**
*Nota: abril conta porque a projeção do aviso prévio indenizado projeta o contrato*
```
(3.000 ÷ 12) × 3 = R$ 750,00
INSS: (750 × 7,5%) = R$ 56,25
IRRF: Base = 750 – 56,25 = R$ 693,75 → isento
```

**4. Férias Proporcionais (1 mês: 15/03/2026 a 05/04/2026 = período incompleto):**
*Nota: precisa calcular o período aquisitivo exato*
```
Supondo 1 mês incompleto:
(3.000 ÷ 12) × 1 × 1,333 = R$ 333,33
INSS: Isento | IRRF: Isento
```

**5. Férias Vencidas (1 período completo + 1/3):**
```
3.000 + (3.000 ÷ 3) = R$ 4.000,00
INSS: Isento | IRRF: Isento
```

**6. Multa FGTS (40%):**
```
Saldo FGTS: R$ 6.000,00
Depósito aviso: 3.300 × 8% = R$ 264,00
Total para multa: 6.264,00
Multa: 6.264,00 × 40% = R$ 2.505,60
(Não integra o líquido - depositado via GRRF)
```

### Resumo:

| Verba | Valor | INSS | IRRF |
|-------|------:|-----:|-----:|
| Saldo de salário (5 dias) | R$ 500,00 | R$ 37,50 | R$ 0,00 |
| Aviso prévio indenizado (33 dias) | R$ 3.300,00 | R$ 284,60 | R$ 0,00 |
| 13º proporcional (3/12) | R$ 750,00 | R$ 56,25 | R$ 0,00 |
| Férias proporcionais + 1/3 | R$ 333,33 | Isento | Isento |
| Férias vencidas + 1/3 | R$ 4.000,00 | Isento | Isento |
| **Total Bruto** | **R$ 8.883,33** | **R$ 378,35** | **R$ 0,00** |
| **Total Líquido** | | **R$ 8.504,98** | |
| Multa FGTS (40%) | R$ 2.505,60 | | (depositado) |

---

## 8. Referências Legais

| Norma | Descrição |
|-------|-----------|
| CLT Arts. 477-512 | Rescisão do contrato de trabalho |
| Lei nº 12.506/2011 | Aviso prévio proporcional |
| Lei nº 4.090/1962 | 13º salário |
| Lei nº 8.036/1990 | FGTS |
| Lei nº 15.270/2025 | Reforma do IRRF (redutor) |
| Portaria MPS/MF nº 13/2026 | Tabela INSS |
| Decreto nº 12.797/2025 | Salário mínimo 2026 |
| Art. 7º, XVII CF/88 | 1/3 constitucional de férias |
| Súmula 386 TST | Férias indenizadas isentas de IRRF |
