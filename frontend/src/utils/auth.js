/**
 * Auth utilities - centraliza acesso ao token de autenticacao
 * Mantem compatibilidade com codigo legado que usa 'token'
 */

export function getToken() {
  return localStorage.getItem("accessToken") || localStorage.getItem("token");
}

export function getRefreshToken() {
  return localStorage.getItem("refreshToken");
}

export function setTokens(accessToken, refreshToken) {
  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("token", accessToken); // backward compat
  if (refreshToken) {
    localStorage.setItem("refreshToken", refreshToken);
  }
}

export function clearAuth() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
}

export function isAuthenticated() {
  const token = getToken();
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}
