/**
 * Authentication Context
 * Manages authentication state across the application
 */

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useMsal } from '@azure/msal-react';
import { AuthContextType, AuthState, User, LoginCredentials } from '../types/auth';
import { AuthService } from '../services/authService';
import { loginRequest, organizationalLoginRequest, personalLoginRequest } from '../config/msalConfig';
import { jwtDecode } from 'jwt-decode';

// Initial state
const initialState: AuthState = {
  isAuthenticated: false,
  isLoading: true,
  user: null,
  token: null,
  error: null,
};

// Action types
type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_AUTHENTICATED'; payload: { user: User; token: string } }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' };

// Reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_AUTHENTICATED':
      return {
        ...state,
        isAuthenticated: true,
        isLoading: false,
        user: action.payload.user,
        token: action.payload.token,
        error: null,
      };
    case 'SET_ERROR':
      return {
        ...state,
        isAuthenticated: false,
        isLoading: false,
        user: null,
        token: null,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...initialState,
        isLoading: false,
      };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
}

// Create context
const AuthContext = createContext<AuthContextType | null>(null);

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const { instance, accounts } = useMsal();

  // Check for existing token and handle Microsoft redirect responses on app load
  useEffect(() => {
    const initializeAuth = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      try {
        // Wait for MSAL instance to be initialized
        await instance.initialize();
        
        // Handle any pending Microsoft redirect response
        const redirectResponse = await instance.handleRedirectPromise();
        
        if (redirectResponse && redirectResponse.accessToken) {
          console.log('Microsoft redirect response received:', redirectResponse);
          
          // Validate token with backend
          const authResult = await AuthService.validateMicrosoftToken(redirectResponse.accessToken);
          
          if (authResult.success && authResult.user && authResult.token) {
            // Store token and user info
            localStorage.setItem('auth_token', authResult.token);
            localStorage.setItem('auth_user', JSON.stringify(authResult.user));
            
            dispatch({ 
              type: 'SET_AUTHENTICATED', 
              payload: { user: authResult.user, token: authResult.token } 
            });
            return;
          } else {
            dispatch({ type: 'SET_ERROR', payload: authResult.error || 'Microsoft authentication failed' });
            dispatch({ type: 'SET_LOADING', payload: false });
            return;
          }
        }
        
        // If no redirect response, check for existing stored token
        const token = localStorage.getItem('auth_token');
        const userStr = localStorage.getItem('auth_user');
        
        if (token && userStr) {
          // Check if token is still valid
          const decoded = jwtDecode(token);
          const currentTime = Date.now() / 1000;
          
          if (decoded.exp && decoded.exp > currentTime) {
            // Token is still valid
            const user = JSON.parse(userStr);
            dispatch({ type: 'SET_AUTHENTICATED', payload: { user, token } });
            return;
          } else {
            // Token expired, try to refresh
            const refreshResult = await AuthService.refreshToken(token);
            if (refreshResult.success && refreshResult.token && refreshResult.user) {
              localStorage.setItem('auth_token', refreshResult.token);
              localStorage.setItem('auth_user', JSON.stringify(refreshResult.user));
              dispatch({ 
                type: 'SET_AUTHENTICATED', 
                payload: { user: refreshResult.user, token: refreshResult.token } 
              });
              return;
            } else {
              // Refresh failed, clear invalid tokens
              console.log('Token refresh failed, clearing auth data');
              localStorage.removeItem('auth_token');
              localStorage.removeItem('auth_user');
            }
          }
        }
        
        // No valid authentication found
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        dispatch({ type: 'SET_LOADING', payload: false });
      } catch (error) {
        console.error('Error initializing auth:', error);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        dispatch({ type: 'SET_ERROR', payload: 'Authentication initialization failed' });
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initializeAuth();
  }, [instance]);

  // Microsoft login with account type selection (using redirect flow)
  const loginWithMicrosoft = async (useOrganizations = false) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      // Ensure MSAL instance is initialized
      await instance.initialize();

      // Select the appropriate login request based on account type
      const selectedLoginRequest = useOrganizations ? organizationalLoginRequest : personalLoginRequest;
      
      console.log('Login type:', useOrganizations ? 'Organization' : 'Personal');
      console.log('Login request:', selectedLoginRequest);

      // Use redirect flow instead of popup to avoid COOP issues
      await instance.loginRedirect(selectedLoginRequest);
    } catch (error: any) {
      console.error('Microsoft login error:', error);
      
      // If this is the first attempt and failed due to tenant issues, suggest trying organizations
      if (!useOrganizations && error.message?.includes('tenant')) {
        dispatch({ 
          type: 'SET_ERROR', 
          payload: 'Account not found in default directory. Try using "Work/School Account Login" instead.' 
        });
      } else {
        dispatch({ type: 'SET_ERROR', payload: error.message || 'Microsoft login failed' });
      }
    }
  };

  // Credentials login (for freshers)
  const loginWithCredentials = async (username: string, password: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      const credentials: LoginCredentials = { username, password };
      const authResult = await AuthService.loginWithCredentials(credentials);
      
      if (authResult.success && authResult.user && authResult.token) {
        // Store token and user info
        localStorage.setItem('auth_token', authResult.token);
        localStorage.setItem('auth_user', JSON.stringify(authResult.user));
        
        dispatch({ 
          type: 'SET_AUTHENTICATED', 
          payload: { user: authResult.user, token: authResult.token } 
        });
      } else {
        dispatch({ type: 'SET_ERROR', payload: authResult.error || 'Login failed' });
      }
    } catch (error: any) {
      console.error('Credentials login error:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Login failed' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Login with HR email (bypass Microsoft authentication)
  const loginWithHREmail = async (email: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      const authResult = await AuthService.loginWithHREmail(email);
      
      if (authResult.success && authResult.user && authResult.token) {
        // Store token and user info
        localStorage.setItem('auth_token', authResult.token);
        localStorage.setItem('auth_user', JSON.stringify(authResult.user));
        
        dispatch({ 
          type: 'SET_AUTHENTICATED', 
          payload: { user: authResult.user, token: authResult.token } 
        });
      } else {
        dispatch({ type: 'SET_ERROR', payload: authResult.error || 'HR email not authorized' });
      }
    } catch (error: any) {
      console.error('HR email login error:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message || 'HR login failed' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Logout
  const logout = async () => {
    try {
      // Clear local storage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      
      // Clear local state first
      dispatch({ type: 'LOGOUT' });
      
      // If logged in with Microsoft, logout from MSAL using redirect
      if (accounts.length > 0) {
        await instance.initialize();
        await instance.logoutRedirect();
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local state even if logout fails
      dispatch({ type: 'LOGOUT' });
    }
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const contextValue: AuthContextType = {
    ...state,
    loginWithMicrosoft,
    loginWithCredentials,
    loginWithHREmail,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

// Hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};