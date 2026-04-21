const express = require('express');
const router = express.Router();
const { buscarSimplesNacional } = require('../controllers/rpa/SimplesNacionalController');
const { buscarSefazBahia, buscarInscricaoEstadualSefazBahia } = require('../controllers/rpa/SefazBahiaController');
const { buscarIptuSalvador } = require('../controllers/rpa/IptuSalvadorController');
const { buscarFichaCadastralSalvador } = require('../controllers/rpa/FichaCadastralController');
const { buscarInscricaoMunicipalSalvador } = require('../controllers/rpa/SalvadorMunicipalController');




/**
 * @swagger
 * /api/rpa/ficha-cadastral:
 *   post:
 *     summary: Consultar Ficha Cadastral Salvador
 *     description: Robô que acessa o portal da SEFAZ Salvador para consultar ficha cadastral resumida por CNPJ
 *     tags: [RPA]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [cnpj]
 *             properties:
 *               cnpj:
 *                 type: string
 *                 description: CNPJ da empresa
 *     responses:
 *       200:
 *         description: Consulta realizada com sucesso
 *       500:
 *         description: Erro no robô
 */
router.post('/ficha-cadastral', buscarFichaCadastralSalvador);

/**
 * @swagger
 * /api/rpa/iptu-salvador:
 *   post:
 *     summary: Consultar IPTU Salvador
 *     description: Robô que acessa o portal da SEFAZ Salvador para consultar dados do IPTU
 *     tags: [RPA]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [numeroIptu]
 *             properties:
 *               numeroIptu:
 *                 type: string
 *                 description: Número da Inscrição do IPTU
 *     responses:
 *       200:
 *         description: Consulta realizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sucesso:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 texto_extraido:
 *                   type: string
 *                 imagemRenderizada:
 *                   type: string
 *                 pdfBase64:
 *                   type: string
 *       400:
 *         description: Número do IPTU obrigatório
 *       500:
 *         description: Erro no robô de IPTU
 */
router.post('/iptu-salvador', buscarIptuSalvador);

/**
 * @swagger
 * /api/rpa/simples-nacional:
 *   post:
 *     summary: Consultar situação no Simples Nacional
 *     description: Robô que acessa o portal do Simples Nacional para consultar situação do CNPJ
 *     tags: [RPA]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [cnpj]
 *             properties:
 *               cnpj:
 *                 type: string
 *                 description: CNPJ da empresa
 *     responses:
 *       200:
 *         description: Consulta realizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sucesso:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 texto_extraido:
 *                   type: string
 *                   description: Texto extraído da página
 *                 imagemRenderizada:
 *                   type: string
 *                   description: Screenshot da página em base64
 *       400:
 *         description: CNPJ obrigatório
 *       500:
 *         description: Erro no robô do Simples Nacional
 */
router.post('/simples-nacional', buscarSimplesNacional);

/**
 * @swagger
 * /api/rpa/sefaz-ba:
 *   post:
 *     summary: Consultar cadastro na SEFAZ BA
 *     description: Robô que acessa o portal da SEFAZ Bahia para consulta cadastral
 *     tags: [RPA]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [cnpj]
 *             properties:
 *               cnpj:
 *                 type: string
 *                 description: CNPJ da empresa
 *     responses:
 *       200:
 *         description: Consulta realizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sucesso:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 texto_extraido:
 *                   type: string
 *                 imagemRenderizada:
 *                   type: string
 *                   description: Screenshot da página em base64
 *                 pdfBase64:
 *                   type: string
 *                   description: PDF da página em base64
 *       400:
 *         description: CNPJ obrigatório
 *       500:
 *         description: Erro no robô da SEFAZ BA
 */
router.post('/sefaz-ba', buscarSefazBahia);

/**
 * @swagger
 * /api/rpa/sefaz-ba/inscricao:
 *   post:
 *     summary: Consultar Inscrição Estadual na SEFAZ BA
 *     description: Robô que acessa o portal da SEFAZ Bahia para obter Inscrição Estadual
 *     tags: [RPA]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [cnpj]
 *             properties:
 *               cnpj:
 *                 type: string
 *                 description: CNPJ da empresa
 *     responses:
 *       200:
 *         description: Inscrição Estadual obtida com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sucesso:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 inscricaoEstadual:
 *                   type: string
 *                   description: Inscrição Estadual
 *                 situacaoCadastral:
 *                   type: string
 *                   description: Situação cadastral (ATIVO, INATIVO, etc)
 *       400:
 *         description: CNPJ obrigatório
 *       404:
 *         description: Inscrição Estadual não encontrada
 *       500:
 *         description: Erro no robô da SEFAZ BA
 */

router.post('/sefaz-ba/inscricao', buscarInscricaoEstadualSefazBahia);
router.post('/ficha-cadastral', buscarFichaCadastralSalvador);
router.post('/salvador/inscricao', buscarInscricaoMunicipalSalvador);

module.exports = router;

