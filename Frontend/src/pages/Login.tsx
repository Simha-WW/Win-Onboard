/**
 * Login Page
 * Provides dual login options: User login and Admin (Microsoft) login
 */

import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { FiUser, FiShield, FiEye, FiEyeOff, FiMail, FiLock } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { useMsal } from '@azure/msal-react';

export const Login: React.FC = () => {
  const { isAuthenticated, isLoading, error, user, loginWithMicrosoft, loginWithCredentials, loginWithHREmail, clearError } = useAuth();
  const { instance: msalInstance } = useMsal();
  const [loginMode, setLoginMode] = useState<'select' | 'user' | 'admin'>('select');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [hrEmail, setHREmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessingRedirect, setIsProcessingRedirect] = useState(false);

  // Check immediately if this is a Microsoft redirect - don't use useState to avoid delay
  const urlParams = new URLSearchParams(window.location.search);
  const urlHash = window.location.hash;
  const isMicrosoftRedirect = urlParams.has('code') || urlParams.has('state') || urlParams.has('session_state') ||
                              urlHash.includes('access_token') || urlHash.includes('id_token') || urlParams.has('error');

  // Clear error when switching modes
  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [loginMode]); // Remove clearError from dependencies to avoid infinite loop

  // Handle Microsoft redirect response
  useEffect(() => {
    if (isMicrosoftRedirect && !user) {
      console.log('Microsoft redirect detected, processing authentication...');
      
      const handleRedirect = async () => {
        try {
          // Let AuthContext handle the redirect
          await msalInstance.handleRedirectPromise();
          console.log('MSAL redirect handled successfully');
        } catch (error) {
          console.error('Error handling redirect:', error);
        }
      };

      handleRedirect();
    }
  }, [isMicrosoftRedirect, user, msalInstance]);

  // Show processing screen immediately if this is a Microsoft redirect
  if (isMicrosoftRedirect && !user) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        flexDirection: 'column',
        gap: '2rem'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '1rem',
          padding: '3rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          textAlign: 'center',
          maxWidth: '400px',
          width: '100%'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            margin: '0 auto 1.5rem',
            borderRadius: '50%',
            background: 'linear-gradient(45deg, #3b82f6, #1d4ed8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'pulse 2s infinite'
          }}>
            <FiUser style={{ color: 'white', fontSize: '24px' }} />
          </div>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            color: '#1f2937',
            margin: '0 0 0.5rem'
          }}>
            Signing You In
          </h2>
          <p style={{
            color: '#6b7280',
            fontSize: '0.875rem',
            margin: '0 0 2rem'
          }}>
            Processing your Microsoft authentication...
          </p>
          <div style={{
            width: '100%',
            height: '4px',
            backgroundColor: '#e5e7eb',
            borderRadius: '2px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: '50%',
              height: '100%',
              backgroundColor: '#3b82f6',
              borderRadius: '2px',
              animation: 'loading-bar 2s infinite'
            }} />
          </div>
        </div>
      </div>
    );
  }

  // Redirect if already authenticated
  if (isAuthenticated && user) {
    // If user has any HR-related role or department, they came from hr_users table
    if (user.role && (user.role.toLowerCase().includes('hr') || user.department === 'Human Resources')) {
      return <Navigate to="/hr" replace />;
    } else if (user.role === 'FRESHER') {
      return <Navigate to="/" replace />;
    }
  }

  // Handle Microsoft login
  const handleMicrosoftLogin = async (useOrganizations = false) => {
    setIsSubmitting(true);
    setIsProcessingRedirect(true);
    clearError(); // Clear any previous error messages
    try {
      await loginWithMicrosoft(useOrganizations);
    } catch (error) {
      console.error('Microsoft login failed:', error);
      setIsProcessingRedirect(false);
      setIsSubmitting(false);
    }
  };

  // Handle user credentials login
  const handleUserLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      return;
    }

    setIsSubmitting(true);
    clearError(); // Clear any previous error messages
    try {
      await loginWithCredentials(username.trim(), password);
    } catch (error) {
      console.error('User login failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle HR email login
  const handleHREmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hrEmail.trim()) {
      return;
    }

    setIsSubmitting(true);
    clearError(); // Clear any previous error messages
    try {
      await loginWithHREmail(hrEmail.trim());
    } catch (error) {
      console.error('HR email login failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle HR login with email and password
  const handleHRLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hrEmail.trim() || !password.trim()) {
      return;
    }

    setIsSubmitting(true);
    clearError();
    try {
      // Call the new HR login API endpoint
      const apiUrl = 'http://localhost:3000/api/auth/hr/login';
      console.log('Calling HR login API:', apiUrl);
      console.log('Email:', hrEmail.trim());
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: hrEmail.trim(),
          password: password
        })
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok && data.success) {
        // Store the token and user data (use 'auth_user' to match AuthContext)
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('auth_user', JSON.stringify(data.user));
        console.log('Login successful, token and user stored');
        console.log('User:', data.user);
        console.log('User Type:', data.userType);
        console.log('Token:', data.token.substring(0, 50) + '...');
        
        // Navigate based on user type
        if (data.userType === 'IT') {
          console.log('Navigating to IT portal');
          window.location.href = '/it';
        } else {
          console.log('Navigating to HR portal');
          // Reload the page to trigger AuthContext to pick up the new token
          window.location.reload();
        }
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (error: any) {
      console.error('HR login failed:', error);
      alert(error.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderModeSelection = () => (
    <div style={{ textAlign: 'center' }}>
      <h1 style={{ 
        fontSize: '2rem', 
        fontWeight: 'bold', 
        marginBottom: '0.5rem', 
        color: '#1f2937' 
      }}>
        Welcome to WinOnboard
      </h1>
      <p style={{ 
        color: '#6b7280', 
        marginBottom: '2rem' 
      }}>
        Choose how you'd like to sign in
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* User Login Option */}
        <button
          onClick={() => setLoginMode('user')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            padding: '1rem 2rem',
            backgroundColor: 'white',
            border: '2px solid #e5e7eb',
            borderRadius: '0.5rem',
            fontSize: '1rem',
            fontWeight: '500',
            color: '#374151',
            cursor: 'pointer',
            transition: 'all 0.2s',
            width: '100%'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.borderColor = '#3b82f6';
            e.currentTarget.style.backgroundColor = '#f8fafc';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.borderColor = '#e5e7eb';
            e.currentTarget.style.backgroundColor = 'white';
          }}
        >
          <FiUser style={{ fontSize: '1.25rem', color: '#3b82f6' }} />
          Employee login
        </button>

        {/* Admin Login Option */}
        <button
          onClick={() => setLoginMode('admin')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            padding: '1rem 2rem',
            backgroundColor: 'white',
            border: '2px solid #e5e7eb',
            borderRadius: '0.5rem',
            fontSize: '1rem',
            fontWeight: '500',
            color: '#374151',
            cursor: 'pointer',
            transition: 'all 0.2s',
            width: '100%'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.borderColor = '#10b981';
            e.currentTarget.style.backgroundColor = '#f0fdf4';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.borderColor = '#e5e7eb';
            e.currentTarget.style.backgroundColor = 'white';
          }}
        >
          <FiShield style={{ fontSize: '1.25rem', color: '#10b981' }} />
          Admin login
        </button>
      </div>
    </div>
  );

  const renderUserLogin = () => (
    <div style={{ textAlign: 'center' }}>
      <h2 style={{ 
        fontSize: '1.5rem', 
        fontWeight: 'bold', 
        marginBottom: '0.5rem', 
        color: '#1f2937' 
      }}>
        User Login
      </h2>
      <p style={{ 
        color: '#6b7280', 
        marginBottom: '2rem' 
      }}>
        Enter your username and password
      </p>

      <form onSubmit={handleUserLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Username Field */}
        <div>
          <div style={{ 
            position: 'relative',
            display: 'flex',
            alignItems: 'center'
          }}>
            <FiUser style={{ 
              position: 'absolute',
              left: '0.75rem',
              color: '#9ca3af',
              fontSize: '1rem'
            }} />
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{
                width: '100%',
                paddingLeft: '2.5rem',
                paddingRight: '1rem',
                paddingTop: '0.75rem',
                paddingBottom: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '1rem',
                backgroundColor: 'white',
                outline: 'none',
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#d1d5db'}
              required
            />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <div style={{ 
            position: 'relative',
            display: 'flex',
            alignItems: 'center'
          }}>
            <FiLock style={{ 
              position: 'absolute',
              left: '0.75rem',
              color: '#9ca3af',
              fontSize: '1rem'
            }} />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                paddingLeft: '2.5rem',
                paddingRight: '2.5rem',
                paddingTop: '0.75rem',
                paddingBottom: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '1rem',
                backgroundColor: 'white',
                outline: 'none',
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#d1d5db'}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '0.75rem',
                color: '#9ca3af',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
        </div>

        {/* Login Button */}
        <button
          type="submit"
          disabled={isSubmitting || isLoading}
          style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: isSubmitting || isLoading ? '#9ca3af' : '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            fontSize: '1rem',
            fontWeight: '500',
            cursor: isSubmitting || isLoading ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s'
          }}
        >
          {isSubmitting || isLoading ? 'Signing In...' : 'Sign In'}
        </button>
      </form>

      <button
        onClick={() => setLoginMode('select')}
        style={{
          marginTop: '1.5rem',
          color: '#6b7280',
          backgroundColor: 'transparent',
          border: 'none',
          cursor: 'pointer',
          fontSize: '0.875rem'
        }}
      >
        ← Back to login options
      </button>
    </div>
  );

  const renderAdminLogin = () => (
    <div style={{ textAlign: 'center' }}>
      <h2 style={{ 
        fontSize: '1.5rem', 
        fontWeight: 'bold', 
        marginBottom: '0.5rem', 
        color: '#1f2937' 
      }}>        Admin Login
      </h2>
      <p style={{ 
        color: '#6b7280', 
        marginBottom: '2rem' 
      }}>        Sign in with your admin credentials
      </p>

      <form onSubmit={handleHRLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Email Field */}
        <div>
          <div style={{ 
            position: 'relative',
            display: 'flex',
            alignItems: 'center'
          }}>
            <FiMail style={{ 
              position: 'absolute',
              left: '0.75rem',
              color: '#9ca3af',
              fontSize: '1rem'
            }} />
            <input
              type="email"
              placeholder="Email Address"
              value={hrEmail}
              onChange={(e) => setHREmail(e.target.value)}
              style={{
                width: '100%',
                paddingLeft: '2.5rem',
                paddingRight: '1rem',
                paddingTop: '0.75rem',
                paddingBottom: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '1rem',
                backgroundColor: 'white',
                outline: 'none',
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#10b981'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#d1d5db'}
              required
            />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <div style={{ 
            position: 'relative',
            display: 'flex',
            alignItems: 'center'
          }}>
            <FiLock style={{ 
              position: 'absolute',
              left: '0.75rem',
              color: '#9ca3af',
              fontSize: '1rem'
            }} />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                paddingLeft: '2.5rem',
                paddingRight: '3rem',
                paddingTop: '0.75rem',
                paddingBottom: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '1rem',
                backgroundColor: 'white',
                outline: 'none',
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#10b981'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#d1d5db'}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '0.75rem',
                border: 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                padding: '0.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {showPassword ? (
                <FiEyeOff style={{ color: '#9ca3af', fontSize: '1rem' }} />
              ) : (
                <FiEye style={{ color: '#9ca3af', fontSize: '1rem' }} />
              )}
            </button>
          </div>
        </div>

        {/* Login Button */}
        <button
          type="submit"
          disabled={isSubmitting || isLoading}
          style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: isSubmitting || isLoading ? '#9ca3af' : '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: isSubmitting || isLoading ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => {
            if (!isSubmitting && !isLoading) {
              e.currentTarget.style.backgroundColor = '#059669';
            }
          }}
          onMouseOut={(e) => {
            if (!isSubmitting && !isLoading) {
              e.currentTarget.style.backgroundColor = '#10b981';
            }
          }}
        >
          {isSubmitting || isLoading ? 'Signing In...' : 'Sign In'}
        </button>
      </form>

      {error && (
        <div style={{
          marginTop: '1rem',
          padding: '0.75rem',
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '0.375rem',
          color: '#dc2626',
          fontSize: '0.875rem'
        }}>
          {error}
        </div>
      )}

      <div style={{
        marginTop: '1.5rem',
        padding: '0.75rem',
        backgroundColor: '#f0f9ff',
        border: '1px solid #0ea5e9',
        borderRadius: '0.375rem',
        fontSize: '0.875rem',
        color: '#0369a1'
      }}>
        <strong>Admin Access:</strong> Only authorized administrative personnel with valid credentials can access the admin portal.
      </div>

      <button
        onClick={() => setLoginMode('select')}
        style={{
          marginTop: '1.5rem',
          color: '#6b7280',
          backgroundColor: 'transparent',
          border: 'none',
          cursor: 'pointer',
          fontSize: '0.875rem'
        }}
      >
        ← Back to login options
      </button>
    </div>
  );

  if (isLoading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f9fafb'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '2rem', 
            height: '2rem', 
            border: '2px solid #e5e7eb',
            borderTop: '2px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <p style={{ color: '#6b7280' }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#f9fafb',
      padding: '1rem'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '0.5rem',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
      }}>
        {/* Error Message */}
        {error && (
          <div style={{
            padding: '0.75rem',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '0.375rem',
            marginBottom: '1rem'
          }}>
            <p style={{ color: '#dc2626', fontSize: '0.875rem' }}>
              {error}
            </p>
          </div>
        )}

        {/* Render appropriate mode */}
        {loginMode === 'select' && renderModeSelection()}
        {loginMode === 'user' && renderUserLogin()}
        {loginMode === 'admin' && renderAdminLogin()}
      </div>

      {/* CSS Animation */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};