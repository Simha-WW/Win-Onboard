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
    personal: {
      maritalStatus: '',
      noOfChildren: '',
      fatherName: '',
      fatherDob: '',
      fatherDeceased: false,
      motherName: '',
      motherDob: '',
      motherDeceased: false,
      emergencyContacts: [{ name: '', mobile: '', relationship: '' }]
    },
    education: {
      qualifications: [{
        qualification: '',
        university_institution: '',
        cgpa_percentage: '',
        year_of_passing: '',
        documents: []
      }],
      additionalQualifications: []
    },
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
    const fetchBGVData = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        console.log('🔑 Auth token found:', token ? `Yes (${token.substring(0, 20)}...)` : 'No');
        
        if (!token) {
          console.log('⚠️ No authentication token found in localStorage');
          console.log('🔍 Available localStorage keys:', Object.keys(localStorage));
          return;
        }

        console.log('📡 Making API call to /api/bgv/submission...');
        
        const response = await fetch('http://localhost:3000/api/bgv/submission', {
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
          console.log('📋 Full BGV API response:', result);
          
          if (result.success) {
            // Handle prefilled data from user profile
            if (result.prefilledData) {
              const data = result.prefilledData;
              console.log('✅ Prefilled data:', data);
              setPrefilledData(data);
            }

            // Handle saved BGV demographics data
            if (result.savedDemographics) {
              const saved = result.savedDemographics;
              console.log('📋 Saved demographics found:', saved);
              
              // Map the saved data to form structure
              const savedFormData = {
                salutation: saved.salutation || '',
                firstName: saved.first_name || '',
                middleName: saved.middle_name || '',
                lastName: saved.last_name || '',
                nameForRecords: saved.name_for_records || '',
                dobAsPerRecords: saved.dob_as_per_records ? new Date(saved.dob_as_per_records).toISOString().split('T')[0] : '',
                celebratedDob: saved.celebrated_dob ? new Date(saved.celebrated_dob).toISOString().split('T')[0] : '',
                gender: saved.gender || '',
                bloodGroup: saved.blood_group || '',
                whatsappNumber: saved.whatsapp_number || '',
                linkedinUrl: saved.linkedin_url || '',
                aadhaarNumber: saved.aadhaar_card_number || '',
                panNumber: saved.pan_card_number || '',
                // File upload information (create file-like objects to show upload status)
                aadhaarFile: saved.aadhaar_file_name ? { 
                  name: saved.aadhaar_file_name, 
                  type: saved.aadhaar_file_type, 
                  size: saved.aadhaar_file_size,
                  uploaded: true 
                } : null,
                panFile: saved.pan_file_name ? { 
                  name: saved.pan_file_name, 
                  type: saved.pan_file_type, 
                  size: saved.pan_file_size,
                  uploaded: true 
                } : null,
                resumeFile: saved.resume_file_name ? { 
                  name: saved.resume_file_name, 
                  type: saved.resume_file_type, 
                  size: saved.resume_file_size,
                  uploaded: true 
                } : null,
                // Address Information (matching the form structure)
                communicationAddress: {
                  houseNo: saved.comm_house_number || '',
                  streetName: saved.comm_street_name || '',
                  city: saved.comm_city || '',
                  district: saved.comm_district || '',
                  state: saved.comm_state || ''
                },
                permanentAddress: {
                  houseNo: saved.perm_house_number || '',
                  streetName: saved.perm_street_name || '',
                  city: saved.perm_city || '',
                  district: saved.perm_district || '',
                  state: saved.perm_state || ''
                },
                sameAsCommAddress: saved.perm_same_as_comm || false
              };

              // Update form data with saved data
              setFormData(prev => ({
                ...prev,
                demographics: {
                  ...prev.demographics,
                  ...savedFormData
                }
              }));

              console.log('✅ Form populated with saved data');
            }

            // Handle saved personal data
            if (result.savedPersonal) {
              const saved = result.savedPersonal;
              console.log('📋 Saved personal found:', saved);
              console.log('📋 Emergency contacts from DB:', saved.emergency_contacts);
              console.log('📋 Emergency contacts type:', typeof saved.emergency_contacts);
              console.log('📋 Emergency contacts is array?', Array.isArray(saved.emergency_contacts));

              // Map backend field names to frontend field names
              const emergencyContacts = saved.emergency_contacts && Array.isArray(saved.emergency_contacts) && saved.emergency_contacts.length > 0 
                ? saved.emergency_contacts.map(contact => ({
                    name: contact.contact_person_name || contact.name || '',
                    mobile: contact.mobile || '',
                    relationship: contact.relationship || ''
                  }))
                : [{ name: '', mobile: '', relationship: '' }];

              console.log('📋 Setting emergency contacts to:', emergencyContacts);
              console.log('📋 First contact details:', emergencyContacts[0]);

              setFormData(prev => {
                const newData = {
                  ...prev,
                  personal: {
                    maritalStatus: saved.marital_status || '',
                    noOfChildren: saved.num_children || '',
                    fatherName: saved.father_name || '',
                    fatherDob: saved.father_dob ? new Date(saved.father_dob).toISOString().split('T')[0] : '',
                    fatherDeceased: saved.father_deceased || false,
                    motherName: saved.mother_name || '',
                    motherDob: saved.mother_dob ? new Date(saved.mother_dob).toISOString().split('T')[0] : '',
                    motherDeceased: saved.mother_deceased || false,
                    emergencyContacts: emergencyContacts
                  }
                };
                console.log('📋 New form data after personal update:', newData);
                return newData;
              });

              console.log('✅ Form populated with saved personal data');
              console.log('✅ Emergency contacts loaded:', emergencyContacts);
            }

            // Handle saved education data
            if (result.savedEducation) {
              const saved = result.savedEducation;
              console.log('📋 Saved education found:', saved);
              console.log('📋 Educational qualifications:', saved.educationalQualifications);
              console.log('📋 Additional qualifications:', saved.additionalQualifications);

              const educationalQualifications = saved.educationalQualifications && saved.educationalQualifications.length > 0
                ? saved.educationalQualifications 
                : [{
                    qualification: '',
                    university_institution: '',
                    cgpa_percentage: '',
                    year_of_passing: '',
                    documents: []
                  }];

              console.log('📋 Setting qualifications to:', educationalQualifications);
              console.log('📋 First qualification details:', educationalQualifications[0]);

              setFormData(prev => {
                const newData = {
                  ...prev,
                  education: {
                    qualifications: educationalQualifications,
                    additionalQualifications: saved.additionalQualifications || []
                  }
                };
                console.log('📋 New form data after education update:', newData);
                return newData;
              });

              console.log('✅ Form populated with saved education data');
            }

            if (result.prefilledData && !result.savedDemographics) {
              // Only use prefilled data if no saved data exists
              const data = result.prefilledData;
              const autoFillValues = {
                firstName: data.first_name || '',
                lastName: data.last_name || '',
                nameForRecords: data.first_name && data.last_name ? `${data.first_name} ${data.last_name}` : ''
              };

              setFormData(prev => ({
                ...prev,
                demographics: {
                  ...prev.demographics,
                  ...autoFillValues
                }
              }));

              console.log('✅ Form populated with prefilled data');
            }
          } else {
            console.error('❌ API response not successful:', result);
          }
        } else {
          const errorText = await response.text();
          console.error('❌ API request failed:', response.status, response.statusText, errorText);
        }
      } catch (error) {
        console.error('Error fetching BGV data:', error);
      }
    };

    fetchBGVData();
  }, []);

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

  // Validate personal section
  const validatePersonalSection = () => {
    const errors = [];

    // Marital Status is required
    if (!formData.personal.maritalStatus) {
      errors.push('Marital Status is required');
    }

    // Father Name is required
    if (!formData.personal.fatherName || !formData.personal.fatherName.trim()) {
      errors.push("Father's Name is required");
    }

    // Mother Name is required
    if (!formData.personal.motherName || !formData.personal.motherName.trim()) {
      errors.push("Mother's Name is required");
    }

    // At least one emergency contact required
    if (!formData.personal.emergencyContacts || formData.personal.emergencyContacts.length === 0) {
      errors.push('At least one emergency contact is required');
    } else {
      // Validate each emergency contact
      const validContacts = formData.personal.emergencyContacts.filter(
        contact => contact.name.trim() && contact.mobile.trim() && contact.relationship
      );
      
      if (validContacts.length === 0) {
        errors.push('At least one complete emergency contact is required');
      }

      // Check for duplicate mobile numbers
      const mobiles = formData.personal.emergencyContacts.map(c => c.mobile).filter(m => m.trim());
      const uniqueMobiles = new Set(mobiles);
      if (mobiles.length !== uniqueMobiles.size) {
        errors.push('Duplicate mobile numbers are not allowed in emergency contacts');
      }

      // Validate mobile number length for each contact
      formData.personal.emergencyContacts.forEach((contact, index) => {
        if (contact.mobile && (contact.mobile.length < 10 || contact.mobile.length > 15)) {
          errors.push(`Emergency contact ${index + 1}: Mobile number must be 10-15 digits`);
        }
      });
    }

    return errors;
  };

  // Save personal section
  const handleSavePersonal = async () => {
    const validationErrors = validatePersonalSection();
    if (validationErrors.length > 0) {
      alert('Please fix the following errors:\n\n' + validationErrors.join('\n'));
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const dataToSave = {
        marital_status: formData.personal.maritalStatus,
        no_of_children: formData.personal.noOfChildren || 0,
        father_name: formData.personal.fatherName,
        father_dob: formData.personal.fatherDob || null,
        father_deceased: formData.personal.fatherDeceased,
        mother_name: formData.personal.motherName,
        mother_dob: formData.personal.motherDob || null,
        mother_deceased: formData.personal.motherDeceased,
        emergency_contacts: formData.personal.emergencyContacts.filter(
          contact => contact.name.trim() && contact.mobile.trim() && contact.relationship
        )
      };

      const response = await fetch('http://localhost:3000/api/bgv/personal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dataToSave)
      });

      const result = await response.json();

      if (result.success) {
        alert('Personal information saved successfully!');
      } else {
        throw new Error(result.message || 'Failed to save personal information');
      }
    } catch (error) {
      console.error('Error saving personal information:', error);
      alert('Failed to save personal information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Education handlers
  const handleAddEducation = () => {
    setFormData(prev => ({
      ...prev,
      education: {
        ...prev.education,
        qualifications: [
          ...(prev.education.qualifications || []),
          {
            qualification: '',
            university_institution: '',
            cgpa_percentage: '',
            year_of_passing: '',
            documents: []
          }
        ]
      }
    }));
  };

  const handleRemoveEducation = (index: number) => {
    setFormData(prev => ({
      ...prev,
      education: {
        ...prev.education,
        qualifications: prev.education.qualifications.filter((_, i) => i !== index)
      }
    }));
  };

  const handleEducationChange = (index: number, field: string, value: any) => {
    setFormData(prev => {
      const newQualifications = [...prev.education.qualifications];
      newQualifications[index] = {
        ...newQualifications[index],
        [field]: value
      };
      return {
        ...prev,
        education: {
          ...prev.education,
          qualifications: newQualifications
        }
      };
    });
  };

  const handleEducationFileUpload = async (index: number, files: FileList | null) => {
    if (!files || files.length === 0) return;

    try {
      const fileArray = Array.from(files);
      const validFiles = fileArray.filter(file => {
        const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
        const maxSize = 5 * 1024 * 1024; // 5MB
        
        if (!validTypes.includes(file.type)) {
          alert(`File ${file.name}: Invalid file type. Only PDF, JPG, JPEG, and PNG are allowed.`);
          return false;
        }
        if (file.size > maxSize) {
          alert(`File ${file.name}: File size exceeds 5MB limit.`);
          return false;
        }
        return true;
      });

      if (validFiles.length === 0) return;

      const documentPromises = validFiles.map(async (file) => {
        const base64Data = await fileToBase64(file);
        return {
          name: file.name,
          data: base64Data,
          type: file.type,
          size: file.size
        };
      });

      const documents = await Promise.all(documentPromises);

      setFormData(prev => {
        const newQualifications = [...prev.education.qualifications];
        newQualifications[index] = {
          ...newQualifications[index],
          documents: [...(newQualifications[index].documents || []), ...documents]
        };
        return {
          ...prev,
          education: {
            ...prev.education,
            qualifications: newQualifications
          }
        };
      });
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Failed to upload files. Please try again.');
    }
  };

  const handleAddAdditionalQualification = () => {
    setFormData(prev => ({
      ...prev,
      education: {
        ...prev.education,
        additionalQualifications: [
          ...(prev.education.additionalQualifications || []),
          {
            certificate_name: '',
            documents: []
          }
        ]
      }
    }));
  };

  const handleRemoveAdditionalQualification = (index: number) => {
    setFormData(prev => ({
      ...prev,
      education: {
        ...prev.education,
        additionalQualifications: prev.education.additionalQualifications.filter((_, i) => i !== index)
      }
    }));
  };

  const handleAdditionalQualificationChange = (index: number, field: string, value: any) => {
    setFormData(prev => {
      const newQualifications = [...prev.education.additionalQualifications];
      newQualifications[index] = {
        ...newQualifications[index],
        [field]: value
      };
      return {
        ...prev,
        education: {
          ...prev.education,
          additionalQualifications: newQualifications
        }
      };
    });
  };

  const handleAdditionalQualificationFileUpload = async (index: number, files: FileList | null) => {
    if (!files || files.length === 0) return;

    try {
      const fileArray = Array.from(files);
      const validFiles = fileArray.filter(file => {
        const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
        const maxSize = 5 * 1024 * 1024; // 5MB
        
        if (!validTypes.includes(file.type)) {
          alert(`File ${file.name}: Invalid file type. Only PDF, JPG, JPEG, and PNG are allowed.`);
          return false;
        }
        if (file.size > maxSize) {
          alert(`File ${file.name}: File size exceeds 5MB limit.`);
          return false;
        }
        return true;
      });

      if (validFiles.length === 0) return;

      const documentPromises = validFiles.map(async (file) => {
        const base64Data = await fileToBase64(file);
        return {
          name: file.name,
          data: base64Data,
          type: file.type,
          size: file.size
        };
      });

      const documents = await Promise.all(documentPromises);

      setFormData(prev => {
        const newQualifications = [...prev.education.additionalQualifications];
        newQualifications[index] = {
          ...newQualifications[index],
          documents: [...(newQualifications[index].documents || []), ...documents]
        };
        return {
          ...prev,
          education: {
            ...prev.education,
            additionalQualifications: newQualifications
          }
        };
      });
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Failed to upload files. Please try again.');
    }
  };

  // Validate education section
  const validateEducationSection = () => {
    const errors = [];

    // At least one educational qualification required
    if (!formData.education.qualifications || formData.education.qualifications.length === 0) {
      errors.push('At least one educational qualification is required');
      return errors;
    }

    // Validate each qualification
    formData.education.qualifications.forEach((qual, index) => {
      if (!qual.qualification) {
        errors.push(`Qualification ${index + 1}: Qualification type is required`);
      }
      if (!qual.university_institution || !qual.university_institution.trim()) {
        errors.push(`Qualification ${index + 1}: University/Institution is required`);
      }
      if (!qual.cgpa_percentage || !qual.cgpa_percentage.trim()) {
        errors.push(`Qualification ${index + 1}: CGPA/Percentage is required`);
      }
      if (!qual.year_of_passing) {
        errors.push(`Qualification ${index + 1}: Year of Passing is required`);
      } else {
        const year = parseInt(qual.year_of_passing);
        const currentYear = new Date().getFullYear();
        if (year > currentYear) {
          errors.push(`Qualification ${index + 1}: Year of Passing cannot be in the future`);
        }
        if (year < 1950) {
          errors.push(`Qualification ${index + 1}: Year of Passing must be after 1950`);
        }
      }
      if (!qual.documents || qual.documents.length === 0) {
        errors.push(`Qualification ${index + 1}: At least one document is required`);
      }
    });

    // Validate additional qualifications if any
    if (formData.education.additionalQualifications && formData.education.additionalQualifications.length > 0) {
      formData.education.additionalQualifications.forEach((cert, index) => {
        if (!cert.certificate_name || !cert.certificate_name.trim()) {
          errors.push(`Additional Qualification ${index + 1}: Certificate name is required`);
        }
        if (!cert.documents || cert.documents.length === 0) {
          errors.push(`Additional Qualification ${index + 1}: At least one document is required`);
        }
      });
    }

    return errors;
  };

  // Save and navigate to next section
  const handleSaveAndNext = async () => {
    const section = sections[activeSection];
    let validationErrors = [];

    if (section.id === 'personal') {
      validationErrors = validatePersonalSection();
    } else if (section.id === 'education') {
      validationErrors = validateEducationSection();
    }

    if (validationErrors.length > 0) {
      alert('Please complete all required fields before proceeding:\n\n' + validationErrors.join('\n'));
      return;
    }
    
    await handleSave();
    if (activeSection < sections.length - 1) {
      setActiveSection(activeSection + 1);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const section = sections[activeSection];
      console.log('💾 handleSave called for section:', section.id);
      console.log('💾 Current formData:', formData);
      console.log('💾 Emergency contacts in formData:', formData.personal.emergencyContacts);

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
            celebrated_dob: formData.demographics.celebratedDob,
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
          
          // Handle file uploads by converting to base64 (only for new uploads, not previously uploaded files)
          if (formData.demographics.aadhaarFile && !formData.demographics.aadhaarFile.uploaded) {
            const aadhaarBase64 = await fileToBase64(formData.demographics.aadhaarFile);
            dataToSave.aadhaar_file_data = aadhaarBase64;
            dataToSave.aadhaar_file_name = formData.demographics.aadhaarFile.name;
            dataToSave.aadhaar_file_type = formData.demographics.aadhaarFile.type;
            dataToSave.aadhaar_file_size = formData.demographics.aadhaarFile.size;
          }
          
          if (formData.demographics.panFile && !formData.demographics.panFile.uploaded) {
            const panBase64 = await fileToBase64(formData.demographics.panFile);
            dataToSave.pan_file_data = panBase64;
            dataToSave.pan_file_name = formData.demographics.panFile.name;
            dataToSave.pan_file_type = formData.demographics.panFile.type;
            dataToSave.pan_file_size = formData.demographics.panFile.size;
          }
          
          if (formData.demographics.resumeFile && !formData.demographics.resumeFile.uploaded) {
            const resumeBase64 = await fileToBase64(formData.demographics.resumeFile);
            dataToSave.resume_file_data = resumeBase64;
            dataToSave.resume_file_name = formData.demographics.resumeFile.name;
            dataToSave.resume_file_type = formData.demographics.resumeFile.type;
            dataToSave.resume_file_size = formData.demographics.resumeFile.size;
          }
          break;
        case 'personal':
          apiEndpoint = '/api/bgv/personal';
          dataToSave = {
            marital_status: formData.personal.maritalStatus,
            no_of_children: formData.personal.noOfChildren || 0,
            father_name: formData.personal.fatherName,
            father_dob: formData.personal.fatherDob,
            father_deceased: formData.personal.fatherDeceased,
            mother_name: formData.personal.motherName,
            mother_dob: formData.personal.motherDob,
            mother_deceased: formData.personal.motherDeceased,
            emergency_contacts: formData.personal.emergencyContacts
          };
          console.log('📤 Sending personal data:', dataToSave);
          console.log('📤 Emergency contacts being sent:', dataToSave.emergency_contacts);
          break;
        case 'education':
          apiEndpoint = '/api/bgv/education';
          dataToSave = {
            educationalQualifications: formData.education.qualifications || [],
            additionalQualifications: formData.education.additionalQualifications || []
          };
          break;
        case 'employment':
          // Employment section is not yet implemented, skip saving
          console.log('⏭️ Employment section not implemented yet, skipping save');
          setLoading(false);
          return;
        case 'passport':
          // Passport section is not yet implemented, skip saving
          console.log('⏭️ Passport section not implemented yet, skipping save');
          setLoading(false);
          return;
        case 'banking':
          // Banking section is not yet implemented, skip saving
          console.log('⏭️ Banking section not implemented yet, skipping save');
          setLoading(false);
          return;
        default:
          console.log('No API endpoint for section:', section.id);
          setLoading(false);
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
    // Validate current section before navigating
    const section = sections[activeSection];
    let validationErrors = [];
    
    if (section.id === 'personal') {
      validationErrors = validatePersonalSection();
    } else if (section.id === 'education') {
      validationErrors = validateEducationSection();
    }
    
    if (validationErrors.length > 0) {
      alert('Please complete all required fields before proceeding:\n\n' + validationErrors.join('\n'));
      return;
    }
    
    await handleSave();
    
    // If on last section, show submit confirmation instead of navigating
    if (isLastSection) {
      setShowSubmitConfirm(true);
    } else if (activeSection < sections.length - 1) {
      setActiveSection(activeSection + 1);
    }
  };

  const handlePrevious = () => {
    if (activeSection > 0) {
      setActiveSection(activeSection - 1);
      setShowSubmitConfirm(false);
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
                    {formData.demographics.aadhaarFile && formData.demographics.aadhaarFile.uploaded ? (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '10px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        backgroundColor: '#f9fafb'
                      }}>
                        <span style={{ flex: 1, fontSize: '14px', color: '#374151' }}>
                          📄 {formData.demographics.aadhaarFile.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleFileUpload('aadhaarFile', null)}
                          style={{
                            marginLeft: '10px',
                            padding: '4px 8px',
                            fontSize: '12px',
                            color: '#3b82f6',
                            backgroundColor: 'transparent',
                            border: '1px solid #3b82f6',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          Change
                        </button>
                      </div>
                    ) : (
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
                    )}
                    {formData.demographics.aadhaarFile && !formData.demographics.aadhaarFile.uploaded && (
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
                    {formData.demographics.panFile && formData.demographics.panFile.uploaded ? (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '10px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        backgroundColor: '#f9fafb'
                      }}>
                        <span style={{ flex: 1, fontSize: '14px', color: '#374151' }}>
                          📄 {formData.demographics.panFile.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleFileUpload('panFile', null)}
                          style={{
                            marginLeft: '10px',
                            padding: '4px 8px',
                            fontSize: '12px',
                            color: '#3b82f6',
                            backgroundColor: 'transparent',
                            border: '1px solid #3b82f6',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          Change
                        </button>
                      </div>
                    ) : (
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
                    )}
                    {formData.demographics.panFile && !formData.demographics.panFile.uploaded && (
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
                  {formData.demographics.resumeFile && formData.demographics.resumeFile.uploaded ? (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '10px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      backgroundColor: '#f9fafb',
                      maxWidth: '400px'
                    }}>
                      <span style={{ flex: 1, fontSize: '14px', color: '#374151' }}>
                        📄 {formData.demographics.resumeFile.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleFileUpload('resumeFile', null)}
                        style={{
                          marginLeft: '10px',
                          padding: '4px 8px',
                          fontSize: '12px',
                          color: '#3b82f6',
                          backgroundColor: 'transparent',
                          border: '1px solid #3b82f6',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        Change
                      </button>
                    </div>
                  ) : (
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
                  )}
                  <p style={{ color: '#6b7280', fontSize: '12px', marginTop: '4px' }}>
                    Max file size: 10MB. Allowed formats: PDF, JPG, JPEG, PNG
                  </p>
                  {formData.demographics.resumeFile && !formData.demographics.resumeFile.uploaded && (
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

            {/* Personal Information Section */}
            <div style={{ marginBottom: '30px' }}>
              <h4 style={{ color: 'black', marginBottom: '15px', fontSize: '16px', fontWeight: '600' }}>Personal Details</h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                {/* Marital Status */}
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', color: '#374151', fontSize: '14px', fontWeight: '500' }}>
                    Marital Status <span style={{ color: 'red' }}>*</span>
                  </label>
                  <select
                    value={formData.personal.maritalStatus}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData(prev => ({
                        ...prev,
                        personal: {
                          ...prev.personal,
                          maritalStatus: value,
                          noOfChildren: value !== 'Married' ? '' : prev.personal.noOfChildren
                        }
                      }));
                    }}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="">Select Marital Status</option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Divorced">Divorced</option>
                    <option value="Widowed">Widowed</option>
                  </select>
                </div>

                {/* Number of Children */}
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', color: '#374151', fontSize: '14px', fontWeight: '500' }}>
                    Number of Children
                  </label>
                  <input
                    type="number"
                    min="0"
                    disabled={formData.personal.maritalStatus !== 'Married'}
                    value={formData.personal.noOfChildren}
                    onChange={(e) => {
                      setFormData(prev => ({
                        ...prev,
                        personal: { ...prev.personal, noOfChildren: e.target.value }
                      }));
                    }}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '14px',
                      backgroundColor: formData.personal.maritalStatus !== 'Married' ? '#f3f4f6' : 'white'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Father Details */}
            <div style={{ marginBottom: '30px' }}>
              <h4 style={{ color: 'black', marginBottom: '15px', fontSize: '16px', fontWeight: '600' }}>Father's Details</h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 100px', gap: '15px', alignItems: 'end' }}>
                {/* Father Name */}
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', color: '#374151', fontSize: '14px', fontWeight: '500' }}>
                    Father's Name <span style={{ color: 'red' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.personal.fatherName}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                      setFormData(prev => ({
                        ...prev,
                        personal: { ...prev.personal, fatherName: value }
                      }));
                    }}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                {/* Father DOB */}
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', color: '#374151', fontSize: '14px', fontWeight: '500' }}>
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    max={new Date().toISOString().split('T')[0]}
                    disabled={formData.personal.fatherDeceased}
                    value={formData.personal.fatherDob}
                    onChange={(e) => {
                      setFormData(prev => ({
                        ...prev,
                        personal: { ...prev.personal, fatherDob: e.target.value }
                      }));
                    }}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '14px',
                      backgroundColor: formData.personal.fatherDeceased ? '#f3f4f6' : 'white'
                    }}
                  />
                </div>

                {/* Father Deceased */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '10px' }}>
                  <input
                    type="checkbox"
                    checked={formData.personal.fatherDeceased}
                    onChange={(e) => {
                      setFormData(prev => ({
                        ...prev,
                        personal: { 
                          ...prev.personal, 
                          fatherDeceased: e.target.checked,
                          fatherDob: e.target.checked ? '' : prev.personal.fatherDob
                        }
                      }));
                    }}
                    style={{ width: '16px', height: '16px' }}
                  />
                  <label style={{ fontSize: '14px', color: '#374151' }}>Deceased</label>
                </div>
              </div>
            </div>

            {/* Mother Details */}
            <div style={{ marginBottom: '30px' }}>
              <h4 style={{ color: 'black', marginBottom: '15px', fontSize: '16px', fontWeight: '600' }}>Mother's Details</h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 100px', gap: '15px', alignItems: 'end' }}>
                {/* Mother Name */}
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', color: '#374151', fontSize: '14px', fontWeight: '500' }}>
                    Mother's Name <span style={{ color: 'red' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.personal.motherName}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                      setFormData(prev => ({
                        ...prev,
                        personal: { ...prev.personal, motherName: value }
                      }));
                    }}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                {/* Mother DOB */}
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', color: '#374151', fontSize: '14px', fontWeight: '500' }}>
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    max={new Date().toISOString().split('T')[0]}
                    disabled={formData.personal.motherDeceased}
                    value={formData.personal.motherDob}
                    onChange={(e) => {
                      setFormData(prev => ({
                        ...prev,
                        personal: { ...prev.personal, motherDob: e.target.value }
                      }));
                    }}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '14px',
                      backgroundColor: formData.personal.motherDeceased ? '#f3f4f6' : 'white'
                    }}
                  />
                </div>

                {/* Mother Deceased */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '10px' }}>
                  <input
                    type="checkbox"
                    checked={formData.personal.motherDeceased}
                    onChange={(e) => {
                      setFormData(prev => ({
                        ...prev,
                        personal: { 
                          ...prev.personal, 
                          motherDeceased: e.target.checked,
                          motherDob: e.target.checked ? '' : prev.personal.motherDob
                        }
                      }));
                    }}
                    style={{ width: '16px', height: '16px' }}
                  />
                  <label style={{ fontSize: '14px', color: '#374151' }}>Deceased</label>
                </div>
              </div>
            </div>

            {/* Emergency Contacts Section */}
            <div style={{ marginBottom: '30px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h4 style={{ color: 'black', fontSize: '16px', fontWeight: '600' }}>Emergency Contacts</h4>
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      personal: {
                        ...prev.personal,
                        emergencyContacts: [
                          ...prev.personal.emergencyContacts,
                          { name: '', mobile: '', relationship: '' }
                        ]
                      }
                    }));
                  }}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#4f46e5',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '14px',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                >
                  + Add Contact
                </button>
              </div>

              {/* Emergency Contacts Table */}
              <div style={{ border: '1px solid #d1d5db', borderRadius: '4px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f3f4f6' }}>
                      <th style={{ padding: '12px', textAlign: 'left', color: '#374151', fontSize: '14px', fontWeight: '600' }}>
                        Contact Person Name <span style={{ color: 'red' }}>*</span>
                      </th>
                      <th style={{ padding: '12px', textAlign: 'left', color: '#374151', fontSize: '14px', fontWeight: '600' }}>
                        Mobile Number <span style={{ color: 'red' }}>*</span>
                      </th>
                      <th style={{ padding: '12px', textAlign: 'left', color: '#374151', fontSize: '14px', fontWeight: '600' }}>
                        Relationship <span style={{ color: 'red' }}>*</span>
                      </th>
                      <th style={{ padding: '12px', textAlign: 'center', color: '#374151', fontSize: '14px', fontWeight: '600', width: '80px' }}>
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.personal.emergencyContacts.map((contact, index) => (
                      <tr key={index} style={{ borderTop: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '12px' }}>
                          <input
                            type="text"
                            value={contact.name}
                            onChange={(e) => {
                              const value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                              const newContacts = [...formData.personal.emergencyContacts];
                              newContacts[index].name = value;
                              setFormData(prev => ({
                                ...prev,
                                personal: { ...prev.personal, emergencyContacts: newContacts }
                              }));
                            }}
                            placeholder="Enter name"
                            style={{
                              width: '100%',
                              padding: '8px',
                              border: '1px solid #d1d5db',
                              borderRadius: '4px',
                              fontSize: '14px'
                            }}
                          />
                        </td>
                        <td style={{ padding: '12px' }}>
                          <input
                            type="text"
                            value={contact.mobile}
                            onChange={(e) => {
                              const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 15);
                              const newContacts = [...formData.personal.emergencyContacts];
                              newContacts[index].mobile = value;
                              setFormData(prev => ({
                                ...prev,
                                personal: { ...prev.personal, emergencyContacts: newContacts }
                              }));
                            }}
                            placeholder="10-15 digits"
                            style={{
                              width: '100%',
                              padding: '8px',
                              border: '1px solid #d1d5db',
                              borderRadius: '4px',
                              fontSize: '14px'
                            }}
                          />
                          {contact.mobile && (contact.mobile.length < 10 || contact.mobile.length > 15) && (
                            <span style={{ color: 'red', fontSize: '12px' }}>Must be 10-15 digits</span>
                          )}
                        </td>
                        <td style={{ padding: '12px' }}>
                          <select
                            value={contact.relationship}
                            onChange={(e) => {
                              const newContacts = [...formData.personal.emergencyContacts];
                              newContacts[index].relationship = e.target.value;
                              setFormData(prev => ({
                                ...prev,
                                personal: { ...prev.personal, emergencyContacts: newContacts }
                              }));
                            }}
                            style={{
                              width: '100%',
                              padding: '8px',
                              border: '1px solid #d1d5db',
                              borderRadius: '4px',
                              fontSize: '14px'
                            }}
                          >
                            <option value="">Select</option>
                            <option value="Father">Father</option>
                            <option value="Mother">Mother</option>
                            <option value="Spouse">Spouse</option>
                            <option value="Sibling">Sibling</option>
                            <option value="Relative">Relative</option>
                            <option value="Friend">Friend</option>
                            <option value="Other">Other</option>
                          </select>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          {formData.personal.emergencyContacts.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const newContacts = formData.personal.emergencyContacts.filter((_, i) => i !== index);
                                setFormData(prev => ({
                                  ...prev,
                                  personal: { ...prev.personal, emergencyContacts: newContacts }
                                }));
                              }}
                              style={{
                                padding: '6px 12px',
                                backgroundColor: '#ef4444',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '12px',
                                cursor: 'pointer'
                              }}
                            >
                              Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'education':
        return (
          <div style={{ padding: '20px' }}>
            <h3 style={{ color: 'black', marginBottom: '20px', fontSize: '20px' }}>Educational Background</h3>
            
            {/* Educational Qualifications Section */}
            <div style={{ marginBottom: '40px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h4 style={{ color: '#1f2937', fontSize: '16px', fontWeight: '600' }}>
                  Educational Qualifications <span style={{ color: '#ef4444' }}>*</span>
                </h4>
                <button
                  onClick={handleAddEducation}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '8px 16px',
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                >
                  <span>+ Add More</span>
                </button>
              </div>

              {/* Educational Qualifications Table */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Qualification <span style={{ color: '#ef4444' }}>*</span></th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>University/Institution <span style={{ color: '#ef4444' }}>*</span></th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>CGPA/% <span style={{ color: '#ef4444' }}>*</span></th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Year of Passing <span style={{ color: '#ef4444' }}>*</span></th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Documents <span style={{ color: '#ef4444' }}>*</span></th>
                      <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#374151' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.education.qualifications && formData.education.qualifications.map((qual, index) => (
                        <tr key={index} style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <td style={{ padding: '12px' }}>
                            <select
                              value={qual.qualification}
                              onChange={(e) => handleEducationChange(index, 'qualification', e.target.value)}
                              style={{
                                width: '100%',
                                padding: '8px',
                                border: '1px solid #d1d5db',
                                borderRadius: '6px',
                                fontSize: '14px'
                              }}
                            >
                              <option value="">Select</option>
                              <option value="10th">10th</option>
                              <option value="12th">12th</option>
                              <option value="Diploma">Diploma</option>
                              <option value="Bachelor of Technology">Bachelor of Technology</option>
                              <option value="Bachelor of Science">Bachelor of Science</option>
                              <option value="Bachelor of Arts">Bachelor of Arts</option>
                              <option value="Bachelor of Commerce">Bachelor of Commerce</option>
                              <option value="Master of Technology">Master of Technology</option>
                              <option value="Master of Science">Master of Science</option>
                              <option value="Master of Arts">Master of Arts</option>
                              <option value="Master of Commerce">Master of Commerce</option>
                              <option value="Master of Business Administration">Master of Business Administration</option>
                              <option value="PhD">PhD</option>
                              <option value="Other">Other</option>
                            </select>
                          </td>
                          <td style={{ padding: '12px' }}>
                            <input
                              type="text"
                              value={qual.university_institution}
                              onChange={(e) => handleEducationChange(index, 'university_institution', e.target.value)}
                              placeholder="Enter university/institution"
                              style={{
                                width: '100%',
                                padding: '8px',
                                border: '1px solid #d1d5db',
                                borderRadius: '6px',
                                fontSize: '14px'
                              }}
                            />
                          </td>
                          <td style={{ padding: '12px' }}>
                            <input
                              type="text"
                              value={qual.cgpa_percentage}
                              onChange={(e) => handleEducationChange(index, 'cgpa_percentage', e.target.value)}
                              placeholder="e.g., 8.2, 82%"
                              style={{
                                width: '100%',
                                padding: '8px',
                                border: '1px solid #d1d5db',
                                borderRadius: '6px',
                                fontSize: '14px'
                              }}
                            />
                          </td>
                          <td style={{ padding: '12px' }}>
                            <input
                              type="number"
                              value={qual.year_of_passing}
                              onChange={(e) => handleEducationChange(index, 'year_of_passing', e.target.value)}
                              placeholder="YYYY"
                              min="1950"
                              max={new Date().getFullYear()}
                              style={{
                                width: '100%',
                                padding: '8px',
                                border: '1px solid #d1d5db',
                                borderRadius: '6px',
                                fontSize: '14px'
                              }}
                            />
                          </td>
                          <td style={{ padding: '12px' }}>
                            <input
                              type="file"
                              multiple
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => handleEducationFileUpload(index, e.target.files)}
                              style={{ fontSize: '12px' }}
                            />
                            {qual.documents && qual.documents.length > 0 && (
                              <div style={{ fontSize: '12px', color: '#10b981', marginTop: '4px' }}>
                                {qual.documents.length} file(s) uploaded
                              </div>
                            )}
                          </td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>
                            {formData.education.qualifications.length > 1 && (
                              <button
                                onClick={() => handleRemoveEducation(index)}
                                style={{
                                  padding: '6px 12px',
                                  backgroundColor: '#ef4444',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '6px',
                                  fontSize: '12px',
                                  cursor: 'pointer'
                                }}
                              >
                                Remove
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
            </div>

            {/* Additional Qualifications Section */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h4 style={{ color: '#1f2937', fontSize: '16px', fontWeight: '600' }}>
                  Additional Qualifications / Certificates (Optional)
                </h4>
                <button
                  onClick={handleAddAdditionalQualification}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '8px 16px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                >
                  <span>Add +</span>
                </button>
              </div>

              {formData.education.additionalQualifications && formData.education.additionalQualifications.length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f0f9ff', borderBottom: '2px solid #bfdbfe' }}>
                        <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Name of Qualification/Certificate</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Documents</th>
                        <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#374151' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.education.additionalQualifications.map((cert, index) => (
                        <tr key={index} style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <td style={{ padding: '12px' }}>
                            <input
                              type="text"
                              value={cert.certificate_name}
                              onChange={(e) => handleAdditionalQualificationChange(index, 'certificate_name', e.target.value)}
                              placeholder="Enter certificate name"
                              style={{
                                width: '100%',
                                padding: '8px',
                                border: '1px solid #d1d5db',
                                borderRadius: '6px',
                                fontSize: '14px'
                              }}
                            />
                          </td>
                          <td style={{ padding: '12px' }}>
                            <input
                              type="file"
                              multiple
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => handleAdditionalQualificationFileUpload(index, e.target.files)}
                              style={{ fontSize: '12px' }}
                            />
                            {cert.documents && cert.documents.length > 0 && (
                              <div style={{ fontSize: '12px', color: '#3b82f6', marginTop: '4px' }}>
                                {cert.documents.length} file(s) uploaded
                              </div>
                            )}
                          </td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>
                            <button
                              onClick={() => handleRemoveAdditionalQualification(index)}
                              style={{
                                padding: '6px 12px',
                                backgroundColor: '#ef4444',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '12px',
                                cursor: 'pointer'
                              }}
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ 
                  padding: '30px', 
                  textAlign: 'center', 
                  backgroundColor: '#f0f9ff', 
                  borderRadius: '8px',
                  border: '2px dashed #bfdbfe'
                }}>
                  <p style={{ color: '#6b7280', fontSize: '14px' }}>No additional qualifications added</p>
                </div>
              )}
            </div>
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
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

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

          {showSubmitConfirm ? (
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
                backgroundColor: isLastSection ? '#dc2626' : '#3b82f6',
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
              {loading ? 'Saving...' : (isLastSection ? 'Review & Submit' : 'Next')}
              <FiArrowRight />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};