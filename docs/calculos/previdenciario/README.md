# 🏥 Cálculos Previdenciários

**Última atualização:** 05 de abril de 2026  
**Versão:** 1.0 - Estrutura  
**Status:** 📝 A ser documentado

---

## 📋 Cálculos a Documentar

### 1. Aposentadoria por Idade
- [ ] Requisitos 2026: 65 anos (H) / 62 anos (M)
- [ ] 15 anos contribuição (ambos)
- [ ] Cálculo do benefício (60% + 2% por ano > 15/20)
- [ ] RMI - Renda Mensal Inicial

### 2. Aposentadoria por Tempo de Contribuição
- [ ] Regra de transição - Pedágio 50%
- [ ] Regra de transição - Pedágio 100%
- [ ] Regra de transição - Pontos (2026: 105H / 95M)
- [ ] Fator previdenciário

### 3. Fator Previdenciário
- [ ] Fórmula: `f = (Tc × a × Es) / (1 + (Tc × a))`
- [ ] Tc = tempo de contribuição (anos)
- [ ] a = alíquota fixa 0,31
- [ ] Es = expectativa de sobrevida (IBGE)
- [ ] Tabelas de expectativa de vida

### 4. RMI - Renda Mensal Inicial
- [ ] Média de 100% dos salários de contribuição (desde jul/1994)
- [ ] Descarte das 20% menores contribuições
- [ ] Coeficiente: 60% + 2% ao ano que exceder 15 anos (mulher) / 20 anos (homem)
- [ ] Limites: mínimo 1 SM, máximo teto INSS

### 5. Salário de Benefício
- [ ] Cálculo da média
- [ ] Atualização monetária dos salários
- [ ] Teto INSS 2026: R$ 9.030,34
- [ ] Salário mínimo 2026

### 6. Outros Benefícios
- [ ] Pensão por morte
- [ ] Auxílio-doença
- [ ] Auxílio-acidente
- [ ] Salário-família
- [ ] Salário-maternidade

### 7. Contribuições
- [ ] Empregado (tabela progressiva)
- [ ] Contribuinte individual (20% ou 11%)
- [ ] Facultativo (20% ou plano simplificado)
- [ ] Tabela INSS 2026

---

## 📚 Base Legal

| Norma | Descrição |
|-------|-----------|
| Lei 8.213/91 | Planos de Benefícios |
| EC 103/2019 | Reforma da Previdência |
| Dec. 3.048/99 | Regulamento da Previdência |
| Portaria MPS/MF nº 13/2026 | Tabela INSS |
| Lei 8.212/91 | Custeio |

---

## 🔗 Referências

| Fonte | URL |
|-------|-----|
| Meu INSS | https://meu.inss.gov.br |
| Calculadora INSS | https://meu.inss.gov.br/#/simulador |
| Bocchi Advogados | https://bocchiadvogados.com.br/fator-previdenciario/ |
| Nosso Direito | https://nossodireito.com/aposentadoria |

---

*Documentação detalhada será criada em sprints futuras.*
