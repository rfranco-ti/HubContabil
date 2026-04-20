/**
 * Utilitários de Máscaras - Hub Contábil
 * 
 * Funções reutilizáveis para formatação de dados
 * Uso: import { formatCnpj, formatPhone } from '../utils/masks';
 */

import { useState } from 'react';

/**
 * Formata CNPJ: 00.000.000/0000-00
 */
export const formatCnpj = (value) => {
  if (!value) return '';
  const digits = String(value).replace(/\D/g, '').slice(0, 14);
  
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
};

/**
 * Formata CPF: 000.000.000-00 (mantém asteriscos)
 * Sempre aplica máscara padrão brasileiro XXX.XXX.XXX-XX
 */
export const formatCpf = (value) => {
  if (!value) return '';
  
  // Mantém asteriscos se existirem (para CPFs mascarados)
  if (value.includes('*')) {
    // Aplica máscara mesmo com asteriscos
    const digits = String(value).replace(/[^\d*]/g, '').slice(0, 14);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  }
  
  const digits = String(value).replace(/\D/g, '').slice(0, 11);

  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
};

/**
 * Formata CPF ou CNPJ automaticamente
 */
export const formatCpfCnpj = (value) => {
  if (!value) return '';
  const digits = String(value).replace(/\D/g, '');
  return digits.length <= 11 ? formatCpf(digits) : formatCnpj(digits);
};

/**
 * Formata Telefone/Celular: (71) 99999-9999 ou (71) 9999-9999
 */
export const formatPhone = (value) => {
  if (!value) return '';
  const digits = String(value).replace(/\D/g, '').slice(0, 11);

  if (digits.length === 0) return '';
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

/**
 * Formata telefone mobile com dígito 9 na frente
 * Regra brasileira: mobile deve ter 9 dígitos após o DDD
 * Ex: (71) 9 8288-6218
 * 
 * @param {string} areaCode - DDD (2 dígitos)
 * @param {string} phoneNumber - Número do telefone
 * @param {string} type - 'mobile' ou 'fixed'
 * @returns {string} Telefone formatado
 */
export const formatPhoneWithMobileDigit = (areaCode, phoneNumber, type = 'mobile') => {
  if (!areaCode && !phoneNumber) return '';
  
  const area = String(areaCode || '').slice(0, 2);
  let number = String(phoneNumber || '').replace(/\D/g, '');
  
  // Se for mobile e não tiver 9 dígitos, adiciona o 9 na frente
  if (type === 'mobile' && number.length === 8 && !number.startsWith('9')) {
    number = '9' + number;
  }
  
  // Limita a 9 dígitos
  number = number.slice(0, 9);
  
  if (!area) return number;
  if (!number) return `(${area})`;
  
  // Formata: (XX) X XXXX-XXXX (com espaço após o 9)
  if (number.length <= 1) return `(${area}) ${number}`;
  if (number.length <= 5) return `(${area}) ${number.slice(0, 1)} ${number.slice(1)}`;
  return `(${area}) ${number.slice(0, 1)} ${number.slice(1, 5)}-${number.slice(5)}`;
};

/**
 * Verifica se é telefone mobile e formata corretamente
 * @param {string} areaCode - DDD
 * @param {string} phoneNumber - Número
 * @param {string} type - 'mobile' ou 'fixed'
 * @returns {string} Telefone formatado
 */
export const formatPhoneByType = (areaCode, phoneNumber, type) => {
  if (type === 'mobile') {
    return formatPhoneWithMobileDigit(areaCode, phoneNumber, 'mobile');
  }
  // Para telefone fixo, formata normalmente
  if (!areaCode && !phoneNumber) return '';
  const area = String(areaCode || '').slice(0, 2);
  const number = String(phoneNumber || '').slice(0, 8);
  if (!area) return number;
  if (!number) return `(${area})`;
  if (number.length <= 4) return `(${area}) ${number}`;
  return `(${area}) ${number.slice(0, 4)}-${number.slice(4)}`;
};

/**
 * Formata telefone para exibição (com dígito 9 se mobile)
 * @param {string} value - Telefone completo (com DDD)
 * @param {string} type - 'mobile' ou 'fixed'
 * @returns {string} Telefone formatado
 */
export const formatPhoneDisplay = (value, type = 'mobile') => {
  if (!value) return '';
  const digits = String(value).replace(/\D/g, '');
  
  if (digits.length === 0) return '';
  if (digits.length <= 2) return `(${digits}`;
  
  const area = digits.slice(0, 2);
  const number = digits.slice(2);
  
  if (type === 'mobile') {
    // Mobile: (XX) X XXXX-XXXX
    if (number.length === 0) return `(${area})`;
    if (number.length === 8 && !number.startsWith('9')) {
      // Adiciona dígito 9
      return `(${area}) 9 ${number.slice(0, 4)}-${number.slice(4)}`;
    }
    if (number.length <= 4) return `(${area}) ${number}`;
    if (number.length <= 5) return `(${area}) ${number.slice(0, 1)} ${number.slice(1)}`;
    if (number.length <= 8) return `(${area}) ${number.slice(0, 1)} ${number.slice(1, 5)}-${number.slice(5)}`;
    return `(${area}) ${number.slice(0, 1)} ${number.slice(1, 5)}-${number.slice(5, 9)}`;
  } else {
    // Fixo: (XX) XXXX-XXXX
    if (number.length <= 4) return `(${area}) ${number}`;
    return `(${area}) ${number.slice(0, 4)}-${number.slice(4, 8)}`;
  }
};

/**
 * Formata CEP: 00000-000
 */
export const formatCep = (value) => {
  if (!value) return '';
  const digits = String(value).replace(/\D/g, '').slice(0, 8);
  
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
};

/**
 * Formata data para DD/MM/YYYY
 */
export const formatDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString('pt-BR');
};

