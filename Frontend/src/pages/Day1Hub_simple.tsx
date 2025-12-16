/**
 * Day 1 Hub - Simplified version
 */

import { FiClock, FiMapPin, FiUser, FiCalendar } from 'react-icons/fi';

export const Day1Hub = () => {
  console.log('Day1Hub component rendering...');
  
  const scheduleItems = [
    { id: 1, time: '9:00 AM', title: 'Welcome & Orientation', location: 'Conference Room A', duration: '45 min' },
    { id: 2, time: '10:00 AM', title: 'Meet Your Team', location: 'Team Space', duration: '30 min' },
    { id: 3, time: '11:00 AM', title: 'IT Setup & Security', location: 'IT Department', duration: '60 min' },
    { id: 4, time: '12:00 PM', title: 'Lunch with Buddy', location: 'Cafeteria', duration: '60 min' },
    { id: 5, time: '1:30 PM', title: 'HR Paperwork Review', location: 'HR Office', duration: '45 min' },
    { id: 6, time: '3:00 PM', title: 'First Assignment Briefing', location: 'Your Desk', duration: '30 min' }
  ];

  return (
    <div style={{ padding: '20px', backgroundColor: 'white', minHeight: '500px' }}>
      <h1 style={{ color: 'black', fontSize: '28px', marginBottom: '20px', fontWeight: 'bold' }}>
        🎆 Day 1 Hub - Welcome!
      </h1>
      
      <div style={{ backgroundColor: '#dbeafe', padding: '16px', borderRadius: '12px', marginBottom: '30px', border: '1px solid #93c5fd' }}>
        <h2 style={{ color: '#1e40af', fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>Today's Date: December 23, 2024</h2>
        <p style={{ color: '#1d4ed8', fontSize: '14px' }}>Your first day at WinOnboard! Follow your schedule below.</p>
      </div>

      <h2 style={{ color: 'black', fontSize: '22px', marginBottom: '20px', fontWeight: '600' }}>Your Schedule</h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {scheduleItems.map((item, index) => (
          <div key={item.id} style={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            position: 'relative',
            borderLeft: index === 0 ? '4px solid #10b981' : '4px solid #e5e7eb'
          }}>
            <div style={{
              backgroundColor: index === 0 ? '#10b981' : '#f3f4f6',
              color: index === 0 ? 'white' : '#6b7280',
              padding: '12px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '60px'
            }}>
              <FiClock style={{ width: '20px', height: '20px' }} />
            </div>
            
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontWeight: 'bold', fontSize: '16px', color: '#1f2937' }}>{item.time}</span>
                <span style={{ color: '#6b7280', fontSize: '14px' }}>({item.duration})</span>
              </div>
              <h3 style={{ fontWeight: '600', fontSize: '18px', color: 'black', marginBottom: '4px' }}>
                {item.title}
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6b7280', fontSize: '14px' }}>
                <FiMapPin style={{ width: '16px', height: '16px' }} />
                {item.location}
              </div>
            </div>
            
            {index === 0 && (
              <div style={{
                backgroundColor: '#10b981',
                color: 'white',
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                CURRENT
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div style={{ marginTop: '30px', backgroundColor: '#f9fafb', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
        <h3 style={{ color: 'black', fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>Important Notes</h3>
        <ul style={{ color: '#4b5563', fontSize: '14px', lineHeight: '1.6', listStyle: 'none', padding: 0, margin: 0 }}>
          <li style={{ marginBottom: '8px' }}>• Your buddy Sarah will meet you at reception at 9:00 AM</li>
          <li style={{ marginBottom: '8px' }}>• Bring a valid photo ID for security badge creation</li>
          <li style={{ marginBottom: '8px' }}>• Parking pass will be provided during orientation</li>
          <li>• Questions? Contact HR at extension 1234</li>
        </ul>
      </div>
    </div>
  );
};