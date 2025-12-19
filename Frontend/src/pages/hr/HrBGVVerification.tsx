/**
 * HR BGV Verification Detail Page
 * View and verify BGV submission documents for a fresher
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FiArrowLeft,
  FiCheckCircle,
  FiX,
  FiEye,
  FiClock,
  FiMail,
  FiAlertCircle,
  FiUser,
  FiMapPin,
  FiPhone,
  FiBook
} from 'react-icons/fi';
import { API_BASE_URL } from '../../config';

interface FresherInfo {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  designation: string;
  department?: string;
  joining_date?: string;
}

interface Demographics {
  salutation?: string;
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  name_for_records?: string;
  dob_as_per_records?: string;
  celebrated_dob?: string;
  gender?: string;
  blood_group?: string;
  whatsapp_number?: string;
  linkedin_url?: string;
  aadhaar_card_number?: string;
  pan_card_number?: string;
  comm_house_number?: string;
  comm_street_name?: string;
  comm_city?: string;
  comm_district?: string;
  comm_state?: string;
  comm_country?: string;
  comm_pin_code?: string;
  perm_house_number?: string;
  perm_street_name?: string;
  perm_city?: string;
  perm_district?: string;
  perm_state?: string;
  perm_country?: string;
  perm_pin_code?: string;
}

interface Personal {
  marital_status?: string;
  num_children?: number;
  father_name?: string;
  father_dob?: string;
  father_deceased?: boolean;
  mother_name?: string;
  mother_dob?: string;
  mother_deceased?: boolean;
  emergency_contacts?: string;
}

interface EducationDocument {
  name: string;
  data: string;
  type: string;
  size: number;
}

interface Education {
  id: number;
  qualification_type: string;
  qualification: string;
  university_institution: string;
  cgpa_percentage: string;
  year_of_passing: number;
  certificate_name?: string;
  documents?: string;
}

interface BGVData {
  fresher: FresherInfo;
  demographics: Demographics | null;
  personal: Personal | null;
  education: Education[];
  submission: any;
}

interface DocumentVerification {
  document_type: string;
  document_section: string;
  document_value: any;
  status?: 'pending' | 'verified' | 'rejected';
  comments?: string;
  verified_at?: string;
  hr_first_name?: string;
  hr_last_name?: string;
}

export const HrBGVVerification = () => {
  const { fresherId } = useParams<{ fresherId: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bgvData, setBgvData] = useState<BGVData | null>(null);
  const [activeTab, setActiveTab] = useState<'demographics' | 'personal' | 'education'>('demographics');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [verifications, setVerifications] = useState<Record<string, DocumentVerification[]>>({});
  const [fresherInfo, setFresherInfo] = useState<FresherInfo | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<DocumentVerification | null>(null);
  const [rejectComments, setRejectComments] = useState('');
  const [rejectModalOpen, setRejectModalOpen] = useState(false);

  useEffect(() => {
    if (fresherId) {
      fetchBGVData();
    }
  }, [fresherId]);

  const fetchBGVData = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch(`${API_BASE_URL}/bgv/hr/verification/${fresherId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch BGV data');
      }

      const result = await response.json();

      console.log("-----------------------------------------------------");
      console.log(result.data);
      console.log("-----------------------------------------------------");
      
      setBgvData(result.data);
      
      // Set fresher info for UI
      setFresherInfo(result.data.fresher);
      
      // Build verifications object from demographics, personal, and education data
      const verificationsData: Record<string, DocumentVerification[]> = {};
      
      // Demographics section
      if (result.data.demographics) {
        verificationsData['Demographics'] = Object.entries(result.data.demographics)
          .filter(([key]) => !['id', 'fresher_id'].includes(key))
          .map(([key, value]) => ({
            document_type: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            document_section: 'Demographics',
            document_value: value,
            status: 'pending' as const
          }));
      }
      
      // Personal section
      if (result.data.personal) {
        verificationsData['Personal'] = Object.entries(result.data.personal)
          .filter(([key]) => !['id', 'fresher_id'].includes(key))
          .map(([key, value]) => ({
            document_type: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            document_section: 'Personal',
            document_value: value,
            status: 'pending' as const
          }));
      }
      
      // Education section
      if (result.data.education && result.data.education.length > 0) {
        verificationsData['Education'] = result.data.education.flatMap((edu: Education) => 
          Object.entries(edu)
            .filter(([key]) => !['id', 'fresher_id'].includes(key))
            .map(([key, value]) => ({
              document_type: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
              document_section: 'Education',
              document_value: value,
              status: 'pending' as const
            }))
        );
      }
      
      setVerifications(verificationsData);
    } catch (error: any) {
      console.error('Error fetching BGV data:', error);
      setError(error.message || 'Failed to load BGV data');
    } finally {
      setLoading(false);
    }
  };

  const fetchVerificationData = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch(`${API_BASE_URL}/bgv/hr/verification/${fresherId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });



      

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch verification data');
      }

      const result = await response.json();
      
      // Extract fresher info
      setFresherInfo(result.data.fresher);
      
      // Build verifications object from demographics, personal, and education data
      const verificationsData: Record<string, DocumentVerification[]> = {};
      
      // Demographics section
      if (result.data.demographics) {
        verificationsData['Demographics'] = Object.entries(result.data.demographics)
          .filter(([key]) => !['id', 'fresher_id'].includes(key))
          .map(([key, value]) => ({
            document_type: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            document_section: 'Demographics',
            document_value: value,
            status: 'pending'
          }));
      }
      
      // Personal section
      if (result.data.personal) {
        verificationsData['Personal'] = Object.entries(result.data.personal)
          .filter(([key]) => !['id', 'fresher_id'].includes(key))
          .map(([key, value]) => ({
            document_type: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            document_section: 'Personal',
            document_value: value,
            status: 'pending'
          }));
      }
      
      // Education section
      if (result.data.education && result.data.education.length > 0) {
        verificationsData['Education'] = result.data.education.flatMap((edu: Education) => 
          Object.entries(edu)
            .filter(([key]) => !['id', 'fresher_id'].includes(key))
            .map(([key, value]) => ({
              document_type: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
              document_section: 'Education',
              document_value: value,
              status: 'pending'
            }))
        );
      }
      
      setVerifications(verificationsData);
    } catch (error: any) {
      console.error('Error fetching verification data:', error);
    }
  };

  const handleVerify = async (doc: DocumentVerification) => {
    try {
      setProcessing(true);
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch(`${API_BASE_URL}/bgv/hr/verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fresherId: parseInt(fresherId!),
          documentType: doc.document_type,
          documentSection: doc.document_section,
          status: 'verified',
          comments: ''
        })
      });

      if (!response.ok) throw new Error('Failed to verify document');

      // Refresh data
      await fetchVerificationData();
    } catch (error) {
      console.error('Error verifying document:', error);
      alert('Failed to verify document');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = (doc: DocumentVerification) => {
    setSelectedDocument(doc);
    setRejectComments('');
    setRejectModalOpen(true);
  };

  const submitRejection = async () => {
    if (!selectedDocument || !rejectComments.trim()) {
      alert('Please provide rejection comments');
      return;
    }

    try {
      setProcessing(true);
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch(`${API_BASE_URL}/bgv/hr/verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fresherId: parseInt(fresherId!),
          documentType: selectedDocument.document_type,
          documentSection: selectedDocument.document_section,
          status: 'rejected',
          comments: rejectComments
        })
      });

      if (!response.ok) throw new Error('Failed to reject document');

      // Refresh data and close modal
      await fetchVerificationData();
      setRejectModalOpen(false);
      setSelectedDocument(null);
      setRejectComments('');
    } catch (error) {
      console.error('Error rejecting document:', error);
      alert('Failed to reject document');
    } finally {
      setProcessing(false);
    }
  };

  const handleSendEmail = async () => {
    // Check if all documents are reviewed
    const allDocs = Object.values(verifications).flat();
    const pendingDocs = allDocs.filter(doc => doc.status === 'pending' || !doc.status);
    
    if (pendingDocs.length > 0) {
      alert(`Please review all documents before sending email. ${pendingDocs.length} documents are still pending.`);
      return;
    }

    if (!window.confirm('Are you sure you want to send the verification email to the candidate?')) {
      return;
    }

    try {
      setProcessing(true);
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch(`${API_BASE_URL}/bgv/hr/send-email`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fresherId: parseInt(fresherId!)
        })
      });

      if (!response.ok) throw new Error('Failed to send email');

      alert('Verification email sent successfully!');
      navigate('/hr/documents');
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send email');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return {
          label: 'Verified',
          color: '#10b981',
          bgColor: '#d1fae5',
          icon: <FiCheckCircle />
        };
      case 'rejected':
        return {
          label: 'Rejected',
          color: '#ef4444',
          bgColor: '#fee2e2',
          icon: <FiX />
        };
      default:
        return {
          label: 'Pending',
          color: '#eab308',
          bgColor: '#fef9c3',
          icon: <FiClock />
        };
    }
  };

  const isDocumentField = (fieldName: string, value: any) => {
    if (!value) return false;
    
    // Check if field name suggests it's a document
    const docFieldNames = ['documents', 'certificate', 'attachment', 'file'];
    const isDocField = docFieldNames.some(name => fieldName.toLowerCase().includes(name));
    
    // Check if value looks like base64 or binary data
    if (typeof value === 'string') {
      // Already a data URL
      if (value.startsWith('data:')) return true;
      
      // Check for base64 pattern - long string with base64 characters
      const isBase64Like = value.length > 100 && /^[A-Za-z0-9+/=\s]+$/.test(value.replace(/\s/g, ''));
      
      // Check for Buffer-like object in string format
      const isBufferLike = value.startsWith('{') && value.includes('"type":"Buffer"');
      
      return isDocField || isBase64Like || isBufferLike;
    }
    
    // Check for Buffer object
    if (typeof value === 'object' && (value.type === 'Buffer' || value.data)) {
      return true;
    }
    
    return false;
  };

  const handleViewDocument = (value: any, docType: string) => {
    try {
      let documentUrl = '';
      
      if (typeof value === 'string') {
        // If it's already a data URL
        if (value.startsWith('data:')) {
          documentUrl = value;
        } else {
          // Try to parse as JSON first (might be array of documents)
          try {
            const parsed = JSON.parse(value);
            if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].data) {
              documentUrl = parsed[0].data;
            }
          } catch {
            // Assume it's base64 encoded, try to determine type
            const isPdf = value.startsWith('JVBERi0');
            const mimeType = isPdf ? 'application/pdf' : 'image/png';
            documentUrl = `data:${mimeType};base64,${value}`;
          }
        }
      }
      
      if (documentUrl) {
        window.open(documentUrl, '_blank');
      } else {
        alert('Unable to display document');
      }
    } catch (error) {
      console.error('Error viewing document:', error);
      alert('Error opening document');
    }
  };

  const formatValue = (value: any, fieldName: string = '') => {
    if (value === null || value === undefined) return 'Not provided';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'object') return JSON.stringify(value);
    
    // Don't display raw binary/document data
    if (isDocumentField(fieldName, value)) {
      return null; // Will be handled separately in rendering
    }
    
    return value.toString();
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '400px'
      }}>
        <div>Loading verification data...</div>
      </div>
    );
  }

  if (!fresherInfo) {
    return (
      <div style={{
        padding: '24px',
        textAlign: 'center'
      }}>
        <FiAlertCircle style={{ width: '48px', height: '48px', color: '#ef4444', margin: '0 auto 16px' }} />
        <h3>No data found for this fresher</h3>
        <button
          onClick={() => navigate('/hr/documents')}
          style={{
            marginTop: '16px',
            padding: '10px 20px',
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Back to List
        </button>
      </div>
    );
  }

  const allDocs = Object.values(verifications).flat();
  const verifiedCount = allDocs.filter(d => d.status === 'verified').length;
  const rejectedCount = allDocs.filter(d => d.status === 'rejected').length;
  const pendingCount = allDocs.filter(d => !d.status || d.status === 'pending').length;

  return (
    <div style={{
      padding: '24px',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <button
          onClick={() => navigate('/hr/documents')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            backgroundColor: 'transparent',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            cursor: 'pointer',
            marginBottom: '16px',
            color: '#6b7280'
          }}
        >
          <FiArrowLeft />
          Back to List
        </button>

        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <h1 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#1f2937',
            margin: '0 0 16px 0'
          }}>
            {fresherInfo.first_name} {fresherInfo.last_name}
          </h1>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '16px'
          }}>
            <div>
              <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Designation</div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>{fresherInfo.designation}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Email</div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>{fresherInfo.email}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Verified</div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#10b981' }}>{verifiedCount}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Rejected</div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#ef4444' }}>{rejectedCount}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Pending</div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#eab308' }}>{pendingCount}</div>
            </div>
          </div>

          {/* Send Email Button */}
          <button
            onClick={handleSendEmail}
            disabled={processing || pendingCount > 0}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: pendingCount > 0 ? '#9ca3af' : '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: pendingCount > 0 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'background-color 0.2s'
            }}
          >
            <FiMail />
            {pendingCount > 0 ? `Review ${pendingCount} Pending Documents First` : 'Send Verification Email'}
          </button>
        </div>
      </div>

      {/* Documents by Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {Object.entries(verifications).map(([section, docs]) => (
          <div
            key={section}
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              overflow: 'hidden'
            }}
          >
            <div style={{
              padding: '16px 20px',
              backgroundColor: '#f9fafb',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <h2 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#1f2937',
                margin: 0
              }}>
                {section}
              </h2>
            </div>

            <div style={{ padding: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {docs.map((doc, idx) => {
                  const status = getStatusBadge(doc.status || 'pending');
                  
                  return (
                    <div
                      key={idx}
                      style={{
                        padding: '16px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        backgroundColor: '#f9fafb'
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '12px'
                      }}>
                        <div style={{ flex: 1 }}>
                          <h3 style={{
                            fontSize: '16px',
                            fontWeight: '600',
                            color: '#1f2937',
                            margin: '0 0 8px 0'
                          }}>
                            {doc.document_type}
                          </h3>
                          <div style={{
                            fontSize: '14px',
                            color: '#6b7280',
                            wordBreak: 'break-word'
                          }}>
                            {isDocumentField(doc.document_type, doc.document_value) ? (
                              <button
                                onClick={() => handleViewDocument(doc.document_value, doc.document_type)}
                                style={{
                                  padding: '8px 16px',
                                  backgroundColor: '#3b82f6',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '6px',
                                  fontSize: '13px',
                                  fontWeight: '500',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px'
                                }}
                              >
                                <FiEye />
                                View Document
                              </button>
                            ) : (
                              formatValue(doc.document_value, doc.document_type)
                            )}
                          </div>
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
                          fontWeight: '600',
                          marginLeft: '16px'
                        }}>
                          {status.icon}
                          {status.label}
                        </div>
                      </div>

                      {doc.comments && (
                        <div style={{
                          marginBottom: '12px',
                          padding: '12px',
                          backgroundColor: '#fef2f2',
                          borderRadius: '6px',
                          borderLeft: '4px solid #ef4444'
                        }}>
                          <div style={{ fontSize: '12px', fontWeight: '600', color: '#991b1b', marginBottom: '4px' }}>
                            Rejection Comments:
                          </div>
                          <div style={{ fontSize: '13px', color: '#7f1d1d' }}>
                            {doc.comments}
                          </div>
                        </div>
                      )}

                      {doc.hr_first_name && (
                        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '12px' }}>
                          Reviewed by: {doc.hr_first_name} {doc.hr_last_name} on {new Date(doc.verified_at!).toLocaleDateString()}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {doc.status !== 'verified' && (
                          <button
                            onClick={() => handleVerify(doc)}
                            disabled={processing}
                            style={{
                              flex: 1,
                              padding: '10px',
                              backgroundColor: '#10b981',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '14px',
                              fontWeight: '600',
                              cursor: processing ? 'not-allowed' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px'
                            }}
                          >
                            <FiCheckCircle />
                            Verify
                          </button>
                        )}

                        {doc.status !== 'rejected' && (
                          <button
                            onClick={() => handleReject(doc)}
                            disabled={processing}
                            style={{
                              flex: 1,
                              padding: '10px',
                              backgroundColor: '#ef4444',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '14px',
                              fontWeight: '600',
                              cursor: processing ? 'not-allowed' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px'
                            }}
                          >
                            <FiX />
                            Reject
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Reject Modal */}
      {rejectModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '500px',
            width: '90%'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1f2937',
              margin: '0 0 16px 0'
            }}>
              Reject Document
            </h3>

            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              marginBottom: '16px'
            }}>
              Please provide a reason for rejecting this document:
            </p>

            <textarea
              value={rejectComments}
              onChange={(e) => setRejectComments(e.target.value)}
              placeholder="Enter rejection comments..."
              style={{
                width: '100%',
                minHeight: '120px',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: 'inherit',
                marginBottom: '16px',
                resize: 'vertical'
              }}
            />

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setRejectModalOpen(false);
                  setSelectedDocument(null);
                  setRejectComments('');
                }}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>

              <button
                onClick={submitRejection}
                disabled={processing || !rejectComments.trim()}
                style={{
                  padding: '10px 20px',
                  backgroundColor: rejectComments.trim() ? '#ef4444' : '#9ca3af',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: rejectComments.trim() && !processing ? 'pointer' : 'not-allowed'
                }}
              >
                Submit Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
