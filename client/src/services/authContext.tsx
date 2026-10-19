import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Meter } from '../types/index.js';
import { api } from './api.js';

interface AuthContextType {
  user: User | null;
  meters: Meter[];
  activeMeter: Meter | null;
  loading: boolean;
  theme: 'light' | 'dark';
  login: (credentials: any) => Promise<void>;
  register: (details: any) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setActiveMeter: (meter: Meter | null) => void;
  toggleTheme: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [meters, setMeters] = useState<Meter[]>([]);
  const [activeMeter, setActiveMeter] = useState<Meter | null>(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const applyTheme = (t: 'light' | 'dark') => {
    setTheme(t);
    localStorage.setItem('enersense_theme', t);
    if (t === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleTheme = () => {
    applyTheme(theme === 'light' ? 'dark' : 'light');
  };

  const refreshUser = async () => {
    try {
      const res = await api.getMe();
      if (res.success && res.user) {
        setUser(res.user);
        setMeters(res.meters || []);
        if (res.meters && res.meters.length > 0) {
          setActiveMeter((prev) => prev || res.meters[0]);
        }
        if (res.user.settings?.theme) {
          applyTheme(res.user.settings.theme);
        }
      }
    } catch (err) {
      setUser(null);
      setMeters([]);
      setActiveMeter(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('enersense_theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      applyTheme(savedTheme);
    }
    refreshUser();
  }, []);

  const login = async (credentials: any) => {
    const res = await api.login(credentials);
    if (res.success) {
      if (res.token) {
        localStorage.setItem('enersense_token', res.token);
      }
      setUser(res.user);
      await refreshUser();
    }
  };

  const register = async (details: any) => {
    const res = await api.register(details);
    if (res.success) {
      if (res.token) {
        localStorage.setItem('enersense_token', res.token);
      }
      setUser(res.user);
      await refreshUser();
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } finally {
      localStorage.removeItem('enersense_token');
      setUser(null);
      setMeters([]);
      setActiveMeter(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        meters,
        activeMeter,
        loading,
        theme,
        login,
        register,
        logout,
        refreshUser,
        setActiveMeter,
        toggleTheme,
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
