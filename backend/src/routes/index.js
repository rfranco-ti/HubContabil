const express = require("express");
const router = express.Router();

// Importação de todas as rotas
const authRoutes = require("./authRoutes");
const clientRoutes = require("./clientRoutes");
const rpaRoutes = require("./rpaRoutes");
const gedRoutes = require("./gedRoutes");
const documentoRoutes = require("./documentoRoutes");
const reciboRoutes = require("./reciboRoutes");
const eventoRoutes = require("./eventoRoutes");
const stickyNotesRoutes = require("./stickyNotesRoutes");
const conversaoRoutes = require("./conversaoRoutes");
const calendarioContabilRoutes = require("./calendarioContabilRoutes");
const documentoGeradoRoutes = require("./documentoGeradoRoutes");
const tipoEventoRoutes = require("./tipoEventoRoutes");
const feriadoRoutes = require("./feriadoRoutes");
const notificacaoRoutes = require("./notificacaoRoutes");
const calculosRoutes = require("./calculosRoutes");
const dashboardRoutes = require("./dashboardRoutes");
const usuarioRoutes = require("./usuarioRoutes");
const logRoutes = require("./logRoutes");
const agendamentoRoutes = require("./agendamentoRoutes");
const apiKeyRoutes = require("./apiKeyRoutes");
const simplesRoutes = require("./simplesRoutes");
const chatRoutes = require("./chatRoutes");

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Autenticação e autorização de usuários
 *   - name: Clientes
 *     description: Gestão de clientes e empresas
 *   - name: RPA
 *     description: Automação robótica de processos (Simples Nacional, SEFAZ)
 *   - name: GED
 *     description: Gestão Eletrônica de Documentos (upload, OCR)
 *   - name: Documentos
 *     description: Gestão de documentos contábeis
 *   - name: Recibos
 *     description: Geração e gestão de recibos
 *   - name: Eventos
 *     description: Eventos e compromissos do calendário
 *   - name: Notas
 *     description: Notas adesivas (sticky notes)
 *   - name: Conversões
 *     description: Conversão de arquivos (PDF, imagens, etc)
 *   - name: Calendário
 *     description: Calendário contábil e obrigações acessórias
 *   - name: Documentos Gerados
 *     description: Histórico de documentos gerados pelo sistema
 */

// Registro de todas as rotas
router.use("/auth", authRoutes);
router.use("/clientes", clientRoutes);
router.use("/rpa", rpaRoutes);
router.use("/ged", gedRoutes);
router.use("/documentos", documentoRoutes);
router.use("/recibo", reciboRoutes);
router.use("/eventos", eventoRoutes);
router.use("/notas", stickyNotesRoutes);
router.use("/conversoes", conversaoRoutes);
router.use("/calendario", calendarioContabilRoutes);
router.use("/documentos-gerados", documentoGeradoRoutes);
router.use("/tipos-evento", tipoEventoRoutes);
router.use("/feriados", feriadoRoutes);
router.use("/notificacoes", notificacaoRoutes);
router.use("/calculos", calculosRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/usuarios", usuarioRoutes);
router.use("/logs", logRoutes);

/**
 * @swagger
 * tags:
 *   - name: Agendamentos
 *     description: Agendamento de robôs RPA
 *   - name: API Keys
 *     description: Gestão de chaves de API
 */

// Registro de todas as rotas
router.use("/agendamentos", agendamentoRoutes);
router.use("/api-keys", apiKeyRoutes);
router.use("/simples", simplesRoutes);
router.use("/chat", chatRoutes);

module.exports = router;
