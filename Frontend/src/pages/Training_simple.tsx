/**
 * Training Page - Simplified version
 */

import { FiPlay, FiClock, FiBookOpen, FiAward } from 'react-icons/fi';

export const Training = () => {
  console.log('Training component rendering...');
  
  const trainingModules = [
    { id: 1, title: 'Company Overview', duration: '15 min', status: 'completed', progress: 100 },
    { id: 2, title: 'Safety Training', duration: '30 min', status: 'completed', progress: 100 },
    { id: 3, title: 'Customer Service Excellence', duration: '45 min', status: 'in-progress', progress: 60 },
    { id: 4, title: 'Data Privacy & Security', duration: '25 min', status: 'pending', progress: 0 },
    { id: 5, title: 'Professional Communication', duration: '20 min', status: 'pending', progress: 0 },
    { id: 6, title: 'Team Collaboration Tools', duration: '35 min', status: 'pending', progress: 0 }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'in-progress': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <FiAward style={{ color: '#10b981', width: '20px', height: '20px' }} />;
      case 'in-progress': return <FiPlay style={{ color: '#f59e0b', width: '20px', height: '20px' }} />;
      default: return <FiBookOpen style={{ color: '#6b7280', width: '20px', height: '20px' }} />;
    }
  };

  return (
    <div style={{ padding: '20px', backgroundColor: 'white', minHeight: '500px' }}>
      <h1 style={{ color: 'black', fontSize: '28px', marginBottom: '20px', fontWeight: 'bold' }}>
        📚 Training Center
      </h1>
      
      <p style={{ color: '#6b7280', fontSize: '16px', marginBottom: '30px' }}>
        Complete your required training modules to get up to speed with our company processes and tools.
      </p>

      {/* Progress Overview */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '16px',
        marginBottom: '30px'
      }}>
        <div style={{ backgroundColor: '#f0fdf4', padding: '16px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
          <div style={{ color: '#15803d', fontSize: '18px', fontWeight: 'bold' }}>2/6</div>
          <div style={{ color: '#16a34a', fontSize: '14px' }}>Modules Completed</div>
        </div>
        <div style={{ backgroundColor: '#fefce8', padding: '16px', borderRadius: '8px', border: '1px solid #fde047' }}>
          <div style={{ color: '#ca8a04', fontSize: '18px', fontWeight: 'bold' }}>1</div>
          <div style={{ color: '#eab308', fontSize: '14px' }}>In Progress</div>
        </div>
        <div style={{ backgroundColor: '#eff6ff', padding: '16px', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
          <div style={{ color: '#1d4ed8', fontSize: '18px', fontWeight: 'bold' }}>130 min</div>
          <div style={{ color: '#2563eb', fontSize: '14px' }}>Total Duration</div>
        </div>
      </div>

      <h2 style={{ color: 'black', fontSize: '22px', marginBottom: '20px', fontWeight: '600' }}>Training Modules</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {trainingModules.map((module) => (
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
              {getStatusIcon(module.status)}
              <div style={{ flex: 1 }}>
                <h3 style={{ fontWeight: '600', fontSize: '18px', color: 'black', marginBottom: '4px' }}>
                  {module.title}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6b7280', fontSize: '14px' }}>
                  <FiClock style={{ width: '14px', height: '14px' }} />
                  {module.duration}
                </div>
              </div>
              <div style={{
                padding: '6px 12px',
                backgroundColor: getStatusColor(module.status),
                color: 'white',
                fontSize: '12px',
                fontWeight: 'bold',
                borderRadius: '16px',
                textTransform: 'capitalize'
              }}>
                {module.status.replace('-', ' ')}
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
                  width: `${module.progress}%`,
                  height: '100%',
                  backgroundColor: getStatusColor(module.status),
                  transition: 'width 0.3s ease'
                }} />
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                {module.progress}% Complete
              </div>
            </div>

            {/* Action Button */}
            <button style={{
              backgroundColor: module.status === 'completed' ? '#10b981' : '#2563eb',
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
              {module.status === 'completed' ? (
                <>
                  <FiAward style={{ width: '16px', height: '16px' }} />
                  Review
                </>
              ) : module.status === 'in-progress' ? (
                <>
                  <FiPlay style={{ width: '16px', height: '16px' }} />
                  Continue
                </>
              ) : (
                <>
                  <FiPlay style={{ width: '16px', height: '16px' }} />
                  Start Module
                </>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};