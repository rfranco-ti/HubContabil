const express = require("express");
const router = express.Router();
const { chat } = require("../controllers/chatController");
const { protect } = require("../middlewares/authMiddleware");

/**
 * @route   POST /api/chat
 * @desc    Enviar mensagem ao chatbot contábil com IA
 * @access  Private (autenticado)
 */
router.post("/", protect, chat);

module.exports = router;
