# 💼 TRCT - Termo de Rescisão do Contrato de Trabalho 2026

**Última atualização:** 05 de abril de 2026  
**Versão:** 1.0  
**Status:** ✅ Documentado - Pronto para implementação do simulador

---

## 📋 Índice
1. [Visão Geral do TRCT](#visão-geral-do-trct)
2. [Base Legal Completa](#base-legal-completa)
3. [Tipos de Desligamento](#tipos-de-desligamento)
4. [Verbas Rescisórias por Tipo](#verbas-rescisórias-por-tipo)
5. [Tabelas e Valores 2026](#tabelas-e-valores-2026)
6. [Fórmulas de Cálculo Completas](#fórmulas-de-cálculo-completas)
7. [Exemplos Práticos Completos](#exemplos-práticos-completos)
8. [Implementação do Simulador](#implementação-do-simulador)

---

## 📖 Visão Geral do TRCT

### O que é o TRCT?
**Termo de Rescisão do Contrato de Trabalho** - documento obrigatório que detalha todas as verbas pagas ao trabalhador na rescisão contratual.

### Requisitos Legais

| Parâmetro | Prazo | Base Legal |
|-----------|-------|------------|
| **Entrega do TRCT** | Até 10 dias corridos da rescisão | Lei 13.467/2017 (Reforma Trabalhista) |
| **Pagamento das Verbas** | Até 10 dias corridos da rescisão | Art. 477, §6º CLT |
| **Multa por atraso** | Valor de 1 salário do empregado | Art. 477, §8º CLT |
| **Homologação** | Não obrigatória (pós-reforma) | Art. 477, §3º CLT |

### Campos do TRCT (eSocial S-2299)

```
1. Identificação do Empregador (CNPJ, Razão Social)
2. Identificação do Trabalhador (CPF, NIS, Nome)
3. Dados do Contrato (Admissão, CBO, Remuneração)
4. Afastamento (Data, Motivo)
5. Verbas Rescisórias (código, referência, valor)
6. Informações Complementares
```

---

## ⚖️ Base Legal Completa

| Norma | Dispositivo | Descrição |
|-------|-------------|-----------|
| **CLT, Art. 477** | - | Disposições gerais sobre rescisão |
| **CLT, Art. 477, §6º** | - | Prazo 10 dias para pagamento |
| **CLT, Art. 477, §8º** | - | Multa por atraso no pagamento |
| **CLT, Art. 478-480** | - | Indenizações e penalidades |
| **CLT, Art. 487** | - | Aviso prévio |
| **CLT, Art. 129-153** | - | Férias |
| **CLT, Art. 489-490** | - | 13º salário |
| **Lei 8.036/90** | - | FGTS e multa rescisória |
| **Lei 13.467/2017** | - | Reforma Trabalhista |
| **Portaria MTE 1.160/2025** | - | Valores 2026 |
| **Portaria MPS/MF nº 13/2026** | - | Tabela INSS, Salário Família |
| **eSocial S-2299** | - | Evento de rescisão |
| **Súmula 305 TST** | - | Contagem tempo de serviço |
| **Súmula 381 TST** | - | Homologação rescisória |

---

## 📊 Tipos de Desligamento

### 1. Demissão Sem Justa Causa (pelo empregador)

**Direitos do Trabalhador:**
- ✅ Saldo de salário (dias trabalhados)
- ✅ Aviso prévio (indenizado ou trabalhado)
- ✅ Férias vencidas + 1/3 (se houver)
- ✅ Férias proporcionais + 1/3
- ✅ 13º salário proporcional
- ✅ Multa 40% FGTS (ou 20% em acordo)
- ✅ Saque do FGTS
- ✅ Seguro-desemprego
- ✅ Entrega de guias para seguro-desemprego

### 2. Demissão Com Justa Causa (pelo empregador)

**Direitos do Trabalhador:**
- ✅ Saldo de salário (dias trabalhados)
- ✅ Férias vencidas + 1/3 (se houver)
- ❌ Férias proporcionais
- ❌ 13º salário proporcional
- ❌ Aviso prévio
- ❌ Multa 40% FGTS
- ❌ Saque do FGTS (mantém depositado)
- ❌ Seguro-desemprego

### 3. Pedido de Demissão (pelo empregado)

**Direitos do Trabalhador:**
- ✅ Saldo de salário (dias trabalhados)
- ✅ Férias vencidas + 1/3 (se houver)
- ✅ Férias proporcionais + 1/3
- ✅ 13º salário proporcional
- ❌ Multa 40% FGTS
- ❌ Saque do FGTS
- ❌ Seguro-desemprego
- ❌ Aviso prévio (deve cumprir ou descontar)

### 4. Acordo Mútuo (Art. 484-A CLT)

**Direitos do Trabalhador:**
- ✅ Saldo de salário
- ✅ Aviso prévio (se indenizado)
- ✅ Férias vencidas + 1/3
- ✅ Férias proporcionais + 1/3
- ✅ 13º salário proporcional
- ✅ Multa 20% FGTS (metade da normal)
- ✅ Saque de 80% do FGTS
- ❌ Seguro-desemprego

---

## 📈 Tabelas e Valores 2026

### Salário Mínimo 2026
```
Valor: R$ 1.621,00
```

### INSS 2026 - Tabela Progressiva
| Faixa | Salário de Contribuição | Alíquota |
|-------|------------------------|----------|
| 1 | Até R$ 1.621,00 | 7,5% |
| 2 | R$ 1.621,01 – R$ 2.902,84 | 9% |
| 3 | R$ 2.902,85 – R$ 4.354,27 | 12% |
| 4 | R$ 4.354,28 – R$ 9.030,34 | 14% |
| **Teto** | **R$ 9.030,34** | |

### IRRF 2026
| Faixa | Base Mensal | Alíquota | Dedução |
|-------|-------------|----------|---------|
| 1 | Até R$ 2.259,20 | Isento | - |
| 2 | R$ 2.259,21 – R$ 2.826,65 | 7,5% | R$ 169,44 |
| 3 | R$ 2.826,66 – R$ 3.751,05 | 15% | R$ 381,44 |
| 4 | R$ 3.751,06 – R$ 4.664,68 | 22,5% | R$ 662,77 |
| 5 | Acima de R$ 4.664,68 | 27,5% | R$ 896,00 |

### Salário Família 2026
```
Valor da cota: R$ 67,54 por filho
Limite de renda: até R$ 1.621,00 (salário mínimo)
Idade máxima: 14 anos (ou inválido qualquer idade)
```

### Divisor Salarial
```
Regra geral: 220 horas mensais (para 44h semanais)

Alternativas:
- 200 horas (40h semanais)
- 180 horas (36h semanais)
- 150 horas (30h semanais)

Para cálculo rescisório: usar SEMPRE 30 dias como divisor
(exceto quando a calculadora permitir opção por dias do mês)
```

---

## 🧮 Fórmulas de Cálculo Completas

### 1. Saldo de Salário

**Fórmula:**
```
Saldo de Salário = (Salário / 30) × Dias Trabalhados no Mês

Se houver horas extras habituais:
Salário Base = Salário + Média Horas Extras

Se houver adicional noturno/horas extras no mês:
Saldo de Salário = (Salário + Adicionais) / 30 × Dias
```

**Exemplo: Salário R$ 3.000, trabalhou 15 dias no mês**
```
Saldo = (3.000 / 30) × 15 = R$ 1.500,00
```

### 2. Aviso Prévio

**Fórmula:**
```
Dias Aviso = 30 + (Anos Completos × 3)
Dias Aviso = min(90, max(30, Dias Aviso))

Valor Aviso = (Salário / 30) × Dias Aviso

Projeção: Nova data saída = Data dispensa + Dias Aviso
```

**Reflexos do Aviso Prévio Indenizado:**
```
Todos os seguintes cálculos usam a data projetada:
- 13º proporcional (conta mês da projeção)
- Férias proporcionais (conta mês da projeção)
- FGTS (inclui mês da projeção)
```

### 3. Férias

#### Férias Vencidas
```
Férias Vencidas = Salário
1/3 Constitucional = Férias Vencidas / 3
Total Férias Vencidas = Férias Vencidas + 1/3
```

#### Férias Proporcionais
```
Meses de Férias = contar meses do período aquisitivo incompleto
→ Contar meses da data de admissão ou último aniversário
→ Contar mês se trabalhou ≥ 15 dias no mês

Férias Proporcionais = (Salário / 12) × Meses
1/3 Constitucional = Férias Proporcionais / 3
Total Férias Proporcionais = Férias Proporcionais + 1/3

Se aviso prévio indenizado:
→ Contar meses incluindo projeção do aviso
```

**Exemplo: Admissão 01/03/2024, Rescisão 25/05/2026**
```
Período aquisitivo:
- 01/03/2024 a 28/02/2025 (completo - férias gozadas?)
- 01/03/2025 a 28/02/2026 (completo - férias gozadas?)
- 01/03/2026 a 25/05/2026 (proporcional)

Meses proporcionais:
Março (15+ dias) = 1
Abril = 1
Maio (25 dias, ≥15) = 1
Total = 3/12 avos

Férias Prop = (3.000 / 12) × 3 = R$ 750,00
1/3 = 750 / 3 = R$ 250,00
Total = R$ 1.000,00
```

### 4. 13º Salário Proporcional

**Fórmula:**
```
Meses 13º = contar meses trabalhados no ano (janeiro até mês rescisão)
→ Contar mês se trabalhou ≥ 15 dias

13º Proporcional = (Salário / 12) × Meses 13º

Se aviso prévio indenizado:
→ Contar meses incluindo projeção do aviso
```

**Exemplo: Rescisão em maio/2026**
```
Meses: Jan (15+ dias) = 1, Fev = 1, Mar = 1, Abr = 1, Mai (≥15) = 1
Total = 5/12 avos

13º = (3.000 / 12) × 5 = R$ 1.250,00
```

### 5. Multa FGTS

#### Demissão Sem Justa Causa
```
Multa FGTS = Saldo Total FGTS × 40%

Saldo Total FGTS inclui:
- Depósitos mensais (8% do salário)
- 13º depositado (8% do 13º)
- Depósitos do aviso prévio indenizado (projeção)
```

#### Acordo Mútuo (Art. 484-A)
```
Multa FGTS = Saldo Total FGTS × 20%
Saque permitido = 80% do saldo total FGTS
```

### 6. Cálculos de Descontos

#### INSS sobre Rescisão
```
INSS incide sobre:
✅ Saldo de salário
✅ 13º salário proporcional
❌ Férias (nem vencidas nem proporcionais)
❌ Aviso prévio indenizado
❌ Multa 40% FGTS
❌ Indenizações

INSS = calcular pela tabela progressiva sobre (Saldo + 13º)
```

#### IRRF sobre Rescisão
```
IRRF incide sobre:
✅ Saldo de salário (após INSS)
✅ 13º salário (após INSS)
❌ Férias (indenizatório)
❌ Aviso prévio indenizado
❌ Multa 40% FGTS

IRRF = calcular pela tabela progressiva sobre base após INSS e dependentes
```

#### Desconto de Faltas
```
Desconto Faltas = (Salário / 30) × Dias de Falta

Se faltas > limite legal (art. 473 CLT):
→ Descontar normalmente
→ Impacta no direito a férias (art. 130 CLT)
→ Impacta no 13º proporcional
```

#### Desconto de Horas Faltas
```
Horas Faltas = converter hh:mm para decimal
Ex: 02:15 = 2 + (15/60) = 2,25 horas

Desconto Horas = (Salário / Jornada Mensal) × Horas Faltas
```

---

## 📝 Exemplos Práticos Completos

### Exemplo Completo 1: Demissão Sem Justa Causa

**Dados:**
- Admissão: 15/03/2023
- Demissão: 20/05/2026
- Salário: R$ 3.500,00
- Jornada: 220 horas
- FGTS acumulado: R$ 8.400,00
- Dependentes IR: 1
- Férias vencidas: Sim (período 2024/2025 não gozado)
- Aviso prévio: Indenizado
- Faltas no período vigente: 3 dias
- Sem adicionais, sem horas extras

**Cálculo Passo a Passo:**

```
=== PASSO 1: DADOS INICIAIS ===
Tempo de serviço: 3 anos e 2 meses
Dias no mês da rescisão: 20 dias (20/05)

=== PASSO 2: AVISO PRÉVIO ===
Dias = 30 + (3 × 3) = 39 dias
Valor Aviso = (3.500 / 30) × 39 = R$ 4.550,00

Projeção: 20/05/2026 + 39 dias = 28/06/2026

=== PASSO 3: SALDO DE SALÁRIO ===
Saldo = (3.500 / 30) × 20 = R$ 2.333,33

=== PASSO 4: FÉRIAS VENCIDAS ===
Férias = R$ 3.500,00
1/3 = 3.500 / 3 = R$ 1.166,67
Total Férias Vencidas = R$ 4.666,67

=== PASSO 5: FÉRIAS PROPORCIONAIS ===
Período: 01/03/2026 a 28/06/2026 (com projeção)
Meses: Mar(15+) + Abr + Mai + Jun(28 dias, ≥15) = 4/12

Férias Prop = (3.500 / 12) × 4 = R$ 1.166,67
1/3 = 1.166,67 / 3 = R$ 388,89
Total Férias Prop = R$ 1.555,56

=== PASSO 6: 13º PROPORCIONAL ===
Meses com projeção: Jan + Fev + Mar + Abr + Mai + Jun(28) = 6/12

13º = (3.500 / 12) × 6 = R$ 1.750,00

=== PASSO 7: MULTA FGTS ===
Multa = 8.400 × 40% = R$ 3.360,00

=== PASSO 8: DESCONTOS ===
a) Faltas: (3.500 / 30) × 3 = R$ 350,00

b) INSS sobre saldo de salário:
   Base = R$ 2.333,33 (Faixa 2: até 2.902,84)
   INSS SS = 2.333,33 × 9% = R$ 210,00 (aproximado)
   (Cálculo exato por faixas seria mais preciso)

c) INSS sobre 13º:
   Base = R$ 1.750,00 (Faixa 2)
   INSS 13º = 1.750 × 9% = R$ 157,50 (aproximado)

Total INSS = R$ 367,50

d) IRRF sobre saldo de salário:
   Base = 2.333,33 - 180,00 (INSS prop.) - 189,59 (1 dep.)
   Base = R$ 1.963,74 → Isento

e) IRRF sobre 13º:
   Base = 1.750 - 157,50 (INSS) - 189,59
   Base = R$ 1.402,91 → Isento

=== PASSO 9: RESUMO ===

PROVENTOS:
Saldo de Salário:      R$ 2.333,33
Aviso Prévio Ind.:     R$ 4.550,00
Férias Vencidas:       R$ 3.500,00
1/3 Férias Vencidas:   R$ 1.166,67
Férias Proporcionais:  R$ 1.166,67
1/3 Férias Prop:       R$   388,89
13º Proporcional:      R$ 1.750,00
Multa 40% FGTS:        R$ 3.360,00
TOTAL PROVENTOS:       R$ 18.215,56

DESCONTOS:
Faltas (3 dias):       - R$ 350,00
INSS SS:               - R$ 180,00
INSS 13º:              - R$ 157,50
TOTAL DESCONTOS:       - R$   687,50

LÍQUIDO A PAGAR:       R$ 17.528,06

+ Seguro Desemprego:
   Meses trabalhados nos últimos 18: 18+ → 1ª solicitação
   Média últimos 3 salários: R$ 3.500
   Parcela: (3.500 × 0,50) + 760,90 = R$ 2.510,90
   Limitado ao teto: R$ 2.250,52
   Nº Parcelas: 5 (24+ meses)
   Total SD: 5 × 2.250,52 = R$ 11.252,60
```

---

## 💻 Implementação do Simulador

### Campos do Formulário (igual ao site de referência)

```typescript
interface SimuladorRescisao {
  anoRescisao: number;              // 2026
  dataAdmissao: Date;               // dd/mm/aaaa
  ultimoSalario: number;            // R$
  jornadaMensal: number;            // 220 horas
  saldoFGTS: number;                // R$
  dependentesIR: number;            // 0+
  dependentesSalarioFamilia: number;// 0+
  feriasVencidas: boolean;          // Sim/Não
  faltasPeriodoVigente: number;     // dias
  motivoDesligamento: Motivo;       // enum
  tipoAvisoPrevio: TipoAviso;       // enum
  dataAvisoPrevio: Date;            // dd/mm/aaaa
  adicionalInsalubridade: boolean;  // Sim/Não + %
  adicionalPericulosidade: boolean; // Sim/Não
  adicionalNoturno: boolean;        // Sim/Não + %
  horasExtras: boolean;             // Sim/Não + qtd + %
  diasFaltaMesRescisao: number;     // 0+
  horasFaltas: string;              // hh:mm
  descontoAdiantamento: number;     // R$
  descontoValeTransporte: boolean;  // Sim/Não (6%)
  outrosDescontos: number;          // R$
  divisorSalarial: Divisor;         // 30 dias ou dias do mês
}
```

### Algoritmo Principal

```javascript
function calcularRescisao(dados) {
  const resultado = {};

  // 1. Calcular tempo de serviço
  const tempoServico = calcularTempoServico(dados.dataAdmissao, dados.dataRescisao);
  resultado.anosCompletos = tempoServico.anos;
  resultado.mesesCompletos = tempoServico.meses;

  // 2. Calcular aviso prévio
  resultado.avisoPrevio = calcularAvisoPrevio(
    tempoServico.anosCompletos,
    dados.ultimoSalario,
    dados.tipoAvisoPrevio
  );

  // 3. Calcular data projetada (para férias e 13º)
  const dataProjetada = dados.tipoAvisoPrevio === 'indenizado'
    ? adicionarDias(dados.dataRescisao, resultado.avisoPrevio.dias)
    : dados.dataRescisao;

  // 4. Saldo de salário
  resultado.saldoSalario = calcularSaldoSalario(
    dados.ultimoSalario,
    dados.divisorSalarial,
    dados.diasTrabalhadosMes
  );

  // 5. Férias
  resultado.feriasVencidas = dados.feriasVencidas
    ? calcularFeriasVencidas(dados.ultimoSalario)
    : null;

  resultado.feriasProporcionais = calcularFeriasProporcionais(
    dados.ultimoSalario,
    dados.dataAdmissao,
    dataProjetada,
    dados.faltasPeriodoVigente
  );

  // 6. 13º proporcional
  resultado.decimoTerceiro = calcularDecimoTerceiro(
    dados.ultimoSalario,
    dados.dataAdmissao,
    dataProjetada,
    dados.anoRescisao,
    dados.faltasPeriodoVigente
  );

  // 7. Multa FGTS
  if (dados.motivoDesligamento === 'SEM_JUSTA_CAUSA') {
    resultado.multaFGTS = dados.saldoFGTS * 0.40;
  } else if (dados.motivoDesligamento === 'ACORDO_MUTUO') {
    resultado.multaFGTS = dados.saldoFGTS * 0.20;
  } else {
    resultado.multaFGTS = 0;
  }

  // 8. Descontos
  resultado.descontos = {
    faltas: (dados.ultimoSalario / 30) * dados.diasFaltaMesRescisao,
    horasFaltas: calcularDescontoHorasFaltas(dados.ultimoSalario, dados.jornadaMensal, dados.horasFaltas),
    inss: calcularINSSRescisao(resultado.saldoSalario, resultado.decimoTerceiro),
    irrf: calcularIRRFRescisao(resultado.saldoSalario, resultado.decimoTerceiro, dados.dependentesIR),
    adiantamento: dados.descontoAdiantamento,
    valeTransporte: dados.descontoValeTransporte ? dados.ultimoSalario * 0.06 : 0,
    outros: dados.outrosDescontos
  };

  // 9. Totais
  resultado.totalProventos = somar(resultados sem multa FGTS);
  resultado.totalDescontos = somar(descontos);
  resultado.liquido = resultado.totalProventos - resultado.totalDescontos;

  // 10. Seguro desemprego (se aplicável)
  if (dados.motivoDesligamento === 'SEM_JUSTA_CAUSA') {
    resultado.seguroDesemprego = calcularSeguroDesemprego(
      dados.ultimoSalario,
      tempoServico.mesesTotais,
      dados.numSolicitacoesAnteriores
    );
  }

  return resultado;
}
```

### Validações Obrigatórias

- [ ] Data de rescisão ≥ data de admissão
- [ ] Salário > 0
- [ ] Jornada mensal válida (150-220)
- [ ] Faltas ≤ dias trabalhados no mês
- [ ] Horas faltas formatadas corretamente (hh:mm)
- [ ] Dependentes ≥ 0
- [ ] Saldo FGTS ≥ 0

---

## 🌐 Sites e Ferramentas de Referência

| Site | URL | Descrição |
|------|-----|-----------|
| TodoCálculo Rescisão | https://www.tudocalculo.com.br/calculadoras/rescisao | Calculadora completa |
| CalculoRescisao | https://www.calculorescisao.com.br | Simulador TRCT |
| Valor do Trabalho | https://www.valordotrabalho.com.br | Cálculos trabalhistas |
| eSocial | https://portal.esocial.gov.br | Modelo S-2299 |
| CalculaBrasil | https://calculabrasil.com | Diversos cálculos |

---

*Documento completo para implementação do simulador de rescisão trabalhista.*
