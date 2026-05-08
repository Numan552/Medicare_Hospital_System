import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
 
const AuthContext = createContext(null);
 
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
 
  const token = localStorage.getItem('medicare_token');
 
  const loadUser = useCallback(async () => {
    const savedToken = localStorage.getItem('medicare_token');
    if (!savedToken) {
      setLoading(false);
      return;
    }
 
    // ── Demo mode: token starts with "demo_token_" ──────────────
    if (savedToken.startsWith('demo_token_')) {
      try {
        const demoUser = JSON.parse(localStorage.getItem('medicare_demo_user') || 'null');
        if (demoUser) {
          setUser(demoUser);
          setProfile(null);
        } else {
          // Stale demo token with no user data — clear it
          localStorage.removeItem('medicare_token');
          localStorage.removeItem('medicare_demo_user');
        }
      } catch {
        localStorage.removeItem('medicare_token');
        localStorage.removeItem('medicare_demo_user');
      }
      setLoading(false);
      return;
    }
 
    // ── Real JWT mode ─────────────────────────────────────────────
    try {
      api.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
      const { data } = await api.get('/auth/me');
      setUser(data.user);
      setProfile(data.profile);
    } catch {
      localStorage.removeItem('medicare_token');
      delete api.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  }, []);
 
  useEffect(() => {
    loadUser();
  }, [loadUser]);
 
  // Real backend login
  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    const { token: newToken, user: userData } = data;
    localStorage.setItem('medicare_token', newToken);
    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    setUser(userData);
    return userData;
  };
 
  // Real backend register
  const register = async (formData) => {
    const { data } = await api.post('/auth/register', formData);
    const { token: newToken, user: userData } = data;
    localStorage.setItem('medicare_token', newToken);
    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    setUser(userData);
    return userData;
  };
 
  const logout = () => {
    localStorage.removeItem('medicare_token');
    localStorage.removeItem('medicare_demo_user');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    setProfile(null);
  };
 
  const updateUser = (updates) => {
    setUser((prev) => {
      const updated = { ...prev, ...updates };
      // Persist demo user updates
      if (localStorage.getItem('medicare_token')?.startsWith('demo_token_')) {
        localStorage.setItem('medicare_demo_user', JSON.stringify(updated));
      }
      return updated;
    });
  };
 
  return (
    <AuthContext.Provider value={{ user, profile, loading, token, login, register, logout, updateUser, loadUser }}>
      {children}
    </AuthContext.Provider>
  );
};
 
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
 