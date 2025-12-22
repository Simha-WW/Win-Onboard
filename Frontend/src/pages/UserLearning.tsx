/**
 * User Learning Page
 * Display assigned learning plans with progress tracking
 */

import React, { useState, useEffect } from 'react';
import { FiPlay, FiCheckCircle, FiClock, FiExternalLink, FiAward, FiBookOpen, FiBook } from 'react-icons/fi';
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

  const getStatusColor = (isCompleted: boolean) => {
    return isCompleted ? '#10b981' : '#f59e0b';
  };

  const getStatusIcon = (isCompleted: boolean) => {
    return isCompleted 
      ? <FiAward style={{ color: '#10b981', width: '20px', height: '20px' }} />
      : <FiBookOpen style={{ color: '#f59e0b', width: '20px', height: '20px' }} />;
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
      <div style={{ padding: '20px', backgroundColor: 'white', minHeight: '500px' }}>
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
      <div style={{ padding: '20px', backgroundColor: 'white', minHeight: '500px' }}>
        <h1 style={{ color: 'black', fontSize: '28px', marginBottom: '20px', fontWeight: 'bold' }}>
          📚 My Learning Plan
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
    <div style={{ padding: '20px', backgroundColor: 'white', minHeight: '500px' }}>
      <h1 style={{ color: 'black', fontSize: '28px', marginBottom: '20px', fontWeight: 'bold' }}>
        📚 My Learning Plan
      </h1>
      
      <p style={{ color: '#6b7280', fontSize: '16px', marginBottom: '30px' }}>
        Complete your assigned learning modules to enhance your skills and knowledge.
      </p>

      {/* Overall Progress Bar */}
      <div style={{
        backgroundColor: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '24px'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '12px' 
        }}>
          <span style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
            Overall Learning Progress
          </span>
          <span style={{ 
            fontSize: '18px', 
            fontWeight: '700', 
            color: stats.progress_percentage >= 75 ? '#10b981' : stats.progress_percentage >= 50 ? '#f59e0b' : '#ef4444'
          }}>
            {stats.progress_percentage}%
          </span>
        </div>
        
        <div style={{
          width: '100%',
          height: '16px',
          backgroundColor: '#e5e7eb',
          borderRadius: '8px',
          overflow: 'hidden',
          marginBottom: '12px'
        }}>
          <div style={{
            width: `${stats.progress_percentage}%`,
            height: '100%',
            background: stats.progress_percentage >= 75 
              ? 'linear-gradient(90deg, #10b981 0%, #059669 100%)'
              : stats.progress_percentage >= 50 
              ? 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)'
              : 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)',
            borderRadius: '8px',
            transition: 'width 0.5s ease'
          }} />
        </div>
        
        <div style={{ fontSize: '14px', color: '#6b7280' }}>
          {stats.completed_count} of {stats.total_count} learning modules completed
        </div>
      </div>

      {/* Progress Overview */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '16px',
        marginBottom: '30px'
      }}>
        <div style={{ backgroundColor: '#f0fdf4', padding: '16px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
          <div style={{ color: '#15803d', fontSize: '18px', fontWeight: 'bold' }}>
            {stats.completed_count}/{stats.total_count}
          </div>
          <div style={{ color: '#16a34a', fontSize: '14px' }}>Modules Completed</div>
        </div>
        <div style={{ backgroundColor: '#fefce8', padding: '16px', borderRadius: '8px', border: '1px solid #fde047' }}>
          <div style={{ color: '#ca8a04', fontSize: '18px', fontWeight: 'bold' }}>
            {pendingLearnings.length}
          </div>
          <div style={{ color: '#eab308', fontSize: '14px' }}>Pending</div>
        </div>
        {data.employee?.days_remaining !== undefined && data.employee?.days_remaining !== null && (
          <div style={{ 
            backgroundColor: data.employee.days_remaining < 3 ? '#fef2f2' : '#eff6ff', 
            padding: '16px', 
            borderRadius: '8px', 
            border: `1px solid ${data.employee.days_remaining < 3 ? '#fecaca' : '#bfdbfe'}`
          }}>
            <div style={{ 
              color: data.employee.days_remaining < 3 ? '#dc2626' : '#1d4ed8', 
              fontSize: '18px', 
              fontWeight: 'bold' 
            }}>
              {data.employee.days_remaining > 0 ? data.employee.days_remaining : 0} days
            </div>
            <div style={{ 
              color: data.employee.days_remaining < 3 ? '#ef4444' : '#2563eb', 
              fontSize: '14px' 
            }}>
              Time Remaining
            </div>
          </div>
        )}
      </div>

      <h2 style={{ color: 'black', fontSize: '22px', marginBottom: '20px', fontWeight: '600' }}>
        Learning Modules
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {learnings.map((module, index) => {
          const progress = module.is_completed ? 100 : 0;
          
          return (
            <div key={module.id} style={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              padding: '20px',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.boxShadow = 'none';
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
                {getStatusIcon(module.is_completed)}
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontWeight: '600', fontSize: '18px', color: 'black', marginBottom: '4px' }}>
                    {module.learning_title}
                  </h3>
                  {module.completed_at && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontSize: '12px' }}>
                      <FiCheckCircle style={{ width: '12px', height: '12px' }} />
                      Completed on {new Date(module.completed_at).toLocaleDateString()}
                    </div>
                  )}
                </div>
                <div style={{
                  padding: '6px 12px',
                  backgroundColor: getStatusColor(module.is_completed),
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  borderRadius: '16px',
                  textTransform: 'capitalize'
                }}>
                  {module.is_completed ? 'Completed' : 'Pending'}
                </div>
              </div>

              {/* Progress Bar */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{
                  width: '100%',
                  height: '8px',
                  backgroundColor: '#f3f4f6',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${progress}%`,
                    height: '100%',
                    backgroundColor: getStatusColor(module.is_completed),
                    transition: 'width 0.3s ease'
                  }} />
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                  {progress}% Complete
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                {module.learning_link && (
                  <a
                    href={module.learning_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      backgroundColor: '#2563eb',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '10px 20px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      textDecoration: 'none'
                    }}
                  >
                    <FiExternalLink style={{ width: '16px', height: '16px' }} />
                    Open Resource
                  </a>
                )}
                {!module.is_completed && (
                  <button 
                    onClick={() => handleMarkComplete(module)}
                    disabled={completingId === module.id}
                    style={{
                      backgroundColor: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '10px 20px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: completingId === module.id ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      opacity: completingId === module.id ? 0.5 : 1
                    }}
                  >
                    {completingId === module.id ? (
                      'Marking...'
                    ) : (
                      <>
                        <FiCheckCircle style={{ width: '16px', height: '16px' }} />
                        Mark as Complete
                      </>
                    )}
                  </button>
                )}
                {module.is_completed && (
                  <button style={{
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 20px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <FiAward style={{ width: '16px', height: '16px' }} />
                    Review
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Completion Message */}
      {stats.progress_percentage === 100 && (
        <div style={{
          marginTop: '30px',
          padding: '20px',
          backgroundColor: '#d1fae5',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          border: '2px solid #86efac'
        }}>
          <FiAward style={{ width: '32px', height: '32px', color: '#047857' }} />
          <div>
            <h3 style={{ margin: 0, color: '#047857', fontSize: '18px', fontWeight: '700' }}>
              Congratulations! 🎉
            </h3>
            <p style={{ margin: '4px 0 0 0', color: '#059669', fontSize: '14px' }}>
              You've completed all your assigned learning modules!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
