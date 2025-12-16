/**
 * HR Settings - Configure HR system settings and preferences
 */

import React, { useState } from 'react';
import { 
  FiSettings, 
  FiUsers, 
  FiBell, 
  FiMail, 
  FiDatabase,
  FiShield,
  FiToggleLeft,
  FiToggleRight,
  FiSave,
  FiRefreshCw
} from 'react-icons/fi';

export const HrSettings = () => {
  console.log('HR Settings rendering...');

  const [activeTab, setActiveTab] = useState<'general' | 'notifications' | 'integrations' | 'security'>('general');
  
  // Mock settings state - TODO: Replace with API data
  const [settings, setSettings] = useState({
    general: {
      companyName: 'TechCorp Solutions',
      timezone: 'America/New_York',
      dateFormat: 'MM/DD/YYYY',
      defaultLanguage: 'en',
      workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      workingHours: { start: '09:00', end: '17:00' }
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      newCandidateAlert: true,
      documentSubmissionAlert: true,
      taskDueReminder: true,
      weeklyReports: true,
      monthlyReports: false
    },
    integrations: {
      emailProvider: 'gmail',
      calendarIntegration: true,
      slackIntegration: false,
      backgroundCheckProvider: 'SecureCheck Inc.',
      documentStorage: 'cloud',
      apiKey: '••••••••••••••••'
    },
    security: {
      twoFactorAuth: true,
      sessionTimeout: 30,
      passwordPolicy: 'strong',
      auditLogging: true,
      dataEncryption: true,
      accessControl: 'role-based'
    }
  });

  const toggleSetting = (category: string, key: string) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [key]: !prev[category as keyof typeof prev][key as keyof (typeof prev)[keyof typeof prev]]
      }
    }));
  };

  const updateSetting = (category: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [key]: value
      }
    }));
  };

  const tabs = [
    { id: 'general', label: 'General', icon: <FiSettings /> },
    { id: 'notifications', label: 'Notifications', icon: <FiBell /> },
    { id: 'integrations', label: 'Integrations', icon: <FiDatabase /> },
    { id: 'security', label: 'Security', icon: <FiShield /> }
  ];

  // TODO: Add user role management
  // TODO: Add backup and restore functionality
  // TODO: Add system health monitoring

  return (
    <div style={{ padding: '20px', backgroundColor: 'white', minHeight: '500px' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ 
          color: '#1f2937', 
          fontSize: '32px', 
          fontWeight: 'bold',
          marginBottom: '8px'
        }}>
          HR Settings
        </h1>
        <p style={{ 
          color: '#6b7280', 
          fontSize: '16px'
        }}>
          Configure system settings and preferences
        </p>
      </div>

      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        borderBottom: '2px solid #e2e8f0',
        marginBottom: '32px',
        gap: '4px'
      }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              border: 'none',
              backgroundColor: 'transparent',
              fontSize: '16px',
              fontWeight: '600',
              color: activeTab === tab.id ? '#2563eb' : '#6b7280',
              borderBottom: activeTab === tab.id ? '2px solid #2563eb' : '2px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              borderRadius: '8px 8px 0 0'
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Settings Content */}
      <div style={{ maxWidth: '800px' }}>
        {/* General Settings */}
        {activeTab === 'general' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0'
            }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#1f2937',
                marginBottom: '16px'
              }}>
                Company Information
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={settings.general.companyName}
                    onChange={(e) => updateSetting('general', 'companyName', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    Timezone
                  </label>
                  <select
                    value={settings.general.timezone}
                    onChange={(e) => updateSetting('general', 'timezone', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="America/New_York">Eastern Time (ET)</option>
                    <option value="America/Chicago">Central Time (CT)</option>
                    <option value="America/Denver">Mountain Time (MT)</option>
                    <option value="America/Los_Angeles">Pacific Time (PT)</option>
                    <option value="UTC">UTC</option>
                  </select>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    Date Format
                  </label>
                  <select
                    value={settings.general.dateFormat}
                    onChange={(e) => updateSetting('general', 'dateFormat', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    Default Language
                  </label>
                  <select
                    value={settings.general.defaultLanguage}
                    onChange={(e) => updateSetting('general', 'defaultLanguage', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </select>
                </div>
              </div>
            </div>

            <div style={{
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0'
            }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#1f2937',
                marginBottom: '16px'
              }}>
                Working Hours
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={settings.general.workingHours.start}
                    onChange={(e) => updateSetting('general', 'workingHours', {
                      ...settings.general.workingHours,
                      start: e.target.value
                    })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    End Time
                  </label>
                  <input
                    type="time"
                    value={settings.general.workingHours.end}
                    onChange={(e) => updateSetting('general', 'workingHours', {
                      ...settings.general.workingHours,
                      end: e.target.value
                    })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notification Settings */}
        {activeTab === 'notifications' && (
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            border: '1px solid #e2e8f0'
          }}>
            <h3 style={{
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '20px'
            }}>
              Notification Preferences
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {Object.entries(settings.notifications).map(([key, value]) => (
                <div key={key} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px'
                }}>
                  <div>
                    <div style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#1f2937',
                      marginBottom: '4px'
                    }}>
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </div>
                    <div style={{
                      fontSize: '14px',
                      color: '#6b7280'
                    }}>
                      {key === 'emailNotifications' && 'Receive notifications via email'}
                      {key === 'smsNotifications' && 'Receive notifications via SMS'}
                      {key === 'pushNotifications' && 'Receive browser push notifications'}
                      {key === 'newCandidateAlert' && 'Alert when new candidates apply'}
                      {key === 'documentSubmissionAlert' && 'Alert when documents are submitted'}
                      {key === 'taskDueReminder' && 'Reminders for upcoming task deadlines'}
                      {key === 'weeklyReports' && 'Receive weekly summary reports'}
                      {key === 'monthlyReports' && 'Receive monthly analytics reports'}
                    </div>
                  </div>

                  <button
                    onClick={() => toggleSetting('notifications', key)}
                    style={{
                      border: 'none',
                      backgroundColor: 'transparent',
                      cursor: 'pointer',
                      color: value ? '#10b981' : '#d1d5db',
                      fontSize: '24px'
                    }}
                  >
                    {value ? <FiToggleRight /> : <FiToggleLeft />}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Integration Settings */}
        {activeTab === 'integrations' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0'
            }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#1f2937',
                marginBottom: '16px'
              }}>
                External Integrations
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '8px'
                    }}>
                      Email Provider
                    </label>
                    <select
                      value={settings.integrations.emailProvider}
                      onChange={(e) => updateSetting('integrations', 'emailProvider', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '14px'
                      }}
                    >
                      <option value="gmail">Gmail</option>
                      <option value="outlook">Outlook</option>
                      <option value="sendgrid">SendGrid</option>
                      <option value="mailchimp">Mailchimp</option>
                    </select>
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '8px'
                    }}>
                      Background Check Provider
                    </label>
                    <select
                      value={settings.integrations.backgroundCheckProvider}
                      onChange={(e) => updateSetting('integrations', 'backgroundCheckProvider', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '14px'
                      }}
                    >
                      <option value="SecureCheck Inc.">SecureCheck Inc.</option>
                      <option value="VerifyNow">VerifyNow</option>
                      <option value="TrustGuard">TrustGuard</option>
                      <option value="SafeHire">SafeHire</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    API Key
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="password"
                      value={settings.integrations.apiKey}
                      onChange={(e) => updateSetting('integrations', 'apiKey', e.target.value)}
                      style={{
                        flex: 1,
                        padding: '12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '14px'
                      }}
                    />
                    <button style={{
                      padding: '12px 16px',
                      backgroundColor: '#f3f4f6',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      cursor: 'pointer'
                    }}>
                      <FiRefreshCw style={{ width: '16px', height: '16px' }} />
                    </button>
                  </div>
                </div>

                {/* Toggle Integrations */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {['calendarIntegration', 'slackIntegration'].map(key => (
                    <div key={key} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '8px'
                    }}>
                      <span style={{
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#374151'
                      }}>
                        {key === 'calendarIntegration' ? 'Calendar Integration' : 'Slack Integration'}
                      </span>
                      <button
                        onClick={() => toggleSetting('integrations', key)}
                        style={{
                          border: 'none',
                          backgroundColor: 'transparent',
                          cursor: 'pointer',
                          color: settings.integrations[key as keyof typeof settings.integrations] ? '#10b981' : '#d1d5db',
                          fontSize: '20px'
                        }}
                      >
                        {settings.integrations[key as keyof typeof settings.integrations] ? <FiToggleRight /> : <FiToggleLeft />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Security Settings */}
        {activeTab === 'security' && (
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            border: '1px solid #e2e8f0'
          }}>
            <h3 style={{
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '20px'
            }}>
              Security Configuration
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Security Toggles */}
              {['twoFactorAuth', 'auditLogging', 'dataEncryption'].map(key => (
                <div key={key} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px'
                }}>
                  <div>
                    <div style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#1f2937',
                      marginBottom: '4px'
                    }}>
                      {key === 'twoFactorAuth' && 'Two-Factor Authentication'}
                      {key === 'auditLogging' && 'Audit Logging'}
                      {key === 'dataEncryption' && 'Data Encryption'}
                    </div>
                    <div style={{
                      fontSize: '14px',
                      color: '#6b7280'
                    }}>
                      {key === 'twoFactorAuth' && 'Require 2FA for all users'}
                      {key === 'auditLogging' && 'Log all user actions and changes'}
                      {key === 'dataEncryption' && 'Encrypt sensitive data at rest'}
                    </div>
                  </div>

                  <button
                    onClick={() => toggleSetting('security', key)}
                    style={{
                      border: 'none',
                      backgroundColor: 'transparent',
                      cursor: 'pointer',
                      color: settings.security[key as keyof typeof settings.security] ? '#10b981' : '#d1d5db',
                      fontSize: '24px'
                    }}
                  >
                    {settings.security[key as keyof typeof settings.security] ? <FiToggleRight /> : <FiToggleLeft />}
                  </button>
                </div>
              ))}

              {/* Security Dropdowns */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    Session Timeout (minutes)
                  </label>
                  <select
                    value={settings.security.sessionTimeout}
                    onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  >
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={60}>1 hour</option>
                    <option value={120}>2 hours</option>
                    <option value={480}>8 hours</option>
                  </select>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    Password Policy
                  </label>
                  <select
                    value={settings.security.passwordPolicy}
                    onChange={(e) => updateSetting('security', 'passwordPolicy', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="basic">Basic (8+ characters)</option>
                    <option value="strong">Strong (12+ chars, mixed case, numbers)</option>
                    <option value="complex">Complex (16+ chars, symbols required)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px',
          marginTop: '32px',
          padding: '20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '12px',
          border: '1px solid #e2e8f0'
        }}>
          <button style={{
            padding: '12px 24px',
            backgroundColor: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer'
          }}>
            Cancel
          </button>

          <button style={{
            padding: '12px 24px',
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <FiSave style={{ width: '16px', height: '16px' }} />
            Save Changes
          </button>
        </div>
      </div>

      {/* TODO: Add user role management */}
      {/* TODO: Add system backup settings */}
      {/* TODO: Add performance monitoring */}
      {/* TODO: Add custom field configuration */}
    </div>
  );
};