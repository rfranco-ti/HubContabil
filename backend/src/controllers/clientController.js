const prisma = require("../config/prisma");
const cnpjCache = require("../services/cnpjCacheService");
const cnpjService = require("../services/cnpj/index.js");

// @desc    Consultar CNPJ na API externa (com fallback automático + cache)
// @route   GET /api/clientes/consulta/:cnpj
// @access  Private
const consultarCnpjApi = async (req, res) => {
  try {
    const { cnpj } = req.params;

    const data = await cnpjService.consultar(cnpj);

    return res.json({
      success: true,
      data,
      message: data.fromCache
        ? "Dados retornados do cache"
        : `Dados retornados da API ${data.apiUsed}`,
    });
  } catch (error) {
    console.error("Erro ao consultar CNPJ:", error.message);
    return res.status(500).json({
      success: false,
      message:
        error.message || "Erro ao consultar CNPJ. Tente novamente mais tarde.",
    });
  }
};

// @desc    Consultar CNPJ nas APIs externas (ignora cache)
// @route   GET /api/clientes/consulta-fresh/:cnpj
// @access  Private
const consultarCnpjFresh = async (req, res) => {
  try {
    const { cnpj } = req.params;

    const data = await cnpjService.consultarFresh(cnpj);

    return res.json({
      success: true,
      data,
      message: `Dados retornados da API ${data.apiUsed}`,
    });
  } catch (error) {
    console.error("Erro ao consultar CNPJ:", error.message);
    return res.status(500).json({
      success: false,
      message:
        error.message || "Erro ao consultar CNPJ. Tente novamente mais tarde.",
    });
  }
};

