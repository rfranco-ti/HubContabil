import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api, { setupInterceptors } from '../services/api';
import { 
  getPersistentRefresh, 
  savePersistentRefresh, 
  clearSecurityStorage, 
} from '../utils/security';

const AuthContext = createContext(undefined);

// Canal de comunicação entre abas
const authChannel = new BroadcastChannel('auth_sync');

export const AuthProvider = ({ children }) => {
  const [state, setState] = useState({
    isAuthenticated: false,
    user: null,
    accessToken: null,
    isInitializing: true,
  });

  const logout = useCallback(() => {
    setState({
      isAuthenticated: false,
      user: null,
      accessToken: null,
      isInitializing: false,
    });
    clearSecurityStorage();
    delete api.defaults.headers.common['Authorization'];
    authChannel.postMessage({ type: 'LOGOUT' });
  }, []);

  const login = useCallback((accessToken, refreshToken, user) => {
    savePersistentRefresh(refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    
    setState({
      isAuthenticated: true,
      user,
      accessToken,
      isInitializing: false,
    });

    api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    authChannel.postMessage({ type: 'LOGIN', user, accessToken });
  }, []);

  const refresh = useCallback(async () => {
    const refreshToken = getPersistentRefresh();
    if (!refreshToken) return false;

    try {
      const response = await api.post('/auth/refresh', { refreshToken });
      const { accessToken, refreshToken: newRefreshToken, user } = response.data;
      login(accessToken, newRefreshToken, user);
      return true;
    } catch (error) {
      logout();
      return false;
    }
  }, [login, logout]);

  // Configura interceptores para deslogar globalmente se o refresh falhar
  // Agora definido DEPOIS da função logout para evitar Uncaught ReferenceError
  useEffect(() => {
    setupInterceptors(logout);
  }, [logout]);

  // Sincronização entre abas
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data.type === 'LOGOUT') {
        setState({
          isAuthenticated: false,
          user: null,
          accessToken: null,
          isInitializing: false,
        });
      } else if (event.data.type === 'LOGIN') {
        setState({
          isAuthenticated: true,
          user: event.data.user,
          accessToken: event.data.accessToken,
          isInitializing: false,
        });
      }
    };

    authChannel.addEventListener('message', handleMessage);
    return () => authChannel.removeEventListener('message', handleMessage);
  }, []);

  // Bootstrapping: Tenta recuperar a sessão no carregamento
  useEffect(() => {
    const initAuth = async () => {
      const refreshToken = getPersistentRefresh();
      const storedUser = localStorage.getItem('user');
      
      if (refreshToken && storedUser) {
        try {
          const success = await refresh();
          if (!success) logout();
        } catch {
          logout();
        }
      } else {
        setState(prev => ({ ...prev, isInitializing: false }));
      }
    };

    initAuth();
  }, [refresh, logout]);

  return (
    <AuthContext.Provider value={{ ...state, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
