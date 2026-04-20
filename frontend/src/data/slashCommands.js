import cnaesData from "./cnaes.json";
const { cnaes } = cnaesData;

export function cmdCnae(query) {
  const q = query.trim().toLowerCase();
  if (!q) return "Uso: `/cnae <texto ou codigo>`\n\nEx: `/cnae TI`, `/cnae 6201`, `/cnae padaria`";
  const codeMatch = cnaes.filter((c) => c.codigo.replace(/[-/\s]/g, "").toLowerCase().includes(q.replace(/[-/\s]/g, "")));
  const descMatch = cnaes.filter((c) => c.descricao.toLowerCase().includes(q));
  const seen = new Set();
  const results = [...codeMatch, ...descMatch].filter((c) => { if (seen.has(c.codigo)) return false; seen.add(c.codigo); return true; }).slice(0, 15);
  if (results.length === 0) return "Nenhum CNAE encontrado. Tente buscar por codigo ou descricao.";
  let reply = "## Resultados (" + results.length + ")\n\n| Codigo | Descricao | Simples | Anexo |\n|--------|-----------|---------|-------|\n";
  for (const c of results) reply += "| `" + c.codigo + "` | " + c.descricao.substring(0, 45) + " | " + (c.simples || "-") + " | " + (c.anexo || "-") + " |\n";
  return reply;
}

const CONTRATOS = {
  "prestacao de servicos": { nome: "Contrato de Prestacao de Servicos Contabeis", partes: ["Contratante", "Contratada"], clausulas: ["Objeto: servicos contabeis", "Honorarios e pagamento", "Prazo e renovacao", "Responsabilidades", "Confidencialidade", "Rescisao e multa", "Foro"], documentos: ["CNPJ e contrato social", "RG/CPF responsavel", "Comprovante endereco", "Certidoes negativas", "Alvara", "Procuracao"] },
  "trabalho": { nome: "Contrato Individual de Trabalho (CLT)", partes: ["Empregador", "Empregado"], clausulas: ["Identificacao das partes", "Funcao/cargo", "Remuneracao", "Jornada", "Local", "Prazo", "Ferias e 13", "Rescisao"], documentos: ["RG e CPF", "CTPS", "Comprovante residencia", "Certidao nascimento", "Titulo eleitor", "Reservista", "PIS", "Exame admissional"] },
  "sociedade": { nome: "Contrato Social de Constituicao", partes: ["Socios fundadores"], clausulas: ["Denominacao e sede", "Objeto social", "Capital social", "Administracao", "Distribuicao de lucros", "Retirada de socios", "Dissolucao"], documentos: ["RG/CPF socios", "Comprovante sede", "Certidao viabilidade", "IPTU ou contrato locacao", "Ficha FCN"] },
  "confidencialidade": { nome: "NDA - Termo de Confidencialidade", partes: ["Revelador", "Receptora"], clausulas: ["Definicao confidencial", "Excecoes", "Obrigacoes", "Prazo", "Penalidades", "Devolucao"], documentos: ["Dados das partes", "CNPJ/CPF", "RG responsaveis"] },
  "locacao": { nome: "Contrato de Locacao Comercial", partes: ["Locador", "Locatario"], clausulas: ["Imovel e partes", "Destinacao", "Aluguel e reajuste", "Garantia", "Prazo", "Encargos", "Rescisao"], documentos: ["Matricula imovel", "IPTU", "RG/CPF", "CNPJ", "Contrato social"] },
  "parceria": { nome: "Contrato de Parceria Comercial", partes: ["Parceiro A", "Parceiro B"], clausulas: ["Objeto", "Obrigacoes", "Divisao receitas", "Exclusividade", "Prazo", "Propriedade intelectual", "Rescisao"], documentos: ["CNPJ ambas", "RG representantes", "Certidoes fiscais"] },
};

export function cmdContrato(query) {
  const q = query.trim().toLowerCase();
  if (!q) {
    let reply = "## Modelos de Contrato Disponiveis\n\nDigite `/contrato <tipo>`:\n\n";
    for (const k of Object.keys(CONTRATOS)) {
      reply += "- **" + k + "** - " + CONTRATOS[k].nome + "\n";
    }
    return reply + "\nEx: `/contrato trabalho`, `/contrato sociedade`";
  }
  let match = null;
  for (const key of Object.keys(CONTRATOS)) { if (q.includes(key) || key.includes(q)) { match = CONTRATOS[key]; break; } }
  if (!match) return "Contrato nao encontrado. Disponiveis: " + Object.keys(CONTRATOS).join(", ");
  let reply = "## " + match.nome + "\n\n### Partes\n";
  for (const p of match.partes) reply += "- " + p + "\n";
  reply += "\n### Clausulas\n";
  for (const c of match.clausulas) reply += "- [ ] " + c + "\n";
  reply += "\n### Documentos Necessarios\n";
  for (const d of match.documentos) reply += "- [ ] " + d + "\n";
  return reply + "\n⚖️ Regido pelo Codigo Civil e legislacao especifica.";
}

export function cmdAjuda() {
  return "## Comandos Disponiveis\n\n### Busca\n| Comando | Descricao |\n|---------|-----------|\n| `/cnae <texto>` | Busca CNAEs |\n| `/anexo` | Tabela Simples Nacional |\n| `/fatorR` | Formula Fator R |\n| `/mei` | Resumo MEI |\n| `/irpf` | Tabela IRPF 2026 |\n| `/inss` | Tabela INSS 2026 |\n| `/tributos` | Comparativo regimes |\n| `/obrigacoes` | Obrigações do mes |\n\n### Documentos\n| Comando | Descricao |\n|---------|-----------|\n| `/contrato [tipo]` | Modelos de contrato |\n| `/certidao` | Certidoes negativas |\n\n### Ajuda\n| `/ajuda` | Lista comandos |\n\nPerguntas complexas? Basta digitar normalmente - a IA responde!";
}

