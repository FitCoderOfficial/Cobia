import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '@/lib/api';

interface User {
  id: number;
  email: string;
  nickname: string;
}

interface SubscriptionStatus {
  tier: 'FREE' | 'PRO';
  end_date?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  subscription: SubscriptionStatus | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, nickname: string) => Promise<void>;
  logout: () => void;
  updateSubscription: (tier: 'FREE' | 'PRO') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await api.get('/api/auth/me/');
        setUser(response.data.user);
        setSubscription(response.data.subscription);
        setIsAuthenticated(true);
      } catch (error) {
        setUser(null);
        setSubscription(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await api.post('/api/auth/login/', { email, password });
    setUser(response.data.user);
    setSubscription(response.data.subscription);
    setIsAuthenticated(true);
  };

  const register = async (email: string, password: string, nickname: string) => {
    const response = await api.post('/api/auth/register/', {
      email,
      password,
      nickname,
    });
    setUser(response.data.user);
    setSubscription(response.data.subscription);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    await api.post('/api/auth/logout/');
    setUser(null);
    setSubscription(null);
    setIsAuthenticated(false);
  };

  const updateSubscription = (tier: 'FREE' | 'PRO') => {
    setSubscription((prev) => ({
      ...prev,
      tier,
    }));
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        subscription,
        isLoading,
        login,
        register,
        logout,
        updateSubscription,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 