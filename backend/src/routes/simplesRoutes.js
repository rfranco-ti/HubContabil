const express = require("express");
const router = express.Router();
const {
  consultaSimples,
  baixaComprovante,
} = require("../controllers/simplesController");
const { protect } = require("../middlewares/authMiddleware");

/**
 * @route   GET /api/simples/:cnpj
 * @desc    Consulta Simples Nacional e MEI
 * @access  Private
 */
router.get("/:cnpj", protect, consultaSimples);

/**
 * @route   GET /api/simples/certificate/:cnpj
 * @desc    Baixa comprovante PDF do Simples Nacional
 * @access  Private
 */
router.get("/certificate/:cnpj", protect, baixaComprovante);

module.exports = router;
