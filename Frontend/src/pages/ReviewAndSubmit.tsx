import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCheck, FiX, FiEdit2, FiFileText, FiUpload, FiExternalLink } from 'react-icons/fi';

// Helper component for table rows
const TableRow = ({ label, value }: { label: string; value?: string | null | React.ReactNode }) => (
  <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
    <td style={{ 
      padding: '12px 16px', 
      fontSize: '14px', 
      color: '#6b7280', 
      fontWeight: '500',
      width: '35%',
      backgroundColor: '#f9fafb'
    }}>
      {label}
    </td>
    <td style={{ 
      padding: '12px 16px', 
      fontSize: '14px', 
      color: '#111827',
      fontWeight: '500'
    }}>
      {value || 'Not provided'}
    </td>
  </tr>
);

// Helper component for displaying document links
const DocumentLink = ({ label, url, fileName }: { label: string; url?: string | null; fileName?: string | null }) => {
  if (!url) return <span style={{ color: '#9ca3af', fontSize: '14px' }}>Not uploaded</span>;
  
  return (
    <a 
      href={url} 
      target="_blank" 
      rel="noopener noreferrer"
      style={{ 
        fontSize: '14px', 
        color: '#6366f1', 
        fontWeight: '500',
        textDecoration: 'none',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        cursor: 'pointer'
      }}
      onMouseOver={(e) => e.currentTarget.style.textDecoration = 'underline'}
      onMouseOut={(e) => e.currentTarget.style.textDecoration = 'none'}
    >
      <FiFileText size={16} />
      {fileName || 'View Document'}
      <FiExternalLink size={14} />
    </a>
  );
};

