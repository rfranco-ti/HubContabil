import DOMPurify from 'dompurify';
import { jwtDecode } from 'jwt-decode';

/**
 * Sanitiza strings HTML para prevenir XSS.
 */
export const sanitizeHTML = (html) => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
  });
};

/**
 * Armazena o Refresh Token de forma persistente.
 */
const RT_KEY = '_hc_rt_v1';

export const savePersistentRefresh = (token) => {
  localStorage.setItem(RT_KEY, token);
};

export const getPersistentRefresh = () => {
  return localStorage.getItem(RT_KEY);
};

export const clearSecurityStorage = () => {
  localStorage.removeItem(RT_KEY);
  localStorage.removeItem('user');
};

/**
 * Validação estrita de JWT no cliente.
 */
export const isValidToken = (token) => {
  if (!token) return false;
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp > currentTime;
  } catch {
    return false;
  }
};

/**
 * Extrai claims do token de forma segura.
 */
export const decodeToken = (token) => {
  if (!token) return null;
  try {
    return jwtDecode(token);
  } catch {
    return null;
  }
};
