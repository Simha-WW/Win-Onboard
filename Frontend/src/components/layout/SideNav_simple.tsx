/**
 * Simplified Side Navigation component
 */

import { NavLink, useLocation } from 'react-router-dom';
import {
  FiHome,
  FiCheckSquare,
  FiFileText,
  FiCalendar,
  FiBookOpen,
  FiBell,
  FiMenu
} from 'react-icons/fi';

interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: React.ComponentType<{ style?: React.CSSProperties }>;
  badge?: number;
}

const navItems: NavItem[] = [
  { id: 'home', label: 'Home', path: '/', icon: FiHome },
  { id: 'checklist', label: 'Checklist', path: '/checklist', icon: FiCheckSquare },
  { id: 'documents', label: 'Documents', path: '/documents', icon: FiFileText },
  { id: 'day1', label: 'Day-1 Hub', path: '/day1-hub', icon: FiCalendar },
  { id: 'training', label: 'Training', path: '/training', icon: FiBookOpen },
  { id: 'notifications', label: 'Notifications', path: '/notifications', icon: FiBell, badge: 3 }
];

interface SideNavProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobile?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

export const SideNav = ({ 
  isCollapsed, 
  onToggleCollapse, 
  isMobile = false 
}: SideNavProps) => {
  const location = useLocation();

  if (isMobile) {
    return null; // Skip mobile for now
  }

  return (
    <div
      style={{
        width: isCollapsed ? '60px' : '240px',
        height: '100vh',
        backgroundColor: 'white',
        borderRight: '1px solid #e5e7eb',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.3s ease'
      }}
    >
      {/* Header with toggle */}
      <div style={{ borderBottom: '1px solid #e5e7eb', padding: '16px' }}>
        <button
          onClick={onToggleCollapse}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#6b7280',
            padding: '8px',
            backgroundColor: 'transparent',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <FiMenu style={{ width: '20px', height: '20px' }} />
        </button>
      </div>

      {/* Navigation Items */}
      <nav style={{ flex: 1, padding: '16px' }}>
        <ul style={{ display: 'flex', flexDirection: 'column', gap: '4px', listStyle: 'none', margin: 0, padding: 0 }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <li key={item.id}>
                <NavLink
                  to={item.path}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: isCollapsed ? '0' : '12px',
                    padding: '12px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    backgroundColor: isActive ? '#2563eb' : 'transparent',
                    color: isActive ? 'white' : '#6b7280',
                    transition: 'all 0.2s ease',
                    justifyContent: isCollapsed ? 'center' : 'flex-start',
                    position: 'relative'
                  }}
                  onMouseOver={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = '#f3f4f6';
                      e.currentTarget.style.color = '#2563eb';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#6b7280';
                    }
                  }}
                >
                  {/* Icon */}
                  <Icon style={{ width: '20px', height: '20px', flexShrink: 0 }} />

                  {/* Label - only show when not collapsed */}
                  {!isCollapsed && (
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between', 
                      flex: 1, 
                      minWidth: 0 
                    }}>
                      <span style={{ 
                        fontWeight: '600', 
                        fontSize: '14px', 
                        whiteSpace: 'nowrap', 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis' 
                      }}>
                        {item.label}
                      </span>
                      
                      {/* Badge */}
                      {item.badge && (
                        <span style={{
                          backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : '#2563eb',
                          color: 'white',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          marginLeft: '8px'
                        }}>
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Collapsed Badge - show as dot */}
                  {isCollapsed && item.badge && (
                    <div style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      width: '8px',
                      height: '8px',
                      backgroundColor: '#ef4444',
                      borderRadius: '50%'
                    }} />
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User section for collapsed state */}
      {isCollapsed && (
        <div style={{
          padding: '16px',
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'center'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            backgroundColor: '#2563eb',
            color: 'white',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            fontSize: '14px'
          }}>
            B
          </div>
        </div>
      )}
    </div>
  );
};