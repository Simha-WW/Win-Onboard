/**
 * IT Task Detail Page
 * Shows individual task checklist for a fresher
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getITTasksForFresher, updateTaskStatus, ITTask } from '../../services/itService';

interface TaskField {
  key: keyof ITTask;
  label: string;
}

const TASK_FIELDS: TaskField[] = [
  { key: 'work_email_generated', label: 'Work Email Generated' },
  { key: 'laptop_allocated', label: 'Laptop Allocated' },
  { key: 'software_installed', label: 'Software Installed' },
  { key: 'access_cards_issued', label: 'Access Cards Issued' },
  { key: 'training_scheduled', label: 'Training Scheduled' },
  { key: 'hardware_accessories', label: 'Hardware Accessories' },
  { key: 'vpn_setup', label: 'VPN Setup' },
  { key: 'network_access_granted', label: 'Network Access Granted' },
  { key: 'domain_account_created', label: 'Domain Account Created' },
  { key: 'security_tools_configured', label: 'Security Tools Configured' }
];

export const ItTaskDetail: React.FC = () => {
  const { fresherId } = useParams<{ fresherId: string }>();
  const navigate = useNavigate();
  const [task, setTask] = useState<ITTask | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (fresherId) {
      fetchTaskDetails();
    }
  }, [fresherId]);

  const fetchTaskDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getITTasksForFresher(parseInt(fresherId!, 10));
      setTask(data);
    } catch (err: any) {
      console.error('Error fetching task details:', err);
      setError(err.message || 'Failed to load task details');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (taskName: string, status: number) => {
    if (!fresherId || !task) return;

    try {
      setUpdating(taskName);
      const updatedTask = await updateTaskStatus(parseInt(fresherId, 10), taskName, status);
      setTask(updatedTask);
    } catch (err: any) {
      console.error('Error updating task status:', err);
      alert(err.message || 'Failed to update task status');
    } finally {
      setUpdating(null);
    }
  };

  const getCompletionPercentage = (): number => {
    if (!task) return 0;
    const completed = TASK_FIELDS.filter(field => task[field.key] === true).length;
    return Math.round((completed / TASK_FIELDS.length) * 100);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '48px 24px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: '18px', color: '#6b7280' }}>Loading task details...</p>
        </div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '48px 24px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{
            backgroundColor: '#fee2e2',
            border: '1px solid #fecaca',
            color: '#991b1b',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '24px'
          }}>
            <p style={{ margin: 0 }}>{error || 'Task not found'}</p>
          </div>
          <button
            onClick={() => navigate('/it')}
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            ← Back to IT Portal
          </button>
        </div>
      </div>
    );
  }

  const completion = getCompletionPercentage();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '48px 24px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Back Button */}
        <button
          onClick={() => navigate('/it')}
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '14px',
            marginBottom: '24px',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
        >
          ← Back to IT Portal
        </button>

        {/* Header Card */}
        <div style={{
          backgroundColor: 'white',
          padding: '32px',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          marginBottom: '24px'
        }}>
          <h1 style={{
            margin: '0 0 16px 0',
            fontSize: '28px',
            fontWeight: '600',
            color: '#1f2937'
          }}>
            {task.fresher_name}
          </h1>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            <div>
              <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#6b7280' }}>
                <strong>Email:</strong> {task.email}
              </p>
              <p style={{ margin: '0', fontSize: '14px', color: '#6b7280' }}>
                <strong>Role:</strong> {task.role}
              </p>
            </div>
            <div>
              <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#6b7280' }}>
                <strong>Fresher ID:</strong> {task.fresher_id}
              </p>
              <p style={{ margin: '0', fontSize: '14px', color: '#6b7280' }}>
                <strong>Sent to IT:</strong> {new Date(task.sent_to_it_date).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>
                Overall Progress
              </span>
              <span style={{
                fontSize: '16px',
                fontWeight: '600',
                color: completion === 100 ? '#059669' : '#3b82f6'
              }}>
                {completion}%
              </span>
            </div>
            <div style={{
              height: '12px',
              backgroundColor: '#e5e7eb',
              borderRadius: '6px',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                width: `${completion}%`,
                backgroundColor: completion === 100 ? '#059669' : '#3b82f6',
                transition: 'width 0.3s'
              }} />
            </div>
          </div>
        </div>

        {/* Task Table */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '24px 32px',
            borderBottom: '2px solid #e5e7eb',
            backgroundColor: '#f9fafb'
          }}>
            <h2 style={{
              margin: 0,
              fontSize: '20px',
              fontWeight: '600',
              color: '#1f2937'
            }}>
              Onboarding Checklist
            </h2>
            <p style={{
              margin: '4px 0 0 0',
              fontSize: '14px',
              color: '#6b7280'
            }}>
              Track and manage IT setup tasks
            </p>
          </div>

          <table style={{
            width: '100%',
            borderCollapse: 'collapse'
          }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb' }}>
                <th style={{
                  padding: '16px 32px',
                  textAlign: 'left',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  borderBottom: '1px solid #e5e7eb'
                }}>
                  Task
                </th>
                <th style={{
                  padding: '16px 32px',
                  textAlign: 'center',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  borderBottom: '1px solid #e5e7eb',
                  width: '200px'
                }}>
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {TASK_FIELDS.map((field, index) => {
                const isCompleted = task[field.key] === true;
                const isUpdating = updating === field.key;
                
                return (
                  <tr
                    key={field.key}
                    style={{
                      backgroundColor: index % 2 === 0 ? 'white' : '#f9fafb',
                      transition: 'background-color 0.1s'
                    }}
                  >
                    <td style={{
                      padding: '8px 32px',
                      fontSize: '14px',
                      color: '#374151',
                      borderBottom: '1px solid #e5e7eb'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: isCompleted ? '#10b981' : '#9ca3af',
                          flexShrink: 0
                        }} />
                        <span style={{ 
                          fontWeight: isCompleted ? '500' : '400',
                          color: isCompleted ? '#059669' : '#374151'
                        }}>
                          {field.label}
                        </span>
                      </div>
                    </td>
                    <td style={{
                      padding: '8px 32px',
                      textAlign: 'center',
                      borderBottom: '1px solid #e5e7eb'
                    }}>
                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: isUpdating ? 'not-allowed' : 'pointer',
                        opacity: isUpdating ? 0.5 : 1,
                        padding: '4px'
                      }}>
                        <input
                          type="checkbox"
                          checked={isCompleted}
                          onChange={(e) => handleStatusUpdate(field.key, e.target.checked ? 1 : 0)}
                          disabled={isUpdating}
                          style={{
                            width: '20px',
                            height: '20px',
                            cursor: isUpdating ? 'not-allowed' : 'pointer',
                            accentColor: '#10b981'
                          }}
                        />
                      </label>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
