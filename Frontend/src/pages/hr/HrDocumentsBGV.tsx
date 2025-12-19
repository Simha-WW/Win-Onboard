/**
 * HR Documents & Background Verification
 * View and verify submitted BGV forms from freshers
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiFileText,
  FiCheckCircle,
  FiClock,
  FiX,
  FiArrowRight,
  FiUser,
  FiCalendar,
  FiBriefcase,
  FiCpu
} from 'react-icons/fi';
import { API_BASE_URL } from '../../config';
import { hrApiService } from '../../services/hrApi';

interface BGVSubmission {
  submission_id: number;
  fresher_id: number;
  submission_status: string;
  submitted_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  first_name: string;
  last_name: string;
  email: string;
  designation: string;
  date_of_joining: string;
  verified_count: number;
  rejected_count: number;
  total_verifications: number;
}

export const HrDocumentsBGV = () => {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<BGVSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch(`${API_BASE_URL}/bgv/hr/submissions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch submissions');

      const data = await response.json();
      setSubmissions(data.data || []);
    } catch (error) {
      console.error('Error fetching BGV submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (submission: BGVSubmission) => {
    const total = submission.total_verifications;
    const verified = submission.verified_count;
    const rejected = submission.rejected_count;

    if (total === 0) {
      return {
        label: 'Pending Review',
        color: '#eab308',
        bgColor: '#fef9c3',
        icon: <FiClock />
      };
    }

    if (rejected > 0) {
      return {
        label: 'Rejected',
        color: '#ef4444',
        bgColor: '#fee2e2',
        icon: <FiX />
      };
    }

    if (verified === total) {
      return {
        label: 'Verified',
        color: '#10b981',
        bgColor: '#d1fae5',
        icon: <FiCheckCircle />
      };
    }

    return {
      label: 'In Progress',
      color: '#3b82f6',
      bgColor: '#dbeafe',
      icon: <FiClock />
    };
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredSubmissions = submissions.filter(sub => {
    if (filter === 'all') return true;
    
    const status = getStatusBadge(sub);
    return status.label.toLowerCase().replace(' ', '_') === filter;
  });

  const handleViewSubmission = (fresherId: number) => {
    navigate(`/hr/documents/${fresherId}`);
  };

  const handleSendToIT = async (fresherId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const confirmSend = window.confirm('Are you sure you want to send this candidate to IT team? This will initiate the IT onboarding process.');
    if (!confirmSend) return;

    try {
      await hrApiService.sendToIt(fresherId);
      alert('Successfully sent to IT team!');
      // Refresh the submissions list
      fetchSubmissions();
    } catch (error: any) {
      alert(error.message || 'Failed to send to IT team');
      console.error('Error sending to IT:', error);
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '400px'
      }}>
        <div>Loading submissions...</div>
      </div>
    );
  }

  return (
    <div style={{
      padding: '24px',
      maxWidth: '1400px',
      margin: '0 auto'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{
          fontSize: '28px',
          fontWeight: '700',
          color: '#1f2937',
          margin: '0 0 8px 0'
        }}>
          Documents & BGV
        </h1>
        <p style={{
          fontSize: '14px',
          color: '#6b7280',
          margin: 0
        }}>
          Review and verify background verification documents from candidates
        </p>
      </div>

      {/* Filter Tabs */}
      <div style={{
        display: 'flex',
        gap: '16px',
        marginBottom: '24px',
        borderBottom: '2px solid #e5e7eb',
        flexWrap: 'wrap'
      }}>
        {[
          { key: 'all', label: 'All Candidates' },
          { key: 'pending_review', label: 'Pending Review' },
          { key: 'in_progress', label: 'In Progress' },
          { key: 'verified', label: 'Verified' },
          { key: 'rejected', label: 'Rejected' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            style={{
              padding: '12px 24px',
              border: 'none',
              backgroundColor: 'transparent',
              color: filter === tab.key ? '#2563eb' : '#6b7280',
              fontWeight: filter === tab.key ? '600' : '500',
              cursor: 'pointer',
              borderBottom: filter === tab.key ? '2px solid #2563eb' : '2px solid transparent',
              marginBottom: '-2px',
              transition: 'all 0.2s'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Submissions List */}
      {filteredSubmissions.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '48px 24px',
          backgroundColor: '#f9fafb',
          borderRadius: '12px',
          border: '1px dashed #d1d5db'
        }}>
          <FiFileText style={{
            width: '48px',
            height: '48px',
            color: '#9ca3af',
            margin: '0 auto 16px'
          }} />
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#374151',
            margin: '0 0 8px 0'
          }}>
            No submissions found
          </h3>
          <p style={{
            fontSize: '14px',
            color: '#6b7280',
            margin: 0
          }}>
            {filter === 'all' 
              ? 'No candidates have submitted their BGV forms yet'
              : `No submissions with status: ${filter.replace('_', ' ')}`
            }
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
          gap: '24px'
        }}>
          {filteredSubmissions.map(submission => {
            const status = getStatusBadge(submission);
            
            return (
              <div
                key={submission.submission_id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  padding: '24px',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                  border: '1px solid #e5e7eb',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
                onClick={() => handleViewSubmission(submission.fresher_id)}
              >
                {/* Header with Status */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '16px'
                }}>
                  <div>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#1f2937',
                      margin: '0 0 4px 0'
                    }}>
                      {submission.first_name} {submission.last_name}
                    </h3>
                    <p style={{
                      fontSize: '14px',
                      color: '#6b7280',
                      margin: 0
                    }}>
                      {submission.designation}
                    </p>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: status.bgColor,
                    color: status.color,
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    {status.icon}
                    {status.label}
                  </div>
                </div>

                {/* Info Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                  marginBottom: '16px',
                  paddingBottom: '16px',
                  borderBottom: '1px solid #e5e7eb'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FiBriefcase style={{ color: '#6b7280', width: '14px', height: '14px' }} />
                    <div>
                      <div style={{ fontSize: '11px', color: '#9ca3af' }}>Provider</div>
                      <div style={{ fontSize: '13px', color: '#374151', fontWeight: '500' }}>
                        SecureCheck Inc.
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FiCalendar style={{ color: '#6b7280', width: '14px', height: '14px' }} />
                    <div>
                      <div style={{ fontSize: '11px', color: '#9ca3af' }}>Initiated</div>
                      <div style={{ fontSize: '13px', color: '#374151', fontWeight: '500' }}>
                        {formatDate(submission.submitted_at)}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FiUser style={{ color: '#6b7280', width: '14px', height: '14px' }} />
                    <div>
                      <div style={{ fontSize: '11px', color: '#9ca3af' }}>Email</div>
                      <div style={{
                        fontSize: '12px',
                        color: '#374151',
                        fontWeight: '500',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {submission.email}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FiCalendar style={{ color: '#6b7280', width: '14px', height: '14px' }} />
                    <div>
                      <div style={{ fontSize: '11px', color: '#9ca3af' }}>Expected</div>
                      <div style={{ fontSize: '13px', color: '#374151', fontWeight: '500' }}>
                        {formatDate(new Date(new Date(submission.submitted_at).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString())}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Documents Progress */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '8px'
                  }}>
                    <span style={{ fontSize: '13px', color: '#6b7280' }}>
                      Documents Verified
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>
                      {submission.verified_count} / {submission.total_verifications || 'Pending'}
                    </span>
                  </div>
                  
                  {submission.total_verifications > 0 && (
                    <div style={{
                      height: '6px',
                      backgroundColor: '#e5e7eb',
                      borderRadius: '3px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${(submission.verified_count / submission.total_verifications) * 100}%`,
                        backgroundColor: submission.rejected_count > 0 ? '#ef4444' : '#10b981',
                        transition: 'width 0.3s'
                      }} />
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    style={{
                      flex: 1,
                      padding: '10px',
                      backgroundColor: '#2563eb',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewSubmission(submission.fresher_id);
                    }}
                  >
                    View Documents
                    <FiArrowRight />
                  </button>

                  {/* Send to IT button - only show if all documents verified */}
                  {submission.verified_count === submission.total_verifications && 
                   submission.total_verifications > 0 && 
                   submission.rejected_count === 0 && (
                    <button
                      style={{
                        flex: 1,
                        padding: '10px',
                        backgroundColor: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#059669'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
                      onClick={(e) => handleSendToIT(submission.fresher_id, e)}
                      title="Send to IT for equipment and account setup"
                    >
                      Send to IT
                      <FiCpu />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
