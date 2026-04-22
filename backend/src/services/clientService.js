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
      certificado_digital,
      servicos_prestados,
      tem_contabil,
      tem_fiscal,
      tem_dp,
      capital_social,
      porte,
      situacao_data,
      situacao_motivo,
      opcao_simples,
      data_opcao_simples,
      data_exclusao_simples,
      motivo_exclusao_simples,
      data_opcao_mei,
      data_exclusao_mei,
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

        capitalSocial: capital_social ? Number(capital_social) : 0,
        porte: porte || null,
        situacaoData: situacao_data || null,
        situacaoMotivo: situacao_motivo || null,
        opcaoSimples: opcao_simples || false,
        dataOpcaoSimples: data_opcao_simples || null,
        dataExclusaoSimples: data_exclusao_simples || null,
        motivoExclusaoSimples: motivo_exclusao_simples || null,
        dataOpcaoMei: data_opcao_mei || null,
        dataExclusaoMei: data_exclusao_mei || null,

        certificadoPossui: certificado_digital?.possui || false,
        certificadoSenha: certificado_digital?.senha || null,
        certificadoEmissao: certificado_digital?.emissao ? new Date(certificado_digital.emissao) : null,
        certificadoVencimento: certificado_digital?.vencimento ? new Date(certificado_digital.vencimento) : null,

        pastas: {
          create: [
            { nome: "Certificado Digital" },
            { nome: "Junta Comercial" },
            { nome: "Departamento Pessoal" },
            { nome: "Departamento Fiscal" },
            { nome: "Diversos" },
          ]
        },

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
            dataEntrada: s.data_entrada || "",
            pais: s.pais || "",
            representanteLegal: s.representante_legal || "",
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
      capital_social,
      porte,
      situacao_data,
      situacao_motivo,
      opcao_simples,
      data_opcao_simples,
      data_exclusao_simples,
      motivo_exclusao_simples,
      data_opcao_mei,
      data_exclusao_mei,
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
        certificadoEmissao: certificado_digital?.emissao !== undefined ? (certificado_digital.emissao ? new Date(certificado_digital.emissao) : null) : undefined,
        certificadoVencimento: certificado_digital?.vencimento !== undefined ? (certificado_digital.vencimento ? new Date(certificado_digital.vencimento) : null) : undefined,
        honorariosValor: honorarios?.valor,
        honorariosDiaVencimento: honorarios?.dia_vencimento,
        servicosPrestados: servicos_prestados,
        temContabil: tem_contabil,
        temFiscal: tem_fiscal,
        temDp: tem_dp,

        capitalSocial: capital_social !== undefined ? Number(capital_social) : undefined,
        porte: porte,
        situacaoData: situacao_data,
        situacaoMotivo: situacao_motivo,
        opcaoSimples: opcao_simples,
        dataOpcaoSimples: data_opcao_simples,
        dataExclusaoSimples: data_exclusao_simples,
        motivoExclusaoSimples: motivo_exclusao_simples,
        dataOpcaoMei: data_opcao_mei,
        dataExclusaoMei: data_exclusao_mei,

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
            dataEntrada: s.data_entrada || "",
            pais: s.pais || "",
            representanteLegal: s.representante_legal || "",
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
      id: client.id,
      _id: client.id,
      cnpj: client.cnpj,
      razao_social: client.razaoSocial,
      nome_fantasia: client.nomeFantasia,
      honorariosValor: Number(client.honorariosValor || 0),
      data_abertura: client.dataAbertura,
      natureza_juridica: client.naturezaJuridica,
      inscricao_estadual: client.inscricaoEstadual,
      inscricao_municipal: client.inscricaoMunicipal,
      nire: client.nire,
      situacao_sefaz: client.situacaoSefaz,
      situacao_sefaz_estadual: client.situacaoSefazEstadual,
      situacao_sefaz_municipal: client.situacaoSefazMunicipal,
      regime_tributario: client.regimeTributario,
      capital_social: Number(client.capitalSocial || 0),
      porte: client.porte,
      situacao_data: client.situacaoData,
      situacao_motivo: client.situacaoMotivo,
      opcao_simples: client.opcaoSimples,
      data_opcao_simples: client.dataOpcaoSimples,
      data_exclusao_simples: client.dataExclusaoSimples,
      motivo_exclusao_simples: client.motivoExclusaoSimples,
      data_opcao_mei: client.dataOpcaoMei,
      data_exclusao_mei: client.dataExclusaoMei,
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
      qsa: (client.qsa || []).map(s => ({
        ...s,
        cpf_cnpj: s.cpfCnpj,
        data_entrada: s.dataEntrada,
        representante_legal: s.representanteLegal
      })),
      senhas_portais: client.senhasPortais,
      certificado_digital: {
        possui: client.certificadoPossui,
        senha: client.certificadoSenha,
        emissao: client.certificadoEmissao,
        vencimento: client.certificadoVencimento,
      },
      financeiro: {
        honorario_valor: Number(client.honorariosValor || 0),
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
