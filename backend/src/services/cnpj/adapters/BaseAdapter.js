/**
 * Adapter Base para APIs de CNPJ
 *
 * Define a interface que todos os adapters devem implementar.
 * Cada adapter transforma o formato específico da API no formato normalizado.
 */

class BaseAdapter {
  constructor(name, baseUrl, timeout) {
    this.name = name;
    this.baseUrl = baseUrl;
    this.timeout = timeout;
  }

  /**
   * URL completa para consulta de CNPJ
   */
  buildUrl(cnpj) {
    throw new Error('Método buildUrl() não implementado');
  }

  /**
   * Normaliza dados da API para o formato padrão
   *
   * @param {Object} rawData - Dados brutos da API
   * @returns {Object} Dados normalizados
   */
  normalize(rawData) {
    throw new Error('Método normalize() não implementado');
  }

  /**
   * Valida se a resposta da API é válida
   */
  isValidResponse(data) {
    return data && data.cnpj;
  }

  /**
   * Executa a consulta completa: fetch + normalize
   */
  async fetchAndNormalize(cnpj) {
    const url = this.buildUrl(cnpj);
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'HubContabil-CNPJ/1.0'
      },
      signal: AbortSignal.timeout(this.timeout)
    });

    if (!response.ok) {
      if (response.status === 404) throw new Error('CNPJ não encontrado');
      if (response.status === 429) throw new Error('Rate limit excedido');
      throw new Error(`HTTP ${response.status}`);
    }

    const rawData = await response.json();

    if (!this.isValidResponse(rawData)) {
      throw new Error('Resposta inválida da API');
    }

    return this.normalize(rawData);
  }
}

module.exports = { BaseAdapter };
