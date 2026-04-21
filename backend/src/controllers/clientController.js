const ClientService = require("../services/clientService");
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
      message: error.message || "Erro ao consultar CNPJ. Tente novamente mais tarde.",
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
      message: error.message || "Erro ao consultar CNPJ. Tente novamente mais tarde.",
    });
  }
};

// @desc    Registrar nova empresa no banco de dados local
// @route   POST /api/clientes
// @access  Private
const criarCliente = async (req, res) => {
  try {
    const cliente = await ClientService.create(req.body);
    res.status(201).json(cliente);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      message: error.message || "Erro ao registrar cliente",
      error: error.message
    });
  }
};

// @desc    Listar todos as empresas cadastradas
// @route   GET /api/clientes
// @access  Private
const getClientes = async (req, res) => {
  try {
    const clientes = await ClientService.getAll();
    res.json(clientes);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar clientes", error: error.message });
  }
};

// @desc    Buscar apenas UMA empresa pelo id
// @route   GET /api/clientes/:id
// @access  Private
const getClienteById = async (req, res) => {
  try {
    const cliente = await ClientService.getById(req.params.id);
    res.json(cliente);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ message: error.message });
  }
};

// @desc    Atualizar os dados de um cliente (Edit / UPDATE)
// @route   PUT /api/clientes/:id
// @access  Private
const atualizarCliente = async (req, res) => {
  try {
    const clienteAtualizado = await ClientService.update(req.params.id, req.body);
    res.json(clienteAtualizado);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ message: error.message });
  }
};

// @desc    Deletar permanentemente uma empresa
// @route   DELETE /api/clientes/:id
// @access  Private
const deletarCliente = async (req, res) => {
  try {
    const result = await ClientService.delete(req.params.id);
    res.json(result);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ message: error.message });
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
