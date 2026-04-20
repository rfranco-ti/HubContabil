/**
 * Middleware para configurar timezone Brasil em todas as requests
 */
const configTimezone = (req, res, next) => {
  // Configurar timezone para America/Sao_Paulo (UTC-3)
  process.env.TZ = 'America/Sao_Paulo';
  
  // Header informando o timezone
  res.setHeader('X-Timezone', 'America/Sao_Paulo');
  res.setHeader('X-Language', 'pt-BR');
  
  next();
};

module.exports = configTimezone;
