/**
 * Formatadores para documentos contábeis
 */

/**
 * Formata número para moeda brasileira (R$)
 * @param {number} value - Valor numérico
 * @returns {string} Valor formatado como moeda
 */
export const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

/**
 * Formata data para padrão brasileiro
 * @param {Date|string} date - Data
 * @returns {string} Data formatada (DD/MM/AAAA)
 */
export const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('pt-BR');
};

/**
 * Formata data por extenso
 * @param {Date|string} date - Data
 * @returns {string} Data formatada por extenso
 */
export const formatDateByExtense = (date) => {
  if (!date) return '';
  const d = new Date(date);
  
  const day = d.getDate();
  const month = d.toLocaleString('pt-BR', { month: 'long' });
  const year = d.getFullYear();
  
  return `${day} de ${month} de ${year}`;
};

/**
 * Formata CPF/CNPJ
 * @param {string} value - CPF ou CNPJ
 * @returns {string} Valor formatado
 */
export const formatCPF = (value) => {
  if (!value) return '';
  const cleaned = value.replace(/\D/g, '');
  
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  } else if (cleaned.length === 14) {
    return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }
  
  return value;
};

/**
 * Converte número para por extenso (até 999999)
 * @param {number} number - Número para converter
 * @returns {string} Número por extenso
 */
export const numberToWords = (number) => {
  const units = [
    '', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove',
    'dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis',
    'dezessete', 'dezoito', 'dezenove'
  ];
  
  const tens = [
    '', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta',
    'setenta', 'oitenta', 'noventa'
  ];
  
  const hundreds = [
    '', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos',
    'seiscentos', 'setecentos', 'oitocentos', 'novecentos'
  ];
  
  if (number === 0) return 'zero';
  if (number === 100) return 'cem';
  
  let result = '';
  
  // Centenas
  if (number >= 100) {
    const hundred = Math.floor(number / 100);
    result += hundreds[hundred];
    number %= 100;
    if (number > 0) result += ' e ';
  }
  
  // Dezenas e unidades
  if (number >= 20) {
    const ten = Math.floor(number / 10);
    result += tens[ten];
    number %= 10;
    if (number > 0) result += ' e ';
  }
  
  if (number > 0 && number < 20) {
    result += units[number];
  }
  
  return result;
};

/**
 * Converte valor monetário para por extenso
 * @param {number} value - Valor em reais
 * @returns {string} Valor por extenso
 */
export const currencyToWords = (value) => {
  const reais = Math.floor(value);
  const centavos = Math.round((value - reais) * 100);
  
  let result = '';
  
  if (reais > 0) {
    result += numberToWords(reais);
    result += reais === 1 ? ' real' : ' reais';
  }
  
  if (centavos > 0) {
    if (reais > 0) result += ' e ';
    result += numberToWords(centavos);
    result += centavos === 1 ? ' centavo' : ' centavos';
  }
  
  return result;
};

/**
 * Capitaliza primeira letra
 * @param {string} text - Texto
 * @returns {string} Texto com primeira letra maiúscula
 */
export const capitalize = (text) => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
};

/**
 * Formata mês e ano
 * @param {Date|string} date - Data
 * @returns {string} Mês/Ano formatado
 */
export const formatMonthYear = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const month = d.toLocaleString('pt-BR', { month: 'long' });
  const year = d.getFullYear();
  return `${capitalize(month)}/${year}`;
};
