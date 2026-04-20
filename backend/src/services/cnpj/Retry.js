/**
 * Retry com Backoff Exponencial
 *
 * Faz retry automático de requisições que falharam,
 * com delay exponencial entre tentativas.
 */

/**
 * Sleep helper
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Fetch com timeout
 */
async function fetchWithTimeout(url, timeout) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

/**
 * Executa função com retry e backoff exponencial
 *
 * @param {Function} fn - Função async que retorna Promise<Response>
 * @param {Object} options - Configurações
 * @param {number} options.retries - Número máximo de tentativas
 * @param {number} options.baseDelay - Delay inicial em ms
 * @param {number} options.maxDelay - Delay máximo em ms
 * @returns {Promise<any>} Resultado da função
 */
async function retry(fn, { retries = 3, baseDelay = 500, maxDelay = 5000 } = {}) {
  let lastError;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const result = await fn();
      return result;
    } catch (error) {
      lastError = error;

      // Se é a última tentativa, não faz delay
      if (attempt === retries) break;

      // Backoff exponencial com jitter
      const delay = Math.min(
        baseDelay * Math.pow(2, attempt) + Math.random() * 100,
        maxDelay
      );

      console.log(`[Retry] Tentativa ${attempt + 1}/${retries} falhou (${error.message}). Aguardando ${Math.round(delay)}ms...`);
      await sleep(delay);
    }
  }

  throw lastError;
}

/**
 * Fetch com retry integrado
 */
async function fetchWithRetry(url, options, retryOptions = {}) {
  return retry(async () => {
    const response = await fetchWithTimeout(url, options?.timeout || 5000);

    if (!response.ok) {
      // 404 não faz retry
      if (response.status === 404) {
        throw new Error('Não encontrado');
      }
      throw new Error(`HTTP ${response.status}`);
    }

    return response.json();
  }, retryOptions);
}

module.exports = { retry, fetchWithTimeout, fetchWithRetry };
