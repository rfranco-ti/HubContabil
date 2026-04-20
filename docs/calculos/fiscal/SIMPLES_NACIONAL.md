# 🏢 Simples Nacional - Simulador Tributário Completo 2026

**Última atualização:** 05 de abril de 2026  
**Versão:** 1.0  
**Status:** ✅ Documentado - Pronto para implementação

---

## 📋 Índice
1. [Visão Geral](#visão-geral)
2. [Base Legal Completa](#base-legal-completa)
3. [Quem Pode Optar](#quem-pode-optar)
4. [Anexos e Atividades](#anexos-e-atividades)
5. [Tabelas Completas 2026](#tabelas-completas-2026)
6. [Fórmulas de Cálculo](#fórmulas-de-cálculo)
7. [Exemplos Práticos](#exemplos-práticos)
8. [Reforma Tributária Impactos](#reforma-tributária-impactos)
9. [Implementação no Sistema](#implementação-no-sistema)

---

## 📖 Visão Geral

### O que é Simples Nacional?
Regime tributário simplificado que unifica **8 tributos** em uma única guia (DAS - Documento de Arrecadação do Simples Nacional). Criado pela LC 123/2006.

### Tributos Unificados
| Sigla | Nome | Esfera |
|-------|------|--------|
| **IRPJ** | Imposto de Renda Pessoa Jurídica | Federal |
| **CSLL** | Contribuição Social sobre Lucro Líquido | Federal |
| **PIS** | Programa de Integração Social | Federal |
| **COFINS** | Contribuição para Financiamento da Seguridade Social | Federal |
| **IPI** | Imposto sobre Produtos Industrializados | Federal |
| **ICMS** | Imposto sobre Circulação de Mercadorias e Serviços | Estadual |
| **ISS** | Imposto Sobre Serviços | Municipal |
| **CPP** | Contribuição Patronal Previdenciária | Federal |

### Características Principais
- **Limite receita bruta:** R$ 4.800.000,00/ano
- **Apuração:** Mensal
- **Pagamento:** Até dia 20 do mês seguinte (DAS)
- **Obrigações:** PGDAS-D, DEFIS anual
- **5 Anexos** com alíquotas progressivas

---

## ⚖️ Base Legal Completa

| Norma | Data | Descrição |
|-------|------|-----------|
| **LC 123/2006** | 14/12/2006 | Institui Simples Nacional (art. 1-66) |
| **LC 155/2016** | 27/10/2016 | Altera limites e regras do Simples |
| **Resolução CGSN 140/2018** | 2018 | Aprova tabelas dos anexos I-V |
| **Lei 14.789/2023** | 2023 | Altera alíquotas e faixas |
| **IN RFB 2.110/2022** | 2022 | Normas de fiscalização |
| **CF/88, Art. 146** | 1988 | Base constitucional |
| **Dec. 6.175/2007** | 2007 | Regulamento do Simples Nacional |

### Tributos por Base Constitucional
- IRPJ: CF/88 Art. 153, III
- CSLL: CF/88 Art. 195, I, "a"
- PIS: CF/88 Art. 239
- COFINS: CF/88 Art. 195, I
- IPI: CF/88 Art. 153, IV
- ICMS: CF/88 Art. 155, II
- ISS: CF/88 Art. 156, III
- CPP: CF/88 Art. 195, I, "a"

---

## ✅ Quem Pode Optar

### Requisitos
1. Receita bruta anual ≤ R$ 4.800.000,00
2. ME (Microempresa) ou EPP (Empresa de Pequeno Porte)
3. Não enquadrada em atividades vedadas

### Vedações (NÃO podem optar)
- Financeiras, cooperativas de crédito
- Seguradoras, corretoras
- Fomento mercantil (factoring)
- Produção/venda de veículos
- Fornecimento de mão de obra temporária
- Produção/venda de bebidas alcoólicas
- Atividade rural (pessoa física)
- Dívidas com Fazenda Nacional/Estadual/Municipal
- Sócios com débitos CPF
- Mais de 3 estabelecimentos em outro estado
- Sócio-administrador com débito previdenciário
- Sociedade por ações (S/A)
- Empresa resultante de desmembramento

---

## 📊 Anexos e Atividades

### Anexo I - Comércio
Atividades: Comércio de mercadorias, varejo, atacadista
- Alíquotas: 4% a 19%
- Tributos: IRPJ, CSLL, PIS, COFINS, ICMS, CPP

### Anexo II - Indústria
Atividades: Fabricação, industrialização, produção
- Alíquotas: 4,5% a 30%
- Tributos: IRPJ, CSLL, PIS, COFINS, IPI, ICMS, CPP

### Anexo III - Serviços
Atividades: Instalação, manutenção, contabilidade, medicina, odontologia, academias, laboratórios
- Alíquotas: 6% a 33%
- **Fator R**: Se folha ≤ 28% da receita → Anexo III; se > 28% → Anexo V
- Tributos: IRPJ, CSLL, PIS, COFINS, ISS, CPP

### Anexo IV - Serviços
Atividades: Limpeza, conservação, vigilância, obras, advocacia
- Alíquotas: 4,5% a 33%
- Tributos: IRPJ, CSLL, PIS, COFINS, ISS, CPP

### Anexo V - Serviços
Atividades: Auditoria, jornalismo, TI, publicidade, engenharia, consultoria, aulas particulares
- Alíquotas: 15,5% a 30,5%
- **Fator R**: Aplica-se mesma regra do Anexo III
- Tributos: IRPJ, CSLL, PIS, COFINS, ISS, CPP

---

## 📈 Tabelas Completas 2026

### Anexo I - Comércio

| Faixa | Receita Bruta 12 Meses | Alíquota Nominal | Valor a Deduzir |
|-------|----------------------|-----------------|-----------------|
| 1ª | Até R$ 180.000,00 | 4,00% | R$ 0,00 |
| 2ª | R$ 180.000,01 – R$ 360.000,00 | 7,30% | R$ 5.940,00 |
| 3ª | R$ 360.000,01 – R$ 720.000,00 | 9,50% | R$ 13.860,00 |
| 4ª | R$ 720.000,01 – R$ 1.800.000,00 | 10,70% | R$ 22.500,00 |
| 5ª | R$ 1.800.000,01 – R$ 3.600.000,00 | 14,30% | R$ 87.300,00 |
| 6ª | R$ 3.600.000,01 – R$ 4.800.000,00 | 19,00% | R$ 378.000,00 |

### Anexo II - Indústria

| Faixa | Receita Bruta 12 Meses | Alíquota Nominal | Valor a Deduzir |
|-------|----------------------|-----------------|-----------------|
| 1ª | Até R$ 180.000,00 | 4,50% | R$ 0,00 |
| 2ª | R$ 180.000,01 – R$ 360.000,00 | 7,80% | R$ 5.940,00 |
| 3ª | R$ 360.000,01 – R$ 720.000,00 | 10,00% | R$ 13.860,00 |
| 4ª | R$ 720.000,01 – R$ 1.800.000,00 | 11,20% | R$ 22.500,00 |
| 5ª | R$ 1.800.000,01 – R$ 3.600.000,00 | 14,70% | R$ 85.500,00 |
| 6ª | R$ 3.600.000,01 – R$ 4.800.000,00 | 30,00% | R$ 720.000,00 |

### Anexo III - Serviços

| Faixa | Receita Bruta 12 Meses | Alíquota Nominal | Valor a Deduzir |
|-------|----------------------|-----------------|-----------------|
| 1ª | Até R$ 180.000,00 | 6,00% | R$ 0,00 |
| 2ª | R$ 180.000,01 – R$ 360.000,00 | 11,20% | R$ 9.360,00 |
| 3ª | R$ 360.000,01 – R$ 720.000,00 | 13,50% | R$ 17.640,00 |
| 4ª | R$ 720.000,01 – R$ 1.800.000,00 | 16,00% | R$ 35.640,00 |
| 5ª | R$ 1.800.000,01 – R$ 3.600.000,00 | 21,00% | R$ 125.640,00 |
| 6ª | R$ 3.600.000,01 – R$ 4.800.000,00 | 33,00% | R$ 648.000,00 |

### Anexo IV - Serviços

| Faixa | Receita Bruta 12 Meses | Alíquota Nominal | Valor a Deduzir |
|-------|----------------------|-----------------|-----------------|
| 1ª | Até R$ 180.000,00 | 4,50% | R$ 0,00 |
| 2ª | R$ 180.000,01 – R$ 360.000,00 | 9,00% | R$ 8.100,00 |
| 3ª | R$ 360.000,01 – R$ 720.000,00 | 10,20% | R$ 12.420,00 |
| 4ª | R$ 720.000,01 – R$ 1.800.000,00 | 14,00% | R$ 39.780,00 |
| 5ª | R$ 1.800.000,01 – R$ 3.600.000,00 | 22,00% | R$ 183.780,00 |
| 6ª | R$ 3.600.000,01 – R$ 4.800.000,00 | 33,00% | R$ 828.000,00 |

### Anexo V - Serviços

| Faixa | Receita Bruta 12 Meses | Alíquota Nominal | Valor a Deduzir |
|-------|----------------------|-----------------|-----------------|
| 1ª | Até R$ 180.000,00 | 15,50% | R$ 0,00 |
| 2ª | R$ 180.000,01 – R$ 360.000,00 | 18,00% | R$ 4.500,00 |
| 3ª | R$ 360.000,01 – R$ 720.000,00 | 19,50% | R$ 9.900,00 |
| 4ª | R$ 720.000,01 – R$ 1.800.000,00 | 20,50% | R$ 17.100,00 |
| 5ª | R$ 1.800.000,01 – R$ 3.600.000,00 | 23,00% | R$ 62.100,00 |
| 6ª | R$ 3.600.000,01 – R$ 4.800.000,00 | 30,50% | R$ 540.000,00 |

---

## 🧮 Fórmulas de Cálculo

### Passo 1: Determinar o Anexo
```
Se CNAE principal → comércio/varejo → Anexo I
Se CNAE principal → indústria/fabricação → Anexo II
Se CNAE principal → serviços (lista LC 116) → verificar Anexo III, IV ou V
```

### Passo 2: Aplicar Fator R (Anexos III e V)
```
Fator R = (Folha de Pagamento 12 meses) / (Receita Bruta 12 meses)

Se Fator R ≤ 28% → Anexo III
Se Fator R > 28% → Anexo V
```

### Passo 3: Encontrar a Faixa
```
Faixa = verificar em qual faixa de receita bruta dos últimos 12 meses (RBT12) a empresa se enquadra
```

### Passo 4: Calcular Alíquota Efetiva
```
Alíquota Efetiva = ((RBT12 × Alíquota Nominal) - Valor a Deduzir) / RBT12
```

### Passo 5: Calcular Imposto Devido
```
Imposto Devido = Receita Bruta do Mês × Alíquota Efetiva
```

### Passo 6: Rateio entre Tributos (se necessário)
```
Cada anexo tem percentuais de rateio definidos em resolução CGSN
IRPJ% + CSLL% + PIS% + COFINS% + ICMS/ISS% + CPP% = 100%
```

---

## 📝 Exemplos Práticos

### Exemplo 1: Comércio - 1ª Faixa

**Dados:**
- Atividade: Loja de roupas (Anexo I)
- Receita últimos 12 meses: R$ 150.000,00
- Receita do mês: R$ 15.000,00

**Cálculo:**
```
1. Faixa: 1ª (RBT12 ≤ R$ 180.000)
2. Alíquota Nominal: 4%
3. Valor a Deduzir: R$ 0

4. Alíquota Efetiva = (150.000 × 4% - 0) / 150.000 = 4%

5. Imposto Devido = 15.000 × 4% = R$ 600,00

6. Rateio (exemplo Anexo I):
   IRPJ: ~15% do total = R$ 90,00
   CSLL: ~10% do total = R$ 60,00
   PIS: ~5% do total = R$ 30,00
   COFINS: ~15% do total = R$ 90,00
   ICMS: ~20% do total = R$ 120,00
   CPP: ~35% do total = R$ 210,00
```

### Exemplo 2: Serviços - Fator R

**Dados:**
- Atividade: Consultoria em TI (Anexo V, pode cair em III)
- Receita últimos 12 meses: R$ 500.000,00
- Folha de pagamento 12 meses: R$ 180.000,00
- Receita do mês: R$ 50.000,00

**Cálculo:**
```
1. Fator R = 180.000 / 500.000 = 36% (> 28% → Anexo V)

2. Faixa: 3ª (R$ 360.000,01 – R$ 720.000,00)
3. Alíquota Nominal: 19,50%
4. Valor a Deduzir: R$ 9.900

5. Alíquota Efetiva = (500.000 × 19,50% - 9.900) / 500.000
                     = (97.500 - 9.900) / 500.000
                     = 87.600 / 500.000
                     = 17,52%

6. Imposto Devido = 50.000 × 17,52% = R$ 8.760,00
```

### Exemplo 3: Indústria - Faixa Alta

**Dados:**
- Atividade: Fabricação de móveis (Anexo II)
- Receita últimos 12 meses: R$ 4.000.000,00
- Receita do mês: R$ 350.000,00

**Cálculo:**
```
1. Faixa: 5ª (R$ 1.800.000,01 – R$ 3.600.000,00)
   NOTA: RBT12 é R$ 4M, mas faixa considera último 12 meses
   Verificação: R$ 4M está na 6ª faixa

2. Faixa: 6ª (R$ 3.600.000,01 – R$ 4.800.000,00)
3. Alíquota Nominal: 30%
4. Valor a Deduzir: R$ 720.000

5. Alíquota Efetiva = (4.000.000 × 30% - 720.000) / 4.000.000
                     = (1.200.000 - 720.000) / 4.000.000
                     = 480.000 / 4.000.000
                     = 12%

6. Imposto Devido = 350.000 × 12% = R$ 42.000,00
```

---

## 🏗️ Reforma Tributária - Impactos

### Cronograma
| Ano | Evento |
|-----|--------|
| **2026** | CBS 0,9% + IBS 0,1% (teste) sobre operações B2B |
| **2027** | CBS substitui PIS/COFINS integralmente |
| **2029-2032** | Transição gradual ICMS → IBS, ISS → IBS |
| **2033** | Sistema pleno: CBS + IBS + Imposto Seletivo |

### Impacto no Simples Nacional
```
Atual (2025):
  DAS unifica 8 tributos

2026-2027:
  DAS mantém PIS/COFINS internos
  CBS (0,9%) cobrada separadamente em B2B
  IBS (0,1%) cobrado separadamente

2029+:
  CBS substitui PIS/COFINS no DAS
  IBS começa a substituir ICMS/ISS
  Possível manutenção do DAS simplificado
```

---

## 💻 Implementação no Sistema

### Estrutura de Dados

```typescript
interface EmpresaSimples {
  cnpj: string;
  cnaePrincipal: string;
  anexo: I | II | III | IV | V;
  receitaBruta12Meses: number;
  folhaPagamento12Meses: number;
  faturamentoMensal: number;
}

interface FaixaSimples {
  faixa: number;
  receitaMin: number;
  receitaMax: number;
  aliquotaNominal: number;
  valorDeduzir: number;
}

interface CalculoSimples {
  anexo: string;
  faixa: number;
  aliquotaNominal: number;
  valorDeduzir: number;
  aliquotaEfetiva: number;
  impostoDevido: number;
  fatorR?: number;
}
```

### Algoritmo

```javascript
const TABELAS = {
  I: [
    { min: 0, max: 180000, aliquota: 0.04, deducao: 0 },
    { min: 180000.01, max: 360000, aliquota: 0.073, deducao: 5940 },
    { min: 360000.01, max: 720000, aliquota: 0.095, deducao: 13860 },
    { min: 720000.01, max: 1800000, aliquota: 0.107, deducao: 22500 },
    { min: 1800000.01, max: 3600000, aliquota: 0.143, deducao: 87300 },
    { min: 3600000.01, max: 4800000, aliquota: 0.19, deducao: 378000 }
  ],
  II: [/* ... */],
  III: [/* ... */],
  IV: [/* ... */],
  V: [/* ... */]
};

function calcularSimplesNacional(empresa) {
  const { anexo, receitaBruta12Meses, faturamentoMensal } = empresa;

  // 1. Determinar anexo (com Fator R para III/V)
  let anetoFinal = anexo;
  if (aneto === 'III' || aneto === 'V') {
    const fatorR = empresa.folhaPagamento12Meses / empresa.receitaBruta12Meses;
    anetoFinal = fatorR <= 0.28 ? 'III' : 'V';
  }

  // 2. Encontrar faixa
  const faixa = TABELAS[anetoFinal].find(f =>
    receitaBruta12Meses >= f.min && receitaBruta12Meses <= f.max
  );

  if (!faixa) throw new Error('Receita fora das faixas do Simples Nacional');

  // 3. Calcular alíquota efetiva
  const aliquotaEfetiva = (
    (receitaBruta12Meses * faixa.aliquota - faixa.deducao) /
    receitaBruta12Meses
  );

  // 4. Calcular imposto
  const impostoDevido = faturamentoMensal * aliquotaEfetiva;

  return {
    aneto: anetoFinal,
    faixa: faixa.faixa,
    aliquotaNominal: faixa.aliquota,
    valorDeduzir: faixa.deducao,
    aliquotaEfetiva,
    impostoDevido
  };
}
```

### Validações Obrigatórias

- [ ] Verificar CNAE e determinar anexo correto
- [ ] Calcular Fator R para Anexos III e V
- [ ] Validar receita bruta ≤ R$ 4.800.000
- [ ] Usar receita dos últimos 12 meses (RBT12)
- [ ] Aplicar alíquota efetiva (não nominal)
- [ ] Ratear tributos conforme resolução CGSN

---

## 🌐 Sites e Ferramentas Oficiais

| Recurso | URL |
|---------|-----|
| Simples Nacional | https://www8.receita.fazenda.gov.br/SimplesNacional |
| PGDAS-D | https://www8.receita.fazenda.gov.br/SimplesNacional |
| DEFIS | https://www8.receita.fazenda.gov.br/SimplesNacional |
| Consulta CNAE | https://cnae.ibge.gov.br |
| Tabela IBPT | https://ibpt.org.br |

---

*Documento base para implementação do simulador Simples Nacional.*
