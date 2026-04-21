/**
 * Middleware de validação genérico para Zod
 * @param {import('zod').AnyZodObject} schema 
 */
const validate = (schema) => async (req, res, next) => {
  try {
    await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    return next();
  } catch (error) {
    // O errorHandler global já trata ZodError,
    // então apenas passamos o erro adiante.
    return next(error);
  }
};

module.exports = validate;
