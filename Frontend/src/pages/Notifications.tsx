/**
 * Notifications Page - Simplified version
 */

import { FiBell, FiMail, FiCalendar, FiUser, FiAlertCircle } from 'react-icons/fi';

export const Notifications = () => {
  console.log('Notifications component rendering...');
  
  const notifications = [
    { 
      id: 1, 
      type: 'welcome', 
      title: 'Welcome to WinOnboard!', 
      message: 'Complete your profile setup to get started', 
      time: '2 hours ago',
      read: false
    },
    { 
      id: 2, 
      type: 'task', 
      title: 'New Task Assigned', 
      message: 'Complete your IT security training by end of week', 
      time: '4 hours ago',
      read: false
    },
    { 
      id: 3, 
      type: 'meeting', 
      title: 'Team Meeting Scheduled', 
      message: 'Weekly team standup tomorrow at 10:00 AM', 
      time: '1 day ago',
      read: false
    },
    { 
      id: 4, 
      type: 'document', 
      title: 'Document Shared', 
      message: 'Employee handbook has been updated', 
      time: '2 days ago',
      read: true
    },
    { 
      id: 5, 
      type: 'system', 
      title: 'System Update', 
      message: 'Platform maintenance scheduled for this weekend', 
      time: '3 days ago',
      read: true
    }
  ];

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'welcome': return <FiUser style={{ color: '#2563eb', width: '20px', height: '20px' }} />;
      case 'task': return <FiAlertCircle style={{ color: '#f59e0b', width: '20px', height: '20px' }} />;
      case 'meeting': return <FiCalendar style={{ color: '#10b981', width: '20px', height: '20px' }} />;
      case 'document': return <FiMail style={{ color: '#8b5cf6', width: '20px', height: '20px' }} />;
      default: return <FiBell style={{ color: '#6b7280', width: '20px', height: '20px' }} />;
    }
  };

  const getNotificationBg = (type: string) => {
    switch (type) {
      case 'welcome': return '#dbeafe';
      case 'task': return '#fef3c7';
      case 'meeting': return '#d1fae5';
      case 'document': return '#e9d5ff';
      default: return '#f3f4f6';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div style={{ padding: '20px', backgroundColor: 'white', minHeight: '500px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <h1 style={{ color: 'black', fontSize: '28px', fontWeight: 'bold' }}>
          🔔 Notifications
        </h1>
        {unreadCount > 0 && (
          <div style={{
            backgroundColor: '#ef4444',
            color: 'white',
            fontSize: '12px',
            fontWeight: 'bold',
            padding: '4px 8px',
            borderRadius: '12px'
          }}>
            {unreadCount} New
          </div>
        )}
      </div>
      
      <p style={{ color: '#6b7280', fontSize: '16px', marginBottom: '30px' }}>
        Stay updated with important messages, tasks, and announcements.
      </p>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '30px' }}>
        <button style={{
          backgroundColor: '#2563eb',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          padding: '10px 16px',
          fontSize: '14px',
          fontWeight: '600',
          cursor: 'pointer'
        }}>
          Mark All as Read
        </button>
        <button style={{
          backgroundColor: 'white',
          color: '#6b7280',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '10px 16px',
          fontSize: '14px',
          fontWeight: '600',
          cursor: 'pointer'
        }}>
          Filter
        </button>
      </div>

      {/* Notifications List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {notifications.map((notification) => (
          <div key={notification.id} style={{
            backgroundColor: notification.read ? 'white' : '#fafafa',
            border: `1px solid ${notification.read ? '#e5e7eb' : '#d1d5db'}`,
            borderRadius: '12px',
            padding: '20px',
            transition: 'all 0.2s ease',
            borderLeft: notification.read ? '1px solid #e5e7eb' : '4px solid #2563eb'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.boxShadow = 'none';
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <div style={{
                backgroundColor: getNotificationBg(notification.type),
                padding: '12px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {getNotificationIcon(notification.type)}
              </div>
              
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <h3 style={{ 
                    fontWeight: notification.read ? '500' : 'bold', 
                    fontSize: '16px', 
                    color: 'black',
                    margin: 0
                  }}>
                    {notification.title}
                  </h3>
                  <span style={{ color: '#6b7280', fontSize: '12px' }}>
                    {notification.time}
                  </span>
                </div>
                
                <p style={{ 
                  color: '#6b7280', 
                  fontSize: '14px', 
                  lineHeight: '1.5',
                  margin: 0,
                  fontWeight: notification.read ? 'normal' : '500'
                }}>
                  {notification.message}
                </p>
              </div>

              {!notification.read && (
                <div style={{
                  width: '8px',
                  height: '8px',
                  backgroundColor: '#2563eb',
                  borderRadius: '50%',
                  marginTop: '8px'
                }} />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State Message */}
      {notifications.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
          <FiBell style={{ width: '48px', height: '48px', margin: '0 auto 16px', color: '#d1d5db' }} />
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>No notifications yet</h3>
          <p style={{ fontSize: '14px' }}>We'll notify you when there are updates about your onboarding.</p>
        </div>
      )}
    </div>
  );
};