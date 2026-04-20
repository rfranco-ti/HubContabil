# 📐 Cálculos do Sistema Hub Contábil - Documento Mestre

**Última atualização:** 05 de abril de 2026  
**Versão:** 1.0  
**Status:** 📝 Em construção

---

## 📁 Estrutura de Documentação

```
docs/calculos/
├── README.md                          ← Este arquivo
├── REFERENCIAS_GERAIS.md              ← Fontes, sites gov, legislação
├── fiscal/
│   ├── LUCRO_PRESUMIDO.md             ← Simulador tributário completo
│   ├── LUCRO_REAL.md                  ← (futuro)
│   └── SIMPLES_NACIONAL.md            ← (futuro)
├── trabalhista/
│   ├── RESCISAO_TRABALHISTA.md        ← (futuro)
│   ├── FERIAS_13_SALARIO.md           ← (futuro)
│   └── ENCARGOS_SOCIAIS.md            ← (futuro)
├── previdenciario/
│   ├── APOSENTADORIA_INSS.md          ← (futuro)
│   ├── FATOR_PREVIDENCIARIO.md        ← (futuro)
│   └── RMI_CALCULO.md                 ← (futuro)
└── contabil/
    ├── DEPRECIACAO.md                 ← (futuro)
    ├── AMORTIZACAO.md                 ← (futuro)
    └── PROVISÕES.md                   ← (futuro)
```

---

## 🎯 Objetivo

Centralizar toda documentação de cálculos contábeis, fiscais, trabalhistas e previdenciários com:
- ✅ Base legal completa (leis, decretos, INs, portarias)
- ✅ Fórmulas detalhadas passo a passo
- ✅ Tabelas atualizadas (2026)
- ✅ Exemplos práticos de cálculo
- ✅ Referências a sites governamentais oficiais
- ✅ Links para ferramentas e calculadoras

---

## 📊 Cálculos Prioritários (Fase 1)

### 1. Lucro Presumido (Simulador Tributário)
**Status:** ✅ Documentando  
**Arquivo:** `fiscal/LUCRO_PRESUMIDO.md`

**Impostos Envolvidos:**
| Imposto | Alíquota | Base | Periodicidade |
|---------|----------|------|---------------|
| IRPJ | 15% + 10% adicional | Receita × % presunção | Trimestral |
| CSLL | 9% | Receita × % presunção | Trimestral |
| PIS | 0,65% | Receita bruta | Mensal |
| COFINS | 3% | Receita bruta | Mensal |
| ISS | 2-5% | Receita bruta | Mensal |
| ICMS | 17-20% | Receita bruta | Mensal |

**Mudanças 2026 (LC 224/2025):**
- Majoração de 10% nos percentuais de presunção para receita > R$ 5M/ano
- Limite trimestral: R$ 1.250.000
- CSLL com novas alíquotas a partir de abril/2026

---

### 2. Cálculos Trabalhistas
**Status:** 📝 Futuro

**Cálculos Incluídos:**
- FGTS (8%)
- INSS patronal e empregado (tabela progressiva 2026)
- IRRF na fonte (tabela progressiva 2026)
- Férias + 1/3 constitucional
- 13º salário proporcional
- Rescisão trabalhista completa
- Aviso prévio
- Multa 40% FGTS
- Multa art. 477 CLT

---

### 3. Cálculos Previdenciários
**Status:** 📝 Futuro

**Cálculos Incluídos:**
- RMI (Renda Mensal Inicial)
- Fator previdenciário
- Aposentadoria por tempo de contribuição
- Aposentadoria por idade
- Aposentadoria por pontos (regra 2026: 105 pontos H / 95 pontos M)
- Salário benefício
- Pensão por morte

---

### 4. Cálculos Contábeis
**Status:** 📝 Futuro

**Cálculos Incluídos:**
- Depreciação linear (tabela Receita Federal)
- Amortização
- Exaustão
- Provisões trabalhistas
- Provisões fiscais
- Juros sobre capital próprio (JCP)

---

## 🏛️ Sites Governamentais Oficiais

