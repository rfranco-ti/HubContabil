# ⏰ Cálculos Trabalhistas Completos 2026

**Última atualização:** 05 de abril de 2026  
**Versão:** 1.0  
**Status:** ✅ Documentado - Pronto para implementação

---

## 📋 Índice
1. [Aviso Prévio](#1-aviso-prévio)
2. [Horas Extras](#2-horas-extras)
3. [Seguro Desemprego](#3-seguro-desemprego)
4. [Jornada de Trabalho](#4-jornada-de-trabalho)
5. [Salário Líquido](#5-salário-líquido)
6. [Implementação no Sistema](#implementação-no-sistema)

---

## 1. Aviso Prévio

### 📖 Visão Geral
Comunicação antecipada dada ao empregado antes da rescisão contratual. Garante tempo para transição.

### ⚖️ Base Legal Completa

| Norma | Dispositivo | Descrição |
|-------|-------------|-----------|
| **Lei 12.506/2011** | Art. 1º-7º | Aviso prévio proporcional (atual) |
| **CLT, Art. 487** | - | Aviso prévio original (30 dias) |
| **CLT, Art. 488** | - | Redução de 2h/dia ou 7 dias corridos |
| **CLT, Art. 489** | - | Efeitos da dispensa sem aviso |
| **CLT, Art. 490** | - | Contrato por tempo determinado |
| **CLT, Art. 491** | - | Contrato de experiência |
| **Súmula 276 TST** | - | Projeção do aviso na contagem de tempo |
| **Súmula 371 TST** | - | Aviso prévio indenizado e projeção |
| **CF/88, Art. 7º, XXI** | - | Garantia constitucional do aviso prévio |

### 📊 Regras 2026

#### Duração
```
Mínimo: 30 dias
Adicional: +3 dias por ano completo de serviço
Máximo: 90 dias
```

**Fórmula:**
```
Dias Aviso Prévio = 30 + (Anos Completos × 3)
Limite: mínimo 30, máximo 90
```

#### Tipos

| Tipo | Característica | Cálculo |
|------|---------------|---------|
| **Trabalhado** | Empregado trabalha durante aviso | Salário proporcional aos dias |
| **Indenizado** | Empregado é dispensado sem trabalhar | Salário integral do período |

#### Redução de Jornada (Aviso Trabalhado)

**Opção 1: Redução de 2 horas diárias**
```
Jornada normal: 8h/dia
Durante aviso: 6h/dia
Salário: integral (sem desconto)
```

**Opção 2: 7 dias corridos de dispensa**
```
Empregado trabalha normalmente até o final
Últimos 7 dias são dispensados (indenizados)
Salário: integral
```

### 🧮 Cálculo Detalhado

#### Aviso Prévio Indenizado

**Fórmula:**
```
1. Calcular dias:
   Dias = 30 + (Anos Completos × 3)
   Dias = min(Dias, 90)
   Dias = max(Dias, 30)

2. Calcular valor:
   Valor Aviso = (Salário / 30) × Dias
```

**Exemplo: 5 anos de empresa, salário R$ 3.000**
```
1. Dias = 30 + (5 × 3) = 45 dias

2. Valor Aviso = (3.000 / 30) × 45 = R$ 4.500,00

3. Projeção na contagem de tempo:
   Nova data de saída = Data dispensa + 45 dias
   → Impacta: férias, 13º, FGTS
```

#### Aviso Prévio Trabalhado

**Fórmula:**
```
Valor Aviso = Salário (integral, sem desconto)

Se redução 2h/dia:
  Horas não trabalhadas = 2h/dia × dias trabalhados
  → Estas horas SÃO indenizadas (já incluídas no salário)

Se dispensa 7 dias finais:
  Dias trabalhados = Total - 7
  Valor = (Salário / 30) × Dias trabalhados + 7 dias indenizados
```

#### Reflexos Obrigatórios

O aviso prévio (indenizado ou trabalhado) gera reflexos em:

```
✅ FGTS + 40%
✅ 13º salário proporcional
✅ Férias + 1/3 proporcionais
✅ INSS (sobre valor do aviso)
✅ IRRF (sobre valor do aviso)
✅ Projeção para contagem de tempo (férias, 13º)
```

**Cálculo dos Reflexos:**
```
1. FGTS sobre aviso indenizado:
   FGTS = Valor Aviso × 8%

2. Multa 40% FGTS sobre aviso:
   Multa = FGTS × 40%

3. 13º proporcional (com projeção):
   Meses = contar incluindo projeção do aviso
   13º = (Salário / 12) × Meses

4. Férias proporcionais (com projeção):
   Meses = contar incluindo projeção do aviso
   Férias = (Salário / 12) × Meses
   1/3 Férias = Férias / 3
```

### 📝 Exemplo Completo

**Dados:**
- Salário: R$ 4.000,00
- Tempo de serviço: 8 anos
- Data admissão: 01/03/2018
- Data dispensa: 01/04/2026
- Tipo: Indenizado

**Cálculo:**
```
1. Dias Aviso = 30 + (8 × 3) = 54 dias

2. Valor Aviso = (4.000 / 30) × 54 = R$ 7.200,00

3. Projeção: Nova data saída = 01/04/2026 + 54 dias = 25/05/2026

4. Reflexos:
   a) FGTS sobre aviso = 7.200 × 8% = R$ 576,00
   b) Multa 40% = 576 × 40% = R$ 230,40
   c) 13º proporcional (assume 9/12 com projeção):
      13º = (4.000 / 12) × 9 = R$ 3.000,00
   d) Férias + 1/3 (assume 3/12 com projeção):
      Férias = (4.000 / 12) × 3 = R$ 1.000,00
      1/3 = 1.000 / 3 = R$ 333,33
      Total Férias = R$ 1.333,33
```

---

## 2. Horas Extras

### 📖 Visão Geral
Horas trabalhadas além da jornada contratual. Devem ser remuneradas com adicional mínimo de 50%.

### ⚖️ Base Legal Completa

| Norma | Dispositivo | Descrição |
|-------|-------------|-----------|
| **CF/88, Art. 7º, XVI** | - | Hora extra mínimo +50% sobre normal |
| **CLT, Art. 59** | - | Prorrogação da jornada (acordo/ convenção) |
| **CLT, Art. 60** | - | Horas extras em caso de força maior |
| **CLT, Art. 61** | - | Recuperação de horas (compensação) |
| **CLT, Art. 62** | - | Exceções (gerentes, externos) |
| **CLT, Art. 71** | - | Intervalo intrajornada (não computado) |
| **CLT, Art. 73** | - | Trabalho noturno (+20%, hora 52m30s) |
| **CLT, Art. 74** | - | Registro de ponto |
| **Decreto 21.691/32** | - | Trabalho noturno urbano |
| **Súmula 85 TST** | - | Compensação de horas (banco) |
| **Súmula 431 TST** | - | Intervalo suprimido = hora extra |
| **Súmula 437 TST** | - | Intervalo não concedido |

### 📊 Regras 2026

#### Limite de Horas Extras
```
Máximo diário: 2 horas extras
Máximo semanal: 12 horas extras (6 dias × 2h)
Máximo mensal: ~44 horas extras
```

#### Adicionais

| Tipo | Adicional Mínimo | Base Legal |
|------|-----------------|------------|
| **Hora Extra Diurna** | +50% sobre hora normal | CF/88, Art. 7º, XVI |
| **Hora Extra Noturna** | +50% + 20% = +70% (cumulativo) | CLT 59 + CLT 73 |
| **Hora Extra Domingos/Feriados** | +100% | Lei/Convenção |
| **Sobreaviso** | +33,33% sobre salário-hora | CLT 244 |
| **Prontidão** | +16,67% sobre salário-hora | CLT 244 |

#### Trabalho Noturno Urbano

| Parâmetro | Valor |
|-----------|-------|
| **Período** | 22:00 às 05:00 |
| **Adicional** | +20% sobre hora diurna |
| **Hora noturna** | 52 minutos e 30 segundos |
| **Fator redução** | 1 hora relógio = 1,1428 hora noturna |

#### Trabalho Noturno Rural

| Atividade | Período | Adicional |
|-----------|---------|-----------|
| Lavoura | 21:00 às 05:00 | +25% |
| Pecuária | 20:00 às 04:00 | +25% |

### 🧮 Cálculos Detalhados

#### Hora Normal (Diurna)

**Fórmulas:**
```
Salário-hora normal = Salário Mensal / (220 horas mensais)
                    = Salário / (Jornada Semanal × 52 semanas / 12 meses)
                    = Salário / 220 (para 44h semanais)

Para 40h semanais: divisor = 200
Para 36h semanais: divisor = 180
```

#### Hora Extra Diurna (+50%)

**Fórmula:**
```
Valor Hora Extra = Hora Normal × 1,50
                 = (Salário / 220) × 1,50
```

**Exemplo: Salário R$ 3.000, 44h semanais, 10 horas extras no mês**
```
1. Hora normal = 3.000 / 220 = R$ 13,64

2. Hora extra = 13,64 × 1,50 = R$ 20,45

3. Total HE = 20,45 × 10 = R$ 204,55
```

#### Hora Extra Noturna (+50% + 20%)

**Fórmula:**
```
1. Converter hora relógio para hora noturna:
   Hora Noturna (52m30s) = 3.150 segundos
   Hora Normal (60m) = 3.600 segundos
   Fator = 3.600 / 3.150 = 1,1428

2. Calcular horas noturnas reais:
   Horas Relógio × 1,1428 = Horas Noturnas Convertidas

3. Valor Hora Normal Noturna = (Salário / 220) × 1,20 (adicional noturno)

4. Valor Hora Extra Noturna = Hora Normal Noturna × 1,50 (adicional HE)

   Ou simplificando:
   HE Noturna = (Salário / 220) × 1,20 × 1,50
              = (Salário / 220) × 1,80
```

**Exemplo: Salário R$ 3.000, 4 horas extras noturnas (22h-02h)**
```
1. Horas relógio = 4h

2. Horas convertidas = 4 × 1,1428 = 4,57 horas noturnas

3. Hora normal noturna = 3.000 / 220 × 1,20 = R$ 16,36

4. HE noturna = 16,36 × 1,50 = R$ 24,55

5. Total HE Noturna = 24,55 × 4,57 = R$ 112,17

OU (forma simplificada):
   HE Noturna = (3.000 / 220) × 1,80 = R$ 24,55
   Total = 24,55 × 4,57 = R$ 112,17
```

#### Hora Extra em Domingos e Feriados (+100%)

**Fórmula:**
```
HE Domingo/Feriado = (Salário / 220) × 2,00
```

**Exemplo: Salário R$ 3.000, 1 domingo trabalhado (8h)**
```
HE = (3.000 / 220) × 2,00 = R$ 27,27/hora
Total = 27,27 × 8 = R$ 218,18
```

#### Reflexos das Horas Extras

```
✅ FGTS: 8% sobre total HE
✅ 13º salário: integra base de cálculo
✅ Férias + 1/3: integra base de cálculo
✅ INSS: sobre total HE
✅ IRRF: sobre total HE
✅ Aviso prévio: sobre média de HE
✅ Repouso semanal remunerado: proporcional
```

---

## 3. Seguro Desemprego

### 📖 Visão Geral
Benefício temporário pago ao trabalhador dispensado sem justa causa. Garante sustento durante busca por novo emprego.

### ⚖️ Base Legal Completa

| Norma | Dispositivo | Descrição |
|-------|-------------|-----------|
| **Lei 7.998/90** | Art. 1-10 | Regulamenta Seguro Desemprego |
| **Lei 13.134/2015** | - | Altera requisitos de concessão |
| **MP 905/2019** | - | Alterações (parcialmente revogada) |
| **CLT, Art. 477** | - | Rescisão e comunicação |
| **CF/88, Art. 7º, II** | - | Garantia constitucional |
| **Portaria MTE 1.160/2025** | - | Valores 2026 |

### 📊 Regras 2026

#### Requisitos

| Solicitação | Meses Trabalhados | Período de Referência |
|-------------|------------------|----------------------|
| **1ª Solicitação** | 12 meses | Últimos 18 meses |
| **2ª Solicitação** | 9 meses | Últimos 12 meses |
| **3ª+ Solicitação** | 6 meses | Últimos 6 meses |

**Condições adicionais:**
- Dispensa sem justa causa
- Não possuir renda própria para sustento
- Não estar recebendo benefício previdenciário (exceto auxílio-acidente)
- Não ter recebido seguro-desemprego nos últimos períodos de carência

#### Número de Parcelas

| Meses Trabalhados | Nº Parcelas (1ª) | Nº Parcelas (2ª) | Nº Parcelas (3ª+) |
|------------------|------------------|------------------|-------------------|
| 6-11 meses | - | 3 | 3 |
| 12-23 meses | 4 | 4 | 4 |
| 24+ meses | 5 | 5 | 5 |

#### Valores 2026

| Parâmetro | Valor |
|-----------|-------|
| **Salário Mínimo 2026** | **R$ 1.621,00** |
| **Valor Mínimo SD** | **R$ 1.621,00** |
| **Valor Máximo SD** | **R$ 2.250,52** (teto) |

**Tabela de Cálculo:**

```
Se Média Salarial ≤ R$ 1.902,42:
  Parcela = Média Salarial × 0,80

Se R$ 1.902,43 ≤ Média ≤ R$ 3.170,71:
  Parcela = (Média × 0,50) + R$ 760,90

Se Média > R$ 3.170,71:
  Parcela = R$ 2.250,52 (teto)

Limites:
  Mínimo: R$ 1.621,00 (salário mínimo)
  Máximo: R$ 2.250,52
```

### 🧮 Cálculo Detalhado

**Fórmulas:**
```
1. Calcular média salarial:
   Média = (Soma dos 3 últimos salários) / 3
   OU (se menos de 3 meses): média dos meses trabalhados

2. Aplicar faixa:
   Faixa 1 (até R$ 1.902,42): Parcela = Média × 0,80
   Faixa 2 (R$ 1.902,43 - R$ 3.170,71): Parcela = (Média × 0,50) + R$ 760,90
   Faixa 3 (acima R$ 3.170,71): Parcela = R$ 2.250,52

3. Aplicar limites:
   Parcela = max(R$ 1.621,00, min(R$ 2.250,52, Parcela))

4. Total beneficio:
   Total = Parcela × Nº Parcelas
```

**Exemplo 1: Salário R$ 2.500, 18 meses trabalhados, 1ª solicitação**
```
1. Média = 2.500 (últimos 3 meses iguais)

2. Faixa 2: (1.902,43 - 3.170,71)
   Parcela = (2.500 × 0,50) + 760,90 = R$ 2.010,90

3. Dentro dos limites (1.621 ≤ 2.010,90 ≤ 2.250,52) ✓

4. Parcelas: 4 (12-23 meses, 1ª solicitação)
   Total = 4 × 2.010,90 = R$ 8.043,60
```

**Exemplo 2: Salário R$ 1.500, 8 meses trabalhados, 2ª solicitação**
```
1. Média = 1.500

2. Faixa 1: (até R$ 1.902,42)
   Parcela = 1.500 × 0,80 = R$ 1.200,00

3. Aplica mínimo: max(1.621, 1.200) = R$ 1.621,00

4. Parcelas: 3 (6-11 meses, 2ª solicitação)
   Total = 3 × 1.621 = R$ 4.863,00
```

### 📝 Como Solicitar

```
1. Via online:
   App Carteira de Trabalho Digital
   Portal Gov.br
   
2. Presencial:
   Postos do SINE
   Unidades do Ministério do Trabalho

3. Documentos necessários:
   - CTPS (Carteira de Trabalho)
   - Termo de Rescisão (TRCT)
   - RG e CPF
   - Comprovante de residência
   - Requerimento do seguro-desemprego (entregue pela empresa)

4. Prazo:
   - Trabalhador formalizado: até 120 dias da dispensa
   - Doméstico: até 90 dias
```

---

## 4. Jornada de Trabalho

### 📖 Visão Geral
Período em que o empregado está à disposição do empregador, pronto para cumprir obrigações.

### ⚖️ Base Legal Completa

| Norma | Dispositivo | Descrição |
|-------|-------------|-----------|
| **CF/88, Art. 7º, XIII-XIV** | - | 8h diárias, 44h semanais, turnos |
| **CLT, Art. 58** | - | Duração normal (8h/44h) |
| **CLT, Art. 59** | - | Prorrogação (horas extras) |
| **CLT, Art. 60** | - | Força maior |
| **CLT, Art. 61** | - | Compensação |
| **CLT, Art. 64-67** | - | Salário mínimo por hora |
| **CLT, Art. 71** | - | Intervalo intrajornada |
| **CLT, Art. 72** | - | Deslocamento |
| **CLT, Art. 73** | - | Trabalho noturno |
| **CLT, Art. 74** | - | Registro de ponto |
| **CLT, Art. 75** | - | Sobreaviso |
| **Decreto-Lei 5.452/43** | Arts. 58-75 | Capítulo da duração do trabalho |

### 📊 Regras 2026

#### Limites Legais

| Parâmetro | Limite |
|-----------|--------|
| **Jornada Diária Máxima** | **8 horas** |
| **Jornada Semanal Máxima** | **44 horas** |
| **Horas Extras Máximas/Dia** | **2 horas** |
| **Intervalo Intrajornada (> 6h)** | **Mínimo 1h, Máximo 2h** |
| **Intervalo Intrajornada (≤ 6h)** | **Mínimo 15 minutos** |
| **Intervalo Interjornadas** | **Mínimo 11 horas consecutivas** |
| **DSR (Descanso Semanal Remunerado)** | **24h consecutivas (preferencialmente domingo)** |

#### Escalas Comuns

| Escala | Dias Trabalho | Dias Descanso | Horas/Dia | Horas/Semana |
|--------|--------------|---------------|-----------|--------------|
| **5x2** | 5 (seg-sex) | 2 (sáb-dom) | 8h48 | 44h |
| **6x1** | 6 | 1 | 7h20 | 44h |
| **4x3** | 4 | 3 | 11h | 44h (com banco) |
| **12x36** | 12h trabalho | 36h descanso | 12h | 36h (média) |

#### Registro de Ponto

```
Obrigatório para empresas com > 20 empregados
Art. 74 CLT

Formas aceitas:
✅ Manual (cartão de ponto)
✅ Mecânico (relógio de ponto)
✅ Eletrônico (REP - Registrador Eletrônico)
✅ Digital (portaria 671/2021 MTP)

Registros obrigatórios:
- Entrada
- Saída almoço
- Retorno almoço
- Saída
```

### 🧮 Cálculos Relacionados

#### Intervalo Intrajornada Suprimido

```
Se intervalo concedido < mínimo legal:
→ Hora extra do período suprimido + 50%

Exemplo: intervalo de 30min quando mínimo é 1h
→ 30 minutos como hora extra (+50%)
```

#### Intervalo Não Concedido

```
Se intervalo NÃO concedido:
→ Período integral como hora extra (+50%)
→ Multa administrativa (art. 71, §4º CLT)
```

#### Descanso Semanal Remunerado (DSR)

```
Fórmula:
DSR = (Salário / Dias Úteis do Mês) × Domingos/Feriados

Para mensalistas: já incluído no salário

Para horistas/diaristas:
DSR = (Valor Total Horas Extras no Mês / Dias Úteis) × Domingos
```

#### Banco de Horas

```
Compensação deve ocorrer em até:
- 6 meses (acordo individual)
- 1 ano (convenção/acordo coletivo)

Saldo positivo: pago como hora extra (+50%) se não compensado
Saldo negativo: desconto permitido
```

---

## 5. Salário Líquido

### 📖 Visão Geral
Valor efetivamente recebido pelo trabalhador após todos os descontos obrigatórios.

### ⚖️ Base Legal

| Desconto | Base Legal |
|----------|-----------|
| **INSS** | Lei 8.212/91, Portaria MPS/MF nº 13/2026 |
| **IRRF** | Lei 9.250/95, RIR/2018, IN RFB 2.131/2023 |
| **Vale Transporte** | Lei 7.418/85 (máx 6%) |
| **Vale Refeição** | PAT (Programa Alimentação Trabalhador) |
| **Plano de Saúde** | Lei 9.656/98 (se contratual) |
| **Adiantamento** | Art. 462 CLT |

### 📊 Tabelas 2026

#### INSS - Tabela Progressiva

| Faixa | Salário de Contribuição | Alíquota |
|-------|------------------------|----------|
| 1 | Até R$ 1.621,00 | 7,5% |
| 2 | R$ 1.621,01 – R$ 2.902,84 | 9% |
| 3 | R$ 2.902,85 – R$ 4.354,27 | 12% |
| 4 | R$ 4.354,28 – R$ 9.030,34 | 14% |
| **Teto** | **R$ 9.030,34** | |

**Cálculo por Faixas (Método Correto):**
```
INSS não é aplicado sobre o total!
É calculado progressivamente, faixa por faixa.
```

#### IRRF 2026 - Tabela Progressiva

| Faixa | Base de Cálculo Mensal | Alíquota | Parcela a Deduzir |
|-------|----------------------|----------|-------------------|
| 1 | Até R$ 2.259,20 | Isento | - |
| 2 | R$ 2.259,21 – R$ 2.826,65 | 7,5% | R$ 169,44 |
| 3 | R$ 2.826,66 – R$ 3.751,05 | 15% | R$ 381,44 |
| 4 | R$ 3.751,06 – R$ 4.664,68 | 22,5% | R$ 662,77 |
| 5 | Acima de R$ 4.664,68 | 27,5% | R$ 896,00 |

**Parâmetros:**
```
Desconto simplificado: R$ 607,20/mês
Dedução por dependente: R$ 189,59/mês (R$ 2.275,08/ano)
```

### 🧮 Cálculo Completo

#### Passo 1: Calcular INSS

**Método Progressivo por Faixas:**

```
Para salário R$ 5.000:

Faixa 1: 1.621,00 × 7,5% = R$ 121,58
Faixa 2: (2.902,84 - 1.621,00) × 9% = 1.281,84 × 9% = R$ 115,37
Faixa 3: (4.354,27 - 2.902,84) × 12% = 1.451,43 × 12% = R$ 174,17
Faixa 4: (5.000 - 4.354,27) × 14% = 645,73 × 14% = R$ 90,40

Total INSS = 121,58 + 115,37 + 174,17 + 90,40 = R$ 501,52
```

**Ou usando tabela com dedução (mais rápido):**

```
INSS = (Salário × Alíquota Faixa) - Parcela Deduzir

Para R$ 5.000 (Faixa 4, 14%):
  Parcela deduzir Faixa 4 = R$ 904,63 (pré-calculado)
  INSS = 5.000 × 14% - 904,63 = 700 - 904,63... erro!

→ Usar cálculo faixa por faixa para precisão!
```

#### Passo 2: Calcular Base IRRF

```
Base IRRF = Salário Bruto - INSS - Deduções

Deduções possíveis:
- Dependentes: R$ 189,59 por dependente
- Pensão alimentícia: valor judicial
- Desconto simplificado: R$ 607,20 (opcional, substitui outras deduções)
```

**Exemplo:**
```
Salário: R$ 5.000,00
INSS: R$ 501,52
Dependentes: 1
Desconto simplificado: NÃO (usa dependentes)

Base IRRF = 5.000 - 501,52 - 189,59 = R$ 4.308,89
```

#### Passo 3: Calcular IRRF

```
Base: R$ 4.308,89 → Faixa 4 (R$ 3.751,06 – R$ 4.664,68)

IRRF = (Base × 22,5%) - 662,77
     = (4.308,89 × 22,5%) - 662,77
     = 969,50 - 662,77
     = R$ 306,73
```

#### Passo 4: Outros Descontos

```
Vale Transporte: min(6% do Salário, Valor Real)
Vale Refeição: conforme contrato
Plano de Saúde: conforme contrato
```

#### Passo 5: Calcular Salário Líquido

```
Salário Líquido = Salário Bruto - INSS - IRRF - Outros Descontos
```

### 📝 Exemplo Completo

**Dados:**
- Salário Bruto: R$ 6.000,00
- Dependentes: 2
- Vale Transporte: R$ 360,00 (6% do salário)
- Plano de Saúde: R$ 250,00

**Cálculo:**

```
PASSO 1 - INSS:
Faixa 1: 1.621,00 × 7,5% = R$ 121,58
Faixa 2: 1.281,84 × 9% = R$ 115,37
Faixa 3: 1.451,43 × 12% = R$ 174,17
Faixa 4: (6.000 - 4.354,27) × 14% = 1.645,73 × 14% = R$ 230,40
Total INSS = R$ 641,52

PASSO 2 - Base IRRF:
Base = 6.000 - 641,52 - (2 × 189,59)
Base = 6.000 - 641,52 - 379,18 = R$ 4.979,30

PASSO 3 - IRRF:
Faixa 5: acima de R$ 4.664,68
IRRF = (4.979,30 × 27,5%) - 896,00
     = 1.369,31 - 896,00
     = R$ 473,31

PASSO 4 - Outros Descontos:
VT: R$ 360,00
Plano Saúde: R$ 250,00
Total Outros: R$ 610,00

PASSO 5 - Salário Líquido:
Líquido = 6.000 - 641,52 - 473,31 - 610,00
Líquido = R$ 4.275,17

RESUMO:
Salário Bruto:        R$ 6.000,00
(-) INSS:             - R$ 641,52  (10,69%)
(-) IRRF:             - R$ 473,31  (7,89%)
(-) Vale Transporte:  - R$ 360,00  (6,00%)
(-) Plano de Saúde:   - R$ 250,00  (4,17%)
Salário Líquido:      = R$ 4.275,17
```

---

## 💻 Implementação no Sistema

### Estrutura de Dados

```typescript
interface CalculoTrabalhista {
  salarioBruto: number;
  tempoServicoAnos: number;
  tempoServicoMeses: number;
  dependentes: number;
  jornadaSemanal: number; // 44, 40, 36
  horasExtrasMes: number;
  horasExtrasNoturnas: number;
  // ... outros campos
}

interface ResultadoCalculos {
  avisoPrevio?: number;
  horasExtras: number;
  inss: number;
  irrf: number;
  salarioLiquido: number;
  seguroDesemprego?: {
    parcelas: number;
    valorParcela: number;
    total: number;
  };
  // ... outros resultados
}
```

### Funções Principais

```javascript
// Aviso Prévio
function calcularAvisoPrevio(anosCompletos, salario) {
  const dias = Math.min(90, Math.max(30, 30 + (anosCompletos * 3)));
  return {
    dias,
    valor: (salario / 30) * dias
  };
}

// Horas Extras
function calcularHoraExtra(salario, percentualAdicional = 50) {
  const horaNormal = salario / 220;
  return horaNormal * (1 + percentualAdicional / 100);
}

// Hora Noturna
function calcularHoraExtraNoturna(salario) {
  const horaNormal = salario / 220;
  const fatorNoturno = 1.1428; // 52m30s
  const adicionalNoturno = 1.20; // +20%
  const adicionalHE = 1.50; // +50%

  return {
    horaConvertida: fatorNoturno,
    valor: horaNormal * adicionalNoturno * adicionalHE
  };
}

// INSS Progressivo
function calcularINSS(salario) {
  const faixas = [
    { limite: 1621.00, aliquota: 0.075 },
    { limite: 2902.84, aliquota: 0.09 },
    { limite: 4354.27, aliquota: 0.12 },
    { limite: 9030.34, aliquota: 0.14 }
  ];

  let inss = 0;
  let salarioRestante = salario;
  let limiteAnterior = 0;

  for (const faixa of faixas) {
    const baseFaixa = Math.min(salarioRestante, faixa.limite - limiteAnterior);
    if (baseFaixa <= 0) break;

    inss += baseFaixa * faixa.aliquota;
    salarioRestante -= baseFaixa;
    limiteAnterior = faixa.limite;
  }

  return inss;
}

// IRRF
function calcularIRRF(baseCalculo, dependentes = 0) {
  const deducaoDependente = 189.59;
  const base = baseCalculo - (dependentes * deducaoDependente);

  const faixas = [
    { limite: 2259.20, aliquota: 0, deducao: 0 },
    { limite: 2826.65, aliquota: 0.075, deducao: 169.44 },
    { limite: 3751.05, aliquota: 0.15, deducao: 381.44 },
    { limite: 4664.68, aliquota: 0.225, deducao: 662.77 },
    { limite: Infinity, aliquota: 0.275, deducao: 896.00 }
  ];

  const faixa = faixas.find(f => base <= f.limite);
  return Math.max(0, (base * faixa.aliquota) - faixa.deducao);
}

// Salário Líquido
function calcularSalarioLiquido(salarioBruto, dependentes, outrosDescontos = 0) {
  const inss = calcularINSS(salarioBruto);
  const baseIRRF = salarioBruto - inss;
  const irrf = calcularIRRF(baseIRRF, dependentes);

  return {
    salarioBruto,
    inss,
    irrf,
    outrosDescontos,
    salarioLiquido: salarioBruto - inss - irrf - outrosDescontos
  };
}

// Seguro Desemprego
function calcularSeguroDesemprego(salariosUltimos3Meses, mesesTrabalhados, solicitacao) {
  const media = salariosUltimos3Meses.reduce((a, b) => a + b, 0) / 3;

  let parcela;
  if (media <= 1902.42) {
    parcela = media * 0.80;
  } else if (media <= 3170.71) {
    parcela = (media * 0.50) + 760.90;
  } else {
    parcela = 2250.52;
  }

  parcela = Math.max(1621.00, Math.min(2250.52, parcela));

  let numParcelas;
  if (solicitacao === 1) {
    if (mesesTrabalhados >= 24) numParcelas = 5;
    else if (mesesTrabalhados >= 12) numParcelas = 4;
    else numParcelas = 0;
  } else if (solicitacao === 2) {
    if (mesesTrabalhados >= 9) numParcelas = 5;
    else if (mesesTrabalhados >= 6) numParcelas = 3;
    else numParcelas = 0;
  } else {
    if (mesesTrabalhados >= 6) numParcelas = 5;
    else numParcelas = 0;
  }

  return {
    mediaSalarial: media,
    valorParcela: parcela,
    numParcelas,
    total: parcela * numParcelas
  };
}
```

---

## 🌐 Sites e Ferramentas Oficiais

| Recurso | URL |
|---------|-----|
| Calculadora INSS | https://meu.inss.gov.br |
| Tabela INSS | Portaria MPS/MF nº 13/2026 |
| Calculadora IRRF | https://www.gov.br/receitafederal/irpf |
| Seguro Desemprego | App Carteira Digital |
| CalculoRescisao | https://www.calculorescisao.com.br |
| Valor do Trabalho | https://www.valordotrabalho.com.br |

---

*Documento completo com base legal, fórmulas e exemplos para todos os cálculos trabalhistas.*
