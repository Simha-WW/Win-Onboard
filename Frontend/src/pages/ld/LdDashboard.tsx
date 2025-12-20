import React, { useEffect, useState } from 'react';
import { FiUsers, FiBook, FiCheckCircle, FiClock, FiAlertCircle } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';

interface DashboardStats {
  newEmployees: number;
  pendingTrainings: number;
  completedTrainings: number;
  overdueTrainings: number;
}

export const LdDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    newEmployees: 0,
    pendingTrainings: 0,
    completedTrainings: 0,
    overdueTrainings: 0
  });

  useEffect(() => {
    // TODO: Fetch real stats from API
    // For now, using mock data
    setStats({
      newEmployees: 5,
      pendingTrainings: 12,
      completedTrainings: 48,
      overdueTrainings: 3
    });
  }, []);

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
          Welcome back, {user?.firstName}! 👋
        </h1>
        <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>
          Here's your Learning & Development overview for today
        </p>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {/* New Employees */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '0.75rem',
          padding: '1.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '0.75rem',
              backgroundColor: '#dbeafe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FiUsers size={24} style={{ color: '#2563eb' }} />
            </div>
            <span style={{
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#2563eb',
              backgroundColor: '#dbeafe',
              padding: '0.25rem 0.75rem',
              borderRadius: '9999px'
            }}>
              New
            </span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.25rem' }}>
            {stats.newEmployees}
          </div>
          <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            New Employees
          </div>
          <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '0.5rem' }}>
            ↑ Awaiting training assignment
          </div>
        </div>

        {/* Pending Trainings */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '0.75rem',
          padding: '1.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '0.75rem',
              backgroundColor: '#fef3c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FiClock size={24} style={{ color: '#f59e0b' }} />
            </div>
            <span style={{
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#f59e0b',
              backgroundColor: '#fef3c7',
              padding: '0.25rem 0.75rem',
              borderRadius: '9999px'
            }}>
              Pending
            </span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.25rem' }}>
            {stats.pendingTrainings}
          </div>
          <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            Pending Trainings
          </div>
          <div style={{ fontSize: '0.75rem', color: '#f59e0b', marginTop: '0.5rem' }}>
            ⏰ In progress
          </div>
        </div>

        {/* Completed Trainings */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '0.75rem',
          padding: '1.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '0.75rem',
              backgroundColor: '#d1fae5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FiCheckCircle size={24} style={{ color: '#10b981' }} />
            </div>
            <span style={{
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#10b981',
              backgroundColor: '#d1fae5',
              padding: '0.25rem 0.75rem',
              borderRadius: '9999px'
            }}>
              Done
            </span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.25rem' }}>
            {stats.completedTrainings}
          </div>
          <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            Completed This Month
          </div>
          <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '0.5rem' }}>
            ✓ Great progress!
          </div>
        </div>

        {/* Overdue Trainings */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '0.75rem',
          padding: '1.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '0.75rem',
              backgroundColor: '#fee2e2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FiAlertCircle size={24} style={{ color: '#ef4444' }} />
            </div>
            <span style={{
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#ef4444',
              backgroundColor: '#fee2e2',
              padding: '0.25rem 0.75rem',
              borderRadius: '9999px'
            }}>
              Urgent
            </span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.25rem' }}>
            {stats.overdueTrainings}
          </div>
          <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            Overdue Trainings
          </div>
          <div style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.5rem' }}>
            ⚠️ Requires attention
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '0.75rem',
        padding: '1.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb',
        marginBottom: '2rem'
      }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937', marginBottom: '1rem' }}>
          Quick Actions
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <button style={{
            padding: '1rem',
            backgroundColor: '#8b5cf6',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            fontWeight: '600',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#7c3aed'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#8b5cf6'}
          >
            📚 Create Training Plan
          </button>
          <button style={{
            padding: '1rem',
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            fontWeight: '600',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#059669'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
          >
            ✓ Mark Training Complete
          </button>
          <button style={{
            padding: '1rem',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            fontWeight: '600',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
          >
            📊 Generate Report
          </button>
          <button style={{
            padding: '1rem',
            backgroundColor: '#f59e0b',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            fontWeight: '600',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d97706'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f59e0b'}
          >
            📅 Schedule Session
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '0.75rem',
        padding: '1.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb'
      }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937', marginBottom: '1rem' }}>
          Recent Activity
        </h2>
        <div style={{ color: '#6b7280', textAlign: 'center', padding: '2rem' }}>
          <FiBook size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
          <p>No recent activity to display</p>
          <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
            New employee training assignments will appear here
          </p>
        </div>
      </div>
    </div>
  );
};
