/**
 * Authentication Service
 * Handles API calls for authentication
 */

import axios from 'axios';
import { AuthResponse, LoginCredentials, User } from '../types/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api';

const authApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export class AuthService {
  /**
   * Validate Microsoft token with backend
   */
  static async validateMicrosoftToken(accessToken: string): Promise<AuthResponse> {
    try {
      const response = await authApi.post('/auth/microsoft', {
        accessToken,
      });
      
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Microsoft authentication failed',
      };
    }
  }

  /**
   * Login with username and password (freshers)
   */
  static async loginWithCredentials(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await authApi.post('/auth/fresher', credentials);
      
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed',
      };
    }
  }

  /**
   * Login with HR email (bypass Microsoft authentication)
   */
  static async loginWithHREmail(email: string): Promise<AuthResponse> {
    try {
      const response = await authApi.post('/auth/hr-email', {
        email,
      });
      
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'HR email authentication failed',
      };
    }
  }

  /**
   * Validate existing token
   */
  static async validateToken(token: string): Promise<AuthResponse> {
    try {
      const response = await authApi.post('/auth/validate', {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Token validation failed',
      };
    }
  }

  /**
   * Refresh token
   */
  static async refreshToken(token: string): Promise<AuthResponse> {
    try {
      const response = await authApi.post('/auth/refresh', {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Token refresh failed',
      };
    }
  }
}

// Add request interceptor to include auth token
authApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle token expiry
authApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/refresh')) {
      originalRequest._retry = true;
      
      // Don't try to refresh if this is already a refresh request
      if (originalRequest.url?.includes('/auth/')) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        return Promise.reject(error);
      }
      
      // Try to refresh token (without using authApi to avoid recursion)
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (refreshResponse.ok) {
            const refreshResult = await refreshResponse.json();
            if (refreshResult.success && refreshResult.token) {
              localStorage.setItem('auth_token', refreshResult.token);
              originalRequest.headers.Authorization = `Bearer ${refreshResult.token}`;
              return authApi(originalRequest);
            }
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
        }
      }
      
      // If refresh fails, clear auth data
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      return Promise.reject(error);
    }
    
    return Promise.reject(error);
  }
);