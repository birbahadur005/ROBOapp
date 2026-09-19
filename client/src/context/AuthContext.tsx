import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

export interface User {
  id: string;
  accountId: string;
  email: string;
  role: 'SUPER_ADMIN' | 'COLLEGE_ADMIN' | 'AUTHORITY' | 'RECEPTION';
  authorityProfile?: {
    id: string;
    name: string;
    designation: string;
    officeLocation: string;
    visitingHours: string;
    isAcceptingAppointments: boolean;
    department?: {
      id: string;
      name: string;
      code: string;
    };
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (identifier: string, pass: string) => Promise<User>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    checkCurrentUser();
  }, []);

  const checkCurrentUser = async () => {
    const token = localStorage.getItem('ravan_auth_token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await api.get<{ success: boolean; user: User }>('/auth/me');
      if (res.success && res.user) {
        setUser(res.user);
      } else {
        localStorage.removeItem('ravan_auth_token');
      }
    } catch (err) {
      localStorage.removeItem('ravan_auth_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (identifier: string, pass: string): Promise<User> => {
    const res = await api.post<{ success: boolean; token?: string; user?: User; message?: string }>('/auth/login', {
      identifier,
      password: pass
    });

    if (res.success && res.token && res.user) {
      localStorage.setItem('ravan_auth_token', res.token);
      setUser(res.user);
      return res.user;
    }
    throw new Error(res.message || 'Login failed');
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // ignore
    } finally {
      localStorage.removeItem('ravan_auth_token');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
