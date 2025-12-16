/**
 * Clean NewHire Home Page
 */

import React from 'react';
import { FiCheckCircle, FiClock, FiUsers, FiCalendar } from 'react-icons/fi';

export const NewHireHome = () => {
  console.log('NewHireHome rendering...');
  
  // Calculate progress percentage
  const tasksCompleted = 6;
  const totalTasks = 8;
  const progressPercentage = (tasksCompleted / totalTasks) * 100;
  
  return (
    <div style={{ padding: '20px', backgroundColor: 'white', minHeight: '500px' }}>
      {/* Welcome Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ 
          color: '#1f2937', 
          fontSize: '32px', 
          fontWeight: 'bold',
          marginBottom: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          🎉 Welcome to WinOnboard!
        </h1>
        <p style={{ 
          color: '#1f2937', 
          fontSize: '18px', 
          marginBottom: '8px',
          fontWeight: '500'
        }}>
          Hello Bunny, we're excited to have you join our team!
        </p>
        <p style={{ 
          color: '#6b7280', 
          fontSize: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <FiCalendar style={{ width: '16px', height: '16px' }} />
          Start Date: December 23, 2024
        </p>
      </div>
      
      {/* Progress Section */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ 
          color: '#1e293b', 
          fontSize: '24px', 
          fontWeight: '700',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          📊 Your Progress
        </h2>
        
        {/* Progress Bar */}
        <div style={{
          backgroundColor: '#f1f5f9',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '20px',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
              Onboarding Progress
            </span>
            <span style={{ fontSize: '16px', fontWeight: '700', color: '#10b981' }}>
              {progressPercentage.toFixed(0)}%
            </span>
          </div>
          
          <div style={{
            width: '100%',
            height: '12px',
            backgroundColor: '#e2e8f0',
            borderRadius: '6px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${progressPercentage}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
              borderRadius: '6px',
              transition: 'width 0.3s ease'
            }} />
          </div>
          
          <div style={{ marginTop: '12px', fontSize: '14px', color: '#6b7280' }}>
            {tasksCompleted} of {totalTasks} tasks completed
          </div>
        </div>
        
        {/* Progress Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
          {/* Tasks Completed Card */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
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
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FiCheckCircle style={{ width: '24px', height: '24px', color: 'white' }} />
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', marginBottom: '4px' }}>
                {tasksCompleted}
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>
                Tasks Completed
              </div>
            </div>
          </div>
          
          {/* Pending Tasks Card */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
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
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FiClock style={{ width: '24px', height: '24px', color: 'white' }} />
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', marginBottom: '4px' }}>
                {totalTasks - tasksCompleted}
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>
                Pending Tasks
              </div>
            </div>
          </div>
          
          {/* Team Members Card */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
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
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FiUsers style={{ width: '24px', height: '24px', color: 'white' }} />
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', marginBottom: '4px' }}>
                24
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>
                Team Members
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Section */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ 
          color: '#1e293b', 
          fontSize: '24px', 
          fontWeight: '700',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          ⚡ Quick Actions
        </h2>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <button style={{ 
            backgroundColor: '#2563eb', 
            color: 'white', 
            padding: '12px 24px', 
            border: 'none', 
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#1d4ed8';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(37, 99, 235, 0.3)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '#2563eb';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}>
            📋 View Checklist
          </button>
          
          <button style={{ 
            backgroundColor: '#10b981', 
            color: 'white', 
            padding: '12px 24px', 
            border: 'none', 
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#059669';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(16, 185, 129, 0.3)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '#10b981';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}>
            📁 Download Documents
          </button>
        </div>
      </div>
    </div>
  );
};