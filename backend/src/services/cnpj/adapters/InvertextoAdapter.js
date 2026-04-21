const { BaseAdapter } = require("./BaseAdapter");

/**
 * Adapter para Invertexto
 *
 * Endpoint: https://api.invertexto.com/v1/cnpj/{cnpj}?token=TOKEN
 *
 * Vantagens: Dados completos, CNAE com descrição, tributários (Simples/MEI), telefones
 * Retorna: atividade_principal com descrição, atividades_secundarias com descrição
 */
class InvertextoAdapter extends BaseAdapter {
  constructor() {
    super("invertexto", "https://api.invertexto.com/v1/cnpj", 5000);
    this.token = process.env.INVERTEXTO_TOKEN;
  }

  buildUrl(cnpj) {
    return `${this.baseUrl}/${cnpj}?token=${this.token}`;
  }

  normalize(raw) {
    const endereco = raw.endereco || {};
    const situacao = raw.situacao || {};
    const atividadePrincipal = raw.atividade_principal || {};
    const simples = raw.simples || {};
    const mei = raw.mei || {};

    return {
      cnpj: this.formatarCnpj(raw.cnpj || ""),
      razaoSocial: raw.razao_social || "",
      nomeFantasia: raw.nome_fantasia || "",
      dataAbertura: this.formatarData(raw.data_inicio || ""),
      naturezaJuridica: raw.natureza_juridica || "",
      cnaePrincipal: {
        codigo: String(atividadePrincipal.codigo || ""),
        descricao: atividadePrincipal.descricao || "",
      },
      cnaesSecundarios: (raw.atividades_secundarias || []).map((c) => ({
        codigo: String(c.codigo || ""),
        descricao: c.descricao || "",
      })),
      endereco: {
        logradouro: endereco.tipo_logradouro
          ? `${endereco.tipo_logradouro} ${endereco.logradouro || ""}`.trim()
          : endereco.logradouro || "",
        numero: endereco.numero || "",
        complemento: endereco.complemento || "",
        bairro: endereco.bairro || "",
        cidade: endereco.municipio || "",
        uf: endereco.uf || "",
        cep: this.formatarCep(endereco.cep || ""),
      },
      situacao: {
        codigo: this.situacaoCodigo(situacao.nome),
        descricao: situacao.nome || "",
        data: this.formatarData(situacao.data || ""),
        motivo: situacao.motivo || "",
      },
      porte: {
        codigo: raw.porte || "",
        descricao: raw.porte || "",
      },
      capitalSocial: this.parseMoeda(raw.capital_social),
      capitalSocialFormatado: this.formatarMoeda(raw.capital_social),

      // TRIBUTÁRIO
      regimeTributario: this.determinarRegime(simples, mei),
      opcaoSimples: simples.optante_simples === "S",
      dataOpcaoSimples: this.formatarData(simples.data_opcao || ""),
      dataExclusaoSimples: this.formatarData(simples.data_exclusao || ""),
      opcaoMei: mei.optante_mei === "S",
      dataOpcaoMei: this.formatarData(mei.data_opcao || ""),
      dataExclusaoMei: this.formatarData(mei.data_exclusao || ""),

      // Contatos
      telefones: this.extrairTelefones(raw),
      email: raw.email || "",

      // Sócios
      socios: (raw.socios || []).map((s) => ({
        nome: s.nome || "",
        cpfCnpj: s.cpf_cnpj || "",
        qualificacao: s.qualificacao || "",
        dataEntrada: this.formatarData(s.data_entrada || ""),
        pais: "",
        faixaEtaria: "",
        representanteLegal: "",
        nomeFaixaEtaria: "",
      })),

      apiUsed: "invertexto",
      fromCache: false,
    };
  }

  formatarCnpj(v) {
    const c = String(v || "")
      .replace(/\D/g, "")
      .padStart(14, "0");
    if (c.length !== 14) return v;
    return `${c.slice(0, 2)}.${c.slice(2, 5)}.${c.slice(5, 8)}/${c.slice(8, 12)}-${c.slice(12, 14)}`;
  }

  formatarData(v) {
    if (!v) return "";
    if (v.includes("-")) {
      const [y, m, d] = v.split("-");
      return `${d}/${m}/${y}`;
    }
    return v;
  }

  formatarCep(v) {
    const c = String(v || "").replace(/\D/g, "");
    if (c.length !== 8) return v;
    return `${c.slice(0, 2)}.${c.slice(2, 5)}-${c.slice(5)}`;
  }

  formatarMoeda(v) {
    if (!v && v !== 0) return "";
    const num = typeof v === "string" ? parseFloat(v) : Number(v);
    if (isNaN(num)) return "";
    return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  parseMoeda(v) {
    if (!v) return 0;
    if (typeof v === "string") return parseFloat(v) || 0;
    return Number(v) || 0;
  }

  situacaoCodigo(descricao) {
    const d = String(descricao || "").toLowerCase();
    if (d.includes("ativa")) return 2;
    if (d.includes("suspensa")) return 4;
    if (d.includes("inapta")) return 8;
    if (d.includes("baixada")) return 1;
    return 0;
  }

  determinarRegime(simples, mei) {
    if (mei.optante_mei === "S") return "Simples Nacional - MEI";
    if (simples.optante_simples === "S") return "Simples Nacional";
    return "Não Enquadrado";
  }

  extrairTelefones(raw) {
    const telefones = [];
    // telefone1 e telefone2 vêm no formato "DDD NUMERO" ex: "71 82886218"
    for (let i = 1; i <= 2; i++) {
      const tel = raw[`telefone${i}`];
      if (tel) {
        const parts = tel.trim().split(/\s+/);
        if (parts.length >= 2) {
          telefones.push({
            ddd: parts[0],
            numero: parts.slice(1).join(""),
            tipo: "",
          });
        } else if (parts.length === 1) {
          telefones.push({ ddd: "", numero: parts[0], tipo: "" });
        }
      }
    }
    return telefones;
  }
}

module.exports = { InvertextoAdapter };
