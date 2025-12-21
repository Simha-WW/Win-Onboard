/**
 * L&D Employee Detail Page
 * Show individual employee's learning plan and progress
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiBook, FiCheckCircle, FiClock, FiExternalLink, FiX, FiPlus } from 'react-icons/fi';
import { ldApiService, EmployeeLearningProgress, LearningItem } from '../../services/ldApi';

export const LDEmployeeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<EmployeeLearningProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addingResource, setAddingResource] = useState(false);
  const [newResource, setNewResource] = useState({
    title: '',
    description: '',
    link: '',
    duration_value: 0,
    duration_unit: 'minutes' as 'minutes' | 'days'
  });

  useEffect(() => {
    if (id) {
      fetchEmployeeProgress();
    }
  }, [id]);

  const fetchEmployeeProgress = async () => {
    try {
      setLoading(true);
      const progressData = await ldApiService.getEmployeeLearningProgress(parseInt(id!));
      setData(progressData);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load employee progress');
    } finally {
      setLoading(false);
    }
  };

  const handleAddResource = async () => {
    if (!id || !newResource.title.trim() || !newResource.link.trim()) {
      alert('Please fill in title and link');
      return;
    }

    try {
      setAddingResource(true);
      // Convert duration to minutes based on unit
      const durationInMinutes = newResource.duration_unit === 'days' 
        ? newResource.duration_value * 24 * 60 
        : newResource.duration_value;

      await ldApiService.addLearningResource(parseInt(id), {
        learning_title: newResource.title,
        description: newResource.description,
        learning_link: newResource.link,
        duration_minutes: durationInMinutes
      });
      
      // Reset form and close modal
      setNewResource({ title: '', description: '', link: '', duration_value: 0, duration_unit: 'minutes' });
      setShowAddModal(false);
      
      // Refresh data
      await fetchEmployeeProgress();
    } catch (err: any) {
      alert(err.message || 'Failed to add learning resource');
    } finally {
      setAddingResource(false);
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Not started';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
        <div>Loading employee progress...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ padding: '24px' }}>
        <div style={{
          padding: '16px',
          backgroundColor: '#fee2e2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          color: '#dc2626'
        }}>
          {error || 'Employee not found'}
        </div>
      </div>
    );
  }

  const { employee, learnings, stats } = data;

  return (
    <div style={{
      padding: '24px',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      {/* Back Button */}
      <button
        onClick={() => navigate('/ld/employees')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 16px',
          backgroundColor: 'transparent',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          color: '#6b7280',
          cursor: 'pointer',
          fontSize: '14px',
          marginBottom: '24px',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#f9fafb';
          e.currentTarget.style.borderColor = '#d1d5db';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.borderColor = '#e5e7eb';
        }}
      >
        <FiArrowLeft /> Back to Employees
      </button>

      {/* Employee Header */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb'
      }}>
        <div style={{ marginBottom: '16px' }}>
          <h1 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#1f2937',
            margin: '0 0 8px 0'
          }}>
            {employee.first_name} {employee.last_name}
          </h1>
          <p style={{
            fontSize: '16px',
            color: '#6b7280',
            margin: '0 0 4px 0'
          }}>
            {employee.designation}
          </p>
          <p style={{
            fontSize: '14px',
            color: '#9ca3af',
            margin: 0
          }}>
            {employee.department} • {employee.email}
          </p>
        </div>

        {/* Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          paddingTop: '16px',
          borderTop: '1px solid #e5e7eb'
        }}>
          <div>
            <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>
              Overall Progress
            </div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#2563eb' }}>
              {stats.progress_percentage}%
            </div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>
              Completed
            </div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#10b981' }}>
              {stats.completed_count} / {stats.total_count}
            </div>
          </div>
          {employee.days_remaining !== undefined && employee.days_remaining !== null && (
            <div>
              <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>
                Days Remaining
              </div>
              <div style={{ 
                fontSize: '28px', 
                fontWeight: '700', 
                color: employee.days_remaining < 3 ? '#ef4444' : employee.days_remaining < 7 ? '#f59e0b' : '#6b7280'
              }}>
                {employee.days_remaining > 0 ? employee.days_remaining : '0'}
              </div>
              {employee.days_remaining < 3 && employee.days_remaining > 0 && (
                <div style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>
                  ⚠️ Deadline approaching
                </div>
              )}
              {employee.days_remaining <= 0 && (
                <div style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>
                  ⚠️ Deadline passed
                </div>
              )}
            </div>
          )}
        </div>

        {/* Overall Progress Bar */}
        <div style={{ marginTop: '16px' }}>
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
              transition: 'width 0.3s'
            }} />
          </div>
        </div>
      </div>

      {/* Learning Items */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#1f2937',
            margin: 0
          }}>
            Learning Plan ({learnings.length} items)
          </h2>
          
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
          >
            <FiPlus size={18} />
            Add Learning Resource
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {learnings.map((learning, index) => (
            <div
              key={learning.id}
              style={{
                padding: '16px',
                backgroundColor: learning.is_completed ? '#f0fdf4' : '#f9fafb',
                border: `2px solid ${learning.is_completed ? '#86efac' : '#e5e7eb'}`,
                borderRadius: '8px',
                transition: 'all 0.2s'
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: '16px'
              }}>
                {/* Content */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <span style={{
                      fontSize: '14px',
                      fontWeight: '700',
                      color: '#9ca3af',
                      minWidth: '30px'
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
                    gap: '16px',
                    marginLeft: '42px',
                    fontSize: '13px',
                    color: '#9ca3af',
                    marginTop: '8px'
                  }}>
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
                          textDecoration: 'none',
                          fontSize: '13px',
                          fontWeight: '500'
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <FiExternalLink size={14} />
                        Open Resource
                      </a>
                    )}
                    {learning.completed_at && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10b981' }}>
                        <FiCheckCircle size={14} />
                        Completed on {formatDate(learning.completed_at)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Resource Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '32px',
            width: '90%',
            maxWidth: '600px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#1f2937',
              marginTop: 0,
              marginBottom: '24px'
            }}>
              Add New Learning Resource
            </h3>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Title <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                value={newResource.title}
                onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                placeholder="e.g., Azure Fundamentals"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Description
              </label>
              <textarea
                value={newResource.description}
                onChange={(e) => setNewResource({ ...newResource, description: e.target.value })}
                placeholder="Brief description of the learning resource"
                rows={3}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Link <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="url"
                value={newResource.link}
                onChange={(e) => setNewResource({ ...newResource, link: e.target.value })}
                placeholder="https://..."
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Duration
              </label>
              <div style={{ display: 'flex', gap: '12px' }}>
                <input
                  type="number"
                  min="0"
                  value={newResource.duration_value}
                  onChange={(e) => setNewResource({ ...newResource, duration_value: parseInt(e.target.value) || 0 })}
                  placeholder="e.g., 60"
                  style={{
                    flex: 1,
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
                <select
                  value={newResource.duration_unit}
                  onChange={(e) => setNewResource({ ...newResource, duration_unit: e.target.value as 'minutes' | 'days' })}
                  style={{
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    minWidth: '120px'
                  }}
                >
                  <option value="minutes">Minutes</option>
                  <option value="days">Days</option>
                </select>
              </div>
              <p style={{
                fontSize: '12px',
                color: '#9ca3af',
                marginTop: '4px',
                marginBottom: 0
              }}>
                Estimated time to complete this resource
                {newResource.duration_unit === 'days' && newResource.duration_value > 0 && (
                  <span style={{ color: '#6b7280', fontWeight: '500' }}>
                    {' '}({newResource.duration_value * 24 * 60} minutes)
                  </span>
                )}
              </p>
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewResource({ title: '', description: '', link: '', duration_value: 0, duration_unit: 'minutes' });
                }}
                disabled={addingResource}
                style={{
                  padding: '10px 20px',
                  backgroundColor: 'white',
                  color: '#6b7280',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: addingResource ? 'not-allowed' : 'pointer',
                  opacity: addingResource ? 0.5 : 1
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleAddResource}
                disabled={addingResource || !newResource.title.trim() || !newResource.link.trim()}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: (addingResource || !newResource.title.trim() || !newResource.link.trim()) ? 'not-allowed' : 'pointer',
                  opacity: (addingResource || !newResource.title.trim() || !newResource.link.trim()) ? 0.5 : 1
                }}
              >
                {addingResource ? 'Adding...' : 'Add Resource'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
