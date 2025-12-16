/**
 * Minimal NewHire Home Page - Basic HTML only
 */

export const NewHireHome = () => {
  console.log('NewHireHome MINIMAL rendering...');
  
  return (
    <div style={{ padding: '20px', backgroundColor: 'white', minHeight: '500px' }}>
      <h1 style={{ color: 'black', fontSize: '24px', marginBottom: '20px' }}>
        🎉 Welcome to WinOnboard!
      </h1>
      <p style={{ color: 'black', fontSize: '16px', marginBottom: '10px' }}>
        Hello Bunny, we're excited to have you join our team!
      </p>
      <p style={{ color: 'gray', fontSize: '14px' }}>
        Start Date: December 23, 2024
      </p>
      
      <div style={{ marginTop: '30px', backgroundColor: '#f0f0f0', padding: '20px', border: '1px solid #ccc' }}>
        <h2 style={{ color: 'black', fontSize: '18px', marginBottom: '15px' }}>Your Progress</h2>
        <p style={{ color: 'black' }}>Tasks Completed: 6/8</p>
        <p style={{ color: 'black' }}>Days Until Start: 5</p>
        <p style={{ color: 'black' }}>Team Members: 24</p>
      </div>
      
      <div style={{ marginTop: '30px' }}>
        <h2 style={{ color: 'black', fontSize: '18px', marginBottom: '15px' }}>Quick Actions</h2>
        <button style={{ 
          backgroundColor: '#007bff', 
          color: 'white', 
          padding: '10px 20px', 
          border: 'none', 
          borderRadius: '5px',
          marginRight: '10px',
          cursor: 'pointer'
        }}>
          View Checklist
        </button>
        <button style={{ 
          backgroundColor: '#28a745', 
          color: 'white', 
          padding: '10px 20px', 
          border: 'none', 
          borderRadius: '5px',
          cursor: 'pointer'
        }}>
          Download Documents
        </button>
      </div>
    </div>
  );
};