// @desc    Registrar nova empresa no banco de dados local
// @route   POST /api/clientes
// @access  Private
const criarCliente = async (req, res) => {
  try {
    const { cnpj } = req.body;

    if (!cnpj) {
      return res.status(400).json({ message: "CNPJ é obrigatório." });
    }

    const cleanCnpj = cnpj.replace(/\D/g, "");

    // Verificar cliente existente
    const clienteExistente = await prisma.client.findUnique({
      where: { cnpj: cleanCnpj },
    });

    if (clienteExistente) {
      return res
        .status(400)
        .json({ message: "Um cliente com este CNPJ já está cadastrado." });
    }

    // Extrair dados do body
    const {
      razao_social,
      nome_fantasia,
      data_abertura,
      natureza_juridica,
      inscricao_estadual,
      inscricao_municipal,
      regime_tributario,
      cnae_principal,
      cnaes_secundarios,
      endereco,
      contato_principal,
      contatos,
      qsa,
      categoria,
      is_bpo,
      observacoes,
      status,
    } = req.body;

    console.log("📋 Dados recebidos:", {
      cnpj: cleanCnpj,
      razao_social,
      cnaes_secundarios: cnaes_secundarios?.length,
      contatos: contatos?.length,
      qsa: qsa?.length,
    });

    // Criar cliente com dados aninhados
    const cliente = await prisma.client.create({
      data: {
        cnpj: cleanCnpj,
        razaoSocial: razao_social || "",
        nomeFantasia: nome_fantasia || "",
        dataAbertura: data_abertura || null,
        naturezaJuridica: natureza_juridica || "",
        inscricaoEstadual: inscricao_estadual || "",
        inscricaoMunicipal: inscricao_municipal || "",
        regimeTributario: regime_tributario || "Outro",

        // CNAE Principal
        cnaePrincipalCodigo: cnae_principal?.codigo || "",
        cnaePrincipalDescricao: cnae_principal?.descricao || "",

        // Endereço
        enderecoCep: endereco?.cep || "",
        enderecoLogradouro: endereco?.logradouro || "",
        enderecoNumero: endereco?.numero || "",
        enderecoComplemento: endereco?.complemento || "",
        enderecoBairro: endereco?.bairro || "",
        enderecoCidade: endereco?.cidade || "",
        enderecoUf: endereco?.uf || "",

        // Contato Principal (legado)
        contatoEmail: contato_principal?.email || "",
        contatoTelefone: contato_principal?.telefone || "",

        // Categoria e Status
        categoria: categoria || "Serviços",
        isBpo: is_bpo || false,
        observacoes: observacoes || "",
        status: status || "Ativo",

        // Contatos Múltiplos
        contatos: contatos?.length
          ? {
              create: contatos.map((contato) => ({
                nome: contato.nome || "",
                email: contato.email || "",
                telefone: contato.telefone || "",
                cargo: contato.cargo || "",
                ehPrincipal: contato.ehPrincipal || false,
              })),
            }
          : undefined,

        // CNAEs Secundários
        cnaesSecundarios: cnaes_secundarios?.length
          ? {
              create: cnaes_secundarios.map((cnae) => ({
                codigo: cnae.codigo || "",
                descricao: cnae.descricao || "",
              })),
            }
          : undefined,

        // QSA
        qsa: qsa?.length
          ? {
              create: qsa.map((socio) => ({
                nome: socio.nome || "",
                cpfCnpj: socio.cpf_cnpj || "",
                qualificacao: socio.qualificacao || "",
                participacao: socio.participacao || 0,
              })),
            }
          : undefined,
      },
      include: {
        contatos: true,
        cnaesSecundarios: true,
        qsa: true,
      },
    });

    console.log("✅ Cliente criado:", cliente.id);
    res.status(201).json(cliente);
  } catch (error) {
    console.error("❌ Erro ao criar cliente:", error);
    console.error("Stack:", error.stack);
    res.status(500).json({
      message: "Erro ao registrar cliente",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// @desc    Listar todos as empresas cadastradas
// @route   GET /api/clientes
// @access  Private
const getClientes = async (req, res) => {
  try {
    const clientes = await prisma.client.findMany({
      orderBy: { razaoSocial: "asc" },
      include: {
        cnaesSecundarios: true,
        qsa: true,
        contatos: true,
      },
    });

    // Mapear para formato compatível com frontend
    const clientesFormatados = clientes.map((cliente) => ({
      _id: cliente.id,
      cnpj: cliente.cnpj,
      razao_social: cliente.razaoSocial,
      nome_fantasia: cliente.nomeFantasia,
      data_abertura: cliente.dataAbertura,
      natureza_juridica: cliente.naturezaJuridica,
      inscricao_estadual: cliente.inscricaoEstadual,
      inscricao_municipal: cliente.inscricaoMunicipal,
      regime_tributario: cliente.regimeTributario,
      cnae_principal: {
        codigo: cliente.cnaePrincipalCodigo,
        descricao: cliente.cnaePrincipalDescricao,
      },
      cnaes_secundarios: cliente.cnaesSecundarios,
      endereco: {
        cep: cliente.enderecoCep,
        logradouro: cliente.enderecoLogradouro,
        numero: cliente.enderecoNumero,
        complemento: cliente.enderecoComplemento,
        bairro: cliente.enderecoBairro,
        cidade: cliente.enderecoCidade,
        uf: cliente.enderecoUf,
      },
      contato_principal: {
        email: cliente.contatoEmail,
        telefone: cliente.contatoTelefone,
      },
      contatos: cliente.contatos,
      qsa: cliente.qsa,
      senhas_portais: cliente.senhasPortais,
      certificado_digital: {
        possui: cliente.certificadoPossui,
        senha: cliente.certificadoSenha,
        vencimento: cliente.certificadoVencimento,
      },
      honorarios: {
        valor: cliente.honorariosValor,
        dia_vencimento: cliente.honorariosDiaVencimento,
      },
      categoria: cliente.categoria,
      is_bpo: cliente.isBpo,
      observacoes: cliente.observacoes,
      status: cliente.status,
      usuario_responsavel: cliente.usuarioResponsavelId,
      createdAt: cliente.createdAt,
      updatedAt: cliente.updatedAt,
    }));

    res.json(clientesFormatados);
  } catch (error) {
    console.error("Erro ao buscar clientes:", error);
    res
      .status(500)
      .json({ message: "Erro ao buscar clientes", error: error.message });
  }
};

// @desc    Buscar apenas UMA empresa pelo id
// @route   GET /api/clientes/:id
// @access  Private
const getClienteById = async (req, res) => {
  try {
    const cliente = await prisma.client.findUnique({
      where: { id: req.params.id },
      include: {
        cnaesSecundarios: true,
        qsa: true,
        contatos: true,
        pastas: true,
      },
    });

    if (!cliente) {
      return res
        .status(404)
        .json({ message: "Cliente não encontrado na base." });
    }

    // Mapear para formato compatível com frontend
    const clienteFormatado = {
      _id: cliente.id,
      cnpj: cliente.cnpj,
      razao_social: cliente.razaoSocial,
      nome_fantasia: cliente.nomeFantasia,
      data_abertura: cliente.dataAbertura,
      natureza_juridica: cliente.naturezaJuridica,
      inscricao_estadual: cliente.inscricaoEstadual,
      inscricao_municipal: cliente.inscricaoMunicipal,
      nire: cliente.nire,
      situacao_sefaz: cliente.situacaoSefaz,
      regime_tributario: cliente.regimeTributario,
      cnae_principal: {
        codigo: cliente.cnaePrincipalCodigo,
        descricao: cliente.cnaePrincipalDescricao,
      },
      cnaes_secundarios: cliente.cnaesSecundarios,
      endereco: {
        cep: cliente.enderecoCep,
        logradouro: cliente.enderecoLogradouro,
        numero: cliente.enderecoNumero,
        complemento: cliente.enderecoComplemento,
        bairro: cliente.enderecoBairro,
        cidade: cliente.enderecoCidade,
        uf: cliente.enderecoUf,
      },
      contato_principal: {
        email: cliente.contatoEmail,
        telefone: cliente.contatoTelefone,
      },
      contatos: cliente.contatos,
      qsa: cliente.qsa,
      senhas_portais: cliente.senhasPortais,
      certificado_digital: {
        possui: cliente.certificadoPossui,
        senha: cliente.certificadoSenha,
        vencimento: cliente.certificadoVencimento,
      },
      honorarios: {
        valor: cliente.honorariosValor,
        dia_vencimento: cliente.honorariosDiaVencimento,
      },
      categoria: cliente.categoria,
      is_bpo: cliente.isBpo,
      observacoes: cliente.observacoes,
      status: cliente.status,
      usuario_responsavel: cliente.usuarioResponsavelId,
      createdAt: cliente.createdAt,
      updatedAt: cliente.updatedAt,
    };

    res.json(clienteFormatado);
  } catch (error) {
    console.error("Erro ao buscar cliente:", error);
    res
      .status(500)
      .json({ message: "Erro ao buscar cliente", error: error.message });
  }
};

// @desc    Atualizar os dados de um cliente (Edit / UPDATE)
// @route   PUT /api/clientes/:id
// @access  Private
const atualizarCliente = async (req, res) => {
  try {
    const cliente = await prisma.client.findUnique({
      where: { id: req.params.id },
    });

    if (!cliente) {
      return res
        .status(404)
        .json({ message: "Cliente não encontrado para edição." });
    }

    // Extrair dados do body e preparar para update
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
      observacoes,
      status,
      honorarios,
      senhas_portais,
      certificado_digital,
    } = req.body;

    const clienteAtualizado = await prisma.client.update({
      where: { id: req.params.id },
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
        observacoes,
        status,
        senhasPortais: senhas_portais,
        certificadoPossui: certificado_digital?.possui,
        certificadoSenha: certificado_digital?.senha,
        certificadoVencimento: certificado_digital?.vencimento,
        honorariosValor: honorarios?.valor,
        honorariosDiaVencimento: honorarios?.dia_vencimento,

        // CNAE Principal
        cnaePrincipalCodigo: cnae_principal?.codigo,
        cnaePrincipalDescricao: cnae_principal?.descricao,

        // Endereço
        enderecoCep: endereco?.cep,
        enderecoLogradouro: endereco?.logradouro,
        enderecoNumero: endereco?.numero,
        enderecoComplemento: endereco?.complemento,
        enderecoBairro: endereco?.bairro,
        enderecoCidade: endereco?.cidade,
        enderecoUf: endereco?.uf,

        // Contato Principal (legado)
        contatoEmail: contato_principal?.email,
        contatoTelefone: contato_principal?.telefone,

        // Contatos Múltiplos (nested operations)
        contatos: contatos?.length
          ? {
              deleteMany: {}, // Remove todos os existentes
              create: contatos.map((contato) => ({
                nome: contato.nome || "",
                email: contato.email || "",
                telefone: contato.telefone || "",
                cargo: contato.cargo || "",
                ehPrincipal: contato.ehPrincipal || false,
              })),
            }
          : undefined,

        // CNAEs Secundários
        cnaesSecundarios: cnaes_secundarios?.length
          ? {
              deleteMany: {},
              create: cnaes_secundarios.map((cnae) => ({
                codigo: cnae.codigo || "",
                descricao: cnae.descricao || "",
              })),
            }
          : undefined,

        // QSA
        qsa: qsa?.length
          ? {
              deleteMany: {},
              create: qsa.map((socio) => ({
                nome: socio.nome || "",
                cpfCnpj: socio.cpf_cnpj || "",
                qualificacao: socio.qualificacao || "",
                participacao: socio.participacao || 0,
              })),
            }
          : undefined,
      },
      include: {
        contatos: true,
        cnaesSecundarios: true,
        qsa: true,
      },
    });

    res.json(clienteAtualizado);
  } catch (error) {
    console.error("Erro ao salvar alterações do cliente:", error);
    res.status(500).json({
      message: "Erro ao salvar alterações do cliente.",
      error: error.message,
    });
  }
};

// @desc    Deletar permanentemente uma empresa
// @route   DELETE /api/clientes/:id
// @access  Private
const deletarCliente = async (req, res) => {
  try {
    const cliente = await prisma.client.findUnique({
      where: { id: req.params.id },
    });

    if (!cliente) {
      return res.status(404).json({ message: "Cliente já não existe." });
    }

    await prisma.client.delete({
      where: { id: req.params.id },
    });

    res.json({ message: "Cliente excluído com sucesso do Hub." });
  } catch (error) {
    console.error("Erro ao deletar:", error);
    res.status(500).json({ message: "Erro ao deletar", error: error.message });
  }
};

// @desc    Pesquisar empresas por Nome, Razão Social ou Nome Fantasia (bff.cnpja.com)
// @route   GET /api/clientes/pesquisa?query=Nome
// @access  Private
const pesquisarEmpresa = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res
        .status(400)
        .json({ message: "Termo de pesquisa é obrigatório (query)." });
    }

    const response = await fetch(
      `https://bff.cnpja.com/search?query=${encodeURIComponent(query)}`,
    );

    if (!response.ok) {
      return res
        .status(response.status)
        .json({ message: "Erro ao consultar bff.cnpja.com" });
    }

    const data = await response.json();
    return res.json(data);
  } catch (error) {
    return res.status(500).json({
      message: "Erro crítico na pesquisa de empresas",
      error: error.message,
    });
  }
};

module.exports = {
  consultarCnpjApi,
  consultarCnpjFresh,
  pesquisarEmpresa,
  criarCliente,
  getClientes,
  getClienteById,
  atualizarCliente,
  deletarCliente,
};
