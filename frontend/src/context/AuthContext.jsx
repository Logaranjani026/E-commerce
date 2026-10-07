import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('smartcart_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('smartcart_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      const savedToken = localStorage.getItem('smartcart_token');
      if (savedToken) {
        try {
          const res = await authService.getMe();
          if (res.success && res.user) {
            setUser(res.user);
            localStorage.setItem('smartcart_user', JSON.stringify(res.user));
          }
        } catch {
          // Token invalid or expired
          localStorage.removeItem('smartcart_token');
          localStorage.removeItem('smartcart_user');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    verifyToken();
  }, []);

  const login = async (email, password) => {
    const res = await authService.login(email, password);
    if (res.success) {
      localStorage.setItem('smartcart_token', res.token);
      localStorage.setItem('smartcart_user', JSON.stringify(res.user));
      setToken(res.token);
      setUser(res.user);
      return res;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (userData) => {
    const res = await authService.register(userData);
    if (res.success) {
      localStorage.setItem('smartcart_token', res.token);
      localStorage.setItem('smartcart_user', JSON.stringify(res.user));
      setToken(res.token);
      setUser(res.user);
      return res;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const logout = () => {
    localStorage.removeItem('smartcart_token');
    localStorage.removeItem('smartcart_user');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (data) => {
    const res = await authService.updateProfile(data);
    if (res.success) {
      setUser(res.user);
      localStorage.setItem('smartcart_user', JSON.stringify(res.user));
      return res.user;
    }
    throw new Error(res.message || 'Profile update failed');
  };

  const isAuthenticated = !!user && !!token;
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        isAdmin,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
