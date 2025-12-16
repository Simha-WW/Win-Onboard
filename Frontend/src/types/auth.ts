/**
 * Authentication Types and Interfaces
 */

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'HR' | 'FRESHER';
  department?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  token: string | null;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  loginWithMicrosoft: (useOrganizations?: boolean) => Promise<void>;
  loginWithCredentials: (username: string, password: string) => Promise<void>;
  loginWithHREmail: (email: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: User;
  error?: string;
}

export interface TokenPayload {
  sub: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'HR' | 'FRESHER';
  exp: number;
  iat: number;
}