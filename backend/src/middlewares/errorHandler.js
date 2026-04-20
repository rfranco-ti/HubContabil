const { StatusCodes } = require('http-status-codes');
const { logger } = require('./logger');

/**
 * Classe para erros personalizados da API
 * @extends Error
 */
class AppError extends Error {
  /**
   * @param {string} message - Mensagem de erro
   * @param {number} statusCode - Código HTTP do erro
   * @param {boolean} isOperational - Se é um erro operacional esperadoado
   */
  constructor(message, statusCode, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Middleware global de tratamento de erros
 * Centraliza toda resposta de erro da API
 */
const errorHandler = (err, req, res, next) => {
  // Logger do erro
  logger.error('Erro não tratado:', {
    error: err.message,
    stack: err.stack,
    path: req.originalUrl,
    method: req.method
  });

  // Default error response
  let statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  let message = err.message || 'Erro interno no servidor';
  let isOperational = err.isOperational !== undefined ? err.isOperational : false;

  // Erros do Prisma
  if (err.code === 'P2002') {
    statusCode = StatusCodes.CONFLICT;
    message = `Conflito: já existe um registro com ${err.meta?.target || 'estes dados'}`;
    isOperational = true;
  }

  if (err.code === 'P2025') {
    statusCode = StatusCodes.NOT_FOUND;
    message = 'Recurso não encontrado';
    isOperational = true;
  }

  // Erros de validação do Zod
  if (err.name === 'ZodError') {
    statusCode = StatusCodes.BAD_REQUEST;
    message = 'Erro de validação nos dados enviados';
    isOperational = true;
  }

  // Erros de JWT
  if (err.name === 'JsonWebTokenError') {
    statusCode = StatusCodes.UNAUTHORIZED;
    message = 'Token inválido';
    isOperational = true;
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = StatusCodes.UNAUTHORIZED;
    message = 'Token expirado';
    isOperational = true;
  }

  // Em produção, não expor stack trace de erros não-operacionais
  const response = {
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      details: err.details
    })
  };

  // Adicionar erros de validação do Zod se presentes
  if (err.name === 'ZodError' && err.errors) {
    response.errors = err.errors.map(e => ({
      field: e.path.join('.'),
      message: e.message
    }));
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
module.exports.AppError = AppError;
