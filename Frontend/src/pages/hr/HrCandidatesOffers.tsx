/**
 * HR Candidates & Offers - Manage candidate pipeline and offer status
 */

import React from 'react';
import { FiEdit2, FiEye, FiMail, FiMoreHorizontal } from 'react-icons/fi';

export const HrCandidatesOffers = () => {
  console.log('HR Candidates & Offers rendering...');

  // Mock candidates data - TODO: Replace with API data
  const candidates = [
    {
      id: 1,
      name: 'John Smith',
      email: 'john.smith@email.com',
      position: 'Software Engineer',
      department: 'Engineering',
      offerStatus: 'Sent',
      salary: '$85,000',
      startDate: '2024-01-15',
      recruiter: 'Sarah Johnson',
      lastActivity: '2 hours ago'
    },
    {
      id: 2,
      name: 'Emily Davis',
      email: 'emily.davis@email.com',
      position: 'Product Manager',
      department: 'Product',
      offerStatus: 'Accepted',
      salary: '$95,000',
      startDate: '2024-01-22',
      recruiter: 'Mike Wilson',
      lastActivity: '1 day ago'
    },
    {
      id: 3,
      name: 'Michael Brown',
      email: 'michael.brown@email.com',
      position: 'UX Designer',
      department: 'Design',
      offerStatus: 'Negotiating',
      salary: '$75,000',
      startDate: '2024-02-01',
      recruiter: 'Lisa Chen',
      lastActivity: '3 hours ago'
    },
    {
      id: 4,
      name: 'Sarah Wilson',
      email: 'sarah.wilson@email.com',
      position: 'Data Analyst',
      department: 'Analytics',
      offerStatus: 'Draft',
      salary: '$70,000',
      startDate: '2024-01-29',
      recruiter: 'David Lee',
      lastActivity: '5 hours ago'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Accepted': return '#10b981';
      case 'Sent': return '#2563eb';
      case 'Negotiating': return '#f59e0b';
      case 'Draft': return '#6b7280';
      case 'Rejected': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusBadge = (status: string) => {
    const color = getStatusColor(status);
    return (
      <span style={{
        backgroundColor: `${color}20`,
        color: color,
        padding: '4px 12px',
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: '600',
        textTransform: 'uppercase'
      }}>
        {status}
      </span>
    );
  };

  // TODO: Add filters for status, department, recruiter
  // TODO: Add search functionality
  // TODO: Add bulk actions

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
          Candidates & Offers
        </h1>
        <p style={{ 
          color: '#6b7280', 
          fontSize: '16px'
        }}>
          Manage candidate pipeline and track offer status
        </p>
      </div>

      {/* Action Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        padding: '16px',
        backgroundColor: '#f8f9fa',
        borderRadius: '12px',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <select style={{
            padding: '8px 12px',
            borderRadius: '8px',
            border: '1px solid #d1d5db',
            fontSize: '14px',
            color: '#374151'
          }}>
            <option value="">All Status</option>
            <option value="sent">Sent</option>
            <option value="accepted">Accepted</option>
            <option value="negotiating">Negotiating</option>
            <option value="draft">Draft</option>
          </select>
          
          <select style={{
            padding: '8px 12px',
            borderRadius: '8px',
            border: '1px solid #d1d5db',
            fontSize: '14px',
            color: '#374151'
          }}>
            <option value="">All Departments</option>
            <option value="engineering">Engineering</option>
            <option value="product">Product</option>
            <option value="design">Design</option>
            <option value="analytics">Analytics</option>
          </select>
        </div>

        <button style={{
          backgroundColor: '#2563eb',
          color: 'white',
          padding: '10px 20px',
          border: 'none',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '600',
          cursor: 'pointer'
        }}>
          + New Candidate
        </button>
      </div>

      {/* Candidates Table */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        overflow: 'hidden'
      }}>
        {/* Table Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr 1fr 100px',
          gap: '16px',
          padding: '16px',
          backgroundColor: '#f8f9fa',
          borderBottom: '1px solid #e2e8f0',
          fontSize: '14px',
          fontWeight: '600',
          color: '#374151'
        }}>
          <div>Candidate</div>
          <div>Position</div>
          <div>Department</div>
          <div>Status</div>
          <div>Salary</div>
          <div>Start Date</div>
          <div>Actions</div>
        </div>

        {/* Table Body */}
        {candidates.map((candidate) => (
          <div key={candidate.id} style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr 1fr 100px',
            gap: '16px',
            padding: '16px',
            borderBottom: '1px solid #e2e8f0',
            alignItems: 'center',
            transition: 'background-color 0.2s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#f9fafb';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = 'white';
          }}>
            {/* Candidate Info */}
            <div>
              <div style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: '4px'
              }}>
                {candidate.name}
              </div>
              <div style={{
                fontSize: '14px',
                color: '#6b7280'
              }}>
                {candidate.email}
              </div>
            </div>

            {/* Position */}
            <div style={{
              fontSize: '14px',
              color: '#374151',
              fontWeight: '500'
            }}>
              {candidate.position}
            </div>

            {/* Department */}
            <div style={{
              fontSize: '14px',
              color: '#6b7280'
            }}>
              {candidate.department}
            </div>

            {/* Status */}
            <div>
              {getStatusBadge(candidate.offerStatus)}
            </div>

            {/* Salary */}
            <div style={{
              fontSize: '14px',
              color: '#374151',
              fontWeight: '600'
            }}>
              {candidate.salary}
            </div>

            {/* Start Date */}
            <div style={{
              fontSize: '14px',
              color: '#6b7280'
            }}>
              {candidate.startDate}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button style={{
                padding: '6px',
                border: 'none',
                borderRadius: '6px',
                backgroundColor: '#f3f4f6',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="View Details">
                <FiEye style={{ width: '16px', height: '16px', color: '#6b7280' }} />
              </button>
              
              <button style={{
                padding: '6px',
                border: 'none',
                borderRadius: '6px',
                backgroundColor: '#f3f4f6',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Edit">
                <FiEdit2 style={{ width: '16px', height: '16px', color: '#6b7280' }} />
              </button>
              
              <button style={{
                padding: '6px',
                border: 'none',
                borderRadius: '6px',
                backgroundColor: '#f3f4f6',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Resend Offer">
                <FiMail style={{ width: '16px', height: '16px', color: '#6b7280' }} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination - TODO: Implement actual pagination */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '24px',
        padding: '16px',
        backgroundColor: '#f8f9fa',
        borderRadius: '12px'
      }}>
        <div style={{ fontSize: '14px', color: '#6b7280' }}>
          Showing 4 of 24 candidates
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button style={{
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            backgroundColor: 'white',
            cursor: 'pointer',
            fontSize: '14px'
          }}>
            Previous
          </button>
          <button style={{
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            backgroundColor: 'white',
            cursor: 'pointer',
            fontSize: '14px'
          }}>
            Next
          </button>
        </div>
      </div>

      {/* TODO: Add candidate profile modal */}
      {/* TODO: Add offer letter templates */}
      {/* TODO: Add email integration */}
      {/* TODO: Add export functionality */}
    </div>
  );
};