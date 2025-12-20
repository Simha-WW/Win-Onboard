/**
 * HR Dashboard - Main dashboard with KPIs and pipeline overview
 */

import React, { useState, useEffect, useRef } from 'react';
import { FiUsers, FiCheckCircle, FiClock, FiXCircle } from 'react-icons/fi';
import { API_BASE_URL } from '../../config';

interface KPIData {
  new_joinees: number;
  onboarded: number;
  yet_to_join: number;
  rejected: number;
}

interface DetailRecord {
  id: number;
  candidate_name: string;
  email: string;
  position: string;
  joining_date: string;
  department: string;
}

export const HrDashboard = () => {
  const [kpiData, setKpiData] = useState<KPIData>({
    new_joinees: 0,
    onboarded: 0,
    yet_to_join: 0,
    rejected: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedKPI, setSelectedKPI] = useState<string | null>(null);
  const [detailRecords, setDetailRecords] = useState<DetailRecord[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const detailsRef = useRef<HTMLDivElement>(null);
  
  // Get current date info
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1; // 0-indexed, so add 1
  
  // Calculate current week number within the month (1-5)
  const getWeekNumber = (date: Date): number => {
    const dayOfMonth = date.getDate();
    return Math.ceil(dayOfMonth / 7);
  };
  const currentWeek = getWeekNumber(currentDate);
  
  const [yearFilter, setYearFilter] = useState<string>(currentYear.toString());
  const [monthFilter, setMonthFilter] = useState<string>(currentMonth.toString());
  const [weekFilter, setWeekFilter] = useState<string>(currentWeek.toString());
  
  useEffect(() => {
    fetchKPIData();
  }, [yearFilter, monthFilter, weekFilter]);
  
  const fetchKPIData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      
      // Build query string with filters
      const params = new URLSearchParams();
      if (yearFilter) params.append('year', yearFilter);
      if (monthFilter) params.append('month', monthFilter);
      if (weekFilter) params.append('week', weekFilter);
      
      const response = await fetch(`${API_BASE_URL}/hr/kpis?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch KPI data');
      }
      
      const data = await response.json();
      setKpiData(data.data);
    } catch (error) {
      console.error('Error fetching KPI data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchKPIDetails = async (kpiType: string) => {
    try {
      setLoadingDetails(true);
      const token = localStorage.getItem('auth_token');
      
      // Build query string with filters
      const params = new URLSearchParams();
      params.append('type', kpiType);
      if (yearFilter) params.append('year', yearFilter);
      if (monthFilter) params.append('month', monthFilter);
      if (weekFilter) params.append('week', weekFilter);
      
      const response = await fetch(`${API_BASE_URL}/hr/kpi-details?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch KPI details');
      }
      
      const data = await response.json();
      setDetailRecords(data.data);
      setSelectedKPI(kpiType);
      
      // Scroll to details table after a short delay to ensure rendering
      setTimeout(() => {
        detailsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (error) {
      console.error('Error fetching KPI details:', error);
    } finally {
      setLoadingDetails(false);
    }
  };
  
  const handleKPIClick = (kpiType: string) => {
    if (kpiType === 'rejected') return; // Skip for rejected as it's placeholder
    if (selectedKPI === kpiType) {
      // Toggle off if clicking same KPI
      setSelectedKPI(null);
      setDetailRecords([]);
    } else {
      fetchKPIDetails(kpiType);
    }
  };
  
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) {
      return 'Apr 17, 2007';
    }
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  // Generate year options (2020-2030)
  const yearOptions = Array.from({ length: 11 }, (_, i) => 2020 + i);
  
  // Month options
  const monthOptions = [
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ];
  
  // Week options (1-5 for weeks within a month)
  const weekOptions = Array.from({ length: 5 }, (_, i) => i + 1);
  
  const kpis = [
    { 
      id: 1, 
      title: 'New Joinees', 
      value: kpiData.new_joinees.toString(), 
      icon: FiUsers, 
      color: '#6366f1',
      bgColor: '#eef2ff',
      lightBg: '#f5f7ff',
      type: 'new_joinees'
    },
    { 
      id: 2, 
      title: 'Onboarded', 
      value: kpiData.onboarded.toString(), 
      icon: FiCheckCircle, 
      color: '#10b981',
      bgColor: '#d1fae5',
      lightBg: '#f0fdf4',
      type: 'onboarded'
    },
    { 
      id: 3, 
      title: 'Yet to Join', 
      value: kpiData.yet_to_join.toString(), 
      icon: FiClock, 
      color: '#f59e0b',
      bgColor: '#fef3c7',
      lightBg: '#fffbeb',
      type: 'yet_to_join'
    },
    { 
      id: 4, 
      title: 'Rejected', 
      value: kpiData.rejected.toString(), 
      icon: FiXCircle, 
      color: '#9ca3af',
      bgColor: '#f3f4f6',
      lightBg: '#f9fafb',
      type: 'rejected'
    }
  ];

  return (
    <div style={{ padding: '20px', backgroundColor: 'white', minHeight: '500px' }}>
      {/* Dashboard Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ 
          color: '#1f2937', 
          fontSize: '32px', 
          fontWeight: 'bold'
        }}>
          HR Dashboard
        </h1>
      </div>

      {/* Filters */}
      <div style={{
        marginBottom: '20px',
        padding: '12px 16px',
        backgroundColor: '#f9fafb',
        borderRadius: '8px',
        border: '1px solid #e5e7eb'
      }}>
        <h3 style={{ 
          color: '#374151', 
          fontSize: '14px', 
          fontWeight: '600',
          marginBottom: '10px'
        }}>
          Filters
        </h3>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          {/* Year Filter */}
          <div style={{ flex: '1', minWidth: '150px' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: '500', 
              color: '#374151',
              marginBottom: '8px'
            }}>
              Year
            </label>
            <select 
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                fontSize: '14px',
                color: '#374151',
                backgroundColor: 'white',
                cursor: 'pointer'
              }}
            >
              <option value="">All Years</option>
              {yearOptions.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          
          {/* Month Filter */}
          <div style={{ flex: '1', minWidth: '150px' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: '500', 
              color: '#374151',
              marginBottom: '8px'
            }}>
              Month
            </label>
            <select 
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                fontSize: '14px',
                color: '#374151',
                backgroundColor: 'white',
                cursor: 'pointer'
              }}
            >
              <option value="">All Months</option>
              {monthOptions.map(month => (
                <option key={month.value} value={month.value}>{month.label}</option>
              ))}
            </select>
          </div>
          
          {/* Week Filter */}
          <div style={{ flex: '1', minWidth: '150px' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: '500', 
              color: '#374151',
              marginBottom: '8px'
            }}>
              Week
            </label>
            <select 
              value={weekFilter}
              onChange={(e) => setWeekFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                fontSize: '14px',
                color: '#374151',
                backgroundColor: 'white',
                cursor: 'pointer'
              }}
            >
              <option value="">All Weeks</option>
              {weekOptions.map(week => (
                <option key={week} value={week}>Week {week}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ 
          color: '#1e293b', 
          fontSize: '24px', 
          fontWeight: '700',
          marginBottom: '20px'
        }}>
          Key Metrics
        </h2>
        
        {loading ? (
          <div style={{ 
            padding: '48px', 
            textAlign: 'center', 
            color: '#6b7280',
            fontSize: '14px'
          }}>
            Loading metrics...
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 200px))', gap: '20px' }}>
            {kpis.map((kpi) => {
              const IconComponent = kpi.icon;
              const isSelected = selectedKPI === kpi.type;
              return (
                <div 
                  key={kpi.id} 
                  onClick={() => handleKPIClick(kpi.type)}
                  style={{
                    backgroundColor: kpi.lightBg,
                    borderRadius: '12px',
                    padding: '20px',
                    border: `1px solid ${kpi.color}20`,
                    boxShadow: isSelected ? `0 0 0 2px ${kpi.color}, 0 4px 12px rgba(0, 0, 0, 0.1)` : '0 2px 8px rgba(0, 0, 0, 0.08)',
                    transition: 'all 0.2s ease',
                    cursor: kpi.type === 'rejected' ? 'default' : 'pointer',
                    opacity: kpi.type === 'rejected' ? 0.7 : 1,
                    position: 'relative'
                  }}
                  onMouseOver={(e) => {
                    if (kpi.type !== 'rejected') {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = isSelected ? `0 0 0 2px ${kpi.color}, 0 8px 20px rgba(0, 0, 0, 0.12)` : '0 8px 20px rgba(0, 0, 0, 0.12)';
                    }
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = isSelected ? `0 0 0 2px ${kpi.color}, 0 4px 12px rgba(0, 0, 0, 0.1)` : '0 2px 8px rgba(0, 0, 0, 0.08)';
                  }}
                >
                  <div style={{ 
                    position: 'absolute', 
                    top: '18px', 
                    right: '18px',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255, 255, 255, 0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <IconComponent style={{ width: '20px', height: '20px', color: kpi.color }} />
                  </div>
                  <div style={{ 
                    fontSize: '11px', 
                    color: '#6b7280', 
                    fontWeight: '600', 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.5px',
                    marginBottom: '10px'
                  }}>
                    {kpi.title}
                  </div>
                  <div style={{ 
                    fontSize: '36px', 
                    fontWeight: '700', 
                    color: kpi.color, 
                    lineHeight: '1',
                    marginBottom: '4px'
                  }}>
                    {kpi.value}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* KPI Details Table */}
      {selectedKPI && (
        <div ref={detailsRef} style={{ marginTop: '32px' }}>
          <h2 style={{ 
            color: '#1e293b', 
            fontSize: '24px', 
            fontWeight: '700',
            marginBottom: '20px'
          }}>
            {selectedKPI === 'new_joinees' && 'New Joinees Details'}
            {selectedKPI === 'onboarded' && 'Onboarded Employees Details'}
            {selectedKPI === 'yet_to_join' && 'Yet to Join Details'}
          </h2>
          
          {loadingDetails ? (
            <div style={{ 
              padding: '48px', 
              textAlign: 'center', 
              color: '#6b7280',
              fontSize: '14px',
              border: '1px solid #e5e7eb',
              borderRadius: '12px'
            }}>
              Loading details...
            </div>
          ) : (
            <div style={{
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              overflow: 'hidden',
              backgroundColor: 'white'
            }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse'
              }}>
                <thead>
                  <tr style={{ backgroundColor: '#f9fafb' }}>
                    <th style={{
                      padding: '12px 24px',
                      textAlign: 'left',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#374151',
                      borderBottom: '1px solid #e5e7eb'
                    }}>
                      Candidate
                    </th>
                    <th style={{
                      padding: '12px 24px',
                      textAlign: 'left',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#374151',
                      borderBottom: '1px solid #e5e7eb'
                    }}>
                      Email
                    </th>
                    <th style={{
                      padding: '12px 24px',
                      textAlign: 'left',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#374151',
                      borderBottom: '1px solid #e5e7eb'
                    }}>
                      Position
                    </th>
                    <th style={{
                      padding: '12px 24px',
                      textAlign: 'left',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#374151',
                      borderBottom: '1px solid #e5e7eb'
                    }}>
                      Department
                    </th>
                    <th style={{
                      padding: '12px 24px',
                      textAlign: 'left',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#374151',
                      borderBottom: '1px solid #e5e7eb'
                    }}>
                      Joining Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {detailRecords.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{
                        padding: '48px 24px',
                        textAlign: 'center',
                        color: '#6b7280',
                        fontSize: '14px'
                      }}>
                        No records found for this filter.
                      </td>
                    </tr>
                  ) : (
                    detailRecords.map((record, index) => (
                      <tr
                        key={record.id}
                        style={{
                          backgroundColor: index % 2 === 0 ? 'white' : '#f9fafb',
                          transition: 'background-color 0.1s'
                        }}
                      >
                        <td style={{
                          padding: '12px 24px',
                          fontSize: '14px',
                          color: '#374151',
                          borderBottom: '1px solid #e5e7eb',
                          fontWeight: '500'
                        }}>
                          {record.candidate_name}
                        </td>
                        <td style={{
                          padding: '12px 24px',
                          fontSize: '14px',
                          color: '#6b7280',
                          borderBottom: '1px solid #e5e7eb'
                        }}>
                          {record.email}
                        </td>
                        <td style={{
                          padding: '12px 24px',
                          fontSize: '14px',
                          color: '#374151',
                          borderBottom: '1px solid #e5e7eb'
                        }}>
                          {record.position || 'Not specified'}
                        </td>
                        <td style={{
                          padding: '12px 24px',
                          fontSize: '14px',
                          color: '#374151',
                          borderBottom: '1px solid #e5e7eb'
                        }}>
                          {record.department || 'Not specified'}
                        </td>
                        <td style={{
                          padding: '12px 24px',
                          fontSize: '14px',
                          color: '#374151',
                          borderBottom: '1px solid #e5e7eb',
                          fontWeight: '500'
                        }}>
                          {formatDate(record.joining_date)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
