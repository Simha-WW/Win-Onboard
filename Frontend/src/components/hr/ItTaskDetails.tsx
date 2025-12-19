/**
 * IT Task Details Component
 * Displays detailed view of IT onboarding tasks for a specific user
 */

import React from 'react';
import { ItTask } from '../../services/hrApi';
import { ProgressBar } from '../ui/ProgressBar';

interface ItTaskDetailsProps {
  task: ItTask;
}

interface TaskItem {
  key: keyof ItTask;
  label: string;
  description: string;
}

const taskItems: TaskItem[] = [
  {
    key: 'work_email_generated',
    label: 'Work Email Generation',
    description: 'Create and configure work email account'
  },
  {
    key: 'domain_account_created',
    label: 'Domain Account Created',
    description: 'Set up Active Directory domain account'
  },
  {
    key: 'laptop_allocated',
    label: 'Laptop Allocation',
    description: 'Assign laptop and hardware to the user'
  },
  {
    key: 'software_installed',
    label: 'Software Installation',
    description: 'Install required software and applications'
  },
  {
    key: 'vpn_setup',
    label: 'VPN Setup',
    description: 'Configure VPN access for remote work'
  },
  {
    key: 'network_access_granted',
    label: 'Network Access',
    description: 'Grant network and system access permissions'
  },
  {
    key: 'security_tools_configured',
    label: 'Security Tools',
    description: 'Install and configure security tools'
  },
  {
    key: 'access_cards_issued',
    label: 'Access Cards',
    description: 'Issue physical access cards and badges'
  },
  {
    key: 'hardware_accessories',
    label: 'Hardware Accessories',
    description: 'Provide keyboard, mouse, and other accessories'
  },
  {
    key: 'training_scheduled',
    label: 'Training Scheduled',
    description: 'Schedule IT systems and tools training'
  }
];

export const ItTaskDetails: React.FC<ItTaskDetailsProps> = ({ task }) => {
  // Calculate completion percentage
  const completedTasks = taskItems.filter(item => task[item.key] === true).length;
  const completionPercentage = Math.round((completedTasks / taskItems.length) * 100);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div style={{ padding: '20px' }}>
      {/* User Info Card */}
      <div style={{ marginBottom: '24px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e0e0e0', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <div style={{ padding: '24px' }}>
          <h2 style={{ margin: '0 0 16px 0', fontSize: '24px', fontWeight: '600' }}>
            {task.fresher_name || 'Unknown User'}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Email</div>
              <div style={{ fontSize: '14px', fontWeight: '500' }}>{task.email || 'N/A'}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Role</div>
              <div style={{ fontSize: '14px', fontWeight: '500' }}>{task.role || 'N/A'}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Sent to IT</div>
              <div style={{ fontSize: '14px', fontWeight: '500' }}>
                {formatDate(task.sent_to_it_date)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>User ID</div>
              <div style={{ fontSize: '14px', fontWeight: '500' }}>#{task.fresher_id}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Card */}
      <div style={{ marginBottom: '24px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e0e0e0', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <div style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>Overall Progress</h3>
            <span style={{ fontSize: '24px', fontWeight: '700', color: '#0078d4' }}>
              {completionPercentage}%
            </span>
          </div>
          <ProgressBar progress={completionPercentage} />
          <div style={{ marginTop: '12px', fontSize: '14px', color: '#666' }}>
            {completedTasks} of {taskItems.length} tasks completed
          </div>
        </div>
      </div>

      {/* Tasks List Card */}
      <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e0e0e0', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <div style={{ padding: '24px' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '600' }}>IT Onboarding Tasks</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {taskItems.map((item) => {
              const isCompleted = task[item.key] === true;
              return (
                <div
                  key={item.key}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    padding: '16px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    backgroundColor: isCompleted ? '#f0f9ff' : '#fff',
                    transition: 'all 0.2s'
                  }}
                >
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: isCompleted ? '#0078d4' : '#e0e0e0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginRight: '16px',
                      transition: 'all 0.2s'
                    }}
                  >
                    {isCompleted && (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path
                          d="M13.5 4L6 11.5L2.5 8"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 style={{
                        margin: 0,
                        fontSize: '15px',
                        fontWeight: '600',
                        color: isCompleted ? '#0078d4' : '#333'
                      }}>
                        {item.label}
                      </h4>
                      <span
                        style={{
                          fontSize: '12px',
                          fontWeight: '600',
                          padding: '4px 12px',
                          borderRadius: '12px',
                          backgroundColor: isCompleted ? '#0078d4' : '#ffa500',
                          color: 'white'
                        }}
                      >
                        {isCompleted ? 'Completed' : 'Pending'}
                      </span>
                    </div>
                    <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#666' }}>
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {task.notes && (
            <div style={{ marginTop: '24px', padding: '16px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '600' }}>Notes</h4>
              <p style={{ margin: 0, fontSize: '13px', color: '#666', whiteSpace: 'pre-wrap' }}>
                {task.notes}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