| Órgão | URL | Finalidade |
|-------|-----|------------|
| **Receita Federal** | https://www.gov.br/receitafederal | Legislação, consultas |
| **e-CAC** | https://cav.receita.fazenda.gov.br | Consulta situação fiscal |
| **INSS** | https://www.gov.br/inss | Simulador, legislação previdenciária |
| **Meu INSS** | https://meu.inss.gov.br | Simular aposentadoria |
| **PGFN** | https://www.gov.br/pgfn | Dívida ativa, transações |
| **FGTS** | https://www.caixa.gov.br | Consulta saldo FGTS |
| **Planalto (Legislação)** | https://www.planalto.gov.br | Leis, decretos, MPs |
| **Tabelas INSS** | Portaria Interministerial MPS/MF nº 13/2026 | |

---

## 📚 Legislação Principal

### Tributária
| Norma | Descrição |
|-------|-----------|
| LC 224/2025 | Altera percentuais presunção LP, alíquotas CSLL |
| IN RFB 2.306/2026 | Regulamenta LC 224/2025 |
| Lei 9.249/95 | Lucro Presumido - base legal |
| Lei 9.718/98 | PIS/COFINS cumulativo |
| LC 116/2003 | ISS - lista de serviços |
| LC 87/96 | ICMS - Lei Kandir |

### Trabalhista
| Norma | Descrição |
|-------|-----------|
| CLT (Dec-Lei 5.452/43) | Consolidação das leis do trabalho |
| Lei 8.036/90 | FGTS |
| Lei 8.212/91 | Custeio da Seguridade Social |

### Previdenciária
| Norma | Descrição |
|-------|-----------|
| Lei 8.213/91 | Planos de benefícios da previdência |
| EC 103/2019 | Reforma da previdência |
| Portaria MPS/MF nº 13/2026 | Tabela INSS 2026 |

---

## 🔗 Ferramentas e Calculadoras de Referência

| Ferramenta | URL | Tipo |
|------------|-----|------|
| Calculadora do Cidadão (BCB) | https://www3.bcb.gov.br/CALCIDADAO | Correção monetária, juros |
| Simulador INSS | https://meu.inss.gov.br | Aposentadoria |
| Calculadora IRPF | https://www.gov.br/receitafederal | Imposto de renda |
| Calculadora Rescisão | https://www.calculorescisao.com.br | Rescisão trabalhista |
| Simulador Simples | https://www8.receita.fazenda.gov.br/SimplesNacional | Simples Nacional |

---

## 📋 Tabelas 2026 - Resumo Rápido

### INSS - Empregado (Progressiva)
| Faixa | Salário | Alíquota |
|-------|---------|----------|
| 1 | Até R$ 1.621,00 | 7,5% |
| 2 | R$ 1.621,01 - R$ 2.902,84 | 9% |
| 3 | R$ 2.902,85 - R$ 4.354,27 | 12% |
| 4 | R$ 4.354,28 - R$ 9.030,34 | 14% |
| **Teto** | **R$ 9.030,34** | |

### IRRF 2026 (Progressiva)
| Faixa | Base Mensal | Alíquota | Dedução |
|-------|-------------|----------|---------|
| 1 | Até R$ 2.259,20 | Isento | - |
| 2 | R$ 2.259,21 - R$ 2.826,65 | 7,5% | R$ 169,44 |
| 3 | R$ 2.826,66 - R$ 3.751,05 | 15% | R$ 381,44 |
| 4 | R$ 3.751,06 - R$ 4.664,68 | 22,5% | R$ 662,77 |
| 5 | Acima de R$ 4.664,68 | 27,5% | R$ 896,00 |

**Desconto simplificado:** 25% do limite máximo da tabela = R$ 607,20/mês  
**Dedução por dependente:** R$ 189,59/mês (R$ 2.275,08/ano)

### Lucro Presumido - Percentuais de Presunção
| Atividade | IRPJ | CSLL |
|-----------|------|------|
| Revenda combustíveis | 1,6% | 12% |
| Comércio/Indústria | 8% | 12% |
| Transporte (exceto carga) | 16% | 12% |
| Serviços gerais | 32% | 32% |
| Serviços hospitalares | 8% | 12% |

**Novos percentuais (excesso R$ 5M/ano):** × 1,10

---

*Documentos detalhados em cada subpasta.*
