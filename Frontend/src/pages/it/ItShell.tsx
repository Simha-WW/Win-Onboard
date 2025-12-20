/**
 * IT Portal Shell
 * Main layout and navigation for IT Portal
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export const ItShell: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f3f4f6',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <header style={{
        backgroundColor: '#1f2937',
        color: 'white',
        padding: '16px 24px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            margin: 0
          }}>
            IT Portal
          </h1>
          
          <button
            onClick={handleLogout}
            style={{
              backgroundColor: '#ef4444',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{
        flex: 1,
        padding: '48px 24px',
        maxWidth: '1400px',
        width: '100%',
        margin: '0 auto'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '48px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          textAlign: 'center'
        }}>
          <h2 style={{
            fontSize: '36px',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '16px'
          }}>
            Welcome to IT Portal
          </h2>
          
          <p style={{
            fontSize: '18px',
            color: '#6b7280',
            marginBottom: '32px'
          }}>
            Manage IT tasks, equipment requests, and user onboarding
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '24px',
            marginTop: '48px'
          }}>
            {/* Placeholder cards for future features */}
            <div style={{
              padding: '24px',
              borderRadius: '8px',
              backgroundColor: '#f9fafb',
              border: '2px dashed #d1d5db'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Pending Tasks
              </h3>
              <p style={{
                fontSize: '14px',
                color: '#6b7280'
              }}>
                View and manage IT onboarding tasks
              </p>
            </div>

            <div style={{
              padding: '24px',
              borderRadius: '8px',
              backgroundColor: '#f9fafb',
              border: '2px dashed #d1d5db'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Equipment Requests
              </h3>
              <p style={{
                fontSize: '14px',
                color: '#6b7280'
              }}>
                Handle hardware and software requests
              </p>
            </div>

            <div style={{
              padding: '24px',
              borderRadius: '8px',
              backgroundColor: '#f9fafb',
              border: '2px dashed #d1d5db'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                User Management
              </h3>
              <p style={{
                fontSize: '14px',
                color: '#6b7280'
              }}>
                Manage user accounts and permissions
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        backgroundColor: 'white',
        padding: '16px 24px',
        borderTop: '1px solid #e5e7eb',
        textAlign: 'center'
      }}>
        <p style={{
          fontSize: '14px',
          color: '#6b7280',
          margin: 0
        }}>
          © 2025 WinOnboard IT Portal. All rights reserved.
        </p>
      </footer>
    </div>
  );
};
