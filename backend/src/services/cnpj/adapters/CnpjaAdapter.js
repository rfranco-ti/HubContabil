const { BaseAdapter } = require("./BaseAdapter");

/**
 * Adapter para Cnpja
 *
 * Endpoint gratuito: https://open.cnpja.com/office/{cnpj}
 * Endpoint comercial: https://api.cnpja.com/office/{cnpj} (API key)
 * Endpoint Simples: https://api.cnpja.com/simples?taxId={cnpj}
 */
class CnpjaAdapter extends BaseAdapter {
  constructor() {
    super("cnpja", "https://open.cnpja.com/office", 5000);
    this.apiBaseUrl = "https://api.cnpja.com/office";
  }

  buildUrl(cnpj) {
    return `${this.baseUrl}/${cnpj}`;
  }

  /**
   * Consulta com Simples Nacional via fetch direto
   */
  async fetchWithSimples(cnpj) {
    const apiKey = process.env.CNPJA_API_KEY;
    if (!apiKey) {
      throw new Error("CNPJA_API_KEY não configurada no .env");
    }

    const url = `https://api.cnpja.com/simples?taxId=${cnpj}&history=true&strategy=CACHE_IF_ERROR`;
    const response = await fetch(url, {
      headers: {
        Authorization: apiKey,
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      if (response.status === 429) {
        throw new Error(
          error.message || "Créditos insuficientes ou limite excedido",
        );
      }
      if (response.status === 404) throw new Error("CNPJ não encontrado");
      throw new Error(
        `HTTP ${response.status}: ${error.message || "Erro na API"}`,
      );
    }

    const raw = await response.json();

    return {
      cnpj: this.formatarCnpj(raw.taxId || ""),
      simples: {
        optant: raw.simples?.optant ?? false,
        since: this.formatarData(raw.simples?.since || ""),
        history: (raw.simples?.history || []).map((h) => ({
          from: this.formatarData(h.from || ""),
          until: this.formatarData(h.until || ""),
          text: h.text || "",
        })),
      },
      simei: {
        optant: raw.simei?.optant ?? false,
        since: this.formatarData(raw.simei?.since || ""),
        history: (raw.simei?.history || []).map((h) => ({
          from: this.formatarData(h.from || ""),
          until: this.formatarData(h.until || ""),
          text: h.text || "",
        })),
      },
      apiUsed: "cnpja-simples",
      fromCache: false,
    };
  }

  normalize(raw) {
    const company = raw.company || {};
    const address = raw.address || company.address || {};
    const nature = company.nature || {};
    const mainActivity = raw.mainActivity || company.mainActivity || {};
    const status = raw.status || {};
    const size = company.size || {};
    const simples = company.simples || {};
    const simei = company.simei || {};
    const phones = raw.phones || company.phones || [];
    const emails = raw.emails || company.emails || [];
    const members = company.members || [];
    const sideActivities = raw.sideActivities || company.sideActivities || [];

    return {
      cnpj: this.formatarCnpj(raw.taxId || raw.cnpj || ""),
      razaoSocial: company.name || "",
      nomeFantasia: raw.alias || company.alias || company.tradeName || "",
      dataAbertura: this.formatarData(company.founded || raw.updated || ""),
      naturezaJuridica: nature.text || "",
      cnaePrincipal: {
        codigo: String(mainActivity.id || mainActivity.code || ""),
        descricao: mainActivity.text || mainActivity.description || "",
      },
      cnaesSecundarios: sideActivities.map((c) => ({
        codigo: String(c.id || c.code || ""),
        descricao: c.text || c.description || "",
      })),
      endereco: {
        logradouro: address.street || "",
        numero: address.number || "",
        complemento: address.details || "",
        bairro: address.district || "",
        cidade: address.city || "",
        uf: address.state || "",
        cep: this.formatarCep(address.zip || ""),
      },
      situacao: {
        codigo: status.id || 0,
        descricao: status.text || "",
        data: this.formatarData(raw.statusDate || status.date || ""),
        motivo: "",
      },
      porte: {
        codigo: size.acronym || size.id || "",
        descricao: size.text || "",
      },
      capitalSocial: company.equity || 0,
      capitalSocialFormatado: this.formatarMoeda(company.equity),

      // TRIBUTÁRIO
      regimeTributario: this.determinarRegime(simples, simei),
      opcaoSimples: simples.optant || false,
      dataOpcaoSimples: this.formatarData(simples.since || ""),
      dataExclusaoSimples: null,
      opcaoMei: simei.optant || false,
      dataOpcaoMei: this.formatarData(simei.since || ""),
      dataExclusaoMei: null,

      // Contatos
      telefones: phones.map((p) => ({
        ddd: p.area || "",
        numero: p.number || p || "",
        tipo: p.type === "MOBILE" ? "Celular" : "Fixo",
      })),
      email: (emails[0] && emails[0].address) || "",

      // Sócios
      socios: members.map((s) => ({
        nome: s.person?.name || s.name || "",
        cpfCnpj: s.person?.taxId || s.taxId || "",
        qualificacao: s.role?.text || s.role || "",
        dataEntrada: this.formatarData(s.since || ""),
        pais: "",
        faixaEtaria: s.person?.age || s.age || "",
        representanteLegal: "",
        nomeFaixaEtaria:
          s.person?.type === "NATURAL" ? "Pessoa Física" : "Pessoa Jurídica",
      })),

      apiUsed: "cnpja",
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
    if (v.includes("T")) v = v.split("T")[0];
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
    return Number(v).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  determinarRegime(simples, simei) {
    if (simei.optant) return "Simples Nacional - MEI";
    if (simples.optant) return "Simples Nacional";
    return "Não Enquadrado";
  }
}

module.exports = { CnpjaAdapter };
