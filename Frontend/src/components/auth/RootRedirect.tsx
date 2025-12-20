/**
 * Root Redirect Component
 * Handles initial routing based on authentication status
 */

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export const RootRedirect: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

  // Show loading while checking authentication
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

  // If not authenticated, go to login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated, redirect based on role
  if (user.role === 'HR') {
    return <Navigate to="/hr" replace />;
  } else if (user.role === 'FRESHER') {
    return <Navigate to="/dashboard" replace />;
  } else if (user.role === 'IT') {
    return <Navigate to="/it" replace />;
  } else if (user.role === 'LD') {
    return <Navigate to="/ld" replace />;
  }

  // Fallback to login
  return <Navigate to="/login" replace />;
};