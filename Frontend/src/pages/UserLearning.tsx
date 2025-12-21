/**
 * User Learning Page
 * Display assigned learning plans with progress tracking
 */

import React, { useState, useEffect } from 'react';
import { FiBook, FiCheckCircle, FiClock, FiExternalLink, FiAward, FiTrendingUp } from 'react-icons/fi';
import { userApiService } from '../services/userApi';
import { LearningItem, EmployeeLearningProgress } from '../services/ldApi';

export const UserLearning = () => {
  const [data, setData] = useState<EmployeeLearningProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completingId, setCompletingId] = useState<number | null>(null);

  useEffect(() => {
    fetchLearningPlan();
  }, []);

  const fetchLearningPlan = async () => {
    try {
      setLoading(true);
      const learningData = await userApiService.getLearningPlan();
      setData(learningData);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load learning plan');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = async (learning: LearningItem) => {
    try {
      setCompletingId(learning.id);
      await userApiService.updateLearningProgress(learning.id, {
        isCompleted: true
      });
      await fetchLearningPlan();
    } catch (err: any) {
      alert(err.message || 'Failed to update progress');
    } finally {
      setCompletingId(null);
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '400px'
      }}>
        <div>Loading your learning plan...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{
          padding: '16px',
          backgroundColor: '#fee2e2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          color: '#dc2626'
        }}>
          {error}
        </div>
      </div>
    );
  }

  if (!data || !data.learnings || data.learnings.length === 0) {
    return (
      <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{
          fontSize: '28px',
          fontWeight: '700',
          color: '#1f2937',
          margin: '0 0 24px 0'
        }}>
          My Learning Plan
        </h1>
        <div style={{
          textAlign: 'center',
          padding: '48px 24px',
          backgroundColor: '#f9fafb',
          borderRadius: '12px',
          border: '1px dashed #d1d5db'
        }}>
          <FiBook style={{
            width: '48px',
            height: '48px',
            color: '#9ca3af',
            margin: '0 auto 16px'
          }} />
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#374151',
            margin: '0 0 8px 0'
          }}>
            No Learning Plan Assigned Yet
          </h3>
          <p style={{
            fontSize: '14px',
            color: '#6b7280',
            margin: 0
          }}>
            Your learning plan will appear here once assigned by the L&D team
          </p>
        </div>
      </div>
    );
  }

  const { learnings, stats } = data;
  const completedLearnings = learnings.filter(l => l.is_completed);
  const pendingLearnings = learnings.filter(l => !l.is_completed);

  return (
    <div style={{
      padding: '24px',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{
          fontSize: '28px',
          fontWeight: '700',
          color: '#1f2937',
          margin: '0 0 8px 0'
        }}>
          My Learning Plan
        </h1>
        <p style={{
          fontSize: '14px',
          color: '#6b7280',
          margin: 0
        }}>
          Track your progress and complete your assigned learning modules
        </p>
      </div>

      {/* Progress Card */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '24px',
          marginBottom: '20px'
        }}>
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '8px'
            }}>
              <FiTrendingUp style={{ color: '#2563eb', width: '20px', height: '20px' }} />
              <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>
                Overall Progress
              </span>
            </div>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#2563eb' }}>
              {stats.progress_percentage}%
            </div>
          </div>

          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '8px'
            }}>
              <FiCheckCircle style={{ color: '#10b981', width: '20px', height: '20px' }} />
              <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>
                Completed
              </span>
            </div>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#10b981' }}>
              {stats.completed_count} / {stats.total_count}
            </div>
          </div>

          {data.employee?.days_remaining !== undefined && data.employee?.days_remaining !== null && (
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '8px'
              }}>
                <FiClock style={{ 
                  color: data.employee.days_remaining < 3 ? '#ef4444' : data.employee.days_remaining < 7 ? '#f59e0b' : '#6b7280', 
                  width: '20px', 
                  height: '20px' 
                }} />
                <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>
                  Time Remaining
                </span>
              </div>
              <div style={{ 
                fontSize: '32px', 
                fontWeight: '700', 
                color: data.employee.days_remaining < 3 ? '#ef4444' : data.employee.days_remaining < 7 ? '#f59e0b' : '#6b7280'
              }}>
                {data.employee.days_remaining > 0 ? `${data.employee.days_remaining}` : '0'} days
              </div>
              {data.employee.days_remaining < 3 && data.employee.days_remaining > 0 && (
                <div style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px', fontWeight: '500' }}>
                  ⚠️ Deadline approaching!
                </div>
              )}
              {data.employee.days_remaining <= 0 && (
                <div style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px', fontWeight: '500' }}>
                  ⚠️ Deadline passed!
                </div>
              )}
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '8px'
          }}>
            <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>
              Learning Progress
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
              width: `${stats.progress_percentage}%`,
              backgroundColor: stats.progress_percentage === 100 ? '#10b981' : '#2563eb',
              transition: 'width 0.3s',
              borderRadius: '6px'
            }} />
          </div>
        </div>

        {stats.progress_percentage === 100 && (
          <div style={{
            marginTop: '16px',
            padding: '12px',
            backgroundColor: '#d1fae5',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#047857'
          }}>
            <FiAward size={20} />
            <span style={{ fontWeight: '600' }}>
              Congratulations! You've completed all your learning modules! 🎉
            </span>
          </div>
        )}
      </div>

      {/* Pending Learning Items */}
      {pendingLearnings.length > 0 && (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#1f2937',
            margin: '0 0 20px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <FiBook /> Pending ({pendingLearnings.length})
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {pendingLearnings.map((learning, index) => (
              <div
                key={learning.id}
                style={{
                  padding: '20px',
                  backgroundColor: '#fef9c3',
                  border: '2px solid #fde047',
                  borderRadius: '8px',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '16px',
                  flexWrap: 'wrap'
                }}>
                  <div style={{ flex: 1, minWidth: '250px' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      marginBottom: '12px'
                    }}>
                      <span style={{
                        fontSize: '16px',
                        fontWeight: '700',
                        color: '#9ca3af',
                        minWidth: '35px'
                      }}>
                        #{completedLearnings.length + index + 1}
                      </span>
                      <h3 style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        color: '#1f2937',
                        margin: 0
                      }}>
                        {learning.learning_title}
                      </h3>
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      marginLeft: '47px',
                      marginTop: '12px',
                      flexWrap: 'wrap'
                    }}>

                      {learning.learning_link && (
                        <a
                          href={learning.learning_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 16px',
                            backgroundColor: '#2563eb',
                            color: 'white',
                            textDecoration: 'none',
                            borderRadius: '6px',
                            fontSize: '14px',
                            fontWeight: '600',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                        >
                          <FiExternalLink size={16} />
                          Open Resource
                        </a>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleMarkComplete(learning)}
                    disabled={completingId === learning.id}
                    style={{
                      padding: '12px 24px',
                      backgroundColor: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: completingId === learning.id ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      opacity: completingId === learning.id ? 0.5 : 1,
                      transition: 'all 0.2s',
                      whiteSpace: 'nowrap'
                    }}
                    onMouseEnter={(e) => {
                      if (completingId !== learning.id) {
                        e.currentTarget.style.backgroundColor = '#059669';
                        e.currentTarget.style.transform = 'scale(1.05)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (completingId !== learning.id) {
                        e.currentTarget.style.backgroundColor = '#10b981';
                        e.currentTarget.style.transform = 'scale(1)';
                      }
                    }}
                  >
                    {completingId === learning.id ? (
                      'Marking...'
                    ) : (
                      <><FiCheckCircle size={20} /> Mark as Complete</>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed Learning Items */}
      {completedLearnings.length > 0 && (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#1f2937',
            margin: '0 0 20px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <FiCheckCircle style={{ color: '#10b981' }} /> Completed ({completedLearnings.length})
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {completedLearnings.map((learning, index) => (
              <div
                key={learning.id}
                style={{
                  padding: '16px',
                  backgroundColor: '#f0fdf4',
                  border: '2px solid #86efac',
                  borderRadius: '8px',
                  opacity: 0.9
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px'
                }}>
                  <FiCheckCircle style={{
                    color: '#10b981',
                    width: '24px',
                    height: '24px',
                    flexShrink: 0,
                    marginTop: '2px'
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '4px'
                    }}>
                      <span style={{
                        fontSize: '14px',
                        fontWeight: '700',
                        color: '#9ca3af'
                      }}>
                        #{index + 1}
                      </span>
                      <h3 style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#1f2937',
                        margin: 0
                      }}>
                        {learning.learning_title}
                      </h3>
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      fontSize: '12px',
                      marginTop: '12px',
                      color: '#9ca3af'
                    }}>
                      {learning.completed_at && (
                        <span style={{ color: '#10b981', fontWeight: '500' }}>
                          ✓ Completed on {new Date(learning.completed_at).toLocaleDateString()}
                        </span>
                      )}
                      {learning.learning_link && (
                        <a
                          href={learning.learning_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            color: '#2563eb',
                            textDecoration: 'none'
                          }}
                        >
                          <FiExternalLink size={12} /> View Resource
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
