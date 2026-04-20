# Modelos Societarios 2026 - Compacto

## Transformacao EI → LTDA Unipessoal

Estrutura minima:
```
1. QUALIFICACAO TITULAR: nome, nacionalidade, estado civil, profissao, CPF, RG, endereco
2. DADOS EI ATUAL: nome empresarial, NIRE, CNPJ, sede, capital social
3. ATO TRANSFORMATIVO: Art. 968, §3o, CC/2002 + LC 128/2008, sub-rogacao direitos/obrigacoes
4. NOVA ESTRUTURA: novo nome [NOME] LTDA, capital, quotas, administracao, objeto (CNAE)
5. DISPOSICOES FINAIS: foro (Art. 1.101, CC), enquadramento ME/EPP, assinatura + 2 testemunhas
```

## Clausulas Padrao Parametrizaveis

### Qualificacao Partes
```
[NOME_COMPLETO], [NACIONALIDADE], [ESTADO_CIVIL], [PROFISSAO],
portador(a) do CPF nº [CPF] e do RG nº [RG] ([ORGAO]/[UF]),
residente e domiciliado(a) na [ENDERECO_COMPLETO],
doravante denominado(a) [CONTRATANTE/CONTRATADA].
```

### Desimpedimento Administrador
```
O administrador declara, sob as penas da lei, que nao esta impedido de exercer
a administracao por: (i) condenacao criminal; (ii) crime falimentar,
prevaricacao, peita, suborno, concussao, peculato; (iii) infracao contra
economia popular, sistema financeiro, defesa da concorrencia, relacoes de
consumo, fe publica ou propriedade (Art. 1.011, §1o, CC/2002).
```

### Objeto Social (CNAE)
```
A sociedade tem por objeto: [DESCRICAO_ATIVIDADE], conforme CNAE [CNAE].
Paragrafo unico: A sociedade nao exercera atividades vedadas ao Simples
Nacional, nos termos do §4o do art. 3o da LC 123/2006.
```

### Capital Social e Quotas
```
Capital social de R$ [VALOR] ([EXTENSO]), dividido em [N] quotas de R$ [VALOR_QUOTA],
totalmente subscritas e integralizadas, distribuidas:
• [NOME_SOCIO]: [N] quotas = R$ [VALOR] ([%]%)
Paragrafo unico: Responsabilidade restrita ao valor das quotas, conforme art. 1.052 CC.
```

### LGPD - Protecao de Dados
```
As partes comprometem-se a tratar dados pessoais em conformidade com a Lei
13.709/2018 (LGPD), observando principios de finalidade, adequacao e seguranca.
```

## Checklist Pre-Geracao
[ ] Partes qualificadas (nome, CPF/CNPJ, endereco, RG)
[ ] Dados empresa (NIRE, CNPJ, sede, capital)
[ ] Objeto claro e CNAEs correspondentes
[ ] Valores (numerico + extenso) e moeda
[ ] Prazos, rescisao, foro
[ ] Base legal aplicavel citada
[ ] Campos parametrizaveis [COLCHETES]

## Fluxos por Tipo
| Pedido | Dados Necessarios | Modelo |
|--------|------------------|--------|
| Contrato prestacao servicos | Partes, objeto, valor, prazo, local | 12-modelos-contratos |
| EI → LTDA Unipessoal | Dados EI, novo nome, capital, CNAEs | Este arquivo |
| Alteracao contratual | Tipo alteracao + dados novos | Clausulas padrao |
| Clausula LGPD/confidencialidade | Dados das partes | Clausula LGPD acima |
| Validacao Simples/CNAE | CNAE, faturamento, folha | 07-cnae-simples |
