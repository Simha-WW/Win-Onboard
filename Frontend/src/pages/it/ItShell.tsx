/**
 * IT Portal Shell
 * Main layout and navigation for IT Portal
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getAllITTasks, ITTask } from '../../services/itService';

export const ItShell: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [tasks, setTasks] = useState<ITTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllITTasks();
      setTasks(data);
    } catch (err: any) {
      console.error('Error fetching IT tasks:', err);
      setError(err.message || 'Failed to load IT tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleCardClick = (fresherId: number) => {
    navigate(`/it/tasks/${fresherId}`);
  };

  const getCompletionPercentage = (task: ITTask): number => {
    const taskFields = [
      task.work_email_generated,
      task.laptop_allocated,
      task.software_installed,
      task.access_cards_issued,
      task.training_scheduled,
      task.hardware_accessories,
      task.vpn_setup,
      task.network_access_granted,
      task.domain_account_created,
      task.security_tools_configured
    ];
    const completed = taskFields.filter(field => field === true).length;
    return Math.round((completed / taskFields.length) * 100);
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f3f4f6',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <header style={{
        backgroundColor: '#1f2937',
        color: 'white',
        padding: '16px 24px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            margin: 0
          }}>
            IT Portal - Onboarding Tasks
          </h1>
          
          <button
            onClick={handleLogout}
            style={{
              backgroundColor: '#ef4444',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{
        flex: 1,
        padding: '48px 24px',
        maxWidth: '1400px',
        width: '100%',
        margin: '0 auto'
      }}>
        {loading && (
          <div style={{ textAlign: 'center', padding: '48px' }}>
            <p style={{ fontSize: '18px', color: '#6b7280' }}>Loading IT tasks...</p>
          </div>
        )}

        {error && (
          <div style={{
            backgroundColor: '#fee2e2',
            border: '1px solid #fecaca',
            color: '#991b1b',
            padding: '16px',
            borderRadius: '8px',
            maxWidth: '600px',
            margin: '0 auto 32px'
          }}>
            <p style={{ margin: 0 }}>{error}</p>
          </div>
        )}

        {!loading && !error && tasks.length === 0 && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '48px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '18px', color: '#6b7280' }}>
              No IT onboarding tasks found
            </p>
          </div>
        )}

        {!loading && !error && tasks.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '24px'
          }}>
            {tasks.map((task) => {
              const completion = getCompletionPercentage(task);
              return (
                <div
                  key={task.id}
                  onClick={() => handleCardClick(task.fresher_id)}
                  style={{
                    backgroundColor: 'white',
                    padding: '24px',
                    borderRadius: '8px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    border: '2px solid transparent'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.15)';
                    e.currentTarget.style.borderColor = '#3b82f6';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                    e.currentTarget.style.borderColor = 'transparent';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ marginBottom: '16px' }}>
                    <h3 style={{
                      margin: '0 0 8px 0',
                      fontSize: '20px',
                      fontWeight: '600',
                      color: '#1f2937'
                    }}>
                      {task.fresher_name}
                    </h3>
                    <p style={{
                      margin: '0 0 4px 0',
                      fontSize: '14px',
                      color: '#6b7280'
                    }}>
                      <strong>Email:</strong> {task.email}
                    </p>
                    <p style={{
                      margin: '0 0 4px 0',
                      fontSize: '14px',
                      color: '#6b7280'
                    }}>
                      <strong>Role:</strong> {task.role}
                    </p>
                    <p style={{
                      margin: 0,
                      fontSize: '14px',
                      color: '#6b7280'
                    }}>
                      <strong>Fresher ID:</strong> {task.fresher_id}
                    </p>
                  </div>

                  <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '14px', color: '#6b7280' }}>
                        Completion
                      </span>
                      <span style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: completion === 100 ? '#059669' : '#3b82f6'
                      }}>
                        {completion}%
                      </span>
                    </div>
                    <div style={{
                      height: '8px',
                      backgroundColor: '#e5e7eb',
                      borderRadius: '4px',
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

                  <div style={{ marginTop: '16px', textAlign: 'center' }}>
                    <span style={{
                      fontSize: '14px',
                      color: '#3b82f6',
                      fontWeight: '500'
                    }}>
                      Click to manage tasks →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{
        backgroundColor: 'white',
        padding: '16px 24px',
        borderTop: '1px solid #e5e7eb',
        textAlign: 'center'
      }}>
        <p style={{
          fontSize: '14px',
          color: '#6b7280',
          margin: 0
        }}>
          © 2025 WinOnboard IT Portal. All rights reserved.
        </p>
      </footer>
    </div>
  );
};
