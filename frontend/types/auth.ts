export interface User {
  email: string;
  nickname: string;
  subscription_tier: 'FREE' | 'PRO' | 'WHALE';
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  nickname: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    email: string;
    nickname: string;
    subscription_tier: 'FREE' | 'PRO' | 'WHALE';
    access: string;
    refresh: string;
  };
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
} 