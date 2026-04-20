# CNAE, Simples Nacional e Fator R 2026 - Compacto

## Faixas RBT12 (todos os anexos)
| Faixa | RBT12 (R$) |
|-------|-----------|
| 1a | Ate 180.000 |
| 2a | 180.001 - 360.000 |
| 3a | 360.001 - 720.000 |
| 4a | 720.001 - 1.800.000 |
| 5a | 1.800.001 - 3.600.000 |
| 6a | 3.600.001 - 4.800.000 |

## Anexos - Aliquotas Iniciais e Deducoes Faixa 1-3
| Faixa | An.I (Com) | An.II (Ind) | An.III (Serv) | An.IV (Serv) | An.V (Serv) |
|-------|-----------|------------|--------------|-------------|------------|
| 1a | 4% | 4,5% | 6% | 4,5% | 15,5% |
| 2a | 7,3% | 7,8% | 11,2% | 9% | 18% |
| 3a | 9,5% | 10% | 13,5% | 10,2% | 19,5% |

## Formula Alíquota Efetiva
`AE = [(RBT12 x Aliq_nominal) - Valor_deduzir] / RBT12`
`DAS = Faturamento_mes x AE`

## Fator R
`Fator R = Folha_12M / Receita_Bruta_12M`

Folha inclui: salarios + pro-labore + INSS patronal (20%) + FGTS (8%) + ferias prop + 13o prop

| Fator R | Anexo | Impacto |
|---------|-------|---------|
| >= 28% | **Anexo III** | Aliquota menor (6% na 1a faixa) |
| < 28% | **Anexo V** | Aliquota maior (15,5% na 1a faixa) |

Economia potencial: ~9,5 pp de aliquota!

## CNAEs Elegiveis ao Fator R (principais)
6201-5/01 a 6209-1/00 (TI e software)
7111-1/00 a 7120-1/00 (arquitetura, engenharia)
6911-7/03 (propriedade industrial)
7020-4/00 (consultoria empresarial)
8531-7/00 a 8599-6/99 (educacao e treinamento)
8610-1/01 a 8690-9/99 (saude)
7490-1/01 a 7490-1/99 (traducao, agronomia, intermed)
7311-4/00, 7319-0/04 (publicidade)
9313-1/00 (condicionamento fisico)
9002-7/01 (artistas, jornalistas)

## Recolhimento
- DAS: gerado via PGDAS-D, vencimento dia 20
- Sem faturamento: declarar "sem movimento"
- Atraso: multa 0,33%/dia (max 20%) + SELIC
- Exclusao do Simples: divida > 6 meses nao parcelada

## Pontos Criticos 2026
- Fator R recalculado mensalmente (janela rolante 12 meses)
- Segregacao de receitas por CNAE na emissao da NF
- CNAE do Anexo V com Fator R >= 28% -> recolhe por Anexo III
- MEI: nao sujeito ao Fator R (regime proprio SIMEI)
