/**
 * Utilitários de formatação para o Brasil
 */

/**
 * Formatar data para padrão brasileiro DD/MM/YYYY
 */
export function formatarDataBR(date) {
  if (!date) return '-';
  const d = new Date(date + 'T12:00:00Z');
  return d.toLocaleDateString('pt-BR');
}

/**
 * Formatar data com nome do mês
 */
export function formatarDataMes(date) {
  if (!date) return '-';
  const d = new Date(date + 'T12:00:00Z');
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}

/**
 * Formatar data completa com dia da semana
 */
export function formatarDataCompleta(date) {
  if (!date) return '-';
  const d = new Date(date + 'T12:00:00Z');
  return d.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
}

/**
 * Formatar moeda para Real Brasileiro
 */
export function formatarMoeda(valor) {
  if (!valor && valor !== 0) return '-';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor);
}

/**
 * Formatar número para padrão brasileiro
 */
export function formatarNumero(valor) {
  if (!valor && valor !== 0) return '-';
  return new Intl.NumberFormat('pt-BR').format(valor);
}

/**
 * Formatar CNPJ
 */
export function formatarCNPJ(cnpj) {
  if (!cnpj) return '';
  const clean = cnpj.replace(/\D/g, '');
  if (clean.length !== 14) return cnpj;
  return clean.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
}

/**
 * Formatar CPF
 */
export function formatarCPF(cpf) {
  if (!cpf) return '';
  const clean = cpf.replace(/\D/g, '');
  if (clean.length !== 11) return cpf;
  return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

/**
 * Formatar telefone
 */
export function formatarTelefone(telefone) {
  if (!telefone) return '';
  const clean = telefone.replace(/\D/g, '');
  if (clean.length === 11) {
    return clean.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  if (clean.length === 10) {
    return clean.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  return telefone;
}
