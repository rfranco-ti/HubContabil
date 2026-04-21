const { BaseAdapter } = require("./BaseAdapter");

/**
 * Adapter para OpenCNPJ
 *
 * Endpoint: https://api.opencnpj.org/{CNPJ}
 * Formato: resposta flat (sem company.*, sem address.*)
 * Nota: CNAE secundário vem só como código, sem descrição
 */
class OpenCnpjAdapter extends BaseAdapter {
  constructor() {
    super("opencnpj", "https://api.opencnpj.org", 5000);
  }

  buildUrl(cnpj) {
    return `${this.baseUrl}/${cnpj}`;
  }

  normalize(raw) {
    return {
      cnpj: this.formatarCnpj(raw.cnpj || ""),
      razaoSocial: raw.razao_social || "",
      nomeFantasia: raw.nome_fantasia || "",
      dataAbertura: this.formatarData(raw.data_inicio_atividade || ""),
      naturezaJuridica: raw.natureza_juridica || "",
      cnaePrincipal: {
        codigo: String(raw.cnae_principal || ""),
        descricao: "", // OpenCNPJ só retorna código
      },
      cnaesSecundarios: (raw.cnaes_secundarios || []).map((c) => ({
        codigo: String(c || ""),
        descricao: "", // Só códigos
      })),
      endereco: {
        logradouro: raw.tipo_logradouro
          ? `${raw.tipo_logradouro} ${raw.logradouro || ""}`.trim()
          : raw.logradouro || "",
        numero: raw.numero || "",
        complemento: raw.complemento || "",
        bairro: raw.bairro || "",
        cidade: raw.municipio || "",
        uf: raw.uf || "",
        cep: this.formatarCep(raw.cep || ""),
      },
      situacao: {
        codigo: this.situacaoCodigo(raw.situacao_cadastral),
        descricao: raw.situacao_cadastral || "",
        data: this.formatarData(raw.data_situacao_cadastral || ""),
        motivo: "",
      },
      porte: {
        codigo: raw.porte_empresa || "",
        descricao: raw.porte_empresa || "",
      },
      capitalSocial: this.parseMoeda(raw.capital_social),
      capitalSocialFormatado: this.formatarMoeda(raw.capital_social),

      // TRIBUTÁRIO
      regimeTributario: this.determinarRegime(raw),
      opcaoSimples: raw.opcao_simples === "S",
      dataOpcaoSimples: this.formatarData(
        raw.data_opcao_simples !== "0000-00-00" ? raw.data_opcao_simples : "",
      ),
      dataExclusaoSimples: null,
      opcaoMei: raw.opcao_mei === "S",
      dataOpcaoMei: this.formatarData(
        raw.data_opcao_mei !== "0000-00-00" ? raw.data_opcao_mei : "",
      ),
      dataExclusaoMei: null,

      // Contatos
      telefones: (raw.telefones || []).map((t) => ({
        ddd: t.ddd || "",
        numero: t.numero || "",
        tipo: t.is_fax ? "Fax" : "",
      })),
      email: raw.email || "",

      // Sócios
      socios: (raw.QSA || raw.qsa || []).map((s) => ({
        nome: s.nome_socio || "",
        cpfCnpj: s.cnpj_cpf_socio || "",
        qualificacao: s.qualificacao_socio || "",
        dataEntrada: this.formatarData(s.data_entrada_sociedade || ""),
        pais: "",
        faixaEtaria: s.faixa_etaria || "",
        representanteLegal: "",
        nomeFaixaEtaria: s.identificador_socio || "",
      })),

      apiUsed: "opencnpj",
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
    const num =
      typeof v === "string"
        ? parseFloat(v.replace(/\./g, "").replace(",", "."))
        : Number(v);
    if (isNaN(num)) return "";
    return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  parseMoeda(v) {
    if (!v) return 0;
    if (typeof v === "string") {
      return parseFloat(v.replace(/\./g, "").replace(",", ".")) || 0;
    }
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

  determinarRegime(raw) {
    if (raw.opcao_mei === "S") return "Simples Nacional - MEI";
    if (raw.opcao_simples === "S") return "Simples Nacional";
    return "Não Enquadrado";
  }
}

module.exports = { OpenCnpjAdapter };
