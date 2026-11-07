import React, { createContext, useContext, useState, useEffect } from 'react';
import { reportService } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('wl_admin_token') || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('wl_admin_user');
    if (savedUser && token) {
      try {
        setAdmin(JSON.parse(savedUser));
      } catch (e) {
        setAdmin({ email: 'admin@waterleakwatch.org', role: 'admin', isDemoMode: true });
      }
    }
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await reportService.login({ email, password });
      if (res.data.success) {
        const receivedToken = res.data.token || 'demo-admin-token';
        const receivedAdmin = res.data.admin;
        setToken(receivedToken);
        setAdmin(receivedAdmin);
        localStorage.setItem('wl_admin_token', receivedToken);
        localStorage.setItem('wl_admin_user', JSON.stringify(receivedAdmin));
        return { success: true };
      }
      return { success: false, message: res.data.message || 'Login failed' };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || err.message || 'Login error'
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setAdmin(null);
    setToken(null);
    localStorage.removeItem('wl_admin_token');
    localStorage.removeItem('wl_admin_user');
  };

  return (
    <AuthContext.Provider value={{ admin, token, login, logout, loading, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
