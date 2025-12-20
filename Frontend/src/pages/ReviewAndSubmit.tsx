import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCheck, FiX, FiEdit2, FiFileText, FiUpload } from 'react-icons/fi';

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

      const response = await fetch('http://localhost:3000/api/bgv/submission', {
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
      
      const response = await fetch('http://localhost:3000/api/bgv/final-submit', {
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              <DataField label="Full Name" value={`${bgvData.savedDemographics.first_name || ''} ${bgvData.savedDemographics.middle_name || ''} ${bgvData.savedDemographics.last_name || ''}`.trim()} />
              <DataField label="Date of Birth" value={bgvData.savedDemographics.dob_as_per_records} />
              <DataField label="Gender" value={bgvData.savedDemographics.gender} />
              <DataField label="Blood Group" value={bgvData.savedDemographics.blood_group} />
              <DataField label="WhatsApp Number" value={bgvData.savedDemographics.whatsapp_number} />
              <DataField label="LinkedIn" value={bgvData.savedDemographics.linkedin_url} />
              <DataField label="PAN Number" value={bgvData.savedDemographics.pan_number} />
              <DataField label="Aadhaar Number" value={bgvData.savedDemographics.aadhaar_number} />
            </div>
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
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '20px' }}>
              Personal Details
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              <DataField label="Marital Status" value={bgvData.savedPersonal.marital_status} />
              <DataField label="Number of Children" value={bgvData.savedPersonal.num_children?.toString() || '0'} />
              <DataField label="Father's Name" value={bgvData.savedPersonal.father_name} />
              <DataField label="Mother's Name" value={bgvData.savedPersonal.mother_name} />
            </div>
          </div>
        )}

        {/* Education Section */}
        {bgvData?.savedEducation && bgvData.savedEducation.length > 0 && (
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '12px', 
            padding: '24px', 
            marginBottom: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '20px' }}>
              Education
            </h2>
            {bgvData.savedEducation.map((edu: any, index: number) => (
              <div key={index} style={{ 
                padding: '16px', 
                backgroundColor: '#f9fafb', 
                borderRadius: '8px',
                marginBottom: index < bgvData.savedEducation.length - 1 ? '12px' : '0'
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                  <DataField label="Qualification" value={edu.qualification} />
                  <DataField label="University/Institution" value={edu.university_institution} />
                  <DataField label="CGPA/Percentage" value={edu.cgpa_percentage} />
                  <DataField label="Year of Passing" value={edu.year_of_passing?.toString()} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Employment Section */}
        {bgvData?.savedEmployment && bgvData.savedEmployment.length > 0 && (
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '12px', 
            padding: '24px', 
            marginBottom: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '20px' }}>
              Employment History
            </h2>
            {bgvData.savedEmployment.map((emp: any, index: number) => (
              <div key={index} style={{ 
                padding: '16px', 
                backgroundColor: '#f9fafb', 
                borderRadius: '8px',
                marginBottom: index < bgvData.savedEmployment.length - 1 ? '12px' : '0'
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                  <DataField label="Company" value={emp.company_name} />
                  <DataField label="Designation" value={emp.designation} />
                  <DataField label="Duration" value={`${emp.from_date} to ${emp.to_date || 'Present'}`} />
                </div>
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
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '20px' }}>
              Passport & Visa
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              <DataField label="Has Passport" value={bgvData.savedPassportVisa.has_passport ? 'Yes' : 'No'} />
              {bgvData.savedPassportVisa.has_passport && (
                <>
                  <DataField label="Passport Number" value={bgvData.savedPassportVisa.passport_number} />
                  <DataField label="Issue Date" value={bgvData.savedPassportVisa.passport_issue_date} />
                  <DataField label="Expiry Date" value={bgvData.savedPassportVisa.passport_expiry_date} />
                </>
              )}
              <DataField label="Has Visa" value={bgvData.savedPassportVisa.has_visa ? 'Yes' : 'No'} />
            </div>
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
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '20px' }}>
              Banking & PF Details
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              <DataField label="Bank Name" value={bgvData.savedBankPfNps.bank_name} />
              <DataField label="Branch" value={bgvData.savedBankPfNps.branch} />
              <DataField label="Account Number" value={bgvData.savedBankPfNps.bank_account_number} />
              <DataField label="IFSC Code" value={bgvData.savedBankPfNps.ifsc_code} />
              <DataField label="Account Holder Name" value={bgvData.savedBankPfNps.name_as_per_bank} />
            </div>
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

// Helper component for displaying data fields
const DataField = ({ label, value }: { label: string; value: string | null | undefined }) => (
  <div>
    <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', fontWeight: '500' }}>
      {label}
    </p>
    <p style={{ fontSize: '14px', color: '#111827', fontWeight: '500' }}>
      {value || 'N/A'}
    </p>
  </div>
);
