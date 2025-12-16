/**
 * Side Navigation component with collapsible functionality
 * Features smooth animations and active state management
 */

import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  FiHome,
  FiCheckSquare,
  FiFileText,
  FiCalendar,
  FiBookOpen,
  FiBell,
  FiMenu,
  FiX
} from 'react-icons/fi';

interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
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

/**
 * Animated side navigation with collapsible design and mobile drawer
 */
export const SideNav = ({ 
  isCollapsed, 
  onToggleCollapse, 
  isMobile = false, 
  isOpen = false, 
  onClose 
}: SideNavProps) => {
  const location = useLocation();

  // Mobile version
  if (isMobile) {
    return null; // Simplified - no mobile version for now
  }

  // Desktop version with inline styles
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
      <SideNavContent 
        isCollapsed={isCollapsed} 
        currentPath={location.pathname}
        onToggleCollapse={onToggleCollapse}
      />
    </div>
  );
};

interface SideNavContentProps {
  isCollapsed: boolean;
  currentPath: string;
  onItemClick?: () => void;
  onToggleCollapse?: () => void;
  showCloseButton?: boolean;
  onClose?: () => void;
}

const SideNavContent = ({ 
  isCollapsed, 
  currentPath, 
  onItemClick, 
  onToggleCollapse,
  showCloseButton = false,
  onClose
}: SideNavContentProps) => {
  return (
    <div className="flex flex-col h-full">
      {/* Compact Header - No logo, just toggle */}
      <div 
        className="flex items-center justify-center"
        style={{
          padding: 'var(--spacing-lg)',
          borderBottom: `1px solid var(--border)`,
          minHeight: 'var(--topbar-height)' // Match topbar height for alignment
        }}
      >
        {/* Toggle/Close Button - Centered and prominent */}
        {showCloseButton ? (
          <button
            onClick={onClose}
            className="transition-all anim-fast"
            style={{
              padding: 'var(--spacing-sm)',
              borderRadius: 'var(--radius-xl)',
              minHeight: 'var(--target-md)',
              minWidth: 'var(--target-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--brand-muted)'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            <FiX 
              style={{ 
                width: 'var(--icon-md)', 
                height: 'var(--icon-md)',
                color: 'var(--text-secondary)'
              }} 
            />
          </button>
        ) : (
          <button
            onClick={onToggleCollapse}
            className="transition-all anim-fast"
            style={{
              padding: 'var(--spacing-sm)',
              borderRadius: 'var(--radius-xl)',
              minHeight: 'var(--target-md)',
              minWidth: 'var(--target-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--brand-muted)'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            <FiMenu 
              style={{ 
                width: 'var(--icon-md)', 
                height: 'var(--icon-md)',
                color: 'var(--text-secondary)'
              }} 
            />
          </button>
        )}
      </div>

      {/* Navigation Items - Semantic spacing and sizing */}
      <nav className="flex-1" style={{ padding: 'var(--spacing-lg)' }}>
        <ul style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path;

            return (
              <li key={item.id}>
                <NavLink
                  to={item.path}
                  onClick={onItemClick}
                  className={({ isActive }) =>
                    clsx(
                      'flex items-center relative group transition-all anim-medium',
                      isActive
                        ? 'bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-primary-dark)] text-white'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--brand-muted)] hover:text-[var(--brand-primary)]'
                    )
                  }
                  style={{
                    gap: 'var(--spacing-md)',
                    padding: 'var(--spacing-md)',
                    borderRadius: 'var(--radius-xl)',
                    minHeight: 'var(--target-md)', // Comfortable touch target
                    boxShadow: isActive ? 'var(--shadow-lg)' : 'none'
                  }}
                >
                  {/* Active Indicator */}
                  {isActive && (
                    <motion.div
                      className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full"
                      layoutId="activeIndicator"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}

                  {/* Icon - Semantic sizing */}
                  <Icon 
                    className={clsx(
                      'flex-shrink-0 transition-transform anim-fast group-hover:scale-110',
                      isCollapsed && 'mx-auto'
                    )}
                    style={{
                      width: 'var(--icon-sm)',
                      height: 'var(--icon-sm)'
                    }}
                  />

                  {/* Label */}
                  <AnimatePresence>
                    {!isCollapsed && (
                      <motion.div
                        className="flex items-center justify-between flex-1 min-w-0"
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                      >
                        <span 
                          className="font-semibold truncate"
                          style={{ fontSize: 'var(--font-scale-sm)' }}
                        >
                          {item.label}
                        </span>
                        
                        {/* Badge */}
                        {item.badge && (
                          <motion.span
                            className={clsx(
                              'px-2 py-1 rounded-lg text-xs font-bold ml-3 shadow-sm',
                              isActive 
                                ? 'bg-white/20 text-white backdrop-blur-sm'
                                : 'bg-[var(--brand-primary)] text-white'
                            )}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
                          >
                            {item.badge}
                          </motion.span>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Collapsed Badge - Semantic sizing */}
                  {isCollapsed && item.badge && (
                    <motion.span
                      className="absolute bg-gradient-to-r from-red-500 to-red-600 text-white flex items-center justify-center font-bold"
                      style={{
                        top: 'calc(var(--spacing-xs) * -1)',
                        right: 'calc(var(--spacing-xs) * -1)',
                        width: 'var(--size-xl)',
                        height: 'var(--size-xl)',
                        borderRadius: 'var(--radius-full)',
                        fontSize: 'var(--font-scale-xs)',
                        boxShadow: 'var(--shadow-lg)'
                      }}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
                      {item.badge}
                    </motion.span>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Section (Collapsed state) - Semantic sizing and spacing */}
      {isCollapsed && (
        <div 
          className="flex justify-center"
          style={{
            padding: 'var(--spacing-lg)',
            borderTop: `1px solid var(--border)`
          }}
        >
          <motion.div 
            className="bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-primary-dark)] flex items-center justify-center text-white font-bold cursor-pointer transition-all anim-fast"
            style={{
              width: 'var(--size-5xl)',   // Larger, more prominent
              height: 'var(--size-5xl)',
              borderRadius: 'var(--radius-xl)',
              fontSize: 'var(--font-scale-lg)',
              boxShadow: 'var(--shadow-lg)'
            }}
            whileHover={{ 
              scale: 1.05,
              boxShadow: 'var(--shadow-xl)'
            }}
            whileTap={{ scale: 0.95 }}
          >
            B
          </motion.div>
        </div>
      )}
    </div>
  );
};