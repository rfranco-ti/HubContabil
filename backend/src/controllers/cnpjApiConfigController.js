const prisma = require("../config/prisma");
const cnpjService = require("../services/cnpj");

// GET /api/cnpj-api-config
async function getConfigs(req, res) {
  try {
    const configs = await prisma.cnpjApiConfig.findMany({
      orderBy: { ordem: "asc" },
    });
    res.json(configs);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar configurações", error: error.message });
  }
}

// PUT /api/cnpj-api-config/:id
async function updateConfig(req, res) {
  try {
    const { id } = req.params;
    const { ativa, ordem, timeout, cbThreshold } = req.body;

    const updated = await prisma.cnpjApiConfig.update({
      where: { id },
      data: {
        ...(ativa !== undefined && { ativa }),
        ...(ordem !== undefined && { ordem: parseInt(ordem) }),
        ...(timeout !== undefined && { timeout: parseInt(timeout) }),
        ...(cbThreshold !== undefined && { cbThreshold: parseInt(cbThreshold) }),
      },
    });

    // Invalidar cache do orquestrador
    cnpjService.invalidateConfig();

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Erro ao atualizar configuração", error: error.message });
  }
}

// PUT /api/cnpj-api-config/reorder
async function reorderConfigs(req, res) {
  try {
    const { order } = req.body; // [{ id, ordem }, ...]

    const updates = order.map((item) =>
      prisma.cnpjApiConfig.update({
        where: { id: item.id },
        data: { ordem: item.ordem },
      }),
    );

    await prisma.$transaction(updates);
    cnpjService.invalidateConfig();

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: "Erro ao reordenar configurações", error: error.message });
  }
}

module.exports = { getConfigs, updateConfig, reorderConfigs };
