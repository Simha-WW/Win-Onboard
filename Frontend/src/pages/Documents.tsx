/**
 * Documents Page - Simplified version
 */

import { FiFileText, FiDownload, FiEye, FiFile } from 'react-icons/fi';

export const Documents = () => {
  console.log('Documents component rendering...');
  
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
        📄 Important Documents
      </h1>
      
      <p style={{ color: '#6b7280', fontSize: '16px', marginBottom: '30px' }}>
        Download and review these important documents for your onboarding process.
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
            e.currentTarget.style.borderColor = '#3b82f6';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.borderColor = '#e5e7eb';
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              {getFileIcon(doc.type)}
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', fontSize: '16px', color: 'black', marginBottom: '4px' }}>
                  {doc.name}
                </div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>
                  {doc.type} • {doc.size}
                </div>
              </div>
              <div style={{
                padding: '4px 8px',
                backgroundColor: doc.status === 'required' ? '#fee2e2' : '#f3f4f6',
                color: doc.status === 'required' ? '#dc2626' : '#6b7280',
                fontSize: '12px',
                fontWeight: 'bold',
                borderRadius: '12px',
                textTransform: 'uppercase'
              }}>
                {doc.status}
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              <button style={{
                backgroundColor: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                flex: 1
              }}>
                <FiEye style={{ width: '16px', height: '16px' }} />
                View
              </button>
              <button style={{
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                flex: 1
              }}>
                <FiDownload style={{ width: '16px', height: '16px' }} />
                Download
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};