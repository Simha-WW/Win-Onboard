/**
 * Login Page
 * Provides dual login options: User login and Admin (Microsoft) login
 */

import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { FiUser, FiShield, FiEye, FiEyeOff, FiMail, FiLock } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { useMsal } from '@azure/msal-react';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';

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

  // Clear all form fields on component mount to prevent cached credentials
  useEffect(() => {
    setUsername('');
    setPassword('');
    setHREmail('');
    setShowPassword(false);
  }, []);

  // Clear error and form fields when switching modes
  useEffect(() => {
    if (error) {
      clearError();
    }
    // Clear all form fields to prevent autofill/cached credentials
    setUsername('');
    setPassword('');
    setHREmail('');
    setShowPassword(false);
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
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api';
      const apiUrl = `${API_BASE_URL}/auth/hr/login`;
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
        } else if (data.userType === 'LD') {
          console.log('Navigating to L&D portal');
          window.location.href = '/ld';
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

  // Handle Google OAuth login for admin users
  const handleGoogleLogin = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      console.error('No credential received from Google');
      alert('Google authentication failed. Please try again.');
      return;
    }

    setIsSubmitting(true);
    clearError();

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api';
      const apiUrl = `${API_BASE_URL}/auth/google`;
      
      console.log('🔐 Sending Google token to backend:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token: credentialResponse.credential
        })
      });

      const data = await response.json();
      console.log('Google auth response:', data);

      if (response.ok && data.success) {
        // Store authentication data
        localStorage.setItem('auth_token', data.data.token);
        localStorage.setItem('auth_user', JSON.stringify(data.data.user));
        
        console.log('✅ Google authentication successful');
        console.log('Department:', data.data.user.department);
        console.log('Role:', data.data.user.role);

        // Navigate to appropriate portal based on department
        if (data.data.user.department === 'IT') {
          console.log('Navigating to IT portal');
          window.location.href = '/it';
        } else if (data.data.user.department === 'LD') {
          console.log('Navigating to L&D portal');
          window.location.href = '/ld';
        } else if (data.data.user.department === 'HR') {
          console.log('Navigating to HR portal');
          window.location.href = '/hr';
        } else {
          console.log('Unknown department, reloading');
          window.location.reload();
        }
      } else {
        // Handle specific error cases
        if (data.error === 'EMAIL_NOT_REGISTERED') {
          alert('You are not authorized to access this system.\n\nYour email is not registered as an admin user.\n\nPlease contact your system administrator.');
        } else if (data.error === 'ACCOUNT_INACTIVE') {
          alert('Your account has been deactivated.\n\nPlease contact your administrator for assistance.');
        } else {
          alert(data.message || 'Authentication failed. Please try again.');
        }
      }
    } catch (error: any) {
      console.error('❌ Google authentication error:', error);
      alert('Authentication failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Google login error
  const handleGoogleError = () => {
    console.error('Google login failed');
    alert('Google authentication failed. Please try again or use email/password login.');
  };

  const renderModeSelection = () => (
    <div style={{ textAlign: 'center' }}>
      <h2 style={{ 
        fontSize: '2rem', 
        fontWeight: '700', 
        marginBottom: '0.75rem', 
        color: '#111827' 
      }}>
        Welcome Back
      </h2>
      <p style={{ 
        color: '#6b7280', 
        marginBottom: '3rem',
        fontSize: '1rem'
      }}>
        Sign in to access your account
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
            padding: '1.25rem 1.5rem',
            backgroundColor: 'white',
            border: '2px solid #e5e7eb',
            borderRadius: '0.75rem',
            fontSize: '1rem',
            fontWeight: '600',
            color: '#374151',
            cursor: 'pointer',
            transition: 'all 0.3s',
            width: '100%',
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.borderColor = '#3b82f6';
            e.currentTarget.style.backgroundColor = '#eff6ff';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.borderColor = '#e5e7eb';
            e.currentTarget.style.backgroundColor = 'white';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
          }}
        >
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <FiUser style={{ fontSize: '1.25rem', color: 'white' }} />
          </div>
          <span>Employee Login</span>
        </button>

        {/* Admin Login Option */}
        <button
          onClick={() => setLoginMode('admin')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            padding: '1.25rem 1.5rem',
            backgroundColor: 'white',
            border: '2px solid #e5e7eb',
            borderRadius: '0.75rem',
            fontSize: '1rem',
            fontWeight: '600',
            color: '#374151',
            cursor: 'pointer',
            transition: 'all 0.3s',
            width: '100%',
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.borderColor = '#8b5cf6';
            e.currentTarget.style.backgroundColor = '#f5f3ff';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.borderColor = '#e5e7eb';
            e.currentTarget.style.backgroundColor = 'white';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
          }}
        >
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <FiShield style={{ fontSize: '1.25rem', color: 'white' }} />
          </div>
          <span>Admin Portal</span>
        </button>
      </div>
    </div>
  );

  const renderUserLogin = () => (
    <div>
      <h2 style={{ 
        fontSize: '1.75rem', 
        fontWeight: '700', 
        marginBottom: '0.5rem', 
        color: '#111827' 
      }}>
        Employee Login
      </h2>
      <p style={{ 
        color: '#6b7280', 
        marginBottom: '2rem',
        fontSize: '0.938rem'
      }}>
        Sign in with your credentials
      </p>

      <form onSubmit={handleUserLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Username Field */}
        <div>
          <label style={{ 
            display: 'block', 
            marginBottom: '0.5rem', 
            fontSize: '0.875rem', 
            fontWeight: '500', 
            color: '#374151' 
          }}>
            Username
          </label>
          <div style={{ 
            position: 'relative',
            display: 'flex',
            alignItems: 'center'
          }}>
            <FiUser style={{ 
              position: 'absolute',
              left: '1rem',
              color: '#9ca3af',
              fontSize: '1.125rem'
            }} />
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              style={{
                width: '100%',
                paddingLeft: '3rem',
                paddingRight: '1rem',
                paddingTop: '0.875rem',
                paddingBottom: '0.875rem',
                border: '2px solid #e5e7eb',
                borderRadius: '0.5rem',
                fontSize: '0.938rem',
                backgroundColor: 'white',
                outline: 'none',
                transition: 'all 0.2s'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#3b82f6';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#e5e7eb';
                e.currentTarget.style.boxShadow = 'none';
              }}
              required
            />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <label style={{ 
            display: 'block', 
            marginBottom: '0.5rem', 
            fontSize: '0.875rem', 
            fontWeight: '500', 
            color: '#374151' 
          }}>
            Password
          </label>
          <div style={{ 
            position: 'relative',
            display: 'flex',
            alignItems: 'center'
          }}>
            <FiLock style={{ 
              position: 'absolute',
              left: '1rem',
              color: '#9ca3af',
              fontSize: '1.125rem'
            }} />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              style={{
                width: '100%',
                paddingLeft: '3rem',
                paddingRight: '3rem',
                paddingTop: '0.875rem',
                paddingBottom: '0.875rem',
                border: '2px solid #e5e7eb',
                borderRadius: '0.5rem',
                fontSize: '0.938rem',
                backgroundColor: 'white',
                outline: 'none',
                transition: 'all 0.2s'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#3b82f6';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#e5e7eb';
                e.currentTarget.style.boxShadow = 'none';
              }}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '1rem',
                color: '#9ca3af',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.25rem'
              }}
            >
              {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          </div>
        </div>

        {/* Login Button */}
        <button
          type="submit"
          disabled={isSubmitting || isLoading}
          style={{
            width: '100%',
            padding: '0.875rem',
            background: isSubmitting || isLoading ? '#9ca3af' : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: isSubmitting || isLoading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
            boxShadow: isSubmitting || isLoading ? 'none' : '0 4px 6px -1px rgba(59, 130, 246, 0.3)'
          }}
          onMouseOver={(e) => {
            if (!isSubmitting && !isLoading) {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 6px 8px -1px rgba(59, 130, 246, 0.4)';
            }
          }}
          onMouseOut={(e) => {
            if (!isSubmitting && !isLoading) {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(59, 130, 246, 0.3)';
            }
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
          fontSize: '0.875rem',
          fontWeight: '500',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem',
          transition: 'color 0.2s'
        }}
        onMouseOver={(e) => e.currentTarget.style.color = '#111827'}
        onMouseOut={(e) => e.currentTarget.style.color = '#6b7280'}
      >
        ← Back to login options
      </button>
    </div>
  );

  const renderAdminLogin = () => (
    <div>
      <h2 style={{ 
        fontSize: '1.75rem', 
        fontWeight: '700', 
        marginBottom: '0.5rem', 
        color: '#111827' 
      }}>
        Admin Portal
      </h2>
      <p style={{ 
        color: '#6b7280', 
        marginBottom: '2rem',
        fontSize: '0.938rem'
      }}>
        Sign in with your admin credentials
      </p>

      <form onSubmit={handleHRLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Email Field */}
        <div>
          <label style={{ 
            display: 'block', 
            marginBottom: '0.5rem', 
            fontSize: '0.875rem', 
            fontWeight: '500', 
            color: '#374151' 
          }}>
            Email
          </label>
          <div style={{ 
            position: 'relative',
            display: 'flex',
            alignItems: 'center'
          }}>
            <FiMail style={{ 
              position: 'absolute',
              left: '1rem',
              color: '#9ca3af',
              fontSize: '1.125rem'
            }} />
            <input
              type="email"
              placeholder="Enter your email"
              value={hrEmail}
              onChange={(e) => setHREmail(e.target.value)}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              style={{
                width: '100%',
                paddingLeft: '3rem',
                paddingRight: '1rem',
                paddingTop: '0.875rem',
                paddingBottom: '0.875rem',
                border: '2px solid #e5e7eb',
                borderRadius: '0.5rem',
                fontSize: '0.938rem',
                backgroundColor: 'white',
                outline: 'none',
                transition: 'all 0.2s'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#8b5cf6';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(139, 92, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#e5e7eb';
                e.currentTarget.style.boxShadow = 'none';
              }}
              required
            />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <label style={{ 
            display: 'block', 
            marginBottom: '0.5rem', 
            fontSize: '0.875rem', 
            fontWeight: '500', 
            color: '#374151' 
          }}>
            Password
          </label>
          <div style={{ 
            position: 'relative',
            display: 'flex',
            alignItems: 'center'
          }}>
            <FiLock style={{ 
              position: 'absolute',
              left: '1rem',
              color: '#9ca3af',
              fontSize: '1.125rem'
            }} />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              style={{
                width: '100%',
                paddingLeft: '3rem',
                paddingRight: '3rem',
                paddingTop: '0.875rem',
                paddingBottom: '0.875rem',
                border: '2px solid #e5e7eb',
                borderRadius: '0.5rem',
                fontSize: '0.938rem',
                backgroundColor: 'white',
                outline: 'none',
                transition: 'all 0.2s'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#8b5cf6';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(139, 92, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#e5e7eb';
                e.currentTarget.style.boxShadow = 'none';
              }}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '1rem',
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
                <FiEyeOff style={{ color: '#9ca3af', fontSize: '1.125rem' }} />
              ) : (
                <FiEye style={{ color: '#9ca3af', fontSize: '1.125rem' }} />
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
            padding: '0.875rem',
            background: isSubmitting || isLoading ? '#9ca3af' : 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: isSubmitting || isLoading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
            boxShadow: isSubmitting || isLoading ? 'none' : '0 4px 6px -1px rgba(139, 92, 246, 0.3)'
          }}
          onMouseOver={(e) => {
            if (!isSubmitting && !isLoading) {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 6px 8px -1px rgba(139, 92, 246, 0.4)';
            }
          }}
          onMouseOut={(e) => {
            if (!isSubmitting && !isLoading) {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(139, 92, 246, 0.3)';
            }
          }}
        >
          {isSubmitting || isLoading ? 'Signing In...' : 'Sign In'}
        </button>
      </form>

      {/* OR Divider */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        margin: '1.5rem 0',
        gap: '0.75rem'
      }}>
        <div style={{ flex: 1, height: '1px', backgroundColor: '#e5e7eb' }} />
        <span style={{ color: '#9ca3af', fontSize: '0.875rem', fontWeight: '600', textTransform: 'uppercase' }}>OR</span>
        <div style={{ flex: 1, height: '1px', backgroundColor: '#e5e7eb' }} />
      </div>

      {/* Google Login Button */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
        <GoogleLogin
          onSuccess={handleGoogleLogin}
          onError={handleGoogleError}
          text="signin_with"
          width="100%"
          size="large"
          theme="outline"
        />
      </div>

      {/* Admin Access Notice */}
      <div style={{
        padding: '1rem',
        backgroundColor: '#f5f3ff',
        border: '2px solid #e9d5ff',
        borderRadius: '0.5rem',
        fontSize: '0.875rem',
        color: '#6b21a8',
        display: 'flex',
        alignItems: 'start',
        gap: '0.75rem'
      }}>
        <FiShield style={{ fontSize: '1.125rem', marginTop: '0.125rem', flexShrink: 0 }} />
        <div>
          <strong style={{ display: 'block', marginBottom: '0.25rem' }}>Admin Access</strong>
          <span>Only authorized administrative personnel with valid credentials can access the admin portal.</span>
        </div>
      </div>

      <button
        onClick={() => setLoginMode('select')}
        style={{
          marginTop: '1.5rem',
          color: '#6b7280',
          backgroundColor: 'transparent',
          border: 'none',
          cursor: 'pointer',
          fontSize: '0.875rem',
          fontWeight: '500',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem',
          transition: 'color 0.2s'
        }}
        onMouseOver={(e) => e.currentTarget.style.color = '#111827'}
        onMouseOut={(e) => e.currentTarget.style.color = '#6b7280'}
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
      height: '100vh', 
      display: 'flex',
      backgroundColor: '#ffffff',
      overflow: 'hidden'
    }}>
      {/* Left Side - Login Form */}
      <div style={{
        flex: '1',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '2rem 2rem',
        maxWidth: '550px',
        position: 'relative',
        overflowY: 'auto'
      }}>
        {/* Logo/Brand */}
        <div style={{ marginBottom: '2rem' }}>
          <img 
            src="/images/logo.png" 
            alt="WinOnboard Logo" 
            style={{ 
              height: '80px',
              width: 'auto',
              objectFit: 'contain'
            }} 
          />
        </div>

        {/* Login Content Container */}
        <div style={{ maxWidth: '400px', width: '100%', margin: '0 auto' }}>
          {/* Error Message */}
          {error && (
            <div style={{
              padding: '1rem',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '0.5rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'start',
              gap: '0.75rem'
            }}>
              <span style={{ color: '#dc2626', fontSize: '1.25rem' }}>⚠</span>
              <p style={{ color: '#dc2626', fontSize: '0.875rem', margin: 0 }}>
                {error}
              </p>
            </div>
          )}

          {/* Render appropriate mode */}
          {loginMode === 'select' && renderModeSelection()}
          {loginMode === 'user' && renderUserLogin()}
          {loginMode === 'admin' && renderAdminLogin()}
        </div>

        {/* Footer Text */}
        <div style={{ 
          marginTop: 'auto', 
          paddingTop: '2rem',
          textAlign: 'center',
          color: '#9ca3af',
          fontSize: '0.875rem'
        }}>
          <p style={{ margin: 0 }}>© {new Date().getFullYear()} WinOnboard. All rights reserved.</p>
        </div>
      </div>

      {/* Right Side - Branding/Marketing */}
      <div style={{
        flex: '1',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2rem',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative Background Pattern */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.1,
          backgroundImage: `
            radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(255,255,255,0.3) 0%, transparent 50%)
          `
        }} />

        {/* Content */}
        <div style={{ 
          position: 'relative',
          zIndex: 1,
          textAlign: 'center',
          maxWidth: '500px'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            backdropFilter: 'blur(10px)'
          }}>
            <FiShield style={{ fontSize: '2.5rem', color: 'white' }} />
          </div>

          <h2 style={{ 
            fontSize: '2rem', 
            fontWeight: 'bold', 
            marginBottom: '0.75rem',
            lineHeight: '1.2'
          }}>
            Streamline Your Onboarding
          </h2>
          
          <p style={{ 
            fontSize: '1rem', 
            marginBottom: '1.5rem',
            opacity: 0.9,
            lineHeight: '1.6'
          }}>
            Welcome to WinOnboard - your comprehensive solution for seamless employee onboarding, document management, and progress tracking.
          </p>

          {/* Feature List */}
          <div style={{ 
            textAlign: 'left', 
            marginTop: '2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            {[
              { icon: '✓', title: 'Automated Workflows', desc: 'Streamline onboarding with automated task assignments' },
              { icon: '✓', title: 'Secure Document Management', desc: 'Safely store and manage employee documents' },
              { icon: '✓', title: 'Real-time Progress Tracking', desc: 'Monitor onboarding progress in real-time' }
            ].map((feature, index) => (
              <div key={index} style={{ 
                display: 'flex', 
                gap: '1rem',
                alignItems: 'start'
              }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  fontSize: '0.875rem',
                  fontWeight: 'bold'
                }}>
                  {feature.icon}
                </div>
                <div>
                  <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem', fontWeight: '600' }}>
                    {feature.title}
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.875rem', opacity: 0.8 }}>
                    {feature.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CSS Animation */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @media (max-width: 1024px) {
            /* Hide right side on tablets and mobile */
            div[style*="flex: 1"][style*="linear-gradient"] {
              display: none !important;
            }
          }
        `}
      </style>
    </div>
  );
};