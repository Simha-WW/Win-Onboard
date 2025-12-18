/**
 * Policies Page - Contains company policies and documents for download
 */

import { FiFileText, FiDownload, FiEye, FiFile } from 'react-icons/fi';

export const Policies = () => {
  console.log('Policies component rendering...');
  
  const documents = [
    { id: 1, name: 'Employee Handbook', type: 'PDF', size: '2.4 MB', status: 'required' },
    { id: 2, name: 'Benefits Guide', type: 'PDF', size: '1.8 MB', status: 'optional' },
    { id: 3, name: 'Code of Conduct', type: 'PDF', size: '856 KB', status: 'required' },
    { id: 4, name: 'Emergency Procedures', type: 'PDF', size: '1.2 MB', status: 'required' },
    { id: 5, name: 'IT Security Policy', type: 'PDF', size: '945 KB', status: 'required' },
    { id: 6, name: 'Org Chart', type: 'PDF', size: '632 KB', status: 'optional' }
  ];

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'PDF': return <FiFileText style={{ color: '#dc2626', width: '24px', height: '24px' }} />;
      default: return <FiFile style={{ color: '#6b7280', width: '24px', height: '24px' }} />;
    }
  };

  return (
    <div style={{ padding: '20px', backgroundColor: 'white', minHeight: '500px' }}>
      <h1 style={{ color: 'black', fontSize: '28px', marginBottom: '20px', fontWeight: 'bold' }}>
        📋 Company Policies
      </h1>
      
      <p style={{ color: '#6b7280', fontSize: '16px', marginBottom: '30px' }}>
        Download and review these important policies and documents for your onboarding process.
      </p>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '16px' 
      }}>
        {documents.map((doc) => (
          <div key={doc.id} style={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '20px',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}>
            
            <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div style={{ marginRight: '12px', marginTop: '4px' }}>
                {getFileIcon(doc.type)}
              </div>
              
              <div style={{ flex: 1 }}>
                <h3 style={{ 
                  color: 'black', 
                  fontSize: '18px', 
                  fontWeight: '600',
                  margin: '0 0 8px 0',
                  lineHeight: '1.4'
                }}>
                  {doc.name}
                </h3>
                
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ 
                    color: '#6b7280', 
                    fontSize: '14px',
                    backgroundColor: '#f3f4f6',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    marginRight: '8px'
                  }}>
                    {doc.type}
                  </span>
                  <span style={{ color: '#6b7280', fontSize: '14px' }}>
                    {doc.size}
                  </span>
                </div>

                <span style={{
                  color: doc.status === 'required' ? '#dc2626' : '#16a34a',
                  backgroundColor: doc.status === 'required' ? '#fef2f2' : '#f0fdf4',
                  fontSize: '12px',
                  fontWeight: '600',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  {doc.status}
                </span>
              </div>
            </div>

            <div style={{ 
              display: 'flex', 
              gap: '8px',
              paddingTop: '12px',
              borderTop: '1px solid #f3f4f6'
            }}>
              <button style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px 16px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#2563eb';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#3b82f6';
              }}>
                <FiDownload style={{ width: '16px', height: '16px' }} />
                Download
              </button>

              <button style={{
                padding: '10px',
                backgroundColor: '#f8f9fa',
                color: '#6b7280',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#e5e7eb';
                e.currentTarget.style.color = '#374151';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#f8f9fa';
                e.currentTarget.style.color = '#6b7280';
              }}>
                <FiEye style={{ width: '16px', height: '16px' }} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};