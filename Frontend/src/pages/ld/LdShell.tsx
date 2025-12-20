import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { FiHome, FiBook, FiUsers, FiCalendar, FiBarChart2, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';

export const LdShell: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Sidebar */}
      <div style={{
        width: '260px',
        backgroundColor: '#1e293b',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '2px 0 10px rgba(0,0,0,0.1)'
      }}>
        {/* Logo/Header */}
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>L&D Portal</h1>
          <p style={{ fontSize: '0.875rem', margin: '0.5rem 0 0', opacity: 0.9 }}>
            Learning & Development
          </p>
        </div>

        {/* User Info */}
        <div style={{
          padding: '1rem 1.5rem',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          backgroundColor: 'rgba(255,255,255,0.05)'
        }}>
          <div style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Logged in as</div>
          <div style={{ fontWeight: '600', marginTop: '0.25rem' }}>
            {user?.firstName} {user?.lastName}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>
            {user?.email}
          </div>
        </div>

        {/* Navigation Links */}
        <nav style={{ flex: 1, padding: '1rem 0', overflowY: 'auto' }}>
          <NavLink
            to="/ld"
            end
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1.5rem',
              color: isActive ? '#fff' : '#cbd5e1',
              textDecoration: 'none',
              backgroundColor: isActive ? 'rgba(139, 92, 246, 0.2)' : 'transparent',
              borderLeft: isActive ? '3px solid #8b5cf6' : '3px solid transparent',
              transition: 'all 0.2s',
              fontWeight: isActive ? '600' : '400'
            })}
          >
            <FiHome size={20} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/ld/training-assignments"
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1.5rem',
              color: isActive ? '#fff' : '#cbd5e1',
              textDecoration: 'none',
              backgroundColor: isActive ? 'rgba(139, 92, 246, 0.2)' : 'transparent',
              borderLeft: isActive ? '3px solid #8b5cf6' : '3px solid transparent',
              transition: 'all 0.2s',
              fontWeight: isActive ? '600' : '400'
            })}
          >
            <FiBook size={20} />
            <span>Training Assignments</span>
          </NavLink>

          <NavLink
            to="/ld/new-employees"
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1.5rem',
              color: isActive ? '#fff' : '#cbd5e1',
              textDecoration: 'none',
              backgroundColor: isActive ? 'rgba(139, 92, 246, 0.2)' : 'transparent',
              borderLeft: isActive ? '3px solid #8b5cf6' : '3px solid transparent',
              transition: 'all 0.2s',
              fontWeight: isActive ? '600' : '400'
            })}
          >
            <FiUsers size={20} />
            <span>New Employees</span>
          </NavLink>

          <NavLink
            to="/ld/schedule"
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1.5rem',
              color: isActive ? '#fff' : '#cbd5e1',
              textDecoration: 'none',
              backgroundColor: isActive ? 'rgba(139, 92, 246, 0.2)' : 'transparent',
              borderLeft: isActive ? '3px solid #8b5cf6' : '3px solid transparent',
              transition: 'all 0.2s',
              fontWeight: isActive ? '600' : '400'
            })}
          >
            <FiCalendar size={20} />
            <span>Training Schedule</span>
          </NavLink>

          <NavLink
            to="/ld/reports"
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1.5rem',
              color: isActive ? '#fff' : '#cbd5e1',
              textDecoration: 'none',
              backgroundColor: isActive ? 'rgba(139, 92, 246, 0.2)' : 'transparent',
              borderLeft: isActive ? '3px solid #8b5cf6' : '3px solid transparent',
              transition: 'all 0.2s',
              fontWeight: isActive ? '600' : '400'
            })}
          >
            <FiBarChart2 size={20} />
            <span>Reports</span>
          </NavLink>
        </nav>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '1rem 1.5rem',
            color: '#cbd5e1',
            backgroundColor: 'transparent',
            border: 'none',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            cursor: 'pointer',
            fontSize: '1rem',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
            e.currentTarget.style.color = '#ef4444';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#cbd5e1';
          }}
        >
          <FiLogOut size={20} />
          <span>Logout</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        <Outlet />
      </div>
    </div>
  );
};
