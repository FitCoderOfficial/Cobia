import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface User {
  email: string;
  nickname: string;
  subscription_tier: 'FREE' | 'PRO' | 'WHALE';
}

interface SubscriptionStatus {
  tier: 'FREE' | 'PRO' | 'WHALE';
  is_active: boolean;
  end_date: string | null;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  subscription: SubscriptionStatus | null;
  isLoading: boolean;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  subscription: null,
  isLoading: true,
};

// Temporary development user
const devUser: User = {
  email: 'dev@example.com',
  nickname: 'Developer',
  subscription_tier: 'PRO',
};

const devSubscription: SubscriptionStatus = {
  tier: 'PRO',
  is_active: true,
  end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
};

export const useAuth = () => {
  const [state, setState] = useState<AuthState>(initialState);
  const router = useRouter();

  const checkAuth = useCallback(async () => {
    // For development, always return authenticated state
    if (process.env.NODE_ENV === 'development') {
      setState({
        isAuthenticated: true,
        user: devUser,
        subscription: devSubscription,
        isLoading: false,
      });
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      // Fetch user data
      const userResponse = await api.get('/auth/me/');
      const user = userResponse.data.data;

      // Fetch subscription status
      const subscriptionResponse = await api.get('/subscriptions/status/');
      const subscription = subscriptionResponse.data.subscription;

      setState({
        isAuthenticated: true,
        user,
        subscription,
        isLoading: false,
      });
    } catch (error) {
      // If token is invalid, clear it
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setState({
        isAuthenticated: false,
        user: null,
        subscription: null,
        isLoading: false,
      });
    }
  }, []);

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = useCallback(async (email: string, password: string) => {
    // For development, always succeed
    if (process.env.NODE_ENV === 'development') {
      setState({
        isAuthenticated: true,
        user: devUser,
        subscription: devSubscription,
        isLoading: false,
      });
      return;
    }

    try {
      const response = await api.post('/auth/login/', { email, password });
      const { access, refresh } = response.data.data;

      // Store tokens
      localStorage.setItem('accessToken', access);
      localStorage.setItem('refreshToken', refresh);

      // Fetch user data and subscription status
      await checkAuth();
    } catch (error) {
      throw new Error('Invalid email or password');
    }
  }, [checkAuth]);

  const register = useCallback(async (email: string, password: string, nickname: string) => {
    // For development, always succeed
    if (process.env.NODE_ENV === 'development') {
      setState({
        isAuthenticated: true,
        user: devUser,
        subscription: devSubscription,
        isLoading: false,
      });
      return;
    }

    try {
      const response = await api.post('/auth/register/', { email, password, nickname });
      const { access, refresh } = response.data.data;

      // Store tokens
      localStorage.setItem('accessToken', access);
      localStorage.setItem('refreshToken', refresh);

      // Fetch user data and subscription status
      await checkAuth();
    } catch (error) {
      throw new Error('Registration failed');
    }
  }, [checkAuth]);

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setState({
      isAuthenticated: false,
      user: null,
      subscription: null,
      isLoading: false,
    });
    router.push('/auth/login');
  }, [router]);

  return {
    isAuthenticated: state.isAuthenticated,
    user: state.user,
    subscription: state.subscription,
    isLoading: state.isLoading,
    login,
    register,
    logout,
  };
}; 