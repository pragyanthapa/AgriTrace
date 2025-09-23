import React from 'react';
import { login as apiLogin, signup as apiSignup, setAuthToken, getAuthToken } from '../lib/auth';

type User = { _id: string; name: string; email: string; role: 'farmer' | 'buyer' } | null;

type AuthContextType = {
  user: User;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, role: 'farmer' | 'buyer') => Promise<void>;
  logout: () => void;
};

export const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = React.useState<User>(null);
  const [token, setToken] = React.useState<string | null>(getAuthToken());

  const login = async (email: string, password: string) => {
    const { token, user } = await apiLogin({ email, password });
    setToken(token); setAuthToken(token); setUser(user);
  };

  const signup = async (name: string, email: string, password: string, role: 'farmer' | 'buyer') => {
    const { token, user } = await apiSignup({ name, email, password, role });
    setToken(token); setAuthToken(token); setUser(user);
  };

  const logout = () => { setToken(null); setAuthToken(null); setUser(null); };

  const value = { user, token, login, signup, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}


