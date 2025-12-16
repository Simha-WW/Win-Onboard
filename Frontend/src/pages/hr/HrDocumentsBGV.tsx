/**
 * HR Documents & Background Verification - Manage document collection and verification
 */

import React, { useState } from 'react';
import { 
  FiFileText, 
  FiDownload, 
  FiUpload, 
  FiCheckCircle, 
  FiClock, 
  FiAlertTriangle,
  FiEye,
  FiX
} from 'react-icons/fi';

export const HrDocumentsBGV = () => {
  console.log('HR Documents & BGV rendering...');
  
  const [selectedCandidate, setSelectedCandidate] = useState<string>('all');

  // Mock documents data - TODO: Replace with API data
  const candidatesDocuments = [
    {
      id: 1,
      candidateName: 'John Smith',
      position: 'Software Engineer',
      documents: [
        {
          id: 1,
          type: 'ID Proof',
          name: 'Passport_John_Smith.pdf',
          status: 'verified',
          uploadedDate: '2024-01-08',
          verifiedDate: '2024-01-09',
          size: '2.3 MB'
        },
        {
          id: 2,
          type: 'Educational Certificate',
          name: 'BS_Computer_Science.pdf',
          status: 'verified',
          uploadedDate: '2024-01-08',
          verifiedDate: '2024-01-10',
          size: '1.8 MB'
        },
        {
          id: 3,
          type: 'Experience Letter',
          name: 'Previous_Company_Letter.pdf',
          status: 'pending',
          uploadedDate: '2024-01-09',
          verifiedDate: null,
          size: '1.2 MB'
        },
        {
          id: 4,
          type: 'Background Check',
          name: 'BGV_Report.pdf',
          status: 'in_progress',
          uploadedDate: '2024-01-10',
          verifiedDate: null,
          size: '856 KB'
        }
      ],
      bgvStatus: 'in_progress',
      bgvProvider: 'SecureCheck Inc.',
      bgvInitiated: '2024-01-08',
      bgvExpected: '2024-01-15'
    },
    {
      id: 2,
      candidateName: 'Emily Davis',
      position: 'Product Manager',
      documents: [
        {
          id: 1,
          type: 'ID Proof',
          name: 'Drivers_License_Emily.pdf',
          status: 'verified',
          uploadedDate: '2024-01-05',
          verifiedDate: '2024-01-06',
          size: '1.9 MB'
        },
        {
          id: 2,
          type: 'Educational Certificate',
          name: 'MBA_Certificate.pdf',
          status: 'verified',
          uploadedDate: '2024-01-05',
          verifiedDate: '2024-01-06',
          size: '2.1 MB'
        },
        {
          id: 3,
          type: 'Experience Letter',
          name: 'Google_Experience_Letter.pdf',
          status: 'verified',
          uploadedDate: '2024-01-06',
          verifiedDate: '2024-01-07',
          size: '1.5 MB'
        },
        {
          id: 4,
          type: 'Background Check',
          name: 'BGV_Complete_Report.pdf',
          status: 'verified',
          uploadedDate: '2024-01-07',
          verifiedDate: '2024-01-12',
          size: '1.1 MB'
        }
      ],
      bgvStatus: 'completed',
      bgvProvider: 'VerifyNow',
      bgvInitiated: '2024-01-05',
      bgvExpected: '2024-01-12'
    },
    {
      id: 3,
      candidateName: 'Michael Brown',
      position: 'UX Designer',
      documents: [
        {
          id: 1,
          type: 'ID Proof',
          name: 'Passport_Michael.pdf',
          status: 'rejected',
          uploadedDate: '2024-01-03',
          verifiedDate: null,
          size: '3.2 MB',
          rejectionReason: 'Document unclear, please re-upload'
        },
        {
          id: 2,
          type: 'Educational Certificate',
          name: 'Design_Degree.pdf',
          status: 'verified',
          uploadedDate: '2024-01-04',
          verifiedDate: '2024-01-05',
          size: '2.0 MB'
        },
        {
          id: 3,
          type: 'Experience Letter',
          name: null,
          status: 'missing',
          uploadedDate: null,
          verifiedDate: null,
          size: null
        },
        {
          id: 4,
          type: 'Background Check',
          name: null,
          status: 'not_started',
          uploadedDate: null,
          verifiedDate: null,
          size: null
        }
      ],
      bgvStatus: 'not_started',
      bgvProvider: null,
      bgvInitiated: null,
      bgvExpected: null
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': 
      case 'completed': return '#10b981';
      case 'pending': 
      case 'in_progress': return '#f59e0b';
      case 'rejected': return '#ef4444';
      case 'missing': 
      case 'not_started': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': 
      case 'completed': return <FiCheckCircle />;
      case 'pending': 
      case 'in_progress': return <FiClock />;
      case 'rejected': return <FiX />;
      case 'missing': 
      case 'not_started': return <FiAlertTriangle />;
      default: return <FiClock />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'verified': return 'Verified';
      case 'pending': return 'Pending Review';
      case 'rejected': return 'Rejected';
      case 'missing': return 'Missing';
      case 'in_progress': return 'In Progress';
      case 'completed': return 'Completed';
      case 'not_started': return 'Not Started';
      default: return status;
    }
  };

  const filteredCandidates = selectedCandidate === 'all' 
    ? candidatesDocuments 
    : candidatesDocuments.filter(c => c.id.toString() === selectedCandidate);

  // TODO: Add document templates
  // TODO: Add bulk document operations  
  // TODO: Add integration with BGV providers

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
          Documents & Background Verification
        </h1>
        <p style={{ 
          color: '#6b7280', 
          fontSize: '16px'
        }}>
          Manage document collection and background verification process
        </p>
      </div>

      {/* Summary Stats */}
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
            <FiFileText style={{ width: '20px', height: '20px', color: '#2563eb' }} />
            <span style={{ fontSize: '14px', color: '#6b7280' }}>Total Documents</span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
            {candidatesDocuments.reduce((sum, candidate) => sum + candidate.documents.length, 0)}
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
            <FiCheckCircle style={{ width: '20px', height: '20px', color: '#10b981' }} />
            <span style={{ fontSize: '14px', color: '#6b7280' }}>Verified</span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
            {candidatesDocuments.reduce((sum, candidate) => 
              sum + candidate.documents.filter(doc => doc.status === 'verified').length, 0
            )}
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
            <span style={{ fontSize: '14px', color: '#6b7280' }}>Pending Review</span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
            {candidatesDocuments.reduce((sum, candidate) => 
              sum + candidate.documents.filter(doc => doc.status === 'pending').length, 0
            )}
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
            <FiAlertTriangle style={{ width: '20px', height: '20px', color: '#ef4444' }} />
            <span style={{ fontSize: '14px', color: '#6b7280' }}>Action Required</span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
            {candidatesDocuments.reduce((sum, candidate) => 
              sum + candidate.documents.filter(doc => ['rejected', 'missing'].includes(doc.status)).length, 0
            )}
          </div>
        </div>
      </div>

      {/* Filter Bar */}
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
          <label style={{ fontSize: '14px', color: '#374151', fontWeight: '500' }}>
            Filter by Candidate:
          </label>
          <select 
            value={selectedCandidate}
            onChange={(e) => setSelectedCandidate(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #d1d5db',
              fontSize: '14px',
              color: '#374151'
            }}
          >
            <option value="all">All Candidates</option>
            {candidatesDocuments.map(candidate => (
              <option key={candidate.id} value={candidate.id.toString()}>
                {candidate.candidateName}
              </option>
            ))}
          </select>
        </div>

        <button style={{
          backgroundColor: '#2563eb',
          color: 'white',
          padding: '10px 16px',
          border: 'none',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '600',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <FiUpload style={{ width: '16px', height: '16px' }} />
          Bulk Upload
        </button>
      </div>

      {/* Documents List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {filteredCandidates.map((candidate) => (
          <div key={candidate.id} style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            overflow: 'hidden'
          }}>
            {/* Candidate Header */}
            <div style={{
              padding: '20px',
              borderBottom: '1px solid #e2e8f0',
              backgroundColor: '#f8f9fa'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px'
              }}>
                <div>
                  <h3 style={{
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: '#1f2937',
                    margin: '0 0 4px 0'
                  }}>
                    {candidate.candidateName}
                  </h3>
                  <p style={{
                    fontSize: '16px',
                    color: '#6b7280',
                    margin: 0
                  }}>
                    {candidate.position}
                  </p>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: `${getStatusColor(candidate.bgvStatus)}20`,
                  color: getStatusColor(candidate.bgvStatus),
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600'
                }}>
                  {getStatusIcon(candidate.bgvStatus)}
                  BGV: {getStatusLabel(candidate.bgvStatus)}
                </div>
              </div>

              {/* BGV Info */}
              {candidate.bgvProvider && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '16px',
                  fontSize: '14px',
                  color: '#6b7280'
                }}>
                  <div>Provider: {candidate.bgvProvider}</div>
                  <div>Initiated: {candidate.bgvInitiated}</div>
                  <div>Expected: {candidate.bgvExpected}</div>
                </div>
              )}
            </div>

            {/* Documents Grid */}
            <div style={{ padding: '20px' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '16px'
              }}>
                {candidate.documents.map((doc) => (
                  <div key={doc.id} style={{
                    padding: '16px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    backgroundColor: '#fafafa'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '12px'
                    }}>
                      <div style={{ flex: 1 }}>
                        <h4 style={{
                          fontSize: '16px',
                          fontWeight: '600',
                          color: '#1f2937',
                          margin: '0 0 4px 0'
                        }}>
                          {doc.type}
                        </h4>
                        <p style={{
                          fontSize: '14px',
                          color: '#6b7280',
                          margin: '0 0 8px 0'
                        }}>
                          {doc.name || 'Not uploaded'}
                        </p>
                      </div>

                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        backgroundColor: `${getStatusColor(doc.status)}20`,
                        color: getStatusColor(doc.status),
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        {getStatusIcon(doc.status)}
                        {getStatusLabel(doc.status)}
                      </div>
                    </div>

                    {doc.name && (
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <div style={{
                          fontSize: '12px',
                          color: '#6b7280'
                        }}>
                          <div>Uploaded: {doc.uploadedDate}</div>
                          {doc.verifiedDate && <div>Verified: {doc.verifiedDate}</div>}
                          <div>Size: {doc.size}</div>
                        </div>

                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button style={{
                            padding: '6px',
                            border: 'none',
                            borderRadius: '6px',
                            backgroundColor: '#e2e8f0',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          title="View Document">
                            <FiEye style={{ width: '14px', height: '14px', color: '#6b7280' }} />
                          </button>
                          
                          <button style={{
                            padding: '6px',
                            border: 'none',
                            borderRadius: '6px',
                            backgroundColor: '#e2e8f0',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          title="Download Document">
                            <FiDownload style={{ width: '14px', height: '14px', color: '#6b7280' }} />
                          </button>
                        </div>
                      </div>
                    )}

                    {doc.status === 'rejected' && doc.rejectionReason && (
                      <div style={{
                        marginTop: '12px',
                        padding: '8px',
                        backgroundColor: '#fef2f2',
                        borderRadius: '6px',
                        fontSize: '12px',
                        color: '#dc2626'
                      }}>
                        <strong>Rejection Reason:</strong> {doc.rejectionReason}
                      </div>
                    )}

                    {doc.status === 'missing' && (
                      <button style={{
                        width: '100%',
                        padding: '8px',
                        backgroundColor: '#2563eb',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}>
                        <FiUpload style={{ width: '14px', height: '14px' }} />
                        Request Document
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* TODO: Add document viewer modal */}
      {/* TODO: Add document upload functionality */}
      {/* TODO: Add BGV provider integration */}
      {/* TODO: Add document approval workflow */}
    </div>
  );
};