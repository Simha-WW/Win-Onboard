/**
 * HR Shell - Layout wrapper for HR Portal pages with dedicated HR navigation
 */

import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { 
  FiHome, 
  FiUsers, 
  FiUserPlus,
  FiCheckSquare, 
  FiFileText, 
  FiCpu, 
  FiBarChart2, 
  FiSettings,
  FiBriefcase,
  FiLogOut,
  FiGift
} from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';

export const HrShell = () => {
  console.log('HR Shell rendering...');
  const { logout } = useAuth();

  const hrNavItems = [
    { path: '/hr', label: 'Dashboard', icon: <FiHome /> },
    { path: '/hr/add-user', label: 'Add User', icon: <FiUserPlus /> },
    { path: '/hr/candidates', label: 'Candidates & Offers', icon: <FiUsers /> },
    { path: '/hr/prejoin', label: 'Pre-Join Tasks', icon: <FiCheckSquare /> },
    { path: '/hr/documents', label: 'Documents & BGV', icon: <FiFileText /> },
    { path: '/hr/it-progress', label: 'IT Progress', icon: <FiCpu /> },
    { path: '/hr/reports', label: 'Reports & Exports', icon: <FiBarChart2 /> },
    { path: '/hr/birthdays', label: 'Birthdays', icon: <FiGift /> },
    { path: '/hr/settings', label: 'Settings', icon: <FiSettings /> }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* HR Portal Header */}
      <header style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        {/* Top Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 24px',
          borderBottom: '1px solid #e2e8f0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <FiBriefcase style={{ width: '24px', height: '24px', color: '#2563eb' }} />
            <h1 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#1f2937',
              margin: 0
            }}>
              HR Portal
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '14px',
              fontWeight: '600'
            }}>
              HR
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
                HR Admin
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>
                Human Resources
              </div>
            </div>
            <button
              onClick={logout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                backgroundColor: '#dc2626',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                color: 'white',
                fontWeight: '500',
                marginLeft: '16px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#b91c1c';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#dc2626';
              }}
            >
              <FiLogOut style={{ width: '16px', height: '16px' }} />
              Logout
            </button>
          </div>
        </div>

        {/* HR Navigation Bar */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          padding: '0 24px',
          backgroundColor: '#fafafa',
          overflow: 'auto'
        }}>
          {hrNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/hr'}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 16px',
                textDecoration: 'none',
                color: isActive ? '#2563eb' : '#6b7280',
                backgroundColor: isActive ? 'white' : 'transparent',
                borderTop: isActive ? '3px solid #2563eb' : '3px solid transparent',
                borderBottom: isActive ? '1px solid white' : '1px solid transparent',
                fontSize: '14px',
                fontWeight: '500',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
                marginBottom: '-1px'
              })}
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      {/* Main Content */}
      <main style={{
        flex: 1,
        overflow: 'auto',
        backgroundColor: '#f8f9fa'
      }}>
        <Outlet />
      </main>
    </div>
  );
};