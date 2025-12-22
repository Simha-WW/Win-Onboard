/**
 * Enhanced NewHire Home Page with dynamic learning progress
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCheckCircle, FiClock, FiUsers, FiCalendar, FiBook, FiTarget } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { userApiService } from '../services/userApi';
import { EmployeeLearningProgress } from '../services/ldApi';

export const NewHireHome = () => {
  console.log('NewHireHome rendering...');
  
  const navigate = useNavigate();
  const { user } = useAuth();
  const [learningData, setLearningData] = useState<EmployeeLearningProgress | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchLearningData();
  }, []);

  const fetchLearningData = async () => {
    try {
      setLoading(true);
      const data = await userApiService.getLearningPlan();
      setLearningData(data);
    } catch (err) {
      console.error('Failed to fetch learning data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate progress from learning data
  const tasksCompleted = learningData?.stats?.completed_count || 0;
  const totalTasks = learningData?.stats?.total_count || 0;
  const progressPercentage = totalTasks > 0 ? (tasksCompleted / totalTasks) * 100 : 0;
  const deadline = learningData?.employee?.deadline ? new Date(learningData.employee.deadline) : null;
  const daysRemaining = learningData?.employee?.days_remaining || 0;
  
  return (
    <div style={{ padding: '20px', backgroundColor: 'white', minHeight: '500px' }}>
      {/* Welcome Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ 
          color: '#1f2937', 
          fontSize: '32px', 
          fontWeight: 'bold',
          marginBottom: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          Welcome to WinOnboard!
        </h1>
        <p style={{ 
          color: '#1f2937', 
          fontSize: '18px', 
          marginBottom: '8px',
          fontWeight: '500'
        }}>
          Hello {user ? (user.firstName || user.username || 'there') : 'there'}, we're excited to have you join our team!
        </p>
        <p style={{ 
          color: '#6b7280', 
          fontSize: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <FiCalendar style={{ width: '16px', height: '16px' }} />
          {user?.createdAt ? `Joined on ${new Date(user.createdAt).toLocaleDateString()}` : 'Welcome!'}
        </p>
      </div>
      
      {/* Learning Progress Section */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ 
          color: '#1e293b', 
          fontSize: '24px', 
          fontWeight: '700',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <FiBook style={{ width: '24px', height: '24px' }} />
          Learning Progress
        </h2>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
            Loading your progress...
          </div>
        ) : learningData && totalTasks > 0 ? (
          <>
            {/* Progress Bar */}
            <div style={{
              backgroundColor: '#f1f5f9',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '20px',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
                  Overall Learning Progress
                </span>
                <span style={{ 
                  fontSize: '16px', 
                  fontWeight: '700', 
                  color: progressPercentage >= 75 ? '#10b981' : progressPercentage >= 50 ? '#f59e0b' : '#ef4444'
                }}>
                  {progressPercentage.toFixed(0)}%
                </span>
              </div>
              
              <div style={{
                width: '100%',
                height: '12px',
                backgroundColor: '#e2e8f0',
                borderRadius: '6px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${progressPercentage}%`,
                  height: '100%',
                  background: progressPercentage >= 75 
                    ? 'linear-gradient(90deg, #10b981 0%, #059669 100%)'
                    : progressPercentage >= 50 
                    ? 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)'
                    : 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)',
                  borderRadius: '6px',
                  transition: 'width 0.3s ease'
                }} />
              </div>
              
              <div style={{ marginTop: '12px', fontSize: '14px', color: '#6b7280' }}>
                {tasksCompleted} of {totalTasks} learning modules completed
              </div>
            </div>
            
            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              {/* Tasks Completed Card */}
              <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '20px',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                cursor: 'pointer'
              }}
              onClick={() => navigate('/dashboard/learning')}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <FiCheckCircle style={{ width: '24px', height: '24px', color: 'white' }} />
                </div>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', marginBottom: '4px' }}>
                    {tasksCompleted}
                  </div>
                  <div style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>
                    Completed Modules
                  </div>
                </div>
              </div>
              
              {/* Pending Tasks Card */}
              <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '20px',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                cursor: 'pointer'
              }}
              onClick={() => navigate('/dashboard/learning')}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <FiClock style={{ width: '24px', height: '24px', color: 'white' }} />
                </div>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', marginBottom: '4px' }}>
                    {totalTasks - tasksCompleted}
                  </div>
                  <div style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>
                    Pending Modules
                  </div>
                </div>
              </div>
              
              {/* Deadline Card */}
              <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '20px',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                cursor: 'pointer'
              }}
              onClick={() => navigate('/dashboard/learning')}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: daysRemaining < 7 
                    ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                    : 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <FiTarget style={{ width: '24px', height: '24px', color: 'white' }} />
                </div>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', marginBottom: '4px' }}>
                    {deadline ? deadline.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}
                  </div>
                  <div style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>
                    Deadline {daysRemaining > 0 ? `(${daysRemaining} days left)` : ''}
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            backgroundColor: '#f9fafb',
            borderRadius: '12px',
            border: '1px dashed #d1d5db'
          }}>
            <FiBook style={{ width: '48px', height: '48px', color: '#9ca3af', margin: '0 auto 16px' }} />
            <p style={{ color: '#6b7280', fontSize: '16px' }}>
              No learning modules assigned yet. Check back soon!
            </p>
          </div>
        )}
      </div>
      
      {/* Quick Actions Section */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ 
          color: '#1e293b', 
          fontSize: '24px', 
          fontWeight: '700',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          Quick Actions
        </h2>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <button style={{ 
            backgroundColor: '#8b5cf6', 
            color: 'white', 
            padding: '12px 24px', 
            border: 'none', 
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s ease'
          }}
          onClick={() => navigate('/dashboard/learning')}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#7c3aed';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(139, 92, 246, 0.3)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '#8b5cf6';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}>
            <FiBook style={{ width: '18px', height: '18px' }} />
            Go to Learning
          </button>
          
          <button style={{ 
            backgroundColor: '#2563eb', 
            color: 'white', 
            padding: '12px 24px', 
            border: 'none', 
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s ease'
          }}
          onClick={() => navigate('/dashboard/checklist')}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#1d4ed8';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(37, 99, 235, 0.3)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '#2563eb';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}>
            View Checklist
          </button>
          
          <button style={{ 
            backgroundColor: '#10b981', 
            color: 'white', 
            padding: '12px 24px', 
            border: 'none', 
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s ease'
          }}
          onClick={() => navigate('/dashboard/documents')}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#059669';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(16, 185, 129, 0.3)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '#10b981';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}>
            View Documents
          </button>
        </div>
      </div>
    </div>
  );
};
