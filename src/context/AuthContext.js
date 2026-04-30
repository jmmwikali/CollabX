import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('collabx_token');
    const savedUser = localStorage.getItem('collabx_user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      // Verify token is still valid
      authAPI.getMe()
        .then(res => {
          setUser(res.data.user);
          localStorage.setItem('collabx_user', JSON.stringify(res.data.user));
        })
        .catch((err) => {
          // Only clear session on explicit 401 (invalid/expired token).
          // Network errors or CORS failures should not log the user out.
          if (err.response?.status === 401) {
            localStorage.removeItem('collabx_token');
            localStorage.removeItem('collabx_user');
            setUser(null);
          }
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
  if (!user) return;
  const interval = setInterval(() => {
    authAPI.getMe().catch(() => {});
  }, 2 * 60 * 1000); // every 2 min
  return () => clearInterval(interval);
}, [user]);

  const login = useCallback(async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { token, user: userData } = res.data;
    localStorage.setItem('collabx_token', token);
    localStorage.setItem('collabx_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  }, []);

  const register = useCallback(async (formData) => {
    const res = await authAPI.register(formData);
    const { token, user: userData } = res.data;
    localStorage.setItem('collabx_token', token);
    localStorage.setItem('collabx_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('collabx_token');
    localStorage.removeItem('collabx_user');
    setUser(null);
  }, []);

  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('collabx_user', JSON.stringify(updatedUser));
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
