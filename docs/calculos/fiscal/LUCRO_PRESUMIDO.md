# 🧮 Lucro Presumido - Simulador Tributário 2026

**Última atualização:** 05 de abril de 2026  
**Versão:** 1.0  
**Status:** ✅ Documentado - Pronto para implementação

---

## 📋 Índice
1. [Visão Geral](#visão-geral)
2. [Base Legal Completa](#base-legal-completa)
3. [Quem Pode Optar](#quem-pode-optar)
4. [Impostos Envolvidos](#impostos-envolvidos)
5. [Tabelas 2026 Completas](#tabelas-2026-completas)
6. [Fórmulas de Cálculo](#fórmulas-de-cálculo)
7. [Exemplos Práticos](#exemplos-práticos)
8. [Mudanças 2026 (LC 224/2025)](#mudanças-2026-lc-2242025)
9. [Reforma Tributária - Transição](#reforma-tributária---transição)
10. [Sites e Ferramentas Oficiais](#sites-e-ferramentas-oficiais)
11. [Implementação no Sistema](#implementação-no-sistema)

---

## 📖 Visão Geral

### O que é Lucro Presumido?
Regime de tributação simplificado onde a base de cálculo do IRPJ e CSLL é **presumida** através de percentuais aplicados sobre a receita bruta, em vez de usar o lucro real (contábil).

### Características Principais
- **Apuração:** Trimestral (IRPJ/CSLL) + Mensal (PIS/COFINS/ISS/ICMS)
- **Limite anual:** R$ 5.000.000,00 (R$ 1.250.000/trimestre)
- **Obrigações acessórias:** ECF, EFD-Reinf, DCTF
- **Prazo pagamento:** Último dia útil do mês seguinte ao trimestre

---

## ⚖️ Base Legal Completa

### Leis Principais
| Norma | Data | Descrição |
|-------|------|-----------|
| **Lei 9.249/95** | 26/12/1995 | Institui o Lucro Presumido (art. 14-25) |
| **Lei 9.718/98** | 27/11/1998 | Altera legislação do IRPJ e da CSLL |
| **LC 224/2025** | 2025 | **NOVA** - Majoração 10% presunção, novas alíquotas CSLL |
| **IN RFB 2.306/2026** | 2026 | Regulamenta LC 224/2025 |
| **Dec. 3.000/99 (RIR)** | 1999 | Regulamento do IR (art. 515-533) |

### PIS/COFINS
| Norma | Descrição |
|-------|-----------|
| Lei 9.718/98 | Regime cumulativo (0,65% + 3%) |
| Lei 10.833/2003 | Alterações COFINS |
| Lei 10.637/2002 | Alterações PIS |

### ISS/ICMS
| Norma | Descrição |
|-------|-----------|
| LC 116/2003 | ISS - Lista de 42 serviços |
| LC 87/96 (Lei Kandir) | ICMS - Princípios gerais |
| Leis municipais | Alíquotas ISS por município |
| Leis estaduais | Alíquotas ICMS por estado |

### CSLL
| Norma | Descrição |
|-------|-----------|
| Lei 7.689/88 | Institui a CSLL |
| Lei 13.097/2015 | Alterações alíquotas |
| **LC 224/2025** | **NOVA** - Alíquotas majoradas a partir de abril/2026 |

---

## ✅ Quem Pode Optar

### Requisitos
1. Receita bruta anual ≤ R$ 5.000.000,00
2. Não enquadrado em atividades obrigadas ao Lucro Real
3. Regularidade fiscal

### Atividades OBRIGADAS ao Lucro Real (NÃO podem usar LP)
- Instituições financeiras
- Seguradoras
- Empresas de factoring
- Empresas com lucro no exterior
- Benefícios fiscais
- CSLL com alíquotas específicas (ex: 15%, 20%)
- Receitas decorrentes de negócio jurídico com simulação

---

## 💰 Impostos Envolvidos

### 1. IRPJ - Imposto de Renda Pessoa Jurídica

**Alíquota:** 15% sobre a base de cálculo  
**Adicional:** 10% sobre a parcela da base que exceder R$ 60.000/trimestre

**Base de Cálculo:** Receita Bruta × Percentual de Presunção

### 2. CSLL - Contribuição Social sobre o Lucro Líquido

**Alíquota:** 9% (regra geral)  
**Base de Cálculo:** Receita Bruta × Percentual de Presunção

### 3. PIS - Programa de Integração Social

**Alíquota:** 0,65% (regime cumulativo)  
**Base de Cálculo:** Receita Bruta total  
**Sem créditos**

### 4. COFINS - Contribuição para Financiamento da Seguridade Social

**Alíquota:** 3% (regime cumulativo)  
**Base de Cálculo:** Receita Bruta total  
**Sem créditos**

### 5. ISS - Imposto Sobre Serviços

**Alíquota:** 2% a 5% (varia por município)  
**Base de Cálculo:** Preço do serviço  
**Regulado por LC 116/2003**

### 6. ICMS - Imposto sobre Circulação de Mercadorias

**Alíquota:** 17% a 20% (varia por estado, padrão 18-20%)  
**Base de Cálculo:** Valor da operação  
**Regulado por LC 87/96**

---

## 📊 Tabelas 2026 Completas

### Percentuais de Presunção - IRPJ

| Atividade | Padrão | Com Majoração (×1,10) |
|-----------|--------|----------------------|
| Revenda de combustíveis | 1,6% | 1,76% |
| Comércio e indústria | 8,0% | 8,80% |
| Transporte (exceto carga) | 16,0% | 17,60% |
| **Serviços em geral** | **32,0%** | **35,20%** |
| Serviços hospitalares* | 8,0% | 8,80% |
| Locação de bens imóveis | 32,0% | 35,20% |
| Intermediação de negócios | 32,0% | 35,20% |
| Compra e venda de mercadorias | 8,0% | 8,80% |

*\* Serviços hospitalares: exige autorização ANVISA*

### Percentuais de Presunção - CSLL

| Atividade | Padrão | Com Majoração (×1,10) |
|-----------|--------|----------------------|
| Revenda de combustíveis | 12% | 13,2% |
| Comércio e indústria | 12% | 13,2% |
| Transporte (exceto carga) | 12% | 13,2% |
| **Serviços em geral** | **32%** | **35,2%** |
| Serviços hospitalares* | 12% | 13,2% |
| Instituições financeiras | 32% | 35,2% |

### Novas Alíquotas CSLL (LC 224/2025) - A partir de abril/2026

| Setor | Alíquota Atual | 04/2026-12/2027 | A partir de 2028 |
|-------|---------------|-----------------|------------------|
| Geral | 9% | 9% | 9% |
| **Instituições financeiras** | **15%** | **12%** | **15%** |
| **Seguradoras** | **15%** | **12%** | **15%** |
| Planos saúde | 15% | 12% | 15% |

**Nota:** Para Lucro Presumido padrão, a CSLL permanece em **9%**. O aumento afeta apenas setores específicos.

---

## 🧮 Fórmulas de Cálculo

### Passo 1: Segregação da Base de Cálculo

O sistema deve calcular a base em dois níveis:

```
Base Nível 1 = min(Receita Trimestral, R$ 1.250.000) × % Presunção Padrão
Base Nível 2 = max(0, Receita Trimestral - R$ 1.250.000) × (% Presunção × 1,10)
Base Total = Base Nível 1 + Base Nível 2
```

### Passo 2: Cálculo do IRPJ

```
IRPJ Base = IRPJ Base Nível 1 + IRPJ Base Nível 2
IRPJ Nível 1 = Base Nível 1 × 15%
IRPJ Nível 2 = Base Nível 2 × 15%

Adicional IRPJ:
  Se Base Total > R$ 60.000:
    Adicional = (Base Total - R$ 60.000) × 10%
  Senão:
    Adicional = 0

Total IRPJ = IRPJ Base + Adicional
```

### Passo 3: Cálculo da CSLL

```
CSLL Base = Mesma lógica do IRPJ (Nível 1 + Nível 2)
Total CSLL = CSLL Base × 9%
```

**Nota Q1 2026:** No 1º trimestre de 2026, a majoração de 10% aplica-se APENAS ao IRPJ. A CSLL continua com percentuais originais até abril/2026.

### Passo 4: Cálculo do PIS

```
PIS = Receita Bruta Total × 0,65%
```

### Passo 5: Cálculo da COFINS

```
COFINS = Receita Bruta Total × 3%
```

### Passo 6: Cálculo do ISS (serviços)

```
ISS = Receita de Serviços × Alíquota ISS Municipal (2-5%)
```

### Passo 7: Cálculo do ICMS (comércio)

```
ICMS = Valor da Operação × Alíquota ICMS Estadual (17-20%)
```

### Passo 8: Total da Carga Tributária

```
Total Impostos = IRPJ + CSLL + PIS + COFINS + ISS + ICMS
Carga Efetiva = (Total Impostos / Receita Bruta) × 100
```

---

## 📝 Exemplos Práticos

### Exemplo 1: Empresa de Serviços - Receita R$ 500.000/trimestre

**Dados:**
- Atividade: Serviços de contabilidade
- Receita trimestral: R$ 500.000,00
- Percentual IRPJ: 32%
- Percentual CSLL: 32%
- ISS municipal: 5%

**Cálculo:**

```
1. Base IRPJ/CSLL:
   Receita (R$ 500.000) < Limite (R$ 1.250.000) → Nível 1 apenas
   Base = R$ 500.000 × 32% = R$ 160.000

2. IRPJ:
   IRPJ = R$ 160.000 × 15% = R$ 24.000
   Adicional = (R$ 160.000 - R$ 60.000) × 10% = R$ 10.000
   Total IRPJ = R$ 24.000 + R$ 10.000 = R$ 34.000

3. CSLL:
   CSLL = R$ 160.000 × 9% = R$ 14.400

4. PIS:
   PIS = R$ 500.000 × 0,65% = R$ 3.250

5. COFINS:
   COFINS = R$ 500.000 × 3% = R$ 15.000

6. ISS:
   ISS = R$ 500.000 × 5% = R$ 25.000

7. Total:
   Total Impostos = R$ 34.000 + R$ 14.400 + R$ 3.250 + R$ 15.000 + R$ 25.000
   Total = R$ 91.650

8. Carga Efetiva:
   Carga = (R$ 91.650 / R$ 500.000) × 100 = 18,33%
```

### Exemplo 2: Comércio - Receita R$ 2.000.000/trimestre (com majoração)

**Dados:**
- Atividade: Comércio de produtos
- Receita trimestral: R$ 2.000.000,00
- Percentual IRPJ: 8%
- Percentual CSLL: 12%
- ICMS: 18%

**Cálculo:**

```
1. Base IRPJ/CSLL com majoração:
   Nível 1 = min(R$ 2.000.000, R$ 1.250.000) × 8% = R$ 1.250.000 × 8% = R$ 100.000
   Nível 2 = max(0, R$ 2.000.000 - R$ 1.250.000) × (8% × 1,10)
           = R$ 750.000 × 8,8% = R$ 66.000
   Base Total = R$ 100.000 + R$ 66.000 = R$ 166.000

2. IRPJ:
   IRPJ = R$ 166.000 × 15% = R$ 24.900
   Adicional = (R$ 166.000 - R$ 60.000) × 10% = R$ 10.600
   Total IRPJ = R$ 24.900 + R$ 10.600 = R$ 35.500

3. CSLL:
   Nível 1 = R$ 1.250.000 × 12% = R$ 150.000
   Nível 2 = R$ 750.000 × (12% × 1,10) = R$ 750.000 × 13,2% = R$ 99.000
   Base CSLL = R$ 150.000 + R$ 99.000 = R$ 249.000
   CSLL = R$ 249.000 × 9% = R$ 22.410

4. PIS:
   PIS = R$ 2.000.000 × 0,65% = R$ 13.000

5. COFINS:
   COFINS = R$ 2.000.000 × 3% = R$ 60.000

6. ICMS:
   ICMS = R$ 2.000.000 × 18% = R$ 360.000

7. Total:
   Total = R$ 35.500 + R$ 22.410 + R$ 13.000 + R$ 60.000 + R$ 360.000
   Total = R$ 490.910

8. Carga Efetiva:
   Carga = (R$ 490.910 / R$ 2.000.000) × 100 = 24,55%
```

### Exemplo 3: Ajuste Anual (True-Up)

**Situação:** Empresa que ultrapassou R$ 1.250.000 em um trimestre, mas receita anual ficou abaixo de R$ 5M.

```
Receita Q1: R$ 1.500.000 → majoração aplicada
Receita Q2: R$ 1.000.000
Receita Q3: R$ 800.000
Receita Q4: R$ 700.000
Receita Anual: R$ 4.000.000 (< R$ 5.000.000)

→ Majoração aplicada nos trimestres foi INDEVIDA
→ Opções de recuperação:
  1. Deduzir no cálculo do Q4
  2. Compensação via PER/DCOMP (com SELIC)
  3. Pedido de restituição à RFB
```

---

## 🔄 Mudanças 2026 (LC 224/2025)

### Resumo das Alterações

| Alteração | Antes | Depois (2026) |
|-----------|-------|---------------|
| **Percentuais presunção** | Fixos | +10% para receita > R$ 5M/ano |
| **Limite trimestral** | Não existia | R$ 1.250.000 |
| **CSLL financeiro** | 15% | 12% (2026-2027) → 15% (2028+) |
| **CSLL seguradoras** | 15% | 12% (2026-2027) → 15% (2028+) |

### Regra de Transição Q1 2026

```
1º Trimestre 2026 (janeiro-março):
  - IRPJ: aplica majoração de 10% nos percentuais de presunção
  - CSLL: usa percentuais ORIGINAIS (sem majoração)

A partir de abril/2026:
  - IRPJ e CSLL: ambos com majoração de 10%
```

### Ajuste Anual (True-Up)

Se a receita anual for inferior a R$ 5.000.000:
- A majoração de 10% aplicada trimestralmente é considerada **indevida**
- Empresa pode recuperar via:
  1. Dedução no 4º trimestre
  2. PER/DCOMP com correção SELIC
  3. Pedido formal de restituição à RFB

---

## 🏗️ Reforma Tributária - Transição

### Cronograma

| Ano | Evento |
|-----|--------|
| **2026** | Fase de teste: CBS 0,9% + IBS 0,1% (alíquotas reduzidas) |
| **2027** | CBS substitui integralmente PIS + COFINS |
| **2029-2032** | Transição gradual IBS/ISS e IBS/ICMS |
| **2033** | Sistema pleno: CBS + IBS + IS (Imposto Seletivo) |

### Impacto no Lucro Presumido (2026)

```
Atual (2025):
  PIS: 0,65%
  COFINS: 3%

Transição (2026):
  PIS: 0,65% (mantém)
  COFINS: 3% (mantém)
  CBS: 0,9% (teste - parcial)
  IBS: 0,1% (teste - parcial)

2027:
  CBS: substitui PIS + COFINS
  IBS: começa a substituir ISS/ICMS
```

---

## 🌐 Sites e Ferramentas Oficiais

| Recurso | URL | Descrição |
|---------|-----|-----------|
| **Receita Federal** | https://www.gov.br/receitafederal | Portal principal |
| **e-CAC** | https://cav.receita.fazenda.gov.br | Consulta fiscal |
| **Legislação** | https://www.planalto.gov.br | Leis e decretos |
| **IN RFB 2.306/2026** | Buscar no site da RFB | Regulamento LC 224 |
| **Simples Nacional** | https://www8.receita.fazenda.gov.br/SimplesNacional | Simulador |
| **Calculadora BCB** | https://www3.bcb.gov.br/CALCIDADAO | Correção monetária |
| **Tabelas IRPF** | https://www.gov.br/receitafederal/irpf | Tabelas atualizadas |

---

## 💻 Implementação no Sistema

### Estrutura de Dados Necessária

```typescript
interface Empresa {
  cnpj: string;
  atividade: 'comercio' | 'industria' | 'servicos' | 'combustivel' | 'transporte' | 'hospitalar';
  regimeTributario: 'lucro_presumido' | 'lucro_real' | 'simples_nacional';
  municipio: string;
  estado: string;
  aliquotaISS: number; // 2-5%
  aliquotaICMS: number; // 17-20%
}

interface CalculoLP {
  receitaTrimestral: number;
  periodo: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  ano: number;

  // Resultados
  baseIRPJ: number;
  baseCSLL: number;
  irpj: number;
  irpjAdicional: number;
  csll: number;
  pis: number;
  cofins: number;
  iss: number;
  icms: number;
  totalImpostos: number;
  cargaEfetiva: number;
}
```

### Algoritmo de Cálculo

```javascript
function calcularLucroPresumido(empresa, receitaTrimestral, periodo, ano) {
  const LIMITE_TRIMESTRAL = 1_250_000;
  const LIMITE_ANUAL = 5_000_000;
  const ISENCAO_ADICIONAL = 60_000;

  // 1. Obter percentuais de presunção
  const percentuais = getPercentuaisPresuncao(empresa.atividade);

  // 2. Calcular bases com/sem majoração
  const receitaNivel1 = Math.min(receitaTrimestral, LIMITE_TRIMESTRAL);
  const receitaNivel2 = Math.max(0, receitaTrimestral - LIMITE_TRIMESTRAL);

  // Majoração aplica-se apenas se receita anual > 5M
  const fatorMajoracao = (receitaTrimestral * 4 > LIMITE_ANUAL) ? 1.10 : 1.0;

  // 3. Transição Q1 2026 para CSLL
  const csllComMajoracao = !(ano === 2026 && periodo === 'Q1');

  // 4. Calcular bases
  const baseIRPJ = (receitaNivel1 * percentuais.irpj) +
                   (receitaNivel2 * percentuais.irpj * fatorMajoracao);

  const baseCSLL = (receitaNivel1 * percentuais.csll) +
                   (receitaNivel2 * percentuais.csll * (csllComMajoracao ? fatorMajoracao : 1));

  // 5. Calcular IRPJ
  const irpj = baseIRPJ * 0.15;
  const irpjAdicional = Math.max(0, baseIRPJ - ISENCAO_ADICIONAL) * 0.10;

  // 6. Calcular CSLL
  const csll = baseCSLL * 0.09;

  // 7. Calcular PIS/COFINS
  const pis = receitaTrimestral * 0.0065;
  const cofins = receitaTrimestral * 0.03;

  // 8. Calcular ISS/ICMS
  const iss = empresa.atividade === 'servicos' ? receitaTrimestral * (empresa.aliquotaISS / 100) : 0;
  const icms = empresa.atividade === 'comercio' ? receitaTrimestral * (empresa.aliquotaICMS / 100) : 0;

  // 9. Total
  const totalImpostos = irpj + irpjAdicional + csll + pis + cofins + iss + icms;
  const cargaEfetiva = (totalImpostos / receitaTrimestral) * 100;

  return {
    baseIRPJ, baseCSLL,
    irpj, irpjAdicional, csll,
    pis, cofins, iss, icms,
    totalImpostos, cargaEfetiva
  };
}

function getPercentuaisPresuncao(atividade) {
  const tabela = {
    combustivel: { irpj: 0.016, csll: 0.12 },
    comercio:    { irpj: 0.08,  csll: 0.12 },
    industria:   { irpj: 0.08,  csll: 0.12 },
    transporte:  { irpj: 0.16,  csll: 0.12 },
    servicos:    { irpj: 0.32,  csll: 0.32 },
    hospitalar:  { irpj: 0.08,  csll: 0.12 }
  };
  return tabela[atividade] || tabela.servicos;
}
```

### Validações Obrigatórias

- [ ] Verificar se empresa pode optar por LP (não financeira, seguradora, etc.)
- [ ] Validar receita anual ≤ R$ 5M
- [ ] Aplicar majoração apenas quando aplicável
- [ ] Tratar Q1 2026 separadamente (CSLL sem majoração)
- [ ] Calcular true-up anual se receita < R$ 5M
- [ ] Usar alíquotas corretas de ISS (município) e ICMS (estado)

---

*Documento base para implementação do simulador tributário.*
