/**
 * Top Bar component with search, notifications, and user avatar
 * Responsive design with mobile menu trigger
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { clsx } from 'clsx';
import { useAuth } from '../../contexts/AuthContext';
import {
  FiSearch,
  FiBell,
  FiUpload,
  FiMenu,
  FiUser,
  FiSettings,
  FiLogOut,
  FiChevronDown
} from 'react-icons/fi';

interface TopbarProps {
  onMobileMenuToggle?: () => void;
  userName?: string;
  userAvatar?: string;
  unreadNotifications?: number;
}

/**
 * Application top bar with search, actions, and user menu
 */
export const Topbar = ({ 
  onMobileMenuToggle, 
  userName = "Bunny",
  userAvatar,
  unreadNotifications = 0
}: TopbarProps) => {
  const [searchFocused, setSearchFocused] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { logout } = useAuth();

  return (
    <header 
      className="bg-white/95 backdrop-blur-md relative z-20" 
      style={{ 
        borderBottom: `1px solid var(--border)`,
        boxShadow: 'var(--shadow-sm)'
      }}
    >
      <div style={{ 
        paddingLeft: 'var(--spacing-lg)', 
        paddingRight: 'var(--spacing-lg)' 
      }}>
        <div 
          className="flex items-center justify-between" 
          style={{ height: 'var(--topbar-height)' }}
        >
          {/* Left Section - Logo and Mobile Menu */}
          <div className="flex items-center" style={{ gap: 'var(--spacing-lg)' }}>
            {/* Mobile Menu Button - Semantic target size */}
            <button
              onClick={onMobileMenuToggle}
              className="lg:hidden transition-all anim-fast"
              style={{
                padding: 'var(--spacing-sm)',
                borderRadius: 'var(--radius-lg)',
                minHeight: 'var(--target-md)',
                minWidth: 'var(--target-md)'
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

            {/* Brand Logo - Responsive and prominent */}
            <div className="flex items-center" style={{ gap: 'var(--spacing-md)' }}>
              <div 
                className="bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-primary-dark)] flex items-center justify-center shadow-lg"
                style={{
                  width: 'var(--size-4xl)',   /* 36px on mobile */
                  height: 'var(--size-4xl)',
                  borderRadius: 'var(--radius-xl)'
                }}
              >
                <img 
                  src="/images/logo.jpg" 
                  alt="Company Logo" 
                  style={{
                    width: 'var(--icon-md)',
                    height: 'var(--icon-md)',
                    borderRadius: 'var(--radius-md)'
                  }}
                />
              </div>
              <span 
                className="font-bold tracking-tight"
                style={{
                  fontSize: 'var(--font-scale-2xl)',  /* Responsive: lg on desktop, xl on mobile */
                  color: 'var(--text-primary)'
                }}
              >
                WinOnboard
              </span>
            </div>

            {/* Search Bar - Semantic sizing and responsive width */}
            <div className="hidden sm:block ml-auto">
              <div 
                className="relative transition-all anim-medium"
                style={{
                  width: '320px' // Fixed smaller width to not interfere with upload button
                }}
              >
                <FiSearch 
                  className="absolute top-1/2 transform -translate-y-1/2 transition-colors anim-fast"
                  style={{
                    left: 'var(--spacing-md)',
                    width: 'var(--icon-sm)',
                    height: 'var(--icon-sm)',
                    color: searchFocused ? 'var(--brand-primary)' : 'var(--text-muted)'
                  }}
                />
                <input
                  type="text"
                  placeholder="Search onboarding tasks..."
                  className="w-full transition-all anim-medium font-medium"
                  style={{
                    paddingLeft: 'calc(var(--spacing-md) + var(--icon-sm) + var(--spacing-sm))', // Icon + spacing
                    paddingRight: 'var(--spacing-md)',
                    paddingTop: 'var(--spacing-sm)',
                    paddingBottom: 'var(--spacing-sm)',
                    height: 'var(--target-md)',  // Semantic input height
                    backgroundColor: 'var(--bg-secondary)',
                    border: `1px solid var(--border)`,
                    borderRadius: 'var(--radius-xl)',
                    fontSize: 'var(--font-scale-sm)'
                  }}
                  onFocus={(e) => {
                    setSearchFocused(true);
                    e.target.style.boxShadow = `0 0 0 2px var(--brand-primary)20`;
                    e.target.style.borderColor = 'var(--brand-primary)';
                  }}
                  onBlur={(e) => {
                    setSearchFocused(false);
                    e.target.style.boxShadow = 'none';
                    e.target.style.borderColor = 'var(--border)';
                  }}
                />
              </div>
            </div>
          </div>

          {/* Right Section - Semantic spacing and sizing */}
          <div className="flex items-center" style={{ gap: 'var(--spacing-md)' }}>
            {/* Upload Document Button - Enhanced semantic spacing and visual alignment */}
            <Button 
              variant="primary" 
              size="md"
              leftIcon={
                <FiUpload 
                  style={{ 
                    width: 'var(--icon-sm)', 
                    height: 'var(--icon-sm)' 
                  }} 
                />
              }
              className="hidden sm:inline-flex font-semibold"
              style={{ 
                boxShadow: 'var(--shadow-md)',
                padding: 'var(--spacing-sm) var(--spacing-lg)',
                gap: 'var(--spacing-md)'
              }}
            >
              Upload Document
            </Button>

            {/* Notifications - Semantic target size */}
            <div className="relative">
              <button 
                className="relative group transition-all anim-fast"
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
                <FiBell 
                  className="group-hover:text-[var(--brand-primary)] transition-colors anim-fast"
                  style={{ 
                    width: 'var(--icon-sm)', 
                    height: 'var(--icon-sm)',
                    color: 'var(--text-secondary)'
                  }} 
                />
                {unreadNotifications > 0 && (
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
                    {unreadNotifications > 9 ? '9+' : unreadNotifications}
                  </motion.span>
                )}
              </button>
            </div>

            {/* User Menu - Semantic sizing and spacing */}
            <div className="relative">
              <motion.button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center transition-all anim-fast"
                style={{
                  gap: 'var(--spacing-md)',
                  padding: 'var(--spacing-sm)',
                  borderRadius: 'var(--radius-xl)',
                  minHeight: 'var(--target-md)'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--brand-muted)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* User Avatar - Semantic sizing */}
                <div 
                  className="bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-primary-dark)] flex items-center justify-center text-white font-bold"
                  style={{
                    width: 'var(--size-4xl)',   /* Larger, more prominent */
                    height: 'var(--size-4xl)',
                    borderRadius: 'var(--radius-xl)',
                    fontSize: 'var(--font-scale-sm)',
                    boxShadow: 'var(--shadow-lg)'
                  }}
                >
                  {userAvatar ? (
                    <img 
                      src={userAvatar} 
                      alt={userName}
                      style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: 'var(--radius-xl)',
                        objectFit: 'cover'
                      }}
                    />
                  ) : (
                    userName.charAt(0).toUpperCase()
                  )}
                </div>

                {/* User Name (Desktop) - Semantic spacing and typography */}
                <div className="hidden md:flex items-center" style={{ gap: 'var(--spacing-sm)' }}>
                  <span 
                    className="font-semibold"
                    style={{
                      fontSize: 'var(--font-scale-sm)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    {userName}
                  </span>
                  <FiChevronDown 
                    className={clsx('transition-transform anim-fast', userMenuOpen && 'rotate-180')}
                    style={{
                      width: 'var(--icon-xs)',
                      height: 'var(--icon-xs)',
                      color: 'var(--text-muted)'
                    }}
                  />
                </div>
              </motion.button>

              {/* Dropdown Menu */}
              {userMenuOpen && (
                <>
                  {/* Overlay */}
                  <div 
                    className="fixed inset-0 z-10"
                    onClick={() => setUserMenuOpen(false)}
                  />
                  
                  {/* Enhanced Profile Dropdown Menu */}
                  <motion.div
                    className="absolute right-0 top-full bg-white z-20 backdrop-blur-md"
                    style={{
                      marginTop: 'var(--spacing-md)',
                      width: '240px',
                      borderRadius: 'var(--radius-2xl)',
                      boxShadow: 'var(--shadow-2xl)',
                      border: `1px solid var(--border)`,
                      padding: 'var(--spacing-md)'
                    }}
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                  >
                    {/* User Info Section with enhanced spacing */}
                    <div 
                      style={{
                        padding: 'var(--spacing-md)',
                        marginBottom: 'var(--spacing-md)',
                        borderBottom: `1px solid var(--border)`,
                        borderRadius: 'var(--radius-lg)',
                        backgroundColor: 'var(--bg-secondary)'
                      }}
                    >
                      <p 
                        className="font-semibold"
                        style={{
                          fontSize: 'var(--font-scale-sm)',
                          color: 'var(--text-primary)',
                          marginBottom: 'var(--spacing-xs)'
                        }}
                      >
                        {userName}
                      </p>
                      <p 
                        style={{
                          fontSize: 'var(--font-scale-xs)',
                          color: 'var(--text-secondary)'
                        }}
                      >
                        New Employee
                      </p>
                    </div>

                    {/* Menu Items with enhanced spacing and padding */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
                      <button 
                        className="w-full flex items-center font-medium transition-all anim-medium"
                        style={{
                          gap: 'var(--spacing-md)',
                          padding: 'var(--spacing-md) var(--spacing-lg)',
                          fontSize: 'var(--font-scale-sm)',
                          color: 'var(--text-secondary)',
                          borderRadius: 'var(--radius-lg)',
                          minHeight: 'var(--target-md)',
                          textAlign: 'left'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--brand-muted)';
                          e.currentTarget.style.color = 'var(--brand-primary)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = 'var(--text-secondary)';
                        }}
                      >
                        <FiUser style={{ width: 'var(--icon-sm)', height: 'var(--icon-sm)' }} />
                        Profile
                      </button>

                      <button 
                        className="w-full flex items-center font-medium transition-all anim-medium"
                        style={{
                          gap: 'var(--spacing-md)',
                          padding: 'var(--spacing-md) var(--spacing-lg)',
                          fontSize: 'var(--font-scale-sm)',
                          color: 'var(--text-secondary)',
                          borderRadius: 'var(--radius-lg)',
                          minHeight: 'var(--target-md)',
                          textAlign: 'left'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--brand-muted)';
                          e.currentTarget.style.color = 'var(--brand-primary)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = 'var(--text-secondary)';
                        }}
                      >
                        <FiSettings style={{ width: 'var(--icon-sm)', height: 'var(--icon-sm)' }} />
                        Settings
                      </button>
                    </div>

                    {/* Separator with semantic spacing */}
                    <div 
                      style={{
                        borderTop: `1px solid var(--border)`,
                        margin: 'var(--spacing-md) 0',
                        paddingTop: 'var(--spacing-md)'
                      }}
                    >
                      <button 
                        onClick={() => {
                          setUserMenuOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center font-medium transition-all anim-medium"
                        style={{
                          gap: 'var(--spacing-md)',
                          padding: 'var(--spacing-md) var(--spacing-lg)',
                          fontSize: 'var(--font-scale-sm)',
                          color: 'var(--error)',
                          borderRadius: 'var(--radius-lg)',
                          minHeight: 'var(--target-md)',
                          textAlign: 'left'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#fef2f2';
                          e.currentTarget.style.color = '#dc2626';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = 'var(--error)';
                        }}
                      >
                        <FiLogOut style={{ width: 'var(--icon-sm)', height: 'var(--icon-sm)' }} />
                        Sign Out
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};