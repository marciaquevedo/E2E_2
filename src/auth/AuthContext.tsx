import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { apiClient } from '../api/client';
import type { AuthResponse, LoginPayload, RegisterPayload, User } from '../api/types';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (payload: LoginPayload) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = useCallback(async (): Promise<User> => {
    const { data } = await apiClient.get<User>('/users/me');
    setUser(data);
    localStorage.setItem('user', JSON.stringify(data));
    return data;
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    fetchMe()
      .catch(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      })
      .finally(() => setLoading(false));
  }, [fetchMe]);

  const login = useCallback(
    async (payload: LoginPayload) => {
      const { data } = await apiClient.post<AuthResponse>('/auth/login', payload);
      localStorage.setItem('token', data.token);
      return fetchMe();
    },
    [fetchMe]
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      const { data } = await apiClient.post<AuthResponse>('/auth/register', payload);
      localStorage.setItem('token', data.token);
      return fetchMe();
    },
    [fetchMe]
  );

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/login';
  }, []);

  const refreshUser = useCallback(async () => {
    await fetchMe();
  }, [fetchMe]);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
