/**
 * Checklist Page - Simplified version
 */

import { FiCheckCircle, FiClock, FiAlertCircle } from 'react-icons/fi';

export const Checklist = () => {
  console.log('Checklist component rendering...');
  
  const tasks = [
    { id: 1, title: 'Complete Personal Information Form', status: 'completed', category: 'HR' },
    { id: 2, title: 'Review Employee Handbook', status: 'completed', category: 'Policy' },
    { id: 3, title: 'Set up IT Equipment', status: 'in-progress', category: 'IT' },
    { id: 4, title: 'Meet with Manager', status: 'pending', category: 'Team' },
    { id: 5, title: 'Complete Security Training', status: 'pending', category: 'Training' },
    { id: 6, title: 'Office Tour', status: 'pending', category: 'Facilities' }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <FiCheckCircle style={{ color: '#10b981', width: '20px', height: '20px' }} />;
      case 'in-progress': return <FiClock style={{ color: '#f59e0b', width: '20px', height: '20px' }} />;
      default: return <FiAlertCircle style={{ color: '#6b7280', width: '20px', height: '20px' }} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'in-progress': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  return (
    <div style={{ padding: '20px', backgroundColor: 'white', minHeight: '500px' }}>
      <h1 style={{ color: 'black', fontSize: '28px', marginBottom: '20px', fontWeight: 'bold' }}>
        📋 Your Onboarding Checklist
      </h1>
      
      <div style={{ marginBottom: '30px' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '16px',
          marginBottom: '30px'
        }}>
          <div style={{ backgroundColor: '#f0fdf4', padding: '16px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
            <div style={{ color: '#15803d', fontSize: '18px', fontWeight: 'bold' }}>2 Completed</div>
            <div style={{ color: '#16a34a', fontSize: '14px' }}>Tasks finished</div>
          </div>
          <div style={{ backgroundColor: '#fefce8', padding: '16px', borderRadius: '8px', border: '1px solid #fde047' }}>
            <div style={{ color: '#ca8a04', fontSize: '18px', fontWeight: 'bold' }}>1 In Progress</div>
            <div style={{ color: '#eab308', fontSize: '14px' }}>Currently working</div>
          </div>
          <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ color: '#475569', fontSize: '18px', fontWeight: 'bold' }}>3 Pending</div>
            <div style={{ color: '#64748b', fontSize: '14px' }}>Not started</div>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ color: 'black', fontSize: '20px', marginBottom: '16px', fontWeight: '600' }}>Tasks</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {tasks.map((task) => (
            <div key={task.id} style={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              {getStatusIcon(task.status)}
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', fontSize: '16px', color: 'black', marginBottom: '4px' }}>
                  {task.title}
                </div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>
                  Category: {task.category}
                </div>
              </div>
              <div style={{
                padding: '4px 12px',
                backgroundColor: getStatusColor(task.status),
                color: 'white',
                fontSize: '12px',
                fontWeight: 'bold',
                borderRadius: '16px',
                textTransform: 'capitalize'
              }}>
                {task.status.replace('-', ' ')}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};