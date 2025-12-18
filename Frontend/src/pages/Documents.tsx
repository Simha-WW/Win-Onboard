/**
 * Documents Page - BGV (Background Verification) Document Submission
 * Multi-section form for document submission and verification
 */

import { useState, useEffect } from 'react';
import { FiUser, FiHome, FiBook, FiBriefcase, FiCreditCard, FiUpload, FiCheck, FiArrowRight, FiArrowLeft, FiSave } from 'react-icons/fi';

interface BGVSection {
  id: string;
  title: string;
  icon: React.ComponentType;
  completed: boolean;
}

const sections: BGVSection[] = [
  { id: 'demographics', title: 'Demographics', icon: FiUser, completed: false },
  { id: 'personal', title: 'Personal Details', icon: FiHome, completed: false },
  { id: 'education', title: 'Education', icon: FiBook, completed: false },
  { id: 'employment', title: 'Employment History', icon: FiBriefcase, completed: false },
  { id: 'passport', title: 'Passport & Visa', icon: FiCreditCard, completed: false },
  { id: 'banking', title: 'Bank/PF/NPS', icon: FiCreditCard, completed: false },
];

// Utility function to convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data:mime;base64, prefix to get just the base64 string
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
};

export const Documents = () => {
  console.log('BGV Documents component rendering...');
  
  const [activeSection, setActiveSection] = useState(0);
  const [formData, setFormData] = useState({
    demographics: {
      // Basic Information
      salutation: '',
      firstName: '',
      middleName: '',
      lastName: '',
      nameForRecords: '',
      dobAsPerRecords: '',
      celebratedDob: '',
      gender: '',
      bloodGroup: '',
      whatsappNumber: '',
      linkedinUrl: '',
      // Identity & Documents
      aadhaarNumber: '',
      aadhaarFile: null,
      panNumber: '',
      panFile: null,
      resumeFile: null,
      // Address Section
      communicationAddress: {
        houseNo: '',
        streetName: '',
        city: '',
        district: '',
        state: ''
      },
      permanentAddress: {
        houseNo: '',
        streetName: '',
        city: '',
        district: '',
        state: ''
      },
      sameAsCommAddress: false
    },
    personal: {},
    education: {},
    employment: {},
    passport: {},
    banking: {}
  });

  const [touchedFields, setTouchedFields] = useState({});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [prefilledData, setPrefilledData] = useState(null);

  // Fetch user details on component mount
  useEffect(() => {
    const fetchFresherDetails = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        console.log('🔑 Auth token found:', token ? `Yes (${token.substring(0, 20)}...)` : 'No');
        
        if (!token) {
          console.log('⚠️ No authentication token found in localStorage');
          console.log('🔍 Available localStorage keys:', Object.keys(localStorage));
          return;
        }

        console.log('📡 Making API call to /api/bgv/fresher-details...');
        
        const response = await fetch('/api/bgv/fresher-details', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('📊 Response status:', response.status);
        console.log('📊 Response OK:', response.ok);

        if (response.ok) {
          const result = await response.json();
          console.log('📋 Full API response:', result);
          
          if (result.success && result.data) {
            const data = result.data;
            console.log('✅ Fresher details:', data);
            
            // Set the prefilled data state
            setPrefilledData(data);

            // Prepare auto-fill values
            const autoFillValues = {
              firstName: data.firstName || '',
              lastName: data.lastName || '',
              nameForRecords: data.firstName && data.lastName ? `${data.firstName} ${data.lastName}` : '',
              dobAsPerRecords: data.dateOfBirth ? new Date(data.dateOfBirth).toISOString().split('T')[0] : '',
              whatsappNumber: data.phoneNumber || ''
            };

            console.log('🔄 Auto-fill values:', autoFillValues);

            // Update form data
            setFormData(prev => ({
              ...prev,
              demographics: {
                ...prev.demographics,
                ...autoFillValues
              }
            }));

            console.log('🎉 Auto-fill completed!');
            
            // Show success message
            if (data.firstName || data.lastName) {
              console.log(`👤 Welcome back, ${data.firstName} ${data.lastName}! Your details have been auto-filled.`);
            }
          } else {
            console.error('❌ API response not successful:', result);
          }
        } else {
          const errorText = await response.text();
          console.error('❌ API request failed:', response.status, response.statusText, errorText);
        }
      } catch (error) {
        console.error('Error fetching fresher details:', error);
      }
    };

    fetchFresherDetails();
  }, []);

  // Auto-save effect - saves data when form changes (with debouncing)
  useEffect(() => {
    const autoSaveTimeout = setTimeout(() => {
      // Only auto-save if there's meaningful data and user is authenticated
      const token = localStorage.getItem('auth_token');
      const section = sections[activeSection];
      
      if (!token || !section || loading) return;

      // Check if current section has any filled data
      let hasData = false;
      
      if (section.id === 'demographics') {
        const demo = formData.demographics;
        hasData = demo.firstName || demo.lastName || demo.salutation || 
                  demo.middleName || demo.gender || demo.bloodGroup ||
                  demo.whatsappNumber || demo.linkedinUrl || 
                  demo.aadhaarNumber || demo.panNumber ||
                  demo.currentAddress.houseNumber || demo.currentAddress.streetName ||
                  demo.currentAddress.city || demo.currentAddress.state;
      }

      if (hasData) {
        console.log('💾 Auto-saving section:', section.id);
        handleSave();
      }
    }, 3000); // Auto-save after 3 seconds of inactivity

    return () => clearTimeout(autoSaveTimeout);
  }, [formData, activeSection]); // Dependencies: form data and active section

  // Validation functions
  const validateField = (fieldName: string, value: any, formSection: string = 'demographics') => {
    let error = '';

    switch (fieldName) {
      case 'firstName':
      case 'lastName':
        if (!value.trim()) error = 'This field is required';
        else if (!/^[a-zA-Z\s]+$/.test(value)) error = 'Only alphabets are allowed';
        break;
      case 'nameForRecords':
        if (!value.trim()) error = 'Full official name is required';
        break;
      case 'dobAsPerRecords':
      case 'celebratedDob':
        if (!value) error = 'Date is required';
        else if (new Date(value) > new Date()) error = 'Future dates are not allowed';
        break;
      case 'salutation':
      case 'gender':
      case 'bloodGroup':
        if (!value) error = 'Please select an option';
        break;
      case 'whatsappNumber':
        if (!value.trim()) error = 'WhatsApp number is required';
        else if (!/^\+?[\d\s-()]+$/.test(value)) error = 'Invalid phone number format';
        break;
      case 'linkedinUrl':
        if (value && !/^https:\/\/(www\.)?linkedin\.com\/in\//.test(value)) {
          error = 'Please enter a valid LinkedIn profile URL';
        }
        break;
      case 'aadhaarNumber':
        if (!value.trim()) error = 'Aadhaar number is required';
        else if (!/^\d{12}$/.test(value.replace(/\s/g, ''))) error = 'Aadhaar must be 12 digits';
        break;
      case 'panNumber':
        if (!value.trim()) error = 'PAN number is required';
        else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value.toUpperCase())) {
          error = 'Invalid PAN format (e.g., ABCDE1234F)';
        }
        break;
      case 'aadhaarFile':
      case 'panFile':
        if (!value) error = 'Document is required';
        break;
      case 'resumeFile':
        if (!value) error = 'Resume is required';
        break;
      default:
        if (fieldName.includes('Address') && !value?.trim()) {
          error = 'This field is required';
        }
        break;
    }

    return error;
  };

  const handleInputChange = (section: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));

    // Mark field as touched
    setTouchedFields(prev => ({
      ...prev,
      [`${section}.${field}`]: true
    }));

    // Validate and set error
    const error = validateField(field, value, section);
    setErrors(prev => ({
      ...prev,
      [`${section}.${field}`]: error
    }));
  };

  const handleAddressChange = (addressType: 'communicationAddress' | 'permanentAddress', field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      demographics: {
        ...prev.demographics,
        [addressType]: {
          ...prev.demographics[addressType],
          [field]: value
        }
      }
    }));
  };

  const handleSameAddressChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      demographics: {
        ...prev.demographics,
        sameAsCommAddress: checked,
        permanentAddress: checked 
          ? { ...prev.demographics.communicationAddress }
          : {
              houseNo: '',
              streetName: '',
              city: '',
              district: '',
              state: ''
            }
      }
    }));
  };

  const handleFileUpload = (field: string, file: File | null) => {
    if (file) {
      const maxSize = field === 'resumeFile' ? 10 * 1024 * 1024 : 5 * 1024 * 1024; // 10MB for resume, 5MB for documents
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];

      if (file.size > maxSize) {
        setErrors(prev => ({
          ...prev,
          [`demographics.${field}`]: `File size must be less than ${field === 'resumeFile' ? '10MB' : '5MB'}`
        }));
        return;
      }

      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({
          ...prev,
          [`demographics.${field}`]: 'Only PDF, JPG, JPEG, PNG files are allowed'
        }));
        return;
      }
    }

    handleInputChange('demographics', field, file);
  };

  const handleSectionChange = (sectionIndex: number) => {
    setActiveSection(sectionIndex);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const section = sections[activeSection];
      console.log('Saving section:', section.id, formData);

      let apiEndpoint = '';
      let dataToSave = {};

      // Determine which section to save and prepare data
      switch (section.id) {
        case 'demographics':
          apiEndpoint = '/api/bgv/demographics';
          dataToSave = {
            salutation: formData.demographics.salutation,
            first_name: formData.demographics.firstName,
            middle_name: formData.demographics.middleName,
            last_name: formData.demographics.lastName,
            name_for_records: formData.demographics.nameForRecords,
            dob_as_per_records: formData.demographics.dobAsPerRecords,
            celebrated_dob: formData.demographics.celebratedDOB,
            gender: formData.demographics.gender,
            blood_group: formData.demographics.bloodGroup,
            whatsapp_number: formData.demographics.whatsappNumber,
            linkedin_url: formData.demographics.linkedinUrl,
            aadhaar_card_number: formData.demographics.aadhaarNumber,
            pan_card_number: formData.demographics.panNumber,
            comm_house_number: formData.demographics.communicationAddress?.houseNo || '',
            comm_street_name: formData.demographics.communicationAddress?.streetName || '',
            comm_city: formData.demographics.communicationAddress?.city || '',
            comm_district: formData.demographics.communicationAddress?.district || '',
            comm_state: formData.demographics.communicationAddress?.state || '',
            comm_country: formData.demographics.communicationAddress?.country || 'India',
            comm_pin_code: formData.demographics.communicationAddress?.pinCode || '',
            perm_same_as_comm: formData.demographics.permanentSameAsCommunication || false,
            perm_house_number: formData.demographics.permanentAddress?.houseNo || '',
            perm_street_name: formData.demographics.permanentAddress?.streetName || '',
            perm_city: formData.demographics.permanentAddress?.city || '',
            perm_district: formData.demographics.permanentAddress?.district || '',
            perm_state: formData.demographics.permanentAddress?.state || '',
            perm_country: formData.demographics.permanentAddress?.country || 'India',
            perm_pin_code: formData.demographics.permanentAddress?.pinCode || ''
          };
          
          // Handle file uploads by converting to base64
          if (formData.demographics.aadhaarFile) {
            const aadhaarBase64 = await fileToBase64(formData.demographics.aadhaarFile);
            dataToSave.aadhaar_file_data = aadhaarBase64;
            dataToSave.aadhaar_file_name = formData.demographics.aadhaarFile.name;
            dataToSave.aadhaar_file_type = formData.demographics.aadhaarFile.type;
            dataToSave.aadhaar_file_size = formData.demographics.aadhaarFile.size;
          }
          
          if (formData.demographics.panFile) {
            const panBase64 = await fileToBase64(formData.demographics.panFile);
            dataToSave.pan_file_data = panBase64;
            dataToSave.pan_file_name = formData.demographics.panFile.name;
            dataToSave.pan_file_type = formData.demographics.panFile.type;
            dataToSave.pan_file_size = formData.demographics.panFile.size;
          }
          
          if (formData.demographics.resumeFile) {
            const resumeBase64 = await fileToBase64(formData.demographics.resumeFile);
            dataToSave.resume_file_data = resumeBase64;
            dataToSave.resume_file_name = formData.demographics.resumeFile.name;
            dataToSave.resume_file_type = formData.demographics.resumeFile.type;
            dataToSave.resume_file_size = formData.demographics.resumeFile.size;
          }
          break;
        case 'personal':
          apiEndpoint = '/api/bgv/personal';
          dataToSave = formData.personal;
          break;
        case 'education':
          apiEndpoint = '/api/bgv/education';
          dataToSave = formData.education;
          break;
        case 'employment':
          apiEndpoint = '/api/bgv/employment';
          dataToSave = formData.employment;
          break;
        default:
          console.log('No API endpoint for section:', section.id);
          return;
      }

      const response = await fetch(`http://localhost:3000${apiEndpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dataToSave)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to save data');
      }

      console.log('✅ Section saved successfully:', result);
      // Show success message briefly
      const successMessage = document.createElement('div');
      successMessage.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: #4CAF50;
        color: white;
        padding: 12px 20px;
        border-radius: 4px;
        z-index: 1000;
        font-weight: 500;
      `;
      successMessage.textContent = `${section.title} saved successfully!`;
      document.body.appendChild(successMessage);
      setTimeout(() => {
        document.body.removeChild(successMessage);
      }, 3000);

    } catch (error) {
      console.error('Error saving section:', error);
      // Show error message
      const errorMessage = document.createElement('div');
      errorMessage.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: #f44336;
        color: white;
        padding: 12px 20px;
        border-radius: 4px;
        z-index: 1000;
        font-weight: 500;
      `;
      errorMessage.textContent = `Failed to save ${sections[activeSection].title}: ${error.message}`;
      document.body.appendChild(errorMessage);
      setTimeout(() => {
        document.body.removeChild(errorMessage);
      }, 5000);
    }
    setLoading(false);
  };

  const handleNext = async () => {
    await handleSave();
    if (activeSection < sections.length - 1) {
      setActiveSection(activeSection + 1);
    }
  };

  const handlePrevious = () => {
    if (activeSection > 0) {
      setActiveSection(activeSection - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      console.log('Submitting BGV form:', formData);

      // First, save current section if not saved
      await handleSave();

      // Submit the entire BGV form
      const response = await fetch('http://localhost:3000/api/bgv/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: 'submitted',
          completed_sections: sections.map(s => s.id)
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to submit BGV form');
      }

      console.log('✅ BGV form submitted successfully:', result);
      
      // Show success message
      const successMessage = document.createElement('div');
      successMessage.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: #4CAF50;
        color: white;
        padding: 20px 30px;
        border-radius: 8px;
        z-index: 1000;
        font-weight: 500;
        font-size: 16px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      `;
      successMessage.innerHTML = `
        <div style="text-align: center;">
          <div style="font-size: 24px; margin-bottom: 8px;">🎉</div>
          <div>BGV Form Submitted Successfully!</div>
          <div style="font-size: 14px; margin-top: 8px; opacity: 0.9;">Your submission is now under review</div>
        </div>
      `;
      document.body.appendChild(successMessage);
      
      setTimeout(() => {
        document.body.removeChild(successMessage);
        // Optionally redirect to a confirmation page
        // window.location.href = '/bgv-confirmation';
      }, 4000);

    } catch (error) {
      console.error('Error submitting BGV form:', error);
      
      // Show error message
      const errorMessage = document.createElement('div');
      errorMessage.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: #f44336;
        color: white;
        padding: 12px 20px;
        border-radius: 4px;
        z-index: 1000;
        font-weight: 500;
      `;
      errorMessage.textContent = `Failed to submit BGV form: ${error.message}`;
      document.body.appendChild(errorMessage);
      setTimeout(() => {
        if (document.body.contains(errorMessage)) {
          document.body.removeChild(errorMessage);
        }
      }, 5000);
    }
    setLoading(false);
  };

  const renderSectionContent = () => {
    const section = sections[activeSection];
    
    switch (section.id) {
      case 'demographics':
        return (
          <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ color: '#1f2937', marginBottom: '30px', fontSize: '24px', fontWeight: '600' }}>
              Demographics – Personal Details
            </h2>

            {/* Basic Information Section */}
            <div style={{ marginBottom: '40px' }}>
              <h3 style={{ color: '#374151', marginBottom: '20px', fontSize: '18px', fontWeight: '500', borderBottom: '2px solid #e5e7eb', paddingBottom: '8px' }}>
                Basic Information
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                
                {/* Salutation */}
                <div>
                  <label style={{ display: 'block', color: '#374151', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                    Salutation *
                  </label>
                  <select
                    value={formData.demographics.salutation}
                    onChange={(e) => handleInputChange('demographics', 'salutation', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: `1px solid ${errors['demographics.salutation'] ? '#ef4444' : '#d1d5db'}`,
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="">Select Salutation</option>
                    <option value="Mr">Mr</option>
                    <option value="Ms">Ms</option>
                    <option value="Mrs">Mrs</option>
                    <option value="Dr">Dr</option>
                  </select>
                  {errors['demographics.salutation'] && (
                    <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                      {errors['demographics.salutation']}
                    </span>
                  )}
                </div>

                {/* First Name */}
                <div>
                  <label style={{ display: 'block', color: '#374151', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                    First Name * {prefilledData && <span style={{ color: '#059669', fontSize: '12px' }}>(Auto-filled)</span>}
                  </label>
                  <input
                    type="text"
                    value={formData.demographics.firstName}
                    onChange={(e) => handleInputChange('demographics', 'firstName', e.target.value)}
                    placeholder="Enter first name"
                    readOnly={!!prefilledData?.firstName}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: `1px solid ${errors['demographics.firstName'] ? '#ef4444' : '#d1d5db'}`,
                      borderRadius: '8px',
                      fontSize: '14px',
                      backgroundColor: prefilledData?.firstName ? '#f9fafb' : 'white',
                      cursor: prefilledData?.firstName ? 'not-allowed' : 'text'
                    }}
                  />
                  {errors['demographics.firstName'] && (
                    <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                      {errors['demographics.firstName']}
                    </span>
                  )}
                </div>

                {/* Middle Name */}
                <div>
                  <label style={{ display: 'block', color: '#374151', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                    Middle Name
                  </label>
                  <input
                    type="text"
                    value={formData.demographics.middleName}
                    onChange={(e) => handleInputChange('demographics', 'middleName', e.target.value)}
                    placeholder="Enter middle name (optional)"
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                {/* Last Name */}
                <div>
                  <label style={{ display: 'block', color: '#374151', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                    Last Name * {prefilledData && <span style={{ color: '#059669', fontSize: '12px' }}>(Auto-filled)</span>}
                  </label>
                  <input
                    type="text"
                    value={formData.demographics.lastName}
                    onChange={(e) => handleInputChange('demographics', 'lastName', e.target.value)}
                    placeholder="Enter last name"
                    readOnly={!!prefilledData?.lastName}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: `1px solid ${errors['demographics.lastName'] ? '#ef4444' : '#d1d5db'}`,
                      borderRadius: '8px',
                      fontSize: '14px',
                      backgroundColor: prefilledData?.lastName ? '#f9fafb' : 'white',
                      cursor: prefilledData?.lastName ? 'not-allowed' : 'text'
                    }}
                  />
                  {errors['demographics.lastName'] && (
                    <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                      {errors['demographics.lastName']}
                    </span>
                  )}
                </div>

                {/* Name for Records */}
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', color: '#374151', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                    Name for Records * {prefilledData && <span style={{ color: '#059669', fontSize: '12px' }}>(Auto-filled)</span>}
                  </label>
                  <input
                    type="text"
                    value={formData.demographics.nameForRecords}
                    onChange={(e) => handleInputChange('demographics', 'nameForRecords', e.target.value)}
                    placeholder="Enter full official name"
                    readOnly={!!(prefilledData?.firstName && prefilledData?.lastName)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: `1px solid ${errors['demographics.nameForRecords'] ? '#ef4444' : '#d1d5db'}`,
                      borderRadius: '8px',
                      fontSize: '14px',
                      backgroundColor: (prefilledData?.firstName && prefilledData?.lastName) ? '#f9fafb' : 'white',
                      cursor: (prefilledData?.firstName && prefilledData?.lastName) ? 'not-allowed' : 'text'
                    }}
                  />
                  {errors['demographics.nameForRecords'] && (
                    <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                      {errors['demographics.nameForRecords']}
                    </span>
                  )}
                </div>

                {/* DOB as per Records */}
                <div>
                  <label style={{ display: 'block', color: '#374151', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                    DOB as per Records * {prefilledData?.dateOfBirth && <span style={{ color: '#059669', fontSize: '12px' }}>(Auto-filled)</span>}
                  </label>
                  <input
                    type="date"
                    value={formData.demographics.dobAsPerRecords}
                    onChange={(e) => handleInputChange('demographics', 'dobAsPerRecords', e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    readOnly={!!prefilledData?.dateOfBirth}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: `1px solid ${errors['demographics.dobAsPerRecords'] ? '#ef4444' : '#d1d5db'}`,
                      borderRadius: '8px',
                      fontSize: '14px',
                      backgroundColor: prefilledData?.dateOfBirth ? '#f9fafb' : 'white',
                      cursor: prefilledData?.dateOfBirth ? 'not-allowed' : 'text'
                    }}
                  />
                  {errors['demographics.dobAsPerRecords'] && (
                    <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                      {errors['demographics.dobAsPerRecords']}
                    </span>
                  )}
                </div>

                {/* Celebrated DOB */}
                <div>
                  <label style={{ display: 'block', color: '#374151', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                    Celebrated DOB *
                  </label>
                  <input
                    type="date"
                    value={formData.demographics.celebratedDob}
                    onChange={(e) => handleInputChange('demographics', 'celebratedDob', e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: `1px solid ${errors['demographics.celebratedDob'] ? '#ef4444' : '#d1d5db'}`,
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                  {errors['demographics.celebratedDob'] && (
                    <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                      {errors['demographics.celebratedDob']}
                    </span>
                  )}
                </div>

                {/* Gender */}
                <div>
                  <label style={{ display: 'block', color: '#374151', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                    Gender * {prefilledData?.gender && <span style={{ color: '#059669', fontSize: '12px' }}>(Auto-filled)</span>}
                  </label>
                  <select
                    value={formData.demographics.gender}
                    onChange={(e) => handleInputChange('demographics', 'gender', e.target.value)}
                    disabled={!!prefilledData?.gender}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: `1px solid ${errors['demographics.gender'] ? '#ef4444' : '#d1d5db'}`,
                      borderRadius: '8px',
                      fontSize: '14px',
                      backgroundColor: prefilledData?.gender ? '#f9fafb' : 'white',
                      cursor: prefilledData?.gender ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                  {errors['demographics.gender'] && (
                    <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                      {errors['demographics.gender']}
                    </span>
                  )}
                </div>

                {/* Blood Group */}
                <div>
                  <label style={{ display: 'block', color: '#374151', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                    Blood Group *
                  </label>
                  <select
                    value={formData.demographics.bloodGroup}
                    onChange={(e) => handleInputChange('demographics', 'bloodGroup', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: `1px solid ${errors['demographics.bloodGroup'] ? '#ef4444' : '#d1d5db'}`,
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="">Select Blood Group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                  {errors['demographics.bloodGroup'] && (
                    <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                      {errors['demographics.bloodGroup']}
                    </span>
                  )}
                </div>

                {/* WhatsApp Number */}
                <div>
                  <label style={{ display: 'block', color: '#374151', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                    WhatsApp Number * {prefilledData?.phoneNumber && <span style={{ color: '#059669', fontSize: '12px' }}>(Auto-filled)</span>}
                  </label>
                  <input
                    type="tel"
                    value={formData.demographics.whatsappNumber}
                    onChange={(e) => handleInputChange('demographics', 'whatsappNumber', e.target.value)}
                    placeholder="+91 1234567890"
                    readOnly={!!(prefilledData?.phoneNumber && prefilledData.phoneNumber !== null && prefilledData.phoneNumber !== '')}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: `1px solid ${errors['demographics.whatsappNumber'] ? '#ef4444' : '#d1d5db'}`,
                      borderRadius: '8px',
                      fontSize: '14px',
                      backgroundColor: (prefilledData?.phoneNumber && prefilledData.phoneNumber !== null && prefilledData.phoneNumber !== '') ? '#f9fafb' : 'white',
                      cursor: (prefilledData?.phoneNumber && prefilledData.phoneNumber !== null && prefilledData.phoneNumber !== '') ? 'not-allowed' : 'text'
                    }}
                  />
                  {errors['demographics.whatsappNumber'] && (
                    <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                      {errors['demographics.whatsappNumber']}
                    </span>
                  )}
                </div>

                {/* LinkedIn URL */}
                <div>
                  <label style={{ display: 'block', color: '#374151', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                    LinkedIn URL
                  </label>
                  <input
                    type="url"
                    value={formData.demographics.linkedinUrl}
                    onChange={(e) => handleInputChange('demographics', 'linkedinUrl', e.target.value)}
                    placeholder="https://www.linkedin.com/in/yourprofile"
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: `1px solid ${errors['demographics.linkedinUrl'] ? '#ef4444' : '#d1d5db'}`,
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                  {errors['demographics.linkedinUrl'] && (
                    <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                      {errors['demographics.linkedinUrl']}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Identity & Documents Section */}
            <div style={{ marginBottom: '40px' }}>
              <h3 style={{ color: '#374151', marginBottom: '20px', fontSize: '18px', fontWeight: '500', borderBottom: '2px solid #e5e7eb', paddingBottom: '8px' }}>
                Identity & Documents
              </h3>

              {/* Aadhaar Details */}
              <div style={{ marginBottom: '30px' }}>
                <h4 style={{ color: '#6b7280', marginBottom: '15px', fontSize: '16px', fontWeight: '500' }}>
                  Aadhaar Details
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', color: '#374151', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                      Aadhaar Card Number *
                    </label>
                    <input
                      type="text"
                      value={formData.demographics.aadhaarNumber}
                      onChange={(e) => handleInputChange('demographics', 'aadhaarNumber', e.target.value)}
                      placeholder="1234 5678 9012"
                      maxLength="14"
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: `1px solid ${errors['demographics.aadhaarNumber'] ? '#ef4444' : '#d1d5db'}`,
                        borderRadius: '8px',
                        fontSize: '14px'
                      }}
                    />
                    {errors['demographics.aadhaarNumber'] && (
                      <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                        {errors['demographics.aadhaarNumber']}
                      </span>
                    )}
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#374151', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                      Aadhaar File *
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileUpload('aadhaarFile', e.target.files?.[0] || null)}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: `1px solid ${errors['demographics.aadhaarFile'] ? '#ef4444' : '#d1d5db'}`,
                        borderRadius: '8px',
                        fontSize: '14px'
                      }}
                    />
                    {formData.demographics.aadhaarFile && (
                      <span style={{ color: '#059669', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                        ✓ {formData.demographics.aadhaarFile.name}
                      </span>
                    )}
                    {errors['demographics.aadhaarFile'] && (
                      <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                        {errors['demographics.aadhaarFile']}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* PAN Details */}
              <div style={{ marginBottom: '30px' }}>
                <h4 style={{ color: '#6b7280', marginBottom: '15px', fontSize: '16px', fontWeight: '500' }}>
                  PAN Details
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', color: '#374151', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                      PAN Card Number *
                    </label>
                    <input
                      type="text"
                      value={formData.demographics.panNumber}
                      onChange={(e) => handleInputChange('demographics', 'panNumber', e.target.value.toUpperCase())}
                      placeholder="ABCDE1234F"
                      maxLength="10"
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: `1px solid ${errors['demographics.panNumber'] ? '#ef4444' : '#d1d5db'}`,
                        borderRadius: '8px',
                        fontSize: '14px',
                        textTransform: 'uppercase'
                      }}
                    />
                    {errors['demographics.panNumber'] && (
                      <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                        {errors['demographics.panNumber']}
                      </span>
                    )}
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#374151', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                      PAN File *
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileUpload('panFile', e.target.files?.[0] || null)}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: `1px solid ${errors['demographics.panFile'] ? '#ef4444' : '#d1d5db'}`,
                        borderRadius: '8px',
                        fontSize: '14px'
                      }}
                    />
                    {formData.demographics.panFile && (
                      <span style={{ color: '#059669', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                        ✓ {formData.demographics.panFile.name}
                      </span>
                    )}
                    {errors['demographics.panFile'] && (
                      <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                        {errors['demographics.panFile']}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Resume */}
              <div style={{ marginBottom: '30px' }}>
                <h4 style={{ color: '#6b7280', marginBottom: '15px', fontSize: '16px', fontWeight: '500' }}>
                  Resume
                </h4>
                <div>
                  <label style={{ display: 'block', color: '#374151', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                    Resume File *
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileUpload('resumeFile', e.target.files?.[0] || null)}
                    style={{
                      width: '100%',
                      maxWidth: '400px',
                      padding: '10px',
                      border: `1px solid ${errors['demographics.resumeFile'] ? '#ef4444' : '#d1d5db'}`,
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                  <p style={{ color: '#6b7280', fontSize: '12px', marginTop: '4px' }}>
                    Max file size: 10MB. Allowed formats: PDF, JPG, JPEG, PNG
                  </p>
                  {formData.demographics.resumeFile && (
                    <span style={{ color: '#059669', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                      ✓ {formData.demographics.resumeFile.name}
                    </span>
                  )}
                  {errors['demographics.resumeFile'] && (
                    <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                      {errors['demographics.resumeFile']}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Address Section */}
            <div style={{ marginBottom: '40px' }}>
              <h3 style={{ color: '#374151', marginBottom: '20px', fontSize: '18px', fontWeight: '500', borderBottom: '2px solid #e5e7eb', paddingBottom: '8px' }}>
                Address Information
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
                {/* Communication Address */}
                <div>
                  <h4 style={{ color: '#6b7280', marginBottom: '15px', fontSize: '16px', fontWeight: '500' }}>
                    Communication Address
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', color: '#374151', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                        H.No / Flat No *
                      </label>
                      <input
                        type="text"
                        value={formData.demographics.communicationAddress.houseNo}
                        onChange={(e) => handleAddressChange('communicationAddress', 'houseNo', e.target.value)}
                        placeholder="Enter house/flat number"
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px',
                          fontSize: '14px'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', color: '#374151', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                        Street Name & Landmark *
                      </label>
                      <input
                        type="text"
                        value={formData.demographics.communicationAddress.streetName}
                        onChange={(e) => handleAddressChange('communicationAddress', 'streetName', e.target.value)}
                        placeholder="Enter street name & landmark"
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px',
                          fontSize: '14px'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', color: '#374151', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                        City / Town / Village *
                      </label>
                      <input
                        type="text"
                        value={formData.demographics.communicationAddress.city}
                        onChange={(e) => handleAddressChange('communicationAddress', 'city', e.target.value)}
                        placeholder="Enter city/town/village"
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px',
                          fontSize: '14px'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', color: '#374151', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                        District *
                      </label>
                      <input
                        type="text"
                        value={formData.demographics.communicationAddress.district}
                        onChange={(e) => handleAddressChange('communicationAddress', 'district', e.target.value)}
                        placeholder="Enter district"
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px',
                          fontSize: '14px'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', color: '#374151', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                        State *
                      </label>
                      <input
                        type="text"
                        value={formData.demographics.communicationAddress.state}
                        onChange={(e) => handleAddressChange('communicationAddress', 'state', e.target.value)}
                        placeholder="Enter state"
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px',
                          fontSize: '14px'
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Permanent Address */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px', gap: '10px' }}>
                    <input
                      type="checkbox"
                      id="sameAddress"
                      checked={formData.demographics.sameAsCommAddress}
                      onChange={(e) => handleSameAddressChange(e.target.checked)}
                      style={{ width: '16px', height: '16px' }}
                    />
                    <label htmlFor="sameAddress" style={{ color: '#374151', fontSize: '14px', fontWeight: '500' }}>
                      Check if permanent address is same as communication address
                    </label>
                  </div>

                  <h4 style={{ color: '#6b7280', marginBottom: '15px', fontSize: '16px', fontWeight: '500' }}>
                    Permanent Address
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', color: '#374151', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                        H.No / Flat No *
                      </label>
                      <input
                        type="text"
                        value={formData.demographics.permanentAddress.houseNo}
                        onChange={(e) => handleAddressChange('permanentAddress', 'houseNo', e.target.value)}
                        disabled={formData.demographics.sameAsCommAddress}
                        placeholder="Enter house/flat number"
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px',
                          fontSize: '14px',
                          backgroundColor: formData.demographics.sameAsCommAddress ? '#f9fafb' : 'white'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', color: '#374151', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                        Street Name & Landmark *
                      </label>
                      <input
                        type="text"
                        value={formData.demographics.permanentAddress.streetName}
                        onChange={(e) => handleAddressChange('permanentAddress', 'streetName', e.target.value)}
                        disabled={formData.demographics.sameAsCommAddress}
                        placeholder="Enter street name & landmark"
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px',
                          fontSize: '14px',
                          backgroundColor: formData.demographics.sameAsCommAddress ? '#f9fafb' : 'white'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', color: '#374151', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                        City / Town / Village *
                      </label>
                      <input
                        type="text"
                        value={formData.demographics.permanentAddress.city}
                        onChange={(e) => handleAddressChange('permanentAddress', 'city', e.target.value)}
                        disabled={formData.demographics.sameAsCommAddress}
                        placeholder="Enter city/town/village"
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px',
                          fontSize: '14px',
                          backgroundColor: formData.demographics.sameAsCommAddress ? '#f9fafb' : 'white'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', color: '#374151', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                        District *
                      </label>
                      <input
                        type="text"
                        value={formData.demographics.permanentAddress.district}
                        onChange={(e) => handleAddressChange('permanentAddress', 'district', e.target.value)}
                        disabled={formData.demographics.sameAsCommAddress}
                        placeholder="Enter district"
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px',
                          fontSize: '14px',
                          backgroundColor: formData.demographics.sameAsCommAddress ? '#f9fafb' : 'white'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', color: '#374151', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                        State *
                      </label>
                      <input
                        type="text"
                        value={formData.demographics.permanentAddress.state}
                        onChange={(e) => handleAddressChange('permanentAddress', 'state', e.target.value)}
                        disabled={formData.demographics.sameAsCommAddress}
                        placeholder="Enter state"
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px',
                          fontSize: '14px',
                          backgroundColor: formData.demographics.sameAsCommAddress ? '#f9fafb' : 'white'
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'personal':
        return (
          <div style={{ padding: '20px' }}>
            <h3 style={{ color: 'black', marginBottom: '20px', fontSize: '20px' }}>Personal Information</h3>
            <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '20px' }}>
              Complete your personal details and emergency contact information.
            </p>
          </div>
        );

      case 'education':
        return (
          <div style={{ padding: '20px' }}>
            <h3 style={{ color: 'black', marginBottom: '20px', fontSize: '20px' }}>Educational Background</h3>
            <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '20px' }}>
              Provide details about your educational qualifications and upload relevant documents.
            </p>
          </div>
        );

      case 'employment':
        return (
          <div style={{ padding: '20px' }}>
            <h3 style={{ color: 'black', marginBottom: '20px', fontSize: '20px' }}>Employment History</h3>
            <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '20px' }}>
              Share your previous work experience and employment details.
            </p>
          </div>
        );

      case 'passport':
        return (
          <div style={{ padding: '20px' }}>
            <h3 style={{ color: 'black', marginBottom: '20px', fontSize: '20px' }}>Passport & Visa Information</h3>
            <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '20px' }}>
              Upload your passport and visa documents for identity verification.
            </p>
          </div>
        );

      case 'banking':
        return (
          <div style={{ padding: '20px' }}>
            <h3 style={{ color: 'black', marginBottom: '20px', fontSize: '20px' }}>Banking & Financial Information</h3>
            <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '20px' }}>
              Provide your banking details for salary processing and PF information.
            </p>
          </div>
        );

      default:
        return <div>Section not implemented</div>;
    }
  };

  const isLastSection = activeSection === sections.length - 1;

  return (
    <div style={{ padding: '20px', backgroundColor: 'white', minHeight: '500px' }}>
      <h1 style={{ color: 'black', fontSize: '28px', marginBottom: '20px', fontWeight: 'bold' }}>
        📄 Document Submission (BGV)
      </h1>
      
      <p style={{ color: '#6b7280', fontSize: '16px', marginBottom: '30px' }}>
        Complete your background verification by submitting all required documents and information.
      </p>

      {/* Section Navigation */}
      <div style={{ 
        display: 'flex', 
        overflowX: 'auto', 
        marginBottom: '30px',
        padding: '10px',
        backgroundColor: '#f8f9fa',
        borderRadius: '12px',
        gap: '8px'
      }}>
        {sections.map((section, index) => (
          <div
            key={section.id}
            onClick={() => handleSectionChange(index)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              backgroundColor: activeSection === index ? '#3b82f6' : 'transparent',
              color: activeSection === index ? 'white' : '#6b7280',
              transition: 'all 0.2s ease',
              minWidth: '150px',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            <section.icon />
            <span>{section.title}</span>
            {section.completed && (
              <FiCheck style={{ 
                backgroundColor: '#10b981', 
                borderRadius: '50%', 
                padding: '2px',
                width: '16px',
                height: '16px' 
              }} />
            )}
          </div>
        ))}
      </div>

      {/* Section Content */}
      <div style={{
        backgroundColor: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        marginBottom: '20px',
        minHeight: '400px'
      }}>
        {renderSectionContent()}
      </div>

      {/* Navigation Buttons */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        paddingTop: '20px',
        borderTop: '1px solid #e5e7eb'
      }}>
        <button
          onClick={handlePrevious}
          disabled={activeSection === 0}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 20px',
            backgroundColor: activeSection === 0 ? '#f3f4f6' : '#6b7280',
            color: activeSection === 0 ? '#9ca3af' : 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: activeSection === 0 ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <FiArrowLeft />
          Previous
        </button>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleSave}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'all 0.2s ease'
            }}
          >
            <FiSave />
            {loading ? 'Saving...' : 'Save'}
          </button>

          {isLastSection ? (
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                backgroundColor: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                transition: 'all 0.2s ease'
              }}
            >
              <FiCheck />
              {loading ? 'Submitting...' : 'Submit BGV'}
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={loading}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                transition: 'all 0.2s ease'
              }}
            >
              {loading ? 'Saving...' : 'Next'}
              <FiArrowRight />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};