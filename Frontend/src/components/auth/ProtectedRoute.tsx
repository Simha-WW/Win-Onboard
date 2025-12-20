/**
 * Protected Route Component
 * Wraps routes that require authentication and role-based access
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'HR' | 'FRESHER' | 'IT';
  fallbackPath?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  fallbackPath = '/login'
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
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
          <p style={{ color: '#6b7280' }}>Authenticating...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate 
      to={fallbackPath} 
      state={{ from: location }} 
      replace 
    />;
  }

  // Check role-based access if required
  if (requiredRole) {
    let hasRequiredRole = false;
    
    if (requiredRole === 'HR') {
      // For HR routes, check if user has any HR-related role or exists in HR table
      // This is determined during authentication when backend validates against hr_users table
      hasRequiredRole = user.role && (
        user.role.toLowerCase().includes('hr') || 
        user.role === 'HR' || 
        user.department === 'Human Resources'
      );
    } else if (requiredRole === 'FRESHER') {
      hasRequiredRole = user.role === 'FRESHER';
    } else if (requiredRole === 'IT') {
      hasRequiredRole = user.role === 'IT';
    }

    if (!hasRequiredRole) {
      // If user has HR privileges but tries to access fresher routes, redirect to HR portal
      if (user.role && user.role.toLowerCase().includes('hr') && requiredRole === 'FRESHER') {
        return <Navigate to="/hr" replace />;
      }
      
      // If fresher user tries to access HR routes, redirect to user portal
      if (user.role === 'FRESHER' && requiredRole === 'HR') {
        return <Navigate to="/" replace />;
      }

      // If IT user tries to access HR/Fresher routes, redirect to IT portal
      if (user.role === 'IT' && (requiredRole === 'HR' || requiredRole === 'FRESHER')) {
        return <Navigate to="/it" replace />;
      }

      // If HR user tries to access IT routes, redirect to HR portal
      if (user.role && user.role.toLowerCase().includes('hr') && requiredRole === 'IT') {
        return <Navigate to="/hr" replace />;
      }

      // If fresher user tries to access IT routes, redirect to user portal
      if (user.role === 'FRESHER' && requiredRole === 'IT') {
        return <Navigate to="/" replace />;
      }
      
      // For any other role mismatch, redirect to login
      return <Navigate to={fallbackPath} replace />;
    }
  }

  // User is authenticated and has the required role
  return <>{children}</>;
};