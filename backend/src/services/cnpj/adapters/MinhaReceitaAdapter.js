const { BaseAdapter } = require("./BaseAdapter");

/**
 * Adapter para Minha Receita
 *
 * Endpoint: https://minhareceita.org/{cnpj}
 * Open Source: https://github.com/cuducos/minha-receita
 *
 * Vantagens: Open source, estável, dados completos
 */
class MinhaReceitaAdapter extends BaseAdapter {
  constructor() {
    super("minhareceita", "https://minhareceita.org", 5000);
  }

  buildUrl(cnpj) {
    return `${this.baseUrl}/${cnpj}`;
  }

  /**
   * Normaliza dados do Minha Receita para formato padrão
   * Aplica máscaras e formatações para o frontend
   */
  normalize(raw) {
    return {
      cnpj: this.formatarCnpj(raw.cnpj || ""),
      razaoSocial: raw.razao_social || "",
      nomeFantasia: raw.nome_fantasia || "",
      dataAbertura: this.formatarData(raw.data_inicio_atividade || ""),
      naturezaJuridica: raw.natureza_juridica || "",
      cnaePrincipal: {
        codigo: String(raw.cnae_fiscal || ""),
        descricao: raw.cnae_fiscal_descricao || "",
      },
      cnaesSecundarios: (raw.cnaes_secundarios || []).map((c) => ({
        codigo: String(c.codigo || ""),
        descricao: c.descricao || "",
      })),
      endereco: {
        logradouro: raw.tipo_logradouro
          ? `${raw.tipo_logradouro} ${raw.logradouro}`.trim()
          : raw.logradouro || "",
        numero: raw.numero || "",
        complemento: raw.complemento || "",
        bairro: raw.bairro || "",
        cidade: raw.municipio || "",
        uf: raw.uf || "",
        cep: this.formatarCep(raw.cep || ""),
      },
      situacao: {
        codigo: this.situacaoCodigo(raw.descricao_situacao_cadastral),
        descricao: raw.descricao_situacao_cadastral || "",
        data: this.formatarData(raw.data_situacao_cadastral || ""),
        motivo: raw.descricao_motivo_situacao_cadastral || "",
      },
      porte: {
        codigo: raw.descricao_porte || "",
        descricao: raw.descricao_porte || "",
      },
      capitalSocial: raw.capital_social || 0,
      capitalSocialFormatado: this.formatarMoeda(raw.capital_social),

      // Tributário (Minha Receita não retorna estes dados)
      regimeTributario: "Nao Informado",
      opcaoSimples: null,
      dataOpcaoSimples: null,
      dataExclusaoSimples: null,
      opcaoMei: null,
      dataOpcaoMei: null,
      dataExclusaoMei: null,

      // Contatos
      telefones: this.extrairTelefones(raw),
      email: raw.email || "",

      // Sócios
      socios: (raw.qsa || []).map((s) => ({
        nome: s.nome_socio || "",
        cpfCnpj: s.cnpj_cpf_do_socio || "",
        qualificacao: s.qualificacao_socio || "",
        dataEntrada: "",
        pais: s.pais || "",
        faixaEtaria: s.faixa_etaria || "",
        representanteLegal: s.nome_representante_legal || "",
        nomeFaixaEtaria: s.qualificacao_representante_legal || "",
      })),

      apiUsed: "minhareceita",
      fromCache: false,
    };
  }

  // Helpers de formatação

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
    return Number(v).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  situacaoCodigo(descricao) {
    const d = String(descricao || "").toLowerCase();
    if (d.includes("ativa")) return 2;
    if (d.includes("suspensa")) return 4;
    if (d.includes("inapta")) return 8;
    if (d.includes("baixada")) return 1;
    return 0;
  }

  extrairTelefones(raw) {
    const telefones = [];
    for (let i = 1; i <= 2; i++) {
      const ddd = raw[`ddd_telefone_${i}`];
      const num = raw[`telefone_${i}`];
      if (ddd || num) {
        telefones.push({ ddd: ddd || "", numero: num || "", tipo: "" });
      }
    }
    return telefones;
  }
}

module.exports = { MinhaReceitaAdapter };
