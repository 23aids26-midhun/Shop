import React, { createContext, useContext, useState, useCallback } from 'react';
import api, { tokenStore, firstErrorMessage } from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  });

  const persistUser = (u) => {
    setUser(u);
    if (u) localStorage.setItem('user', JSON.stringify(u));
    else localStorage.removeItem('user');
  };

  const register = useCallback(async (payload) => {
    await api.post('/accounts/register/', payload);
  }, []);

  const login = useCallback(async (username, password) => {
    const { data } = await api.post('/accounts/login/', { username, password });
    tokenStore.set({ access: data.access, refresh: data.refresh });
    persistUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    tokenStore.clear();
    persistUser(null);
  }, []);

  const updateProfile = useCallback(async (payload) => {
    const { data } = await api.put('/accounts/profile/', payload);
    persistUser(data);
    return data;
  }, []);

  const value = {
    user,
    isAuthenticated: !!user,
    isAdmin: !!user?.is_staff,
    register,
    login,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

export { firstErrorMessage };
