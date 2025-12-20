import React, { useEffect, useState, useRef } from 'react';
import { API_BASE_URL } from '../../config';

interface BirthdayRecord {
  id: number;
  fullName: string;
  email: string;
  dateOfBirth: string;
  dobDisplay: string;
  dayOfWeek: string;
  dayOfMonth: number;
}

export const HrBirthdays = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<BirthdayRecord[]>([]);
  const printableRef = useRef<HTMLTableElement | null>(null);

  const currentMonth = new Date().toLocaleString('en-US', { month: 'long' });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/birthdays/monthly`);
      const json = await res.json();
      if (json && json.success) setData(json.data || []);
    } catch (err) {
      console.error('Failed to fetch birthdays', err);
    } finally {
      setLoading(false);
    }
  }

  function handlePrint() {
    window.print();
  }

  function handleDownloadPdf() {
    if (!printableRef.current) return;
    
    // Create a clean table for PDF
    const table = printableRef.current.cloneNode(true) as HTMLTableElement;
    const html = `
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Birthdays - ${currentMonth}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              padding: 20px; 
              margin: 0;
            }
            h2 { 
              color: #1f2937; 
              margin: 0 0 20px 0;
              text-align: center;
              font-size: 22px;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin: 0 auto;
            }
            th { 
              background: #3b82f6; 
              color: white; 
              padding: 14px; 
              text-align: left; 
              font-weight: 600; 
              border: 1px solid #1e40af;
              font-size: 14px;
            }
            th:nth-child(3) { 
              width: 30%;
            }
            td { 
              border: 1px solid #e5e7eb; 
              padding: 12px 14px;
              font-size: 14px;
              color: #374151;
            }
            tbody tr:nth-child(odd) { 
              background-color: #f9fafb; 
            }
            tbody tr:nth-child(even) { 
              background-color: white; 
            }
          </style>
        </head>
        <body>
          <h2>Employee Birthdays — ${currentMonth}</h2>
          ${table.outerHTML}
        </body>
      </html>
    `;
    
    const win = window.open('', '_blank', 'width=900,height=700');
    if (!win) return;
    win.document.write(html);
    win.document.close();
    setTimeout(() => { win.print(); }, 300);
  }

  const tableStyles = {
    container: {
      padding: '24px',
      backgroundColor: '#ffffff',
      borderRadius: '8px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '24px',
      flexWrap: 'wrap' as const,
      gap: '16px'
    },
    headerText: {
      flex: 1
    },
    title: {
      fontSize: '24px',
      fontWeight: 600,
      color: '#1f2937',
      margin: '0 0 8px 0'
    },
    subtitle: {
      fontSize: '14px',
      color: '#6b7280',
      margin: 0
    },
    buttonGroup: {
      display: 'flex',
      gap: '12px'
    },
    button: {
      padding: '10px 16px',
      borderRadius: '6px',
      border: 'none',
      fontSize: '14px',
      fontWeight: 500,
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      color: 'white'
    },
    buttonPdf: {
      backgroundColor: '#2563eb'
    },
    buttonPrint: {
      backgroundColor: '#10b981'
    },
    tableWrapper: {
      overflowX: 'auto' as const
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse' as const,
      marginTop: '16px',
      fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif'
    },
    thead: {
      backgroundColor: '#3b82f6'
    },
    th: {
      padding: '14px',
      textAlign: 'left' as const,
      color: 'white',
      fontWeight: 600,
      fontSize: '14px',
      borderBottom: '2px solid #1e40af',
      letterSpacing: '0.5px'
    },
    tbody: {
      backgroundColor: 'white'
    },
    td: {
      padding: '14px',
      borderBottom: '1px solid #e5e7eb',
      fontSize: '14px',
      color: '#374151'
    },
    trOdd: {
      backgroundColor: '#f9fafb'
    },
    trEven: {
      backgroundColor: 'white'
    },
    emptyRow: {
      textAlign: 'center' as const,
      padding: '32px 14px',
      color: '#9ca3af',
      fontSize: '14px'
    },
    loadingContainer: {
      textAlign: 'center' as const,
      padding: '32px',
      color: '#6b7280',
      fontSize: '16px'
    },
    badge: {
      padding: '4px 8px',
      borderRadius: '4px',
      fontWeight: 500,
      display: 'inline-block'
    },
    idBadge: {
      backgroundColor: '#dbeafe',
      color: '#1e40af'
    },
    dateBadge: {
      backgroundColor: '#fef3c7',
      color: '#92400e'
    }
  };

  return (
    <div style={tableStyles.container}>
      <div style={tableStyles.header}>
        <div style={tableStyles.headerText}>
          <h2 style={tableStyles.title}>🎂 Employee Birthdays</h2>
          <p style={tableStyles.subtitle}>{currentMonth} — Celebrate your team members!</p>
        </div>

        <div style={tableStyles.buttonGroup}>
          <button 
            onClick={handleDownloadPdf} 
            style={{ ...tableStyles.button, ...tableStyles.buttonPdf }}
            onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.4)')}
            onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
          >
            📥 Download PDF
          </button>
          <button 
            onClick={handlePrint} 
            style={{ ...tableStyles.button, ...tableStyles.buttonPrint }}
            onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.4)')}
            onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
          >
            🖨️ Print List
          </button>
        </div>
      </div>

      <div style={tableStyles.tableWrapper}>
        {loading ? (
          <div style={tableStyles.loadingContainer}>⏳ Loading birthdays...</div>
        ) : (
          <table style={tableStyles.table} ref={printableRef}>
            <thead style={tableStyles.thead}>
              <tr>
                <th style={tableStyles.th}>Employee ID</th>
                <th style={tableStyles.th}>Employee Name</th>
                <th style={tableStyles.th}>Email</th>
                <th style={tableStyles.th}>Date of Birth</th>
              </tr>
            </thead>
            <tbody style={tableStyles.tbody}>
              {data.length === 0 && (
                <tr style={tableStyles.trOdd}>
                  <td colSpan={4} style={tableStyles.emptyRow}>
                    🎉 No employees with birthdays this month
                  </td>
                </tr>
              )}
              {data.map((r, idx) => (
                <tr key={idx} style={idx % 2 === 0 ? tableStyles.trOdd : tableStyles.trEven}>
                  <td style={tableStyles.td}>
                    <span style={{ ...tableStyles.badge, ...tableStyles.idBadge }}>#{r.id}</span>
                  </td>
                  <td style={{ ...tableStyles.td, fontWeight: 500, color: '#1f2937' }}>{r.fullName}</td>
                  <td style={{ ...tableStyles.td, color: '#6b7280' }}>{r.email}</td>
                  <td style={tableStyles.td}>
                    <span style={{ ...tableStyles.badge, ...tableStyles.dateBadge }}>
                      🎂 {r.dobDisplay}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
