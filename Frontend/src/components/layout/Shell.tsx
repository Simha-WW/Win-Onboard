/**
 * Application Shell - Main layout component
 * Combines sidebar navigation, top bar, and main content area
 */

import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { SideNav } from './SideNav';
import { Topbar } from './Topbar';
import { useAuth } from '../../contexts/AuthContext';
import AIAgentChat from '../AIAgentChat';

/**
 * Main application shell with responsive sidebar and content layout
 */
export const Shell = () => {
  console.log('Shell component rendering...');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user } = useAuth();

  return (
    <>
      <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f8f9fa' }}>
        {/* Desktop Sidebar */}
        <SideNav
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          isMobile={false}
        />

        {/* Main Content Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Top Bar */}
          <Topbar
            onMobileMenuToggle={() => {}}
            userName={user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || user.email : 'User'}
            unreadNotifications={3}
          />

          {/* Page Content */}
          <main style={{ flex: 1, overflow: 'auto' }}>
            <div style={{
              padding: '40px 20px',
              maxWidth: '1200px',
              margin: '0 auto',
              minHeight: '100%',
              backgroundColor: 'white'
            }}>
              <Outlet />
            </div>
          </main>
        </div>
      </div>
      
      {/* AI Agent Chat - Always visible */}
      <AIAgentChat />
    </>
  );
};