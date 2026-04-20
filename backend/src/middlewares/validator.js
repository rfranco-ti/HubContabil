const { AppError } = require('./errorHandler');

/**
 * Middleware de validação com Zod
 * @param {import('zod').ZodSchema} schema - Schema Zod para validação
 * @returns {function} Middleware Express
 */
const validate = (schema) => {
  return (req, res, next) => {
    try {
      // Validar body se presente
      if (schema.body && req.body) {
        schema.body.parse(req.body);
      }
      
      // Validar params se presente
      if (schema.params && req.params) {
        schema.params.parse(req.params);
      }
      
      // Validar query se presente
      if (schema.query && req.query) {
        schema.query.parse(req.query);
      }

      next();
    } catch (error) {
      next(error); // Enviar para errorHandler
    }
  };
};

module.exports = validate;
