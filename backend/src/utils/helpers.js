/**
 * Funções auxiliares utilitárias
 */

/**
 * Formatar resposta de sucesso padronizada
 * @param {number} statusCode - Código HTTP
 * @param {object} data - Dados da resposta
 * @param {string} message - Mensagem opcional
 * @returns {object} Resposta formatada
 */
const successResponse = (data, message = null) => {
  const response = {
    success: true,
    data
  };
  
  if (message) {
    response.message = message;
  }
  
  return response;
};

/**
 * Formatar resposta de erro padronizada
 * @param {string} message - Mensagem de erro
 * @param {array} errors - Lista de erros detalhados
 * @returns {object} Resposta de erro
 */
const errorResponse = (message, errors = null) => {
  const response = {
    success: false,
    message
  };
  
  if (errors) {
    response.errors = errors;
  }
  
  return response;
};

/**
 * Remover caracteres especiais de CNPJ
 * @param {string} cnpj - CNPJ formatado ou não
 * @returns {string} CNPJ apenas com números
 */
const cleanCnpj = (cnpj) => {
  return cnpj.replace(/\D/g, '');
};

/**
 * Remover caracteres especiais de CPF
 * @param {string} cpf - CPF formatado ou não
 * @returns {string} CPF apenas com números
 */
const cleanCpf = (cpf) => {
  return cpf.replace(/\D/g, '');
};

/**
 * Formatar CNPJ (XX.XXX.XXX/XXXX-XX)
 * @param {string} cnpj - CNPJ com 14 dígitos
 * @returns {string} CNPJ formatado
 */
const formatCnpj = (cnpj) => {
  const clean = cleanCnpj(cnpj);
  if (clean.length !== 14) return cnpj;
  return clean.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
};

/**
 * Formatar CPF (XXX.XXX.XXX-XX)
 * @param {string} cpf - CPF com 11 dígitos
 * @returns {string} CPF formatado
 */
const formatCpf = (cpf) => {
  const clean = cleanCpf(cpf);
  if (clean.length !== 11) return cpf;
  return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

/**
 * Sleep/Pause assíncrono
 * @param {number} ms - Milissegundos
 * @returns {Promise<void>}
 */
const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Retry com exponential backoff
 * @param {function} fn - Função async para executar
 * @param {number} maxRetries - Número máximo de tentativas
 * @param {number} delay - Delay inicial em ms
 * @returns {Promise<*>} Resultado da função
 */
const retryWithBackoff = async (fn, maxRetries = 3, delay = 1000) => {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries - 1) throw error;
      const backoff = delay * Math.pow(2, attempt);
      console.warn(`Tentativa ${attempt + 1} falhou. Retentando em ${backoff}ms...`);
      await sleep(backoff);
    }
  }
};

/**
 * Sanitizar string (remover caracteres perigosos)
 * @param {string} str - String para sanitizar
 * @returns {string} String sanitizada
 */
const sanitizeString = (str) => {
  if (!str || typeof str !== 'string') return str;
  return str
    .replace(/[<>\"'&]/g, '') // Remover caracteres HTML/SQL injection
    .trim()
    .substring(0, 500); // Limitar tamanho
};

/**
 * Paginar array
 * @param {array} data - Array completo
 * @param {number} page - Número da página
 * @param {number} limit - Itens por página
 * @returns {object} Dados paginados com metadados
 */
const paginateArray = (data, page = 1, limit = 20) => {
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const start = (pageNum - 1) * limitNum;
  const end = start + limitNum;
  
  return {
    data: data.slice(start, end),
    metadata: {
      page: pageNum,
      limit: limitNum,
      total: data.length,
      pages: Math.ceil(data.length / limitNum)
    }
  };
};

module.exports = {
  successResponse,
  errorResponse,
  cleanCnpj,
  cleanCpf,
  formatCnpj,
  formatCpf,
  sleep,
  retryWithBackoff,
  sanitizeString,
  paginateArray
};
