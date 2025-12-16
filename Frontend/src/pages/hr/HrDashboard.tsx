/**
 * HR Dashboard - Main dashboard with KPIs and pipeline overview
 */

import React from 'react';
import { FiUsers, FiClock, FiCheckCircle, FiTrendingUp, FiArrowRight } from 'react-icons/fi';

export const HrDashboard = () => {
  console.log('HR Dashboard rendering...');

  // Mock KPI data - TODO: Replace with API data
  const kpis = [
    { id: 1, title: 'Active Candidates', value: '24', change: '+12%', icon: FiUsers, color: '#2563eb' },
    { id: 2, title: 'Pending Offers', value: '8', change: '+3%', icon: FiClock, color: '#f59e0b' },
    { id: 3, title: 'Completed Onboarding', value: '156', change: '+18%', icon: FiCheckCircle, color: '#10b981' },
    { id: 4, title: 'Time to Hire (avg)', value: '12d', change: '-2d', icon: FiTrendingUp, color: '#8b5cf6' }
  ];

  // Mock pipeline data - TODO: Replace with API data
  const pipelineStages = [
    { name: 'Offer Sent', count: 8, percentage: 100 },
    { name: 'Pre-Join Tasks', count: 6, percentage: 75 },
    { name: 'BGV Complete', count: 4, percentage: 50 },
    { name: 'Day-1 Ready', count: 3, percentage: 37.5 }
  ];

  // Mock recent activity - TODO: Replace with API data
  const recentActivity = [
    { id: 1, candidate: 'John Smith', action: 'Completed pre-join tasks', time: '2 hours ago', status: 'completed' },
    { id: 2, candidate: 'Sarah Wilson', action: 'Offer sent', time: '4 hours ago', status: 'pending' },
    { id: 3, candidate: 'Mike Johnson', action: 'BGV verification completed', time: '1 day ago', status: 'completed' },
    { id: 4, candidate: 'Emily Brown', action: 'Started onboarding', time: '2 days ago', status: 'in-progress' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'in-progress': return '#f59e0b';
      case 'pending': return '#6b7280';
      default: return '#6b7280';
    }
  };

  return (
    <div style={{ padding: '20px', backgroundColor: 'white', minHeight: '500px' }}>
      {/* Dashboard Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ 
          color: '#1f2937', 
          fontSize: '32px', 
          fontWeight: 'bold',
          marginBottom: '8px'
        }}>
          HR Dashboard
        </h1>
        <p style={{ 
          color: '#6b7280', 
          fontSize: '16px'
        }}>
          Monitor candidate pipeline and onboarding metrics
        </p>
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
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {kpis.map((kpi) => {
            const IconComponent = kpi.icon;
            return (
              <div key={kpi.id} style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '24px',
                border: '1px solid #e2e8f0',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    backgroundColor: `${kpi.color}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <IconComponent style={{ width: '24px', height: '24px', color: kpi.color }} />
                  </div>
                  <span style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: kpi.change.startsWith('+') ? '#10b981' : '#ef4444'
                  }}>
                    {kpi.change}
                  </span>
                </div>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>
                  {kpi.value}
                </div>
                <div style={{ fontSize: '16px', color: '#6b7280', fontWeight: '500' }}>
                  {kpi.title}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pipeline Overview */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ 
          color: '#1e293b', 
          fontSize: '24px', 
          fontWeight: '700',
          marginBottom: '20px'
        }}>
          Pipeline Overview
        </h2>
        
        <div style={{
          backgroundColor: '#f1f5f9',
          borderRadius: '12px',
          padding: '24px',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            {pipelineStages.map((stage, index) => (
              <React.Fragment key={stage.name}>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  minWidth: '120px'
                }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    backgroundColor: 'white',
                    border: '3px solid #2563eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '12px',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: '#2563eb'
                  }}>
                    {stage.count}
                  </div>
                  <span style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#1f2937',
                    textAlign: 'center'
                  }}>
                    {stage.name}
                  </span>
                  <span style={{
                    fontSize: '12px',
                    color: '#6b7280',
                    marginTop: '4px'
                  }}>
                    {stage.percentage}%
                  </span>
                </div>
                {index < pipelineStages.length - 1 && (
                  <FiArrowRight style={{ color: '#6b7280', width: '20px', height: '20px' }} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 style={{ 
          color: '#1e293b', 
          fontSize: '24px', 
          fontWeight: '700',
          marginBottom: '20px'
        }}>
          Recent Activity
        </h2>
        
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          border: '1px solid #e2e8f0'
        }}>
          {recentActivity.map((activity, index) => (
            <div key={activity.id} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '20px',
              borderBottom: index < recentActivity.length - 1 ? '1px solid #e2e8f0' : 'none'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: getStatusColor(activity.status)
                }} />
                <div>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>
                    {activity.candidate}
                  </div>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>
                    {activity.action}
                  </div>
                </div>
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>
                {activity.time}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* TODO: Add backend integration for real-time data */}
      {/* TODO: Add click handlers for KPI cards to navigate to detailed views */}
      {/* TODO: Add filters and date range selectors */}
    </div>
  );
};