export function cmdAnexo() {
  return "## Anexos Simples Nacional 2026\n\n| Faixa | RBT12 | An.I | An.II | An.III | An.IV | An.V |\n|-------|-------|------|-------|--------|-------|------|\n| 1a | 180k | 4% | 4,5% | 6% | 4,5% | 15,5% |\n| 2a | 180-360k | 7,3% | 7,8% | 11,2% | 9% | 18% |\n| 3a | 360-720k | 9,5% | 10% | 13,5% | 10,2% | 19,5% |\n| 4a | 720k-1,8M | 10,7% | 11,2% | 16% | 14% | 20,5% |\n| 5a | 1,8-3,6M | 14,3% | 14,7% | 21% | 22% | 23% |\n| 6a | 3,6-4,8M | 19% | 30% | 33% | 33% | 30,5% |\n\nFormula: AE = [(RBT12 x Aliq) - Deduzir] / RBT12\nDAS = Faturamento x AE";
}

export function cmdFatorR() {
  return "## Fator R\n\n### Formula\n`Fator R = Folha 12M / Receita Bruta 12M`\n\nFolha: salarios + pro-labore + INSS patronal (20%) + FGTS (8%) + ferias prop. + 13o\n\n### Regra\n| Fator R | Anexo | Impacto |\n|---------|-------|--------|\n| >= 28% | **Anexo III** | Aliquota menor (6%) |\n| < 28% | **Anexo V** | Aliquota maior (15,5%) |\n\nExemplo: Receita 600k, Folha 180k = Fator R 30% = Anexo III\nEconomia: ~9,5 pp de aliquota!";
}

export function cmdMei() {
  return "## MEI 2026\n\nFaturamento: R$ 81.000/ano (R$ 6.750 x meses)\n\n### DAS Mensal\n- Comercio: R$ 71,60\n- Servicos: R$ 75,60\n- Ambos: R$ 76,60\n\n### Obrigacoes\n- Mensal: DAS ate dia 20\n- Anual: DASN-SIMEI ate 31/maio\n- Com empregado: eSocial + INSS 20% + FGTS 8%\n\n### Quem NAO pode\n- Socio de outra empresa\n- Atividade intelectual nao permitida\n- Faturamento > 81k\n- Mais de 1 empregado";
}

export function cmdIrpf() {
  return "## IRRF 2026\n\n| Base (R$) | Aliquota | Deduzir |\n|-----------|----------|--------|\n| Ate 2.259,20 | Isento | 0 |\n| 2.259-3.036 | 7,5% | 169,44 |\n| 3.036-4.000 | 15% | 390,70 |\n| 4.000-5.000 | 22,5% | 690,70 |\n| Acima 5.000 | 27,5% | 940,70 |\n\nIsencao efetiva ate ~R$ 5.000/mes (Lei 15.270/2025)";
}

export function cmdInss() {
  return "## INSS 2026\n\n| Faixa (R$) | Aliquota | Deduzir |\n|------------|----------|--------|\n| Ate 1.412 | 7,5% | 0 |\n| 1.412-2.666 | 9% | 21,18 |\n| 2.666-4.000 | 12% | 101,18 |\n| 4.000-7.786 | 14% | 181,18 |\n\nTeto: R$ 7.786,02 | Max desconto: R$ 1.089,04\nPatronal: 20% + RAT/FAP + Terceiros";
}

export function cmdTributos() {
  return "## Tributos por Regime\n\n### Simples Nacional -> DAS unico\n### Lucro Presumido -> IRPJ 15%+10%, CSLL 9%, PIS 0,65%, COFINS 3%\n### Lucro Real -> IRPJ 15%+10%, CSLL 9%, PIS 1,65%, COFINS 7,60%\n\nPeca detalhes de qualquer regime!";
}

export function cmdObrigacoes() {
  return "## Obrigacoes Mensais\n\n| Dia | Obrigacao |\n|-----|-----------|\n| 7 | GFIP (se aplicavel) |\n| 15 | eSocial + DAS |\n| 20 | PIS/COFINS, IRRF, CSLL |\n| Ultimo dia util | PGDAS-D |\n\nVerifique pendencias!";
}

export function cmdCertidao() {
  return "## Certidoes Negativas\n\n### Empresas\n| Certidao | Orgao | Validade |\n|----------|-------|--------|\n| CND Federal | RFB/PGFN | 6 meses |\n| CND Estadual | SEFAZ | Varia |\n| CND Municipal | Prefeitura | Varia |\n| CND Trabalhista | TST | 6 meses |\n| FGTS | Caixa | 30 dias |\n\nEmitir em gov.br";
}

export function handleCommand(message) {
  const trimmed = message.trim();
  if (!trimmed.startsWith("/")) return null;
  const parts = trimmed.slice(1).split(" ");
  const cmd = parts[0].toLowerCase();
  const query = parts.slice(1).join(" ");
  switch (cmd) {
    case "cnae": return cmdCnae(query);
    case "contrato": return cmdContrato(query);
    case "ajuda": case "help": case "comandos": return cmdAjuda();
    case "anexo": return cmdAnexo();
    case "fatorr": case "fator-r": case "fator_r": return cmdFatorR();
    case "mei": return cmdMei();
    case "irpf": case "irrf": return cmdIrpf();
    case "inss": return cmdInss();
    case "tributos": return cmdTributos();
    case "obrigacoes": return cmdObrigacoes();
    case "certidao": case "certidoes": return cmdCertidao();
    default: return null;
  }
}