export const ReviewAndSubmit = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [bgvData, setBgvData] = useState<any>(null);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [showSignature, setShowSignature] = useState(false);

  useEffect(() => {
    fetchBGVData();
  }, []);

  const fetchBGVData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        console.error('No auth token found');
        navigate('/login');
        return;
      }

      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api';
      const response = await fetch(`${API_BASE_URL}/bgv/submission`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ BGV Data fetched:', result);
        console.log('Demographics:', result.savedDemographics);
        console.log('Personal:', result.savedPersonal);
        console.log('Education:', result.savedEducation);
        console.log('Employment:', result.savedEmployment);
        console.log('Passport/Visa:', result.savedPassportVisa);
        console.log('Banking:', result.savedBankPfNps);
        setBgvData(result);
      } else {
        const errorText = await response.text();
        console.error('❌ Failed to fetch BGV data:', response.status, errorText);
        alert(`Failed to load data: ${response.status} - ${errorText}`);
      }
    } catch (error: any) {
      console.error('❌ Error fetching BGV data:', error);
      alert(`Error loading data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      setSignatureData(reader.result as string);
      setShowSignature(false);
    };
    reader.readAsDataURL(file);
  };

  const clearSignature = () => {
    setSignatureData(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFinalSubmit = async () => {
    if (!signatureData) {
      alert('Please add your digital signature before submitting');
      setShowSignature(true);
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        alert('Authentication token not found. Please login again.');
        navigate('/login');
        return;
      }

      console.log('Submitting BGV form...');
      
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api';
      const response = await fetch(`${API_BASE_URL}/bgv/final-submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          signature: signatureData,
          submittedAt: new Date().toISOString()
        })
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Submission successful:', result);
        alert('BGV form submitted successfully!');
        navigate('/dashboard');
      } else {
        const errorText = await response.text();
        console.error('❌ Submission failed:', response.status, errorText);
        alert(`Submission failed: ${response.status} - ${errorText}`);
      }
    } catch (error: any) {
      console.error('❌ Error submitting form:', error);
      alert(`Error: ${error.message || 'Failed to submit form. Please try again.'}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f9fafb'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="animate-spin" style={{
            width: '48px',
            height: '48px',
            border: '4px solid #e5e7eb',
            borderTopColor: '#6366f1',
            borderRadius: '50%',
            margin: '0 auto 16px'
          }} />
          <p style={{ color: '#6b7280' }}>Loading your information...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', padding: '24px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '12px', 
          padding: '24px', 
          marginBottom: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>
            Review & Submit
          </h1>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>
            Please review all your information carefully before submitting
          </p>
          {bgvData && (
            <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#f0fdf4', borderRadius: '8px', fontSize: '12px', color: '#166534' }}>
              Data loaded: Demographics ({bgvData.savedDemographics ? '✓' : '✗'}), 
              Personal ({bgvData.savedPersonal ? '✓' : '✗'}), 
              Education ({bgvData.savedEducation?.length || 0} records), 
              Employment ({bgvData.savedEmployment?.length || 0} records), 
              Passport ({bgvData.savedPassportVisa ? '✓' : '✗'}), 
              Banking ({bgvData.savedBankPfNps ? '✓' : '✗'})
            </div>
          )}
        </div>

        {/* Demographics Section */}
        {bgvData?.savedDemographics && (
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '12px', 
            padding: '24px', 
            marginBottom: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827' }}>
                Demographics
              </h2>
              <button
                onClick={() => navigate('/dashboard/documents')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  backgroundColor: '#f3f4f6',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#374151',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                <FiEdit2 size={16} /> Edit
              </button>
            </div>
            
            {/* Basic Information */}
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>Basic Information</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden', marginBottom: '24px' }}>
              <tbody>
                <TableRow label="Salutation" value={bgvData.savedDemographics.salutation} />
                <TableRow label="Full Name" value={bgvData.savedDemographics.name_for_records || `${bgvData.savedDemographics.first_name || ''} ${bgvData.savedDemographics.middle_name || ''} ${bgvData.savedDemographics.last_name || ''}`.trim()} />
                <TableRow label="Date of Birth (Records)" value={bgvData.savedDemographics.dob_as_per_records?.split('T')[0]} />
                <TableRow label="Date of Birth (Celebrated)" value={bgvData.savedDemographics.celebrated_dob?.split('T')[0]} />
                <TableRow label="Gender" value={bgvData.savedDemographics.gender} />
                <TableRow label="Blood Group" value={bgvData.savedDemographics.blood_group} />
                <TableRow label="WhatsApp Number" value={bgvData.savedDemographics.whatsapp_number} />
                <TableRow label="LinkedIn Profile" value={bgvData.savedDemographics.linkedin_url || 'Not provided'} />
              </tbody>
            </table>

            {/* Identity Documents */}
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>Identity Documents</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden', marginBottom: '24px' }}>
              <tbody>
                <TableRow label="PAN Number" value={bgvData.savedDemographics.pan_card_number} />
                <TableRow label="Aadhaar Number" value={bgvData.savedDemographics.aadhaar_card_number} />
              </tbody>
            </table>
            
            {/* Communication Address */}
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>Communication Address</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden', marginBottom: '24px' }}>
              <tbody>
                <TableRow label="House Number" value={bgvData.savedDemographics.comm_house_number} />
                <TableRow label="Street Name" value={bgvData.savedDemographics.comm_street_name} />
                <TableRow label="District" value={bgvData.savedDemographics.comm_district} />
                <TableRow label="City" value={bgvData.savedDemographics.comm_city} />
                <TableRow label="State" value={bgvData.savedDemographics.comm_state} />
                <TableRow label="Pincode" value={bgvData.savedDemographics.comm_pin_code || 'Not provided'} />
                <TableRow label="Country" value={bgvData.savedDemographics.comm_country} />
              </tbody>
            </table>
            
            {/* Permanent Address */}
            {!bgvData.savedDemographics.perm_same_as_comm ? (
              <>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>Permanent Address</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden', marginBottom: '24px' }}>
                  <tbody>
                    <TableRow label="House Number" value={bgvData.savedDemographics.perm_house_number} />
                    <TableRow label="Street Name" value={bgvData.savedDemographics.perm_street_name} />
                    <TableRow label="District" value={bgvData.savedDemographics.perm_district} />
                    <TableRow label="City" value={bgvData.savedDemographics.perm_city} />
                    <TableRow label="State" value={bgvData.savedDemographics.perm_state} />
                    <TableRow label="Pincode" value={bgvData.savedDemographics.perm_pin_code || 'Not provided'} />
                    <TableRow label="Country" value={bgvData.savedDemographics.perm_country} />
                  </tbody>
                </table>
              </>
            ) : (
              <div style={{ padding: '12px', backgroundColor: '#f0f9ff', borderRadius: '8px', marginBottom: '24px' }}>
                <p style={{ fontSize: '14px', color: '#1e40af', margin: 0 }}>
                  ℹ️ Permanent address is same as communication address
                </p>
              </div>
            )}
            
            {/* Uploaded Documents */}
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>Uploaded Documents</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
              <tbody>
                <TableRow label="Aadhaar Card" value={<DocumentLink url={bgvData.savedDemographics.aadhaar_doc_file_url} fileName={bgvData.savedDemographics.aadhaar_file_name} label="" />} />
                <TableRow label="PAN Card" value={<DocumentLink url={bgvData.savedDemographics.pan_file_url} fileName={bgvData.savedDemographics.pan_file_name} label="" />} />
                <TableRow label="Resume" value={<DocumentLink url={bgvData.savedDemographics.resume_file_url} fileName={bgvData.savedDemographics.resume_file_name} label="" />} />
              </tbody>
            </table>
          </div>
        )}

        {/* Personal Details Section */}
        {bgvData?.savedPersonal && (
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '12px', 
            padding: '24px', 
            marginBottom: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827' }}>
                Personal Details
              </h2>
              <button
                onClick={() => navigate('/dashboard/documents')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  backgroundColor: '#f3f4f6',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#374151',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                <FiEdit2 size={16} /> Edit
              </button>
            </div>
            
            {/* Family Details */}
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>Family Details</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden', marginBottom: '24px' }}>
              <tbody>
                <TableRow label="Father's Name" value={bgvData.savedPersonal.father_name} />
                <TableRow label="Father's Date of Birth" value={bgvData.savedPersonal.father_dob?.split('T')[0]} />
                <TableRow label="Father Deceased" value={bgvData.savedPersonal.father_deceased ? 'Yes' : 'No'} />
                <TableRow label="Mother's Name" value={bgvData.savedPersonal.mother_name} />
                <TableRow label="Mother's Date of Birth" value={bgvData.savedPersonal.mother_dob?.split('T')[0]} />
                <TableRow label="Mother Deceased" value={bgvData.savedPersonal.mother_deceased ? 'Yes' : 'No'} />
                <TableRow label="Marital Status" value={bgvData.savedPersonal.marital_status} />
                {bgvData.savedPersonal.marital_status === 'Married' && (
                  <>
                    <TableRow label="Spouse Name" value={bgvData.savedPersonal.spouse_name} />
                    <TableRow label="Spouse Date of Birth" value={bgvData.savedPersonal.spouse_dob?.split('T')[0]} />
                  </>
                )}
                <TableRow label="Number of Children" value={bgvData.savedPersonal.num_children?.toString() || '0'} />
                {bgvData.savedPersonal.num_children > 0 && (
                  <>
                    <TableRow label="Child 1 Name" value={bgvData.savedPersonal.child1_name} />
                    <TableRow label="Child 1 Date of Birth" value={bgvData.savedPersonal.child1_dob?.split('T')[0]} />
                    {bgvData.savedPersonal.num_children > 1 && (
                      <>
                        <TableRow label="Child 2 Name" value={bgvData.savedPersonal.child2_name} />
                        <TableRow label="Child 2 Date of Birth" value={bgvData.savedPersonal.child2_dob?.split('T')[0]} />
                      </>
                    )}
                  </>
                )}
              </tbody>
            </table>

            {/* Emergency Contacts */}
            {bgvData.savedPersonal.emergency_contacts && bgvData.savedPersonal.emergency_contacts.length > 0 && (
              <>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>Emergency Contacts</h3>
                {bgvData.savedPersonal.emergency_contacts.map((contact: any, index: number) => (
                  <div key={index} style={{ marginBottom: '16px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', marginBottom: '8px' }}>Contact {index + 1}</h4>
                    <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
                      <tbody>
                        <TableRow label="Name" value={contact.contact_person_name} />
                        <TableRow label="Relationship" value={contact.relationship} />
                        <TableRow label="Phone Number" value={contact.mobile} />
                      </tbody>
                    </table>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* Education Section */}
        {bgvData?.savedEducation && (bgvData.savedEducation.educationalQualifications?.length > 0 || bgvData.savedEducation.additionalQualifications?.length > 0) && (
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '12px', 
            padding: '24px', 
            marginBottom: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827' }}>
                Education
              </h2>
              <button
                onClick={() => navigate('/dashboard/documents')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  backgroundColor: '#f3f4f6',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#374151',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                <FiEdit2 size={16} /> Edit
              </button>
            </div>
            
            {bgvData.savedEducation.educationalQualifications && bgvData.savedEducation.educationalQualifications.length > 0 && (
              <>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>Educational Qualifications</h3>
                {bgvData.savedEducation.educationalQualifications.map((edu: any, index: number) => (
                  <div key={index} style={{ marginBottom: '16px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', marginBottom: '8px' }}>{edu.qualification || `Qualification ${index + 1}`}</h4>
                    <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden', marginBottom: '12px' }}>
                      <tbody>
                        <TableRow label="Qualification" value={edu.qualification} />
                        <TableRow label="University/Institution" value={edu.university_institution} />
                        <TableRow label="CGPA/Percentage" value={edu.cgpa_percentage} />
                        <TableRow label="Year of Passing" value={edu.year_of_passing?.toString()} />
                        <TableRow label="Certificate Document" value={<DocumentLink url={edu.documentUrl} fileName={edu.documentName} label="" />} />
                      </tbody>
                    </table>
                  </div>
                ))}
              </>
            )}

            {bgvData.savedEducation.additionalQualifications && bgvData.savedEducation.additionalQualifications.length > 0 && (
              <>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '12px', marginTop: '24px' }}>Additional Certificates</h3>
                {bgvData.savedEducation.additionalQualifications.map((cert: any, index: number) => (
                  <div key={index} style={{ marginBottom: '16px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', marginBottom: '8px' }}>{cert.qualification || `Certificate ${index + 1}`}</h4>
                    <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden', marginBottom: '12px' }}>
                      <tbody>
                        <TableRow label="Certificate Name" value={cert.qualification} />
                        <TableRow label="Issuing Organization" value={cert.university_institution} />
                        <TableRow label="Year Obtained" value={cert.year_of_passing?.toString()} />
                        <TableRow label="Certificate Document" value={<DocumentLink url={cert.documentUrl} fileName={cert.documentName} label="" />} />
                      </tbody>
                    </table>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* Employment Section */}
        {bgvData?.savedEmployment?.employmentHistory && bgvData.savedEmployment.employmentHistory.length > 0 && (
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '12px', 
            padding: '24px', 
            marginBottom: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827' }}>
                Employment History
              </h2>
              <button
                onClick={() => navigate('/dashboard/documents')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  backgroundColor: '#f3f4f6',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#374151',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                <FiEdit2 size={16} /> Edit
              </button>
            </div>
            {bgvData.savedEmployment.employmentHistory.map((emp: any, index: number) => (
              <div key={index} style={{ marginBottom: '16px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', marginBottom: '8px' }}>
                  {emp.company_name || `Employment ${index + 1}`}
                </h4>
                <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden', marginBottom: '12px' }}>
                  <tbody>
                    <TableRow label="Company Name" value={emp.company_name} />
                    <TableRow label="Designation" value={emp.designation} />
                    <TableRow label="From Date" value={emp.from_date} />
                    <TableRow label="To Date" value={emp.to_date || 'Present'} />
                    <TableRow label="Reason for Leaving" value={emp.reason_for_leaving} />
                    <TableRow label="HR Name" value={emp.hr_name} />
                    <TableRow label="HR Email" value={emp.hr_email} />
                    <TableRow label="HR Phone" value={emp.hr_phone} />
                    <TableRow label="Offer Letter" value={<DocumentLink url={emp.offer_letter_url} fileName={emp.offer_letter_name} label="" />} />
                    <TableRow label="Experience Letter" value={<DocumentLink url={emp.experience_letter_url} fileName={emp.experience_letter_name} label="" />} />
                    <TableRow label="Last 3 Months Payslip" value={<DocumentLink url={emp.payslip_url} fileName={emp.payslip_name} label="" />} />
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        )}

        {/* Passport/Visa Section */}
        {bgvData?.savedPassportVisa && (
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '12px', 
            padding: '24px', 
            marginBottom: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827' }}>
                Passport & Visa
              </h2>
              <button
                onClick={() => navigate('/dashboard/documents')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  backgroundColor: '#f3f4f6',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#374151',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                <FiEdit2 size={16} /> Edit
              </button>
            </div>
            
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>Travel Documents</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
              <tbody>
                <TableRow label="Has Passport" value={bgvData.savedPassportVisa.has_passport ? 'Yes' : 'No'} />
                {bgvData.savedPassportVisa.has_passport && (
                  <>
                    <TableRow label="Passport Number" value={bgvData.savedPassportVisa.passport_number} />
                    <TableRow label="Issue Date" value={bgvData.savedPassportVisa.passport_issue_date?.split('T')[0]} />
                    <TableRow label="Expiry Date" value={bgvData.savedPassportVisa.passport_expiry_date?.split('T')[0]} />
                    <TableRow label="Passport Copy" value={<DocumentLink url={bgvData.savedPassportVisa.passport_copy_url} fileName={bgvData.savedPassportVisa.passport_copy_name} label="" />} />
                  </>
                )}
                <TableRow label="Has Visa" value={bgvData.savedPassportVisa.has_visa ? 'Yes' : 'No'} />
                {bgvData.savedPassportVisa.has_visa && (
                  <>
                    <TableRow label="Visa Type" value={bgvData.savedPassportVisa.visa_type} />
                    <TableRow label="Visa Country" value={bgvData.savedPassportVisa.visa_country} />
                    <TableRow label="Visa Document" value={<DocumentLink url={bgvData.savedPassportVisa.visa_document_url} fileName={bgvData.savedPassportVisa.visa_document_name} label="" />} />
                  </>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Banking Section */}
        {bgvData?.savedBankPfNps && (
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '12px', 
            padding: '24px', 
            marginBottom: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827' }}>
                Banking, PF & NPS Details
              </h2>
              <button
                onClick={() => navigate('/dashboard/documents')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  backgroundColor: '#f3f4f6',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#374151',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                <FiEdit2 size={16} /> Edit
              </button>
            </div>
            
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>Bank Details</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden', marginBottom: '24px' }}>
              <tbody>
                <TableRow label="Account Holder Name" value={bgvData.savedBankPfNps.name_as_per_bank} />
                <TableRow label="Bank Name" value={bgvData.savedBankPfNps.bank_name} />
                <TableRow label="Branch" value={bgvData.savedBankPfNps.branch} />
                <TableRow label="Account Number" value={bgvData.savedBankPfNps.bank_account_number} />
                <TableRow label="IFSC Code" value={bgvData.savedBankPfNps.ifsc_code} />
                <TableRow label="Cancelled Cheque" value={<DocumentLink url={bgvData.savedBankPfNps.cancelled_cheque_url} fileName="Cancelled Cheque" label="" />} />
              </tbody>
            </table>
            
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>PF & NPS Details</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
              <tbody>
                <TableRow label="UAN/PF Number" value={bgvData.savedBankPfNps.uan_pf_number} />
                <TableRow label="PRAN/NPS Number" value={bgvData.savedBankPfNps.pran_nps_number} />
              </tbody>
            </table>
          </div>
        )}

        {/* Digital Signature Section */}
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '12px', 
          padding: '24px', 
          marginBottom: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '20px' }}>
            Digital Signature
          </h2>
          
          {!signatureData ? (
            <div>
              {!showSignature ? (
                <button
                  onClick={() => setShowSignature(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 24px',
                    backgroundColor: '#6366f1',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: '500'
                  }}
                >
                  <FiUpload size={20} /> Upload Signature
                </button>
              ) : (
                <div>
                  <p style={{ marginBottom: '12px', color: '#6b7280' }}>
                    Please upload an image of your signature (JPG, PNG, max 5MB):
                  </p>
                  <div style={{ 
                    border: '2px dashed #d1d5db', 
                    borderRadius: '8px',
                    backgroundColor: '#f9fafb',
                    padding: '40px',
                    textAlign: 'center',
                    cursor: 'pointer'
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  >
                    <FiUpload size={48} style={{ color: '#6b7280', margin: '0 auto 16px' }} />
                    <p style={{ color: '#374151', fontWeight: '500', marginBottom: '8px' }}>
                      Click to upload signature image
                    </p>
                    <p style={{ color: '#6b7280', fontSize: '14px' }}>
                      Supported formats: JPG, PNG, GIF
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      style={{ display: 'none' }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                    <button
                      onClick={() => setShowSignature(false)}
                      style={{
                        padding: '10px 20px',
                        backgroundColor: '#6b7280',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '500'
                      }}
                    >
                      <FiX size={18} style={{ display: 'inline', marginRight: '8px' }} />
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div>
              <p style={{ marginBottom: '12px', color: '#10b981', fontWeight: '500' }}>
                ✓ Signature added successfully
              </p>
              <div style={{ 
                border: '2px solid #10b981', 
                borderRadius: '8px', 
                padding: '12px',
                backgroundColor: '#f0fdf4',
                display: 'inline-block'
              }}>
                <img src={signatureData} alt="Your signature" style={{ maxWidth: '300px', height: 'auto' }} />
              </div>
              <div style={{ marginTop: '12px' }}>
                <button
                  onClick={() => {
                    setSignatureData(null);
                    setShowSignature(true);
                  }}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#f3f4f6',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#374151',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Change Signature
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Declaration */}
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '12px', 
          padding: '24px', 
          marginBottom: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
            Declaration
          </h3>
          <p style={{ color: '#4b5563', lineHeight: '1.6', fontSize: '14px' }}>
           hereby authorize my current/prospective employer and/or any of its subsidiaries or affiliates or partners or vendors, and any person or organizations acting on its behalf, to verify information presented in my employment application and to compile a background report for that purpose. I hereby grant authority to the bearer of this letter to access or be provided with full details of my previous employment record held by any company or business for which I previously worked. This information should include, but not be restricted to, the dates of employment, position held, details of my salary upon departure and an appraisal of my performance, capabilities and character. I hereby release from liability any person or entity requesting or supplying such information.          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ 
          display: 'flex', 
          gap: '16px', 
          justifyContent: 'flex-end',
          marginBottom: '24px'
        }}>
          <button
            onClick={() => navigate('/documents')}
            style={{
              padding: '14px 28px',
              backgroundColor: '#f3f4f6',
              color: '#374151',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '500'
            }}
          >
            Back to Edit
          </button>
          <button
            onClick={handleFinalSubmit}
            disabled={submitting || !signatureData}
            style={{
              padding: '14px 28px',
              backgroundColor: signatureData ? '#6366f1' : '#d1d5db',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: signatureData ? 'pointer' : 'not-allowed',
              fontSize: '16px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {submitting ? (
              <>
                <div className="animate-spin" style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid white',
                  borderTopColor: 'transparent',
                  borderRadius: '50%'
                }} />
                Submitting...
              </>
            ) : (
              <>
                <FiCheck size={20} />
                Submit BGV Form
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

