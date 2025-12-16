/**
 * HR Pre-Join Tasks - Manage tasks for candidates before their start date
 */

import React from 'react';
import { FiCheckCircle, FiClock, FiAlertTriangle, FiUser, FiCalendar, FiFileText } from 'react-icons/fi';

export const HrPreJoinTasks = () => {
  console.log('HR Pre-Join Tasks rendering...');

  // Mock pre-join tasks data - TODO: Replace with API data
  const preJoinTasks = [
    {
      id: 1,
      candidateName: 'John Smith',
      position: 'Software Engineer',
      startDate: '2024-01-15',
      daysUntilStart: 5,
      completedTasks: 6,
      totalTasks: 8,
      status: 'On Track',
      tasks: [
        { id: 1, title: 'Submit Background Check Forms', status: 'completed', dueDate: '2024-01-10' },
        { id: 2, title: 'Complete I-9 Documentation', status: 'completed', dueDate: '2024-01-10' },
        { id: 3, title: 'Upload Passport/ID Copy', status: 'completed', dueDate: '2024-01-12' },
        { id: 4, title: 'Complete Direct Deposit Setup', status: 'completed', dueDate: '2024-01-12' },
        { id: 5, title: 'Sign Offer Letter', status: 'completed', dueDate: '2024-01-08' },
        { id: 6, title: 'Complete Emergency Contact Form', status: 'completed', dueDate: '2024-01-12' },
        { id: 7, title: 'Schedule First Day Orientation', status: 'pending', dueDate: '2024-01-14' },
        { id: 8, title: 'IT Equipment Setup', status: 'pending', dueDate: '2024-01-14' }
      ]
    },
    {
      id: 2,
      candidateName: 'Emily Davis',
      position: 'Product Manager',
      startDate: '2024-01-22',
      daysUntilStart: 12,
      completedTasks: 8,
      totalTasks: 8,
      status: 'Complete',
      tasks: [
        { id: 1, title: 'Submit Background Check Forms', status: 'completed', dueDate: '2024-01-15' },
        { id: 2, title: 'Complete I-9 Documentation', status: 'completed', dueDate: '2024-01-15' },
        { id: 3, title: 'Upload Passport/ID Copy', status: 'completed', dueDate: '2024-01-17' },
        { id: 4, title: 'Complete Direct Deposit Setup', status: 'completed', dueDate: '2024-01-17' },
        { id: 5, title: 'Sign Offer Letter', status: 'completed', dueDate: '2024-01-10' },
        { id: 6, title: 'Complete Emergency Contact Form', status: 'completed', dueDate: '2024-01-17' },
        { id: 7, title: 'Schedule First Day Orientation', status: 'completed', dueDate: '2024-01-19' },
        { id: 8, title: 'IT Equipment Setup', status: 'completed', dueDate: '2024-01-19' }
      ]
    },
    {
      id: 3,
      candidateName: 'Michael Brown',
      position: 'UX Designer',
      startDate: '2024-02-01',
      daysUntilStart: 22,
      completedTasks: 4,
      totalTasks: 8,
      status: 'At Risk',
      tasks: [
        { id: 1, title: 'Submit Background Check Forms', status: 'completed', dueDate: '2024-01-20' },
        { id: 2, title: 'Complete I-9 Documentation', status: 'completed', dueDate: '2024-01-20' },
        { id: 3, title: 'Upload Passport/ID Copy', status: 'overdue', dueDate: '2024-01-08' },
        { id: 4, title: 'Complete Direct Deposit Setup', status: 'pending', dueDate: '2024-01-25' },
        { id: 5, title: 'Sign Offer Letter', status: 'completed', dueDate: '2024-01-05' },
        { id: 6, title: 'Complete Emergency Contact Form', status: 'pending', dueDate: '2024-01-25' },
        { id: 7, title: 'Schedule First Day Orientation', status: 'pending', dueDate: '2024-01-28' },
        { id: 8, title: 'IT Equipment Setup', status: 'completed', dueDate: '2024-01-28' }
      ]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Complete': return '#10b981';
      case 'On Track': return '#2563eb';
      case 'At Risk': return '#f59e0b';
      case 'Overdue': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Complete': return <FiCheckCircle />;
      case 'On Track': return <FiClock />;
      case 'At Risk': return <FiAlertTriangle />;
      case 'Overdue': return <FiAlertTriangle />;
      default: return <FiClock />;
    }
  };

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'pending': return '#6b7280';
      case 'overdue': return '#ef4444';
      default: return '#6b7280';
    }
  };

  // TODO: Add task templates management
  // TODO: Add automated reminders
  // TODO: Add bulk task assignment

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
          Pre-Join Tasks
        </h1>
        <p style={{ 
          color: '#6b7280', 
          fontSize: '16px'
        }}>
          Manage and track tasks for candidates before their start date
        </p>
      </div>

      {/* Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <FiUser style={{ width: '24px', height: '24px', color: '#2563eb' }} />
            <h3 style={{ color: '#1f2937', fontSize: '18px', fontWeight: '600', margin: 0 }}>
              Active Candidates
            </h3>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>
            {preJoinTasks.length}
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>
            Candidates with pending tasks
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <FiCheckCircle style={{ width: '24px', height: '24px', color: '#10b981' }} />
            <h3 style={{ color: '#1f2937', fontSize: '18px', fontWeight: '600', margin: 0 }}>
              Completion Rate
            </h3>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>
            75%
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>
            Average task completion
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <FiAlertTriangle style={{ width: '24px', height: '24px', color: '#f59e0b' }} />
            <h3 style={{ color: '#1f2937', fontSize: '18px', fontWeight: '600', margin: 0 }}>
              At Risk
            </h3>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>
            1
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>
            Candidates with overdue tasks
          </div>
        </div>
      </div>

      {/* Candidates List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {preJoinTasks.map((candidate) => (
          <div key={candidate.id} style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            overflow: 'hidden'
          }}>
            {/* Candidate Header */}
            <div style={{
              padding: '20px',
              borderBottom: '1px solid #e2e8f0',
              backgroundColor: '#f8f9fa'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px'
              }}>
                <div>
                  <h3 style={{
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: '#1f2937',
                    margin: '0 0 4px 0'
                  }}>
                    {candidate.candidateName}
                  </h3>
                  <p style={{
                    fontSize: '16px',
                    color: '#6b7280',
                    margin: 0
                  }}>
                    {candidate.position}
                  </p>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: `${getStatusColor(candidate.status)}20`,
                  color: getStatusColor(candidate.status),
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600'
                }}>
                  {getStatusIcon(candidate.status)}
                  {candidate.status}
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FiCalendar style={{ width: '16px', height: '16px', color: '#6b7280' }} />
                  <span style={{ fontSize: '14px', color: '#6b7280' }}>
                    Starts: {candidate.startDate} ({candidate.daysUntilStart} days)
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FiCheckCircle style={{ width: '16px', height: '16px', color: '#6b7280' }} />
                  <span style={{ fontSize: '14px', color: '#6b7280' }}>
                    Progress: {candidate.completedTasks}/{candidate.totalTasks} tasks completed
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div style={{
                width: '100%',
                height: '8px',
                backgroundColor: '#e2e8f0',
                borderRadius: '4px',
                marginTop: '12px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${(candidate.completedTasks / candidate.totalTasks) * 100}%`,
                  height: '100%',
                  backgroundColor: getStatusColor(candidate.status),
                  borderRadius: '4px',
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>

            {/* Tasks List */}
            <div style={{ padding: '20px' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '12px'
              }}>
                {candidate.tasks.map((task) => (
                  <div key={task.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    borderRadius: '8px',
                    backgroundColor: task.status === 'completed' ? '#f0fdf4' : 
                                   task.status === 'overdue' ? '#fef2f2' : '#f9fafb',
                    border: '1px solid',
                    borderColor: task.status === 'completed' ? '#bbf7d0' :
                                task.status === 'overdue' ? '#fecaca' : '#e2e8f0'
                  }}>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      backgroundColor: getTaskStatusColor(task.status),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {task.status === 'completed' && (
                        <FiCheckCircle style={{ width: '12px', height: '12px', color: 'white' }} />
                      )}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#1f2937',
                        marginBottom: '2px'
                      }}>
                        {task.title}
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: task.status === 'overdue' ? '#ef4444' : '#6b7280'
                      }}>
                        Due: {task.dueDate} {task.status === 'overdue' && '(Overdue)'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* TODO: Add task template management */}
      {/* TODO: Add reminder scheduling */}
      {/* TODO: Add bulk actions for tasks */}
      {/* TODO: Add integration with email notifications */}
    </div>
  );
};