/**
 * Formata data para input type="date" (YYYY-MM-DD)
 */
export const formatDateForInput = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (isNaN(date.getTime())) return '';
  return date.toISOString().split('T')[0];
};

/**
 * Formata número para porcentagem: 12,34%
 */
export const formatPercentage = (value) => {
  if (!value && value !== 0) return '';
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value) + '%';
};

/**
 * Remove formatação de CNPJ/CPF (deixa apenas dígitos)
 */
export const unformatCpfCnpj = (value) => {
  if (!value) return '';
  return String(value).replace(/\D/g, '');
};

/**
 * Remove formatação de telefone (deixa apenas dígitos)
 */
export const unformatPhone = (value) => {
  if (!value) return '';
  return String(value).replace(/\D/g, '');
};

/**
 * Remove formatação de CEP (deixa apenas dígitos)
 */
export const unformatCep = (value) => {
  if (!value) return '';
  return String(value).replace(/\D/g, '');
};

/**
 * Formata valor monetário para padrão brasileiro: R$ 1.234,56
 * @param {number|string} value - Valor em centavos ou decimal
 * @returns {string} Valor formatado como moeda brasileira
 */
export const formatCurrency = (value) => {
  if (!value && value !== 0) return '';
  
  // Converte para número se for string
  let numValue = typeof value === 'string' ? parseFloat(value.replace(/[^\d,-]/g, '').replace(',', '.')) : value;
  
  if (isNaN(numValue)) return '';
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(numValue);
};

/**
 * Formata input de valor monetário (para digitação)
 * Ex: 1234.56 → R$ 1.234,56
 * @param {string} value - Valor digitado
 * @returns {string} Valor formatado
 */
export const formatCurrencyInput = (value) => {
  if (!value) return '';
  
  // Remove tudo que não é dígito
  const digits = String(value).replace(/\D/g, '');
  
  // Converte para decimal (últimos 2 dígitos são centavos)
  const decimalValue = parseInt(digits) / 100;
  
  if (isNaN(decimalValue)) return '';
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(decimalValue);
};

/**
 * Remove formatação de moeda (deixa apenas valor decimal)
 * Ex: R$ 1.234,56 → 1234.56
 * @param {string} value - Valor formatado
 * @returns {number} Valor como número
 */
export const unformatCurrency = (value) => {
  if (!value) return 0;
  
  // Remove R$, espaços, pontos de milhar e troca vírgula por ponto
  const cleanValue = String(value)
    .replace('R$', '')
    .replace(/\./g, '')
    .replace(',', '.')
    .trim();
  
  return parseFloat(cleanValue) || 0;
};

/**
 * Hook React para input com máscara de CNPJ
 * Uso: const cnpjInput = useCnpjMask();
 *      <input {...cnpjInput} />
 */
export const useCnpjMask = (initialValue = '') => {
  const [value, setValue] = useState(initialValue);
  
  const onChange = (e) => {
    const formatted = formatCnpj(e.target.value);
    setValue(formatted);
  };
  
  return {
    value,
    onChange,
    setValue: (v) => setValue(formatCnpj(v))
  };
};

/**
 * Hook React para input com máscara de telefone
 */
export const usePhoneMask = (initialValue = '') => {
  const [value, setValue] = useState(initialValue);
  
  const onChange = (e) => {
    const formatted = formatPhone(e.target.value);
    setValue(formatted);
  };
  
  return {
    value,
    onChange,
    setValue: (v) => setValue(formatPhone(v))
  };
};

/**
 * Hook React para input com máscara de CEP
 */
export const useCepMask = (initialValue = '') => {
  const [value, setValue] = useState(initialValue);
  
  const onChange = (e) => {
    const formatted = formatCep(e.target.value);
    setValue(formatted);
  };
  
  return {
    value,
    onChange,
    setValue: (v) => setValue(formatCep(v))
  };
};

// Export default com todas as funções
export default {
  formatCnpj,
  formatCpf,
  formatCpfCnpj,
  formatPhone,
  formatCep,
  formatDate,
  formatDateForInput,
  formatCurrency,
  formatPercentage,
  unformatCpfCnpj,
  unformatPhone,
  unformatCep,
  useCnpjMask,
  usePhoneMask,
  useCepMask
};
