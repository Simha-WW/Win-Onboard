/**
 * L&D New Employees Page
 * Display list of employees with their learning progress
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiBook, FiClock, FiCheckCircle, FiTrendingUp } from 'react-icons/fi';
import { ldApiService, LDEmployee } from '../../services/ldApi';

export const LDNewEmployees = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<LDEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'in-progress' | 'completed'>('all');

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const data = await ldApiService.getEmployees();
      setEmployees(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getProgressColor = (percentage: number) => {
    if (percentage === 0) return '#9ca3af';
    if (percentage < 50) return '#f59e0b';
    if (percentage < 100) return '#3b82f6';
    return '#10b981';
  };

  const filteredEmployees = employees.filter(emp => {
    if (filter === 'all') return true;
    if (filter === 'completed') return emp.progress_percentage === 100;
    if (filter === 'in-progress') return emp.progress_percentage > 0 && emp.progress_percentage < 100;
    return true;
  });

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '400px'
      }}>
        <div>Loading employees...</div>
      </div>
    );
  }

  return (
    <div style={{
      padding: '24px',
      maxWidth: '1400px',
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
          New Employees - Learning Progress
        </h1>
        <p style={{
          fontSize: '14px',
          color: '#6b7280',
          margin: 0
        }}>
          Track and monitor learning progress of new employees
        </p>
      </div>

      {/* Filter Tabs */}
      <div style={{
        display: 'flex',
        gap: '16px',
        marginBottom: '24px',
        borderBottom: '2px solid #e5e7eb',
        flexWrap: 'wrap'
      }}>
        {[
          { key: 'all' as const, label: 'All Employees', count: employees.length },
          { key: 'in-progress' as const, label: 'In Progress', count: employees.filter(e => e.progress_percentage > 0 && e.progress_percentage < 100).length },
          { key: 'completed' as const, label: 'Completed', count: employees.filter(e => e.progress_percentage === 100).length }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            style={{
              padding: '12px 24px',
              border: 'none',
              backgroundColor: 'transparent',
              color: filter === tab.key ? '#2563eb' : '#6b7280',
              fontWeight: filter === tab.key ? '600' : '500',
              cursor: 'pointer',
              borderBottom: filter === tab.key ? '2px solid #2563eb' : '2px solid transparent',
              marginBottom: '-2px',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {tab.label}
            <span style={{
              backgroundColor: filter === tab.key ? '#2563eb' : '#e5e7eb',
              color: filter === tab.key ? 'white' : '#6b7280',
              padding: '2px 8px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '600'
            }}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {error && (
        <div style={{
          padding: '16px',
          backgroundColor: '#fee2e2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          color: '#dc2626',
          marginBottom: '24px'
        }}>
          {error}
        </div>
      )}

      {/* Employees Grid */}
      {filteredEmployees.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '48px 24px',
          backgroundColor: '#f9fafb',
          borderRadius: '12px',
          border: '1px dashed #d1d5db'
        }}>
          <FiUser style={{
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
            No employees found
          </h3>
          <p style={{
            fontSize: '14px',
            color: '#6b7280',
            margin: 0
          }}>
            {filter === 'all' 
              ? 'No employees have been assigned learning plans yet'
              : `No employees with ${filter.replace('-', ' ')} status`
            }
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '24px'
        }}>
          {filteredEmployees.map(employee => (
            <div
              key={employee.fresher_id}
              style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e5e7eb',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
              onClick={() => navigate(`/ld/employee/${employee.fresher_id}`)}
            >
              {/* Employee Info */}
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#1f2937',
                  margin: '0 0 4px 0'
                }}>
                  {employee.first_name} {employee.last_name}
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  margin: '0 0 4px 0'
                }}>
                  {employee.designation}
                </p>
                <p style={{
                  fontSize: '13px',
                  color: '#9ca3af',
                  margin: 0
                }}>
                  {employee.department}
                </p>
              </div>

              {/* Stats Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                marginBottom: '16px',
                paddingTop: '16px',
                borderTop: '1px solid #e5e7eb'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FiBook style={{ color: '#6b7280', width: '16px', height: '16px' }} />
                  <div>
                    <div style={{ fontSize: '11px', color: '#9ca3af' }}>Total Learnings</div>
                    <div style={{ fontSize: '16px', color: '#374151', fontWeight: '600' }}>
                      {employee.total_count}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FiCheckCircle style={{ color: '#10b981', width: '16px', height: '16px' }} />
                  <div>
                    <div style={{ fontSize: '11px', color: '#9ca3af' }}>Completed</div>
                    <div style={{ fontSize: '16px', color: '#10b981', fontWeight: '600' }}>
                      {employee.completed_count}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FiClock style={{ color: '#6b7280', width: '16px', height: '16px' }} />
                  <div>
                    <div style={{ fontSize: '11px', color: '#9ca3af' }}>Assigned On</div>
                    <div style={{ fontSize: '13px', color: '#374151', fontWeight: '500' }}>
                      {formatDate(employee.assigned_date)}
                    </div>
                  </div>
                </div>

                {employee.days_remaining !== undefined && employee.days_remaining !== null && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FiClock style={{ 
                      color: employee.days_remaining < 3 ? '#ef4444' : employee.days_remaining < 7 ? '#f59e0b' : '#6b7280', 
                      width: '16px', 
                      height: '16px' 
                    }} />
                    <div>
                      <div style={{ fontSize: '11px', color: '#9ca3af' }}>Days Left</div>
                      <div style={{ 
                        fontSize: '16px', 
                        fontWeight: '600',
                        color: employee.days_remaining < 3 ? '#ef4444' : employee.days_remaining < 7 ? '#f59e0b' : '#374151'
                      }}>
                        {employee.days_remaining > 0 ? employee.days_remaining : '0'}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Progress */}
              <div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '8px'
                }}>
                  <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>
                    Learning Progress
                  </span>
                  <span style={{
                    fontSize: '16px',
                    fontWeight: '700',
                    color: getProgressColor(employee.progress_percentage)
                  }}>
                    {employee.progress_percentage}%
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
                    width: `${employee.progress_percentage}%`,
                    backgroundColor: getProgressColor(employee.progress_percentage),
                    transition: 'width 0.3s'
                  }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
