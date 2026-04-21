const prisma = require("../config/prisma");
const { AppError } = require("../middlewares/errorHandler");

class ClientService {
  /**
   * Buscar todos os clientes com mapeamento para formato legado do frontend
   */
  static async getAll() {
    const clients = await prisma.client.findMany({
      orderBy: { razaoSocial: "asc" },
      include: {
        cnaesSecundarios: true,
        qsa: true,
        contatos: true,
      },
    });

    return clients.map(this.formatForFrontend);
  }

  /**
   * Buscar cliente por ID com mapeamento
   */
  static async getById(id) {
    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        cnaesSecundarios: true,
        qsa: true,
        contatos: true,
        pastas: true,
      },
    });

    if (!client) {
      throw new AppError("Cliente não encontrado na base.", 404);
    }

    return this.formatForFrontend(client);
  }

  /**
   * Criar novo cliente com validação de duplicidade
   */
  static async create(data) {
    const cleanCnpj = data.cnpj.replace(/\D/g, "");

    // Verificar duplicidade
    const existing = await prisma.client.findUnique({
      where: { cnpj: cleanCnpj },
    });

    if (existing) {
      throw new AppError("Um cliente com este CNPJ já está cadastrado.", 409);
    }

    const {
      razao_social,
      nome_fantasia,
      data_abertura,
      natureza_juridica,
      inscricao_estadual,
      inscricao_municipal,
      situacao_sefaz_estadual,
      situacao_sefaz_municipal,
      regime_tributario,
      cnae_principal,
      cnaes_secundarios,
      endereco,
      contato_principal,
      contatos,
      qsa,
      categoria,
      is_bpo,
      is_mei,
      observacoes,
      status,
      honorarios,
      servicos_prestados,
      tem_contabil,
      tem_fiscal,
      tem_dp,
    } = data;

    const client = await prisma.client.create({
      data: {
        cnpj: cleanCnpj,
        razaoSocial: razao_social || "",
        nomeFantasia: nome_fantasia || "",
        dataAbertura: data_abertura || null,
        naturezaJuridica: natureza_juridica || "",
        inscricaoEstadual: inscricao_estadual || "",
        inscricaoMunicipal: inscricao_municipal || "",
        situacaoSefazEstadual: situacao_sefaz_estadual || null,
        situacaoSefazMunicipal: situacao_sefaz_municipal || null,
        regimeTributario: regime_tributario || "Não Enquadrado",

        cnaePrincipalCodigo: cnae_principal?.codigo || "",
        cnaePrincipalDescricao: cnae_principal?.descricao || "",

        enderecoCep: endereco?.cep || "",
        enderecoLogradouro: endereco?.logradouro || "",
        enderecoNumero: endereco?.numero || "",
        enderecoComplemento: endereco?.complemento || "",
        enderecoBairro: endereco?.bairro || "",
        enderecoCidade: endereco?.cidade || "",
        enderecoUf: endereco?.uf || "",

        contatoEmail: contato_principal?.email || "",
        contatoTelefone: contato_principal?.telefone || "",

        categoria: categoria || "Serviços",
        isBpo: is_bpo || false,
        isMei: is_mei || false,
        observacoes: observacoes || "",
        status: status || "Ativo",
        honorariosValor: honorarios?.valor || 0,
        honorariosDiaVencimento: honorarios?.dia_vencimento || null,
        servicosPrestados: servicos_prestados || "",
        temContabil: tem_contabil || false,
        temFiscal: tem_fiscal || false,
        temDp: tem_dp || false,

        contatos: contatos?.length ? {
          create: contatos.map(c => ({
            nome: c.nome || "",
            email: c.email || "",
            telefone: c.telefone || "",
            cargo: c.cargo || "",
            ehPrincipal: c.ehPrincipal || false,
          })),
        } : undefined,

        cnaesSecundarios: cnaes_secundarios?.length ? {
          create: cnaes_secundarios.map(c => ({
            codigo: c.codigo || "",
            descricao: c.descricao || "",
          })),
        } : undefined,

        qsa: qsa?.length ? {
          create: qsa.map(s => ({
            nome: s.nome || "",
            cpfCnpj: s.cpf_cnpj || "",
            qualificacao: s.qualificacao || "",
            participacao: s.participacao || 0,
          })),
        } : undefined,
      },
      include: {
        contatos: true,
        cnaesSecundarios: true,
        qsa: true,
      },
    });

    return this.formatForFrontend(client);
  }

  /**
   * Atualizar cliente existente
   */
  static async update(id, data) {
    const existing = await prisma.client.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError("Cliente não encontrado para edição.", 404);
    }

    const {
      razao_social,
      nome_fantasia,
      data_abertura,
      natureza_juridica,
      inscricao_estadual,
      inscricao_municipal,
      nire,
      situacao_sefaz,
      regime_tributario,
      cnae_principal,
      cnaes_secundarios,
      endereco,
      contato_principal,
      contatos,
      qsa,
      categoria,
      is_bpo,
      is_mei,
      observacoes,
      status,
      honorarios,
      senhas_portais,
      certificado_digital,
      servicos_prestados,
      tem_contabil,
      tem_fiscal,
      tem_dp,
    } = data;

    const client = await prisma.client.update({
      where: { id },
      data: {
        razaoSocial: razao_social,
        nomeFantasia: nome_fantasia,
        dataAbertura: data_abertura,
        naturezaJuridica: natureza_juridica,
        inscricaoEstadual: inscricao_estadual,
        inscricaoMunicipal: inscricao_municipal,
        nire,
        situacaoSefaz: situacao_sefaz,
        regimeTributario: regime_tributario,
        categoria,
        isBpo: is_bpo,
        isMei: is_mei,
        observacoes,
        status,
        senhasPortais: senhas_portais,
        certificadoPossui: certificado_digital?.possui,
        certificadoSenha: certificado_digital?.senha,
        certificadoVencimento: certificado_digital?.vencimento,
        honorariosValor: honorarios?.valor,
        honorariosDiaVencimento: honorarios?.dia_vencimento,
        servicosPrestados: servicos_prestados,
        temContabil: tem_contabil,
        temFiscal: tem_fiscal,
        temDp: tem_dp,

        cnaePrincipalCodigo: cnae_principal?.codigo,
        cnaePrincipalDescricao: cnae_principal?.descricao,

        enderecoCep: endereco?.cep,
        enderecoLogradouro: endereco?.logradouro,
        enderecoNumero: endereco?.numero,
        enderecoComplemento: endereco?.complemento,
        enderecoBairro: endereco?.bairro,
        enderecoCidade: endereco?.cidade,
        enderecoUf: endereco?.uf,

        contatoEmail: contato_principal?.email,
        contatoTelefone: contato_principal?.telefone,

        contatos: contatos?.length ? {
          deleteMany: {},
          create: contatos.map(c => ({
            nome: c.nome || "",
            email: c.email || "",
            telefone: c.telefone || "",
            cargo: c.cargo || "",
            ehPrincipal: c.ehPrincipal || false,
          })),
        } : undefined,

        cnaesSecundarios: cnaes_secundarios?.length ? {
          deleteMany: {},
          create: cnaes_secundarios.map(c => ({
            codigo: c.codigo || "",
            descricao: c.descricao || "",
          })),
        } : undefined,

        qsa: qsa?.length ? {
          deleteMany: {},
          create: qsa.map(s => ({
            nome: s.nome || "",
            cpfCnpj: s.cpf_cnpj || "",
            qualificacao: s.qualificacao || "",
            participacao: s.participacao || 0,
          })),
        } : undefined,
      },
      include: {
        contatos: true,
        cnaesSecundarios: true,
        qsa: true,
      },
    });

    return this.formatForFrontend(client);
  }

  /**
   * Deletar cliente
   */
  static async delete(id) {
    const existing = await prisma.client.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError("Cliente já não existe.", 404);
    }

    await prisma.client.delete({ where: { id } });
    return { message: "Cliente excluído com sucesso do Hub." };
  }

  /**
   * Mapper para converter modelo do Prisma para o formato esperado pelo Frontend (Legado)
   */
  static formatForFrontend(client) {
    return {
      _id: client.id,
      cnpj: client.cnpj,
      razao_social: client.razaoSocial,
      nome_fantasia: client.nomeFantasia,
      data_abertura: client.dataAbertura,
      natureza_juridica: client.naturezaJuridica,
      inscricao_estadual: client.inscricaoEstadual,
      inscricao_municipal: client.inscricaoMunicipal,
      nire: client.nire,
      situacao_sefaz: client.situacaoSefaz,
      situacao_sefaz_estadual: client.situacaoSefazEstadual,
      situacao_sefaz_municipal: client.situacaoSefazMunicipal,
      regime_tributario: client.regimeTributario,
      cnae_principal: {
        codigo: client.cnaePrincipalCodigo,
        descricao: client.cnaePrincipalDescricao,
      },
      cnaes_secundarios: client.cnaesSecundarios,
      endereco: {
        cep: client.enderecoCep,
        logradouro: client.enderecoLogradouro,
        numero: client.enderecoNumero,
        complemento: client.enderecoComplemento,
        bairro: client.enderecoBairro,
        cidade: client.enderecoCidade,
        uf: client.enderecoUf,
      },
      contato_principal: {
        email: client.contatoEmail,
        telefone: client.contatoTelefone,
      },
      contatos: client.contatos,
      qsa: client.qsa,
      senhas_portais: client.senhasPortais,
      certificado_digital: {
        possui: client.certificadoPossui,
        senha: client.certificadoSenha,
        vencimento: client.certificadoVencimento,
      },
      financeiro: {
        honorario_valor: client.honorariosValor,
        honorario_dia_vencimento: client.honorariosDiaVencimento,
        servicos_prestados: client.servicosPrestados,
        tem_contabil: client.temContabil,
        tem_fiscal: client.temFiscal,
        tem_dp: client.temDp,
      },
      categoria: client.categoria,
      is_bpo: client.isBpo,
      is_mei: client.isMei,
      observacoes: client.observacoes,
      status: client.status,
      usuario_responsavel: client.usuarioResponsavelId,
      createdAt: client.createdAt,
      updatedAt: client.updatedAt,
    };
  }
}

module.exports = ClientService;
