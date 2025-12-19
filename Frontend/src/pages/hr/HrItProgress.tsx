/**
 * HR IT Progress Page
 * Displays list of freshers sent to IT team with their onboarding progress
 */

import React, { useState, useEffect } from 'react';
import { hrApiService, ItTask } from '../../services/hrApi';
import { Card } from '../../components/ui/Card';
import { ItTaskDetails } from '../../components/hr/ItTaskDetails';

export const HrItProgress: React.FC = () => {
  const [tasks, setTasks] = useState<ItTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<ItTask | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadItTasks();
  }, []);

  const loadItTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Fetching IT tasks...');
      const data = await hrApiService.getItTasks();
      console.log('✅ IT tasks loaded:', data);
      console.log('📊 Number of tasks:', data.length);
      if (data.length > 0) {
        console.log('🔍 First task fields:', {
          id: data[0].id,
          fresher_id: data[0].fresher_id,
          fresher_name: data[0].fresher_name,
          email: data[0].email,
          role: data[0].role
        });
      }
      setTasks(data);
    } catch (err: any) {
      console.error('❌ Error loading IT tasks:', err);
      setError(err.message || 'Failed to load IT tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleTaskClick = async (task: ItTask) => {
    try {
      // Fetch fresh data for the selected task
      const freshTask = await hrApiService.getItTaskById(task.id);
      setSelectedTask(freshTask);
    } catch (err: any) {
      console.error('Error loading task details:', err);
      setSelectedTask(task); // Fallback to existing data
    }
  };

  const handleBack = () => {
    setSelectedTask(null);
    loadItTasks(); // Refresh the list
  };

  const calculateCompletionPercentage = (task: ItTask): number => {
    const taskFields = [
      'work_email_generated',
      'laptop_allocated',
      'software_installed',
      'access_cards_issued',
      'training_scheduled',
      'hardware_accessories',
      'vpn_setup',
      'network_access_granted',
      'domain_account_created',
      'security_tools_configured'
    ];
    
    const completedTasks = taskFields.filter(field => task[field as keyof ItTask] === true).length;
    return Math.round((completedTasks / taskFields.length) * 100);
  };

  const filteredTasks = searchTerm
    ? tasks.filter(task =>
        task.fresher_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.role?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : tasks;

  // Debug logging
  console.log('🎯 Render state:', { 
    loading, 
    error, 
    tasksCount: tasks.length, 
    filteredTasksCount: filteredTasks.length,
    searchTerm,
    tasks: tasks 
  });
  console.log('Will render cards?', !loading && !error && filteredTasks.length > 0);

  // If a task is selected, show details view
  if (selectedTask) {
    return (
      <div>
        <div style={{ marginBottom: '20px' }}>
          <button
            onClick={handleBack}
            style={{
              padding: '8px 16px',
              backgroundColor: '#0078d4',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>←</span> Back to IT Progress
          </button>
        </div>
        <ItTaskDetails task={selectedTask} />
      </div>
    );
  }

  // Main list view
  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: '600' }}>IT Progress</h1>
        <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
          Track IT onboarding tasks and equipment setup for new hires
        </p>
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: '24px' }}>
        <input
          type="text"
          placeholder="Search by name, email, or role..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            maxWidth: '500px',
            padding: '12px 16px',
            border: '1px solid #d0d0d0',
            borderRadius: '8px',
            fontSize: '14px',
            outline: 'none'
          }}
        />
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          Loading IT tasks...
        </div>
      )}

      {error && (
        <Card style={{ padding: '20px', backgroundColor: '#fff3cd', border: '1px solid #ffc107' }}>
          <p style={{ margin: 0, color: '#856404' }}>⚠️ {error}</p>
        </Card>
      )}

      {!loading && !error && filteredTasks.length === 0 && (
        <Card style={{ padding: '40px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600' }}>
            {searchTerm ? 'No matching tasks found' : 'No users sent to IT yet'}
          </h3>
          <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
            {searchTerm
              ? 'Try adjusting your search criteria'
              : 'Users will appear here after HR sends them to IT team'}
          </p>
        </Card>
      )}

      {!loading && !error && filteredTasks.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {filteredTasks.map((task) => {
            const completionPercentage = calculateCompletionPercentage(task);
            const isComplete = completionPercentage === 100;

            return (
              <div
                key={task.id}
                onClick={() => handleTaskClick(task)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.12)';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                  e.currentTarget.style.transform = '';
                }}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  padding: '20px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  border: '1px solid #e0e0e0',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '600', color: '#1a1a1a', lineHeight: '1.3' }}>
                    {task.fresher_name || 'Unknown User'}
                  </h3>
                  <div
                    style={{
                      padding: '3px 10px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: '600',
                      backgroundColor: isComplete ? '#d4edda' : '#fff3cd',
                      color: isComplete ? '#155724' : '#856404',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {isComplete ? 'Done' : `${completionPercentage}%`}
                  </div>
                </div>

                <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                  <strong>ID:</strong> #{task.fresher_id}
                </div>

                <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {task.email || 'N/A'}
                </div>

                <div style={{ fontSize: '12px', color: '#666', marginBottom: '12px' }}>
                  <strong>Role:</strong> {task.role || 'N/A'}
                </div>

                <div style={{ marginTop: 'auto' }}>
                  <div style={{ fontSize: '11px', color: '#999', marginBottom: '6px' }}>
                    Progress
                  </div>
                  <div style={{ 
                    width: '100%', 
                    height: '8px',
                    backgroundColor: '#e0e0e0',
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${completionPercentage}%`,
                      height: '100%',
                      backgroundColor: isComplete ? '#28a745' : '#0078d4',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                  <div style={{ fontSize: '11px', color: '#999', marginTop: '8px' }}>
                    Sent: {new Date(task.sent_to_it_date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
