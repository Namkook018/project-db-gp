'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiLogin } from './api';

export type Role = 'admin' | 'teacher' | 'student';

export interface User {
  id: string;
  username: string;
  role: Role;
  name: string;
  surname: string;
  class?: string;
  roomAdvisor?: string;
  profilePic?: string;
}

interface LoginResult {
  success: boolean;
  message?: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<LoginResult>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('school_user');
      if (stored) {
        setUser(JSON.parse(stored) as User);
      }
    } catch {
      // ignore
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<LoginResult> => {
    const result = await apiLogin(username, password);
    if (result.success && result.user) {
      setUser(result.user);
      localStorage.setItem('school_user', JSON.stringify(result.user));
    }
    return { success: result.success, message: result.message };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('school_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
