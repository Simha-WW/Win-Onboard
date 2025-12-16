/**
 * HR Reports & Exports - Generate and manage HR reports and data exports
 */

import React, { useState } from 'react';
import { 
  FiDownload, 
  FiCalendar, 
  FiBarChart2, 
  FiPieChart, 
  FiTrendingUp,
  FiUsers,
  FiClock,
  FiFileText,
  FiFilter,
  FiPlay
} from 'react-icons/fi';

export const HrReportsExports = () => {
  console.log('HR Reports & Exports rendering...');
  
  const [selectedReport, setSelectedReport] = useState<string>('');
  const [dateRange, setDateRange] = useState({ start: '2024-01-01', end: '2024-01-31' });

  // Mock reports data - TODO: Replace with API data
  const reportTypes = [
    {
      id: 'onboarding-summary',
      title: 'Onboarding Summary',
      description: 'Complete overview of onboarding metrics and progress',
      category: 'Onboarding',
      icon: <FiUsers />,
      fields: ['Candidate Count', 'Completion Rate', 'Average Time', 'Status Breakdown'],
      formats: ['PDF', 'Excel', 'CSV'],
      lastGenerated: '2024-01-20'
    },
    {
      id: 'candidate-pipeline',
      title: 'Candidate Pipeline',
      description: 'Track candidate progression through hiring stages',
      category: 'Recruitment',
      icon: <FiTrendingUp />,
      fields: ['Pipeline Stages', 'Conversion Rates', 'Time to Hire', 'Source Analysis'],
      formats: ['PDF', 'Excel', 'CSV'],
      lastGenerated: '2024-01-19'
    },
    {
      id: 'document-compliance',
      title: 'Document Compliance',
      description: 'Document verification status and compliance metrics',
      category: 'Compliance',
      icon: <FiFileText />,
      fields: ['Document Types', 'Verification Status', 'Missing Documents', 'BGV Status'],
      formats: ['PDF', 'Excel'],
      lastGenerated: '2024-01-18'
    },
    {
      id: 'time-analytics',
      title: 'Time & Attendance Analytics',
      description: 'Detailed time tracking and attendance patterns',
      category: 'Analytics',
      icon: <FiClock />,
      fields: ['Attendance Rates', 'Time Patterns', 'Leave Analysis', 'Overtime Tracking'],
      formats: ['Excel', 'CSV'],
      lastGenerated: '2024-01-17'
    },
    {
      id: 'performance-metrics',
      title: 'Performance Metrics',
      description: 'Employee performance data and trend analysis',
      category: 'Performance',
      icon: <FiBarChart2 />,
      fields: ['Performance Scores', 'Goal Achievement', 'Review Status', 'Trend Analysis'],
      formats: ['PDF', 'Excel'],
      lastGenerated: '2024-01-16'
    },
    {
      id: 'departmental-breakdown',
      title: 'Departmental Breakdown',
      description: 'Department-wise HR metrics and comparisons',
      category: 'Analytics',
      icon: <FiPieChart />,
      fields: ['Department Stats', 'Headcount', 'Turnover Rates', 'Cost Analysis'],
      formats: ['PDF', 'Excel', 'CSV'],
      lastGenerated: '2024-01-15'
    }
  ];

  // Mock recent exports - TODO: Replace with API data
  const recentExports = [
    {
      id: 1,
      reportType: 'Onboarding Summary',
      fileName: 'onboarding_summary_2024_01.pdf',
      generatedDate: '2024-01-20 14:30',
      size: '2.3 MB',
      status: 'completed',
      downloadUrl: '#'
    },
    {
      id: 2,
      reportType: 'Candidate Pipeline',
      fileName: 'candidate_pipeline_Q1_2024.xlsx',
      generatedDate: '2024-01-19 16:45',
      size: '1.8 MB',
      status: 'completed',
      downloadUrl: '#'
    },
    {
      id: 3,
      reportType: 'Document Compliance',
      fileName: 'document_compliance_Jan2024.pdf',
      generatedDate: '2024-01-18 10:15',
      size: '3.1 MB',
      status: 'completed',
      downloadUrl: '#'
    },
    {
      id: 4,
      reportType: 'Performance Metrics',
      fileName: 'performance_metrics_2024.xlsx',
      generatedDate: '2024-01-17 09:20',
      size: '2.7 MB',
      status: 'generating',
      downloadUrl: null
    }
  ];

  const categories = [...new Set(reportTypes.map(report => report.category))];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'generating': return '#f59e0b';
      case 'failed': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusBadge = (status: string) => {
    const color = getStatusColor(status);
    return (
      <span style={{
        backgroundColor: `${color}20`,
        color: color,
        padding: '4px 8px',
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: '600',
        textTransform: 'uppercase'
      }}>
        {status}
      </span>
    );
  };

  // TODO: Add scheduled reports
  // TODO: Add email delivery options
  // TODO: Add custom report builder

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
          Reports & Exports
        </h1>
        <p style={{ 
          color: '#6b7280', 
          fontSize: '16px'
        }}>
          Generate comprehensive reports and export HR data
        </p>
      </div>

      {/* Quick Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <FiBarChart2 style={{ width: '20px', height: '20px', color: '#2563eb' }} />
            <span style={{ fontSize: '14px', color: '#6b7280' }}>Total Reports</span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
            {reportTypes.length}
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <FiDownload style={{ width: '20px', height: '20px', color: '#10b981' }} />
            <span style={{ fontSize: '14px', color: '#6b7280' }}>This Month</span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
            {recentExports.length}
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <FiClock style={{ width: '20px', height: '20px', color: '#f59e0b' }} />
            <span style={{ fontSize: '14px', color: '#6b7280' }}>Generating</span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
            {recentExports.filter(e => e.status === 'generating').length}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
        {/* Report Generation Section */}
        <div>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '20px'
          }}>
            Generate New Report
          </h2>

          {/* Report Selection */}
          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            marginBottom: '24px'
          }}>
            <div style={{
              display: 'flex',
              gap: '16px',
              marginBottom: '16px',
              alignItems: 'center'
            }}>
              <div style={{ flex: 1 }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Select Report Type
                </label>
                <select
                  value={selectedReport}
                  onChange={(e) => setSelectedReport(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #d1d5db',
                    fontSize: '14px',
                    color: '#374151'
                  }}
                >
                  <option value="">Choose a report type...</option>
                  {reportTypes.map(report => (
                    <option key={report.id} value={report.id}>
                      {report.title} ({report.category})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid #d1d5db',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    End Date
                  </label>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid #d1d5db',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>
            </div>

            {selectedReport && (
              <div style={{
                backgroundColor: 'white',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
              }}>
                {(() => {
                  const report = reportTypes.find(r => r.id === selectedReport);
                  if (!report) return null;
                  
                  return (
                    <>
                      <div style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px',
                        marginBottom: '12px'
                      }}>
                        <div style={{ color: '#2563eb', marginTop: '2px' }}>
                          {report.icon}
                        </div>
                        <div style={{ flex: 1 }}>
                          <h4 style={{
                            fontSize: '16px',
                            fontWeight: '600',
                            color: '#1f2937',
                            margin: '0 0 4px 0'
                          }}>
                            {report.title}
                          </h4>
                          <p style={{
                            fontSize: '14px',
                            color: '#6b7280',
                            margin: '0 0 12px 0'
                          }}>
                            {report.description}
                          </p>

                          <div style={{ marginBottom: '12px' }}>
                            <span style={{
                              fontSize: '12px',
                              fontWeight: '600',
                              color: '#374151',
                              marginBottom: '4px',
                              display: 'block'
                            }}>
                              Included Fields:
                            </span>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                              {report.fields.map(field => (
                                <span key={field} style={{
                                  backgroundColor: '#e2e8f0',
                                  color: '#374151',
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  fontSize: '12px'
                                }}>
                                  {field}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}>
                            <div>
                              <span style={{
                                fontSize: '12px',
                                fontWeight: '600',
                                color: '#374151',
                                marginRight: '8px'
                              }}>
                                Available Formats:
                              </span>
                              {report.formats.map((format, index) => (
                                <span key={format} style={{
                                  fontSize: '12px',
                                  color: '#6b7280'
                                }}>
                                  {format}{index < report.formats.length - 1 ? ', ' : ''}
                                </span>
                              ))}
                            </div>

                            <button style={{
                              backgroundColor: '#2563eb',
                              color: 'white',
                              padding: '8px 16px',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '14px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}>
                              <FiPlay style={{ width: '14px', height: '14px' }} />
                              Generate Report
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}
          </div>

          {/* Available Report Types Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px'
          }}>
            {reportTypes.map((report) => {
              const isSelected = selectedReport === report.id;
              return (
                <div key={report.id} style={{
                  backgroundColor: isSelected ? '#f8faff' : 'white',
                  padding: '16px',
                  borderRadius: '8px',
                  border: `1px solid ${isSelected ? '#2563eb' : '#e2e8f0'}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: isSelected ? '0 0 0 3px rgba(37, 99, 235, 0.1)' : 'none'
                }}
                onClick={() => setSelectedReport(report.id)}
                onMouseOver={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = '#94a3b8';
                    e.currentTarget.style.backgroundColor = '#f8faff';
                  }
                }}
                onMouseOut={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.backgroundColor = 'white';
                  }
                }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '8px'
                }}>
                  <div style={{ color: '#2563eb' }}>{report.icon}</div>
                  <span style={{
                    backgroundColor: '#e2e8f0',
                    color: '#6b7280',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '10px',
                    fontWeight: '500'
                  }}>
                    {report.category}
                  </span>
                </div>

                <h4 style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#1f2937',
                  margin: '0 0 4px 0'
                }}>
                  {report.title}
                </h4>

                <p style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  margin: '0 0 8px 0',
                  lineHeight: '1.3'
                }}>
                  {report.description}
                </p>

                <div style={{
                  fontSize: '10px',
                  color: '#9ca3af'
                }}>
                  Last generated: {report.lastGenerated}
                </div>
              </div>
            );
            })}
          </div>
        </div>

        {/* Recent Exports Sidebar */}
        <div>
          <h2 style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '16px'
          }}>
            Recent Exports
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentExports.map((exportItem) => (
              <div key={exportItem.id} style={{
                backgroundColor: 'white',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '8px'
                }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#1f2937',
                      margin: '0 0 4px 0'
                    }}>
                      {exportItem.reportType}
                    </h4>
                    <p style={{
                      fontSize: '12px',
                      color: '#6b7280',
                      margin: '0',
                      wordBreak: 'break-all'
                    }}>
                      {exportItem.fileName}
                    </p>
                  </div>
                  {getStatusBadge(exportItem.status)}
                </div>

                <div style={{
                  fontSize: '11px',
                  color: '#9ca3af',
                  marginBottom: '12px'
                }}>
                  <div>Generated: {exportItem.generatedDate}</div>
                  <div>Size: {exportItem.size}</div>
                </div>

                {exportItem.status === 'completed' && (
                  <button style={{
                    width: '100%',
                    padding: '6px 12px',
                    backgroundColor: '#f3f4f6',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }}>
                    <FiDownload style={{ width: '12px', height: '12px' }} />
                    Download
                  </button>
                )}
                
                {exportItem.status === 'generating' && (
                  <div style={{
                    width: '100%',
                    padding: '6px',
                    backgroundColor: '#fef3c7',
                    borderRadius: '6px',
                    fontSize: '12px',
                    textAlign: 'center',
                    color: '#92400e'
                  }}>
                    Generating...
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TODO: Add scheduled reports */}
      {/* TODO: Add email delivery */}
      {/* TODO: Add custom report builder */}
      {/* TODO: Add data visualization options */}
    </div>
  );
};