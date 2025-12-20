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
import { documentViewerService } from '../../services/documentViewer.service';

// Add spinner animation styles
const spinnerStyles = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = spinnerStyles;
  if (!document.head.querySelector('style[data-spinner-styles]')) {
    styleElement.setAttribute('data-spinner-styles', 'true');
    document.head.appendChild(styleElement);
  }
}

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
  document_url?: string;  // Actual field from educational_details table
}

interface Employment {
  id: number;
  company_name: string;
  designation: string;
  employment_start_date: string;
  employment_end_date: string;
  reason_for_leaving?: string;
  offer_letter_url?: string;
  experience_letter_url?: string;
  payslips_url?: string;
}

interface PassportVisa {
  id: number;
  has_passport: boolean;
  passport_number?: string;
  passport_issue_date?: string;
  passport_expiry_date?: string;
  passport_copy_url?: string;
  has_visa: boolean;
  visa_type?: string;
  visa_expiry_date?: string;
  visa_document_url?: string;
}

interface BankPfNps {
  id: number;
  number_of_bank_accounts: number;
  bank_account_number: string;
  ifsc_code: string;
  name_as_per_bank: string;
  bank_name: string;
  branch: string;
  cancelled_cheque_url?: string;
  uan_pf_number?: string;
  pran_nps_number?: string;
}

interface BGVData {
  fresher: FresherInfo;
  demographics: Demographics | null;
  personal: Personal | null;
  education: Education[];
  employment: Employment[];
  passportVisa: PassportVisa | null;
  bankPfNps: BankPfNps | null;
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
  const [activeTab, setActiveTab] = useState<'demographics' | 'personal' | 'education' | 'employment' | 'passport' | 'banking'>('demographics');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [processingDocs, setProcessingDocs] = useState<Set<string>>(new Set());
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
      
      // Get existing verification statuses from backend
      const existingVerifications = result.data.verifications || [];
      const verificationMap = new Map();
      existingVerifications.forEach((v: any) => {
        const key = `${v.document_section}-${v.document_type}`;
        verificationMap.set(key, {
          status: v.status,
          comments: v.comments,
          verified_at: v.verified_at,
          hr_first_name: v.hr_first_name,
          hr_last_name: v.hr_last_name
        });
      });
      
      // Demographics section
      if (result.data.demographics) {
        const demo = result.data.demographics;
        
        // Concatenate communication address
        const commAddress = [
          demo.comm_house_number,
          demo.comm_street_name,
          demo.comm_city,
          demo.comm_district,
          demo.comm_state,
          demo.comm_country,
          demo.comm_pin_code
        ].filter(Boolean).join(', ');
        
        // Concatenate permanent address
        const permAddress = [
          demo.perm_house_number,
          demo.perm_street_name,
          demo.perm_city,
          demo.perm_district,
          demo.perm_state,
          demo.perm_country,
          demo.perm_pin_code
        ].filter(Boolean).join(', ');
        
        verificationsData['Demographics'] = Object.entries(demo)
          .filter(([key]) => !['id', 'fresher_id', 'created_at', 'updated_at'].includes(key))
          .filter(([key]) => !key.toLowerCase().includes('file_data'))
          .filter(([key]) => !key.toLowerCase().includes('file_name'))
          .filter(([key]) => !key.toLowerCase().includes('file_type'))
          .filter(([key]) => !key.toLowerCase().includes('file_size'))
          .filter(([key]) => !key.toLowerCase().includes('certificate_name'))
          .filter(([key]) => !key.startsWith('comm_') || key === 'comm_house_number')
          .filter(([key]) => !key.startsWith('perm_') || key === 'perm_house_number')
          .map(([key, value]) => {
            // Replace first occurrence of comm_ address field with concatenated address
            if (key === 'comm_house_number') {
              const docType = 'Communication Address';
              const verificationKey = `Demographics-${docType}`;
              const savedStatus = verificationMap.get(verificationKey);
              
              return {
                document_type: docType,
                document_section: 'Demographics',
                document_value: commAddress || 'Not provided',
                status: (savedStatus?.status || 'pending') as 'pending' | 'verified' | 'rejected',
                comments: savedStatus?.comments,
                verified_at: savedStatus?.verified_at,
                hr_first_name: savedStatus?.hr_first_name,
                hr_last_name: savedStatus?.hr_last_name
              };
            }
            // Replace first occurrence of perm_ address field with concatenated address
            if (key === 'perm_house_number') {
              const docType = 'Permanent Address';
              const verificationKey = `Demographics-${docType}`;
              const savedStatus = verificationMap.get(verificationKey);
              
              return {
                document_type: docType,
                document_section: 'Demographics',
                document_value: permAddress || 'Not provided',
                status: (savedStatus?.status || 'pending') as 'pending' | 'verified' | 'rejected',
                comments: savedStatus?.comments,
                verified_at: savedStatus?.verified_at,
                hr_first_name: savedStatus?.hr_first_name,
                hr_last_name: savedStatus?.hr_last_name
              };
            }
            
            const docType = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            const verificationKey = `Demographics-${docType}`;
            const savedStatus = verificationMap.get(verificationKey);
            
            return {
              document_type: docType,
              document_section: 'Demographics',
              document_value: value,
              status: (savedStatus?.status || 'pending') as 'pending' | 'verified' | 'rejected',
              comments: savedStatus?.comments,
              verified_at: savedStatus?.verified_at,
              hr_first_name: savedStatus?.hr_first_name,
              hr_last_name: savedStatus?.hr_last_name
            };
          });
      }
      
      // Personal section
      if (result.data.personal) {
        verificationsData['Personal'] = Object.entries(result.data.personal)
          .filter(([key]) => !['id', 'fresher_id', 'created_at', 'updated_at'].includes(key))
          .filter(([key]) => !key.toLowerCase().includes('file_data'))
          .filter(([key]) => !key.toLowerCase().includes('file_name'))
          .filter(([key]) => !key.toLowerCase().includes('file_type'))
          .filter(([key]) => !key.toLowerCase().includes('file_size'))
          .filter(([key]) => !key.toLowerCase().includes('certificate_name'))
          .filter(([key]) => {
            const lowerKey = key.toLowerCase();
            return lowerKey !== 'emergency_contact_name' && 
                   lowerKey !== 'emergency_contact_phone' && 
                   lowerKey !== 'emergency_contact_relationship';
          })
          .map(([key, value]) => {
            const docType = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            const verificationKey = `Personal-${docType}`;
            const savedStatus = verificationMap.get(verificationKey);
            
            return {
              document_type: docType,
              document_section: 'Personal',
              document_value: value,
              status: (savedStatus?.status || 'pending') as 'pending' | 'verified' | 'rejected',
              comments: savedStatus?.comments,
              verified_at: savedStatus?.verified_at,
              hr_first_name: savedStatus?.hr_first_name,
              hr_last_name: savedStatus?.hr_last_name
            };
          });
      }
      
      // Education section - only include the 5 main verifiable fields
      if (result.data.education && result.data.education.length > 0) {
        const educationFields = ['qualification_type', 'qualification', 'university_institution', 'cgpa_percentage', 'year_of_passing'];
        
        verificationsData['Education'] = result.data.education.flatMap((edu: Education) => 
          Object.entries(edu)
            .filter(([key]) => educationFields.includes(key))
            .map(([key, value]) => {
              const docType = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
              const verificationKey = `Education-${docType}`;
              const savedStatus = verificationMap.get(verificationKey);
              
              return {
                document_type: docType,
                document_section: 'Education',
                document_value: value,
                status: (savedStatus?.status || 'pending') as 'pending' | 'verified' | 'rejected',
                comments: savedStatus?.comments,
                verified_at: savedStatus?.verified_at,
                hr_first_name: savedStatus?.hr_first_name,
                hr_last_name: savedStatus?.hr_last_name
              };
            })
        );
      }
      
      // Employment section
      if (result.data.employment && result.data.employment.length > 0) {
        const employmentFields = ['company_name', 'designation', 'employment_start_date', 'employment_end_date', 'reason_for_leaving'];
        
        verificationsData['Employment'] = result.data.employment.flatMap((emp: Employment) => 
          Object.entries(emp)
            .filter(([key]) => employmentFields.includes(key))
            .map(([key, value]) => {
              const docType = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
              const verificationKey = `Employment-${docType}`;
              const savedStatus = verificationMap.get(verificationKey);
              
              return {
                document_type: docType,
                document_section: 'Employment',
                document_value: value,
                status: (savedStatus?.status || 'pending') as 'pending' | 'verified' | 'rejected',
                comments: savedStatus?.comments,
                verified_at: savedStatus?.verified_at,
                hr_first_name: savedStatus?.hr_first_name,
                hr_last_name: savedStatus?.hr_last_name
              };
            })
        );
      }
      
      // Passport & Visa section
      if (result.data.passportVisa) {
        verificationsData['Passport'] = Object.entries(result.data.passportVisa)
          .filter(([key]) => !['id', 'fresher_id', 'created_at', 'updated_at'].includes(key))
          .filter(([key]) => !key.toLowerCase().includes('_url'))
          .map(([key, value]) => {
            const docType = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            const verificationKey = `Passport-${docType}`;
            const savedStatus = verificationMap.get(verificationKey);
            
            return {
              document_type: docType,
              document_section: 'Passport',
              document_value: value,
              status: (savedStatus?.status || 'pending') as 'pending' | 'verified' | 'rejected',
              comments: savedStatus?.comments,
              verified_at: savedStatus?.verified_at,
              hr_first_name: savedStatus?.hr_first_name,
              hr_last_name: savedStatus?.hr_last_name
            };
          });
      }
      
      // Bank/PF/NPS section
      if (result.data.bankPfNps) {
        verificationsData['Banking'] = Object.entries(result.data.bankPfNps)
          .filter(([key]) => !['id', 'fresher_id', 'created_at', 'updated_at'].includes(key))
          .filter(([key]) => !key.toLowerCase().includes('_url'))
          .map(([key, value]) => {
            const docType = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            const verificationKey = `Banking-${docType}`;
            const savedStatus = verificationMap.get(verificationKey);
            
            return {
              document_type: docType,
              document_section: 'Banking',
              document_value: value,
              status: (savedStatus?.status || 'pending') as 'pending' | 'verified' | 'rejected',
              comments: savedStatus?.comments,
              verified_at: savedStatus?.verified_at,
              hr_first_name: savedStatus?.hr_first_name,
              hr_last_name: savedStatus?.hr_last_name
            };
          });
      }
      
      // Initialize empty arrays for sections that don't have data yet
      if (!verificationsData['Employment']) {
        verificationsData['Employment'] = [];
      }
      if (!verificationsData['Passport']) {
        verificationsData['Passport'] = [];
      }
      if (!verificationsData['Banking']) {
        verificationsData['Banking'] = [];
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
      
      // Get existing verification statuses from backend
      const existingVerifications = result.data.verifications || [];
      const verificationMap = new Map();
      existingVerifications.forEach((v: any) => {
        const key = `${v.document_section}-${v.document_type}`;
        verificationMap.set(key, {
          status: v.status,
          comments: v.comments,
          verified_at: v.verified_at,
          hr_first_name: v.hr_first_name,
          hr_last_name: v.hr_last_name
        });
      });
      
      // Demographics section
      if (result.data.demographics) {
        const demo = result.data.demographics;
        
        // Concatenate communication address
        const commAddress = [
          demo.comm_house_number,
          demo.comm_street_name,
          demo.comm_city,
          demo.comm_district,
          demo.comm_state,
          demo.comm_country,
          demo.comm_pin_code
        ].filter(Boolean).join(', ');
        
        // Concatenate permanent address
        const permAddress = [
          demo.perm_house_number,
          demo.perm_street_name,
          demo.perm_city,
          demo.perm_district,
          demo.perm_state,
          demo.perm_country,
          demo.perm_pin_code
        ].filter(Boolean).join(', ');
        
        verificationsData['Demographics'] = Object.entries(demo)
          .filter(([key]) => !['id', 'fresher_id', 'created_at', 'updated_at'].includes(key))
          .filter(([key]) => !key.toLowerCase().includes('file_data'))
          .filter(([key]) => !key.toLowerCase().includes('file_name'))
          .filter(([key]) => !key.toLowerCase().includes('file_type'))
          .filter(([key]) => !key.toLowerCase().includes('file_size'))
          .filter(([key]) => !key.toLowerCase().includes('certificate_name'))
          .filter(([key]) => !key.startsWith('comm_') || key === 'comm_house_number')
          .filter(([key]) => !key.startsWith('perm_') || key === 'perm_house_number')
          .map(([key, value]) => {
            // Replace first occurrence of comm_ address field with concatenated address
            if (key === 'comm_house_number') {
              const docType = 'Communication Address';
              const verificationKey = `Demographics-${docType}`;
              const savedStatus = verificationMap.get(verificationKey);
              
              return {
                document_type: docType,
                document_section: 'Demographics',
                document_value: commAddress || 'Not provided',
                status: savedStatus?.status || 'pending',
                comments: savedStatus?.comments,
                verified_at: savedStatus?.verified_at,
                hr_first_name: savedStatus?.hr_first_name,
                hr_last_name: savedStatus?.hr_last_name
              };
            }
            // Replace first occurrence of perm_ address field with concatenated address
            if (key === 'perm_house_number') {
              const docType = 'Permanent Address';
              const verificationKey = `Demographics-${docType}`;
              const savedStatus = verificationMap.get(verificationKey);
              
              return {
                document_type: docType,
                document_section: 'Demographics',
                document_value: permAddress || 'Not provided',
                status: savedStatus?.status || 'pending',
                comments: savedStatus?.comments,
                verified_at: savedStatus?.verified_at,
                hr_first_name: savedStatus?.hr_first_name,
                hr_last_name: savedStatus?.hr_last_name
              };
            }
            
            const docType = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            const verificationKey = `Demographics-${docType}`;
            const savedStatus = verificationMap.get(verificationKey);
            
            return {
              document_type: docType,
              document_section: 'Demographics',
              document_value: value,
              status: savedStatus?.status || 'pending',
              comments: savedStatus?.comments,
              verified_at: savedStatus?.verified_at,
              hr_first_name: savedStatus?.hr_first_name,
              hr_last_name: savedStatus?.hr_last_name
            };
          });
      }
      
      // Personal section
      if (result.data.personal) {
        verificationsData['Personal'] = Object.entries(result.data.personal)
          .filter(([key]) => !['id', 'fresher_id', 'created_at', 'updated_at'].includes(key))
          .filter(([key]) => !key.toLowerCase().includes('file_data'))
          .filter(([key]) => !key.toLowerCase().includes('file_name'))
          .filter(([key]) => !key.toLowerCase().includes('file_type'))
          .filter(([key]) => !key.toLowerCase().includes('file_size'))
          .filter(([key]) => !key.toLowerCase().includes('certificate_name'))
          .filter(([key]) => {
            const lowerKey = key.toLowerCase();
            return lowerKey !== 'emergency_contact_name' && 
                   lowerKey !== 'emergency_contact_phone' && 
                   lowerKey !== 'emergency_contact_relationship';
          })
          .map(([key, value]) => {
            const docType = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            const verificationKey = `Personal-${docType}`;
            const savedStatus = verificationMap.get(verificationKey);
            
            return {
              document_type: docType,
              document_section: 'Personal',
              document_value: value,
              status: savedStatus?.status || 'pending',
              comments: savedStatus?.comments,
              verified_at: savedStatus?.verified_at,
              hr_first_name: savedStatus?.hr_first_name,
              hr_last_name: savedStatus?.hr_last_name
            };
          });
      }
      
      // Education section - only include the 5 main verifiable fields
      if (result.data.education && result.data.education.length > 0) {
        const educationFields = ['qualification_type', 'qualification', 'university_institution', 'cgpa_percentage', 'year_of_passing'];
        
        verificationsData['Education'] = result.data.education.flatMap((edu: Education) => 
          Object.entries(edu)
            .filter(([key]) => educationFields.includes(key))
            .map(([key, value]) => {
              const docType = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
              const verificationKey = `Education-${docType}`;
              const savedStatus = verificationMap.get(verificationKey);
              
              return {
                document_type: docType,
                document_section: 'Education',
                document_value: value,
                status: savedStatus?.status || 'pending',
                comments: savedStatus?.comments,
                verified_at: savedStatus?.verified_at,
                hr_first_name: savedStatus?.hr_first_name,
                hr_last_name: savedStatus?.hr_last_name
              };
            })
        );
      }
      
      setVerifications(verificationsData);
    } catch (error: any) {
      console.error('Error fetching verification data:', error);
    }
  };

  const handleVerify = async (doc: DocumentVerification) => {
    const docKey = `${doc.document_section}-${doc.document_type}`;
    
    try {
      // Add to processing set
      setProcessingDocs(prev => new Set(prev).add(docKey));
      
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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to verify document');
      }

      // Update the verification status immediately in UI
      setVerifications(prev => {
        const updated = { ...prev };
        if (updated[doc.document_section]) {
          updated[doc.document_section] = updated[doc.document_section].map(d => 
            d.document_type === doc.document_type && d.document_section === doc.document_section
              ? { ...d, status: 'verified' }
              : d
          );
        }
        return updated;
      });

      // Refresh data to get any server-side updates
      await fetchVerificationData();
    } catch (error: any) {
      console.error('Error verifying document:', error);
      alert(error.message || 'Failed to verify document');
    } finally {
      // Remove from processing set
      setProcessingDocs(prev => {
        const updated = new Set(prev);
        updated.delete(docKey);
        return updated;
      });
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

    const docKey = `${selectedDocument.document_section}-${selectedDocument.document_type}`;

    try {
      setProcessing(true);
      setProcessingDocs(prev => new Set(prev).add(docKey));
      
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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to reject document');
      }

      // Update the verification status immediately in UI
      setVerifications(prev => {
        const updated = { ...prev };
        if (updated[selectedDocument.document_section]) {
          updated[selectedDocument.document_section] = updated[selectedDocument.document_section].map(d => 
            d.document_type === selectedDocument.document_type && d.document_section === selectedDocument.document_section
              ? { ...d, status: 'rejected', comments: rejectComments }
              : d
          );
        }
        return updated;
      });

      // Refresh data and close modal
      await fetchVerificationData();
      setRejectModalOpen(false);
      setSelectedDocument(null);
      setRejectComments('');
    } catch (error: any) {
      console.error('Error rejecting document:', error);
      alert(error.message || 'Failed to reject document');
    } finally {
      setProcessing(false);
      setProcessingDocs(prev => {
        const updated = new Set(prev);
        updated.delete(docKey);
        return updated;
      });
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

  const getSectionVerificationStatus = (sectionName: string) => {
    const sectionDocs = verifications[sectionName] || [];
    if (sectionDocs.length === 0) return { verified: 0, total: 0, allVerified: false };
    
    const verifiedCount = sectionDocs.filter(d => d.status === 'verified').length;
    const total = sectionDocs.length;
    
    return {
      verified: verifiedCount,
      total: total,
      allVerified: verifiedCount === total && total > 0
    };
  };

  const getTotalSectionsVerified = () => {
    const sections = ['Demographics', 'Personal', 'Education', 'Employment', 'Passport', 'Banking'];
    const verifiedSections = sections.filter(section => {
      const status = getSectionVerificationStatus(section);
      return status.allVerified;
    }).length;
    return { verified: verifiedSections, total: sections.length };
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
    
    // Only show document viewer for these specific fields
    const documentUrlFields = [
      'aadhaar_doc_file_url',
      'pan_file_url', 
      'resume_file_url',
      'documents',
      'document_urls'
    ];
    
    // Check if this is one of the designated document fields
    const isDesignatedDocField = documentUrlFields.some(field => 
      fieldName.toLowerCase().includes(field.toLowerCase())
    );
    
    if (!isDesignatedDocField) return false;
    
    // Check if value is a blob URL
    if (documentViewerService.isBlobUrl(value)) return true;
    
    // Check if value looks like base64 or binary data
    if (typeof value === 'string') {
      // Already a data URL
      if (value.startsWith('data:')) return true;
      
      // Check for base64 pattern - long string with base64 characters
      const isBase64Like = value.length > 100 && /^[A-Za-z0-9+/=\s]+$/.test(value.replace(/\s/g, ''));
      
      // Check for Buffer-like object in string format
      const isBufferLike = value.startsWith('{') && value.includes('"type":"Buffer"');
      
      // Check if it's a JSON array of document objects (with fileUrl or data)
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed) && parsed.length > 0) {
          if (parsed[0].fileUrl || parsed[0].data) return true;
        }
      } catch {
        // Not JSON, continue with other checks
      }
      
      return isBase64Like || isBufferLike;
    }
    
    // Check for Buffer object
    if (typeof value === 'object' && (value.type === 'Buffer' || value.data)) {
      return true;
    }
    
    return false;
  };

  const handleViewDocument = async (value: any, docType: string) => {
    try {
      // Check if value is a blob URL
      if (documentViewerService.isBlobUrl(value)) {
        const fileName = documentViewerService.extractFileName(value);
        await documentViewerService.viewBlobDocument(value, fileName);
        return;
      }

      // Legacy handling for base64 documents
      let documentUrl = '';
      
      if (typeof value === 'string') {
        // If it's already a data URL
        if (value.startsWith('data:')) {
          documentUrl = value;
        } else {
          // Try to parse as JSON first (might be array of documents)
          try {
            const parsed = JSON.parse(value);
            if (Array.isArray(parsed) && parsed.length > 0) {
              // Check if it's an array of blob URLs
              if (parsed[0].fileUrl) {
                await documentViewerService.viewBlobDocument(
                  parsed[0].fileUrl, 
                  parsed[0].fileName || 'Document'
                );
                return;
              } else if (parsed[0].data) {
                documentUrl = parsed[0].data;
              }
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
    } catch (error: any) {
      console.error('Error viewing document:', error);
      alert(error.message || 'Error opening document');
    }
  };

  const renderEmergencyContacts = (value: any) => {
    try {
      const contacts = typeof value === 'string' ? JSON.parse(value) : value;
      if (!Array.isArray(contacts) || contacts.length === 0) return 'Not provided';
      
      return (
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '14px',
          marginTop: '8px'
        }}>
          <thead>
            <tr style={{ backgroundColor: '#f9fafb' }}>
              <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #e5e7eb', fontWeight: '600' }}>Name</th>
              <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #e5e7eb', fontWeight: '600' }}>Mobile</th>
              <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #e5e7eb', fontWeight: '600' }}>Relationship</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((contact: any, index: number) => (
              <tr key={index}>
                <td style={{ padding: '8px', border: '1px solid #e5e7eb' }}>{contact.contact_person_name || contact.name || 'N/A'}</td>
                <td style={{ padding: '8px', border: '1px solid #e5e7eb' }}>{contact.mobile || 'N/A'}</td>
                <td style={{ padding: '8px', border: '1px solid #e5e7eb' }}>{contact.relationship || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    } catch (error) {
      console.error('Error parsing emergency contacts:', error);
      return 'Invalid format';
    }
  };

  const formatValue = (value: any, fieldName: string = '') => {
    if (value === null || value === undefined) return 'Not provided';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'object') return JSON.stringify(value);
    
    // Don't display file_data columns
    if (fieldName.toLowerCase().includes('file_data')) {
      return null;
    }
    
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
  const sectionsProgress = getTotalSectionsVerified();

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
            margin: '0 0 20px 0'
          }}>
            {fresherInfo.first_name || fresherInfo.last_name 
              ? `${fresherInfo.first_name || ''}${fresherInfo.first_name && fresherInfo.last_name ? ' ' : ''}${fresherInfo.last_name || ''}`.trim()
              : 'N/A'}
          </h1>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '20px',
            marginBottom: '20px'
          }}>
            <div>
              <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', fontWeight: '500' }}>Designation</div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>{fresherInfo.designation}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', fontWeight: '500' }}>Email</div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#374151', wordBreak: 'break-word' }}>{fresherInfo.email}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', fontWeight: '500' }}>Sections Completed</div>
              <div style={{ 
                fontSize: '18px', 
                fontWeight: '700', 
                color: sectionsProgress.verified === sectionsProgress.total ? '#10b981' : '#3b82f6' 
              }}>
                {sectionsProgress.verified} of {sectionsProgress.total}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', fontWeight: '500' }}>Fields Verified</div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: '#10b981' }}>{verifiedCount}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', fontWeight: '500' }}>Rejected</div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: '#ef4444' }}>{rejectedCount}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', fontWeight: '500' }}>Pending</div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: '#eab308' }}>{pendingCount}</div>
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
        {/* Demographics Section */}
        {verifications['Demographics'] && (
          <div
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
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h2 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#1f2937',
                margin: 0
              }}>
                Demographics
              </h2>
              <div style={{
                fontSize: '14px',
                fontWeight: '600',
                color: getSectionVerificationStatus('Demographics').allVerified ? '#10b981' : '#6b7280'
              }}>
                {getSectionVerificationStatus('Demographics').verified} / {getSectionVerificationStatus('Demographics').total} verified
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '14px'
              }}>
                <thead>
                  <tr style={{ backgroundColor: '#f9fafb' }}>
                    <th style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      fontWeight: '600',
                      color: '#374151',
                      borderBottom: '2px solid #e5e7eb',
                      width: '30%'
                    }}>Property</th>
                    <th style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      fontWeight: '600',
                      color: '#374151',
                      borderBottom: '2px solid #e5e7eb',
                      width: '50%'
                    }}>Value</th>
                    <th style={{
                      padding: '12px 16px',
                      textAlign: 'center',
                      fontWeight: '600',
                      color: '#374151',
                      borderBottom: '2px solid #e5e7eb',
                      width: '20%'
                    }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {verifications['Demographics'].map((doc, idx) => {
                    const status = getStatusBadge(doc.status || 'pending');
                    const docKey = `${doc.document_section}-${doc.document_type}`;
                    const isProcessing = processingDocs.has(docKey);
                    
                    return (
                      <tr key={idx} style={{
                        borderBottom: '1px solid #e5e7eb',
                        backgroundColor: idx % 2 === 0 ? 'white' : '#f9fafb'
                      }}>
                        <td style={{
                          padding: '12px 16px',
                          fontWeight: '500',
                          color: '#1f2937'
                        }}>
                          {doc.document_type}
                        </td>
                        <td style={{
                          padding: '12px 16px',
                          color: '#6b7280',
                          wordBreak: 'break-word'
                        }}>
                          {isDocumentField(doc.document_type, doc.document_value) ? (
                            <button
                              onClick={() => handleViewDocument(doc.document_value, doc.document_type)}
                              style={{
                                padding: '4px 12px',
                                backgroundColor: '#3b82f6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '12px',
                                fontWeight: '500',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <FiEye size={12} />
                              View
                            </button>
                          ) : documentViewerService.isBlobUrl(doc.document_value) ? (
                            <a
                              href={doc.document_value}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                color: '#3b82f6',
                                textDecoration: 'underline',
                                wordBreak: 'break-all'
                              }}
                            >
                              View Link
                            </a>
                          ) : (
                            <>
                              {formatValue(doc.document_value, doc.document_type)}
                              {doc.comments && (
                                <div style={{
                                  marginTop: '8px',
                                  padding: '8px',
                                  backgroundColor: '#fef2f2',
                                  borderRadius: '4px',
                                  borderLeft: '3px solid #ef4444',
                                  fontSize: '12px'
                                }}>
                                  <strong style={{ color: '#991b1b' }}>Rejection: </strong>
                                  <span style={{ color: '#7f1d1d' }}>{doc.comments}</span>
                                </div>
                              )}
                            </>
                          )}
                        </td>
                        <td style={{
                          padding: '12px 16px',
                          textAlign: 'center'
                        }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px'
                          }}>
                            {isProcessing ? (
                              <div style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '4px 8px',
                                color: '#6b7280',
                                fontSize: '11px'
                              }}>
                                <div style={{
                                  width: '16px',
                                  height: '16px',
                                  border: '2px solid #e5e7eb',
                                  borderTop: '2px solid #3b82f6',
                                  borderRadius: '50%',
                                  animation: 'spin 0.6s linear infinite'
                                }} />
                                Processing...
                              </div>
                            ) : doc.status === 'verified' ? (
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '4px 8px',
                                backgroundColor: status.bgColor,
                                color: status.color,
                                borderRadius: '12px',
                                fontSize: '11px',
                                fontWeight: '600'
                              }}>
                                {status.icon}
                                {status.label}
                              </span>
                            ) : doc.status === 'rejected' ? (
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '4px 8px',
                                backgroundColor: status.bgColor,
                                color: status.color,
                                borderRadius: '12px',
                                fontSize: '11px',
                                fontWeight: '600'
                              }}>
                                {status.icon}
                                {status.label}
                              </span>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleVerify(doc)}
                                  disabled={isProcessing}
                                  title="Verify"
                                  style={{
                                    padding: '6px',
                                    backgroundColor: isProcessing ? '#9ca3af' : '#10b981',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: isProcessing ? 'not-allowed' : 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}
                                >
                                  <FiCheckCircle size={16} />
                                </button>
                                <button
                                  onClick={() => handleReject(doc)}
                                  disabled={isProcessing}
                                  title="Reject"
                                  style={{
                                    padding: '6px',
                                    backgroundColor: isProcessing ? '#9ca3af' : '#ef4444',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: isProcessing ? 'not-allowed' : 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}
                                >
                                  <FiX size={16} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Personal Details Section */}
        {verifications['Personal'] && (
          <div
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
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h2 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#1f2937',
                margin: 0
              }}>
                Personal Details
              </h2>
              <div style={{
                fontSize: '14px',
                fontWeight: '600',
                color: getSectionVerificationStatus('Personal').allVerified ? '#10b981' : '#6b7280'
              }}>
                {getSectionVerificationStatus('Personal').verified} / {getSectionVerificationStatus('Personal').total} verified
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '14px'
              }}>
                <thead>
                  <tr style={{ backgroundColor: '#f9fafb' }}>
                    <th style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      fontWeight: '600',
                      color: '#374151',
                      borderBottom: '2px solid #e5e7eb',
                      width: '30%'
                    }}>Property</th>
                    <th style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      fontWeight: '600',
                      color: '#374151',
                      borderBottom: '2px solid #e5e7eb',
                      width: '50%'
                    }}>Value</th>
                    <th style={{
                      padding: '12px 16px',
                      textAlign: 'center',
                      fontWeight: '600',
                      color: '#374151',
                      borderBottom: '2px solid #e5e7eb',
                      width: '20%'
                    }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {verifications['Personal'].map((doc, idx) => {
                    const status = getStatusBadge(doc.status || 'pending');
                    const docKey = `${doc.document_section}-${doc.document_type}`;
                    const isProcessing = processingDocs.has(docKey);
                    const isEmergencyContacts = doc.document_type.toLowerCase().includes('emergency contact');
                    
                    return (
                      <tr key={idx} style={{
                        borderBottom: '1px solid #e5e7eb',
                        backgroundColor: idx % 2 === 0 ? 'white' : '#f9fafb'
                      }}>
                        <td style={{
                          padding: '12px 16px',
                          fontWeight: '500',
                          color: '#1f2937'
                        }}>
                          {doc.document_type}
                        </td>
                        <td style={{
                          padding: '12px 16px',
                          color: '#6b7280',
                          wordBreak: 'break-word'
                        }}>
                          {isEmergencyContacts ? (
                            renderEmergencyContacts(doc.document_value)
                          ) : (
                            <>
                              {formatValue(doc.document_value, doc.document_type)}
                              {isDocumentField(doc.document_type, doc.document_value) && (
                                <button
                                  onClick={() => handleViewDocument(doc.document_value, doc.document_type)}
                                  style={{
                                    marginLeft: '12px',
                                    padding: '6px 12px',
                                    backgroundColor: '#3b82f6',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '12px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                  }}
                                >
                                  <FiFile style={{ width: '14px', height: '14px' }} />
                                  View Document
                                </button>
                              )}
                            </>
                          )}
                          {doc.comments && (
                            <div style={{
                              marginTop: '8px',
                              padding: '8px',
                              backgroundColor: '#fef2f2',
                              borderRadius: '4px',
                              borderLeft: '3px solid #ef4444',
                              fontSize: '12px'
                            }}>
                              <strong style={{ color: '#991b1b' }}>Rejection: </strong>
                              <span style={{ color: '#7f1d1d' }}>{doc.comments}</span>
                            </div>
                          )}
                        </td>
                        <td style={{
                          padding: '12px 16px',
                          textAlign: 'center'
                        }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px'
                          }}>
                            {isProcessing ? (
                              <div style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '4px 8px',
                                color: '#6b7280',
                                fontSize: '11px'
                              }}>
                                <div style={{
                                  width: '16px',
                                  height: '16px',
                                  border: '2px solid #e5e7eb',
                                  borderTop: '2px solid #3b82f6',
                                  borderRadius: '50%',
                                  animation: 'spin 0.6s linear infinite'
                                }} />
                                Processing...
                              </div>
                            ) : doc.status === 'verified' ? (
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '4px 8px',
                                backgroundColor: status.bgColor,
                                color: status.color,
                                borderRadius: '12px',
                                fontSize: '11px',
                                fontWeight: '600'
                              }}>
                                {status.icon}
                                {status.label}
                              </span>
                            ) : doc.status === 'rejected' ? (
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '4px 8px',
                                backgroundColor: status.bgColor,
                                color: status.color,
                                borderRadius: '12px',
                                fontSize: '11px',
                                fontWeight: '600'
                              }}>
                                {status.icon}
                                {status.label}
                              </span>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleVerify(doc)}
                                  disabled={isProcessing}
                                  title="Verify"
                                  style={{
                                    padding: '6px',
                                    backgroundColor: isProcessing ? '#9ca3af' : '#10b981',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: isProcessing ? 'not-allowed' : 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}
                                >
                                  <FiCheckCircle size={16} />
                                </button>
                                <button
                                  onClick={() => handleReject(doc)}
                                  disabled={isProcessing}
                                  title="Reject"
                                  style={{
                                    padding: '6px',
                                    backgroundColor: isProcessing ? '#9ca3af' : '#ef4444',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: isProcessing ? 'not-allowed' : 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}
                                >
                                  <FiX size={16} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Education Section */}
        {verifications['Education'] && (
          <div
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
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h2 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#1f2937',
                margin: 0
              }}>
                Education
              </h2>
              <div style={{
                fontSize: '14px',
                fontWeight: '600',
                color: getSectionVerificationStatus('Education').allVerified ? '#10b981' : '#6b7280'
              }}>
                {getSectionVerificationStatus('Education').verified} / {getSectionVerificationStatus('Education').total} verified
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '14px'
              }}>
                <thead>
                  <tr style={{ backgroundColor: '#f9fafb' }}>
                    <th style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      fontWeight: '600',
                      color: '#374151',
                      borderBottom: '2px solid #e5e7eb'
                    }}>Qualification Type</th>
                    <th style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      fontWeight: '600',
                      color: '#374151',
                      borderBottom: '2px solid #e5e7eb'
                    }}>Qualification</th>
                    <th style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      fontWeight: '600',
                      color: '#374151',
                      borderBottom: '2px solid #e5e7eb'
                    }}>University/Institution</th>
                    <th style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      fontWeight: '600',
                      color: '#374151',
                      borderBottom: '2px solid #e5e7eb'
                    }}>CGPA/Percentage</th>
                    <th style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      fontWeight: '600',
                      color: '#374151',
                      borderBottom: '2px solid #e5e7eb'
                    }}>Year of Passing</th>
                    <th style={{
                      padding: '12px 16px',
                      textAlign: 'center',
                      fontWeight: '600',
                      color: '#374151',
                      borderBottom: '2px solid #e5e7eb'
                    }}>Document</th>
                    <th style={{
                      padding: '12px 16px',
                      textAlign: 'center',
                      fontWeight: '600',
                      color: '#374151',
                      borderBottom: '2px solid #e5e7eb',
                      width: '120px'
                    }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {bgvData?.education && bgvData.education.map((edu, idx) => {
                    // Get status for each field
                    const qualTypeDoc = verifications['Education']?.find(d => 
                      d.document_value === edu.qualification_type && d.document_type.includes('Qualification Type')
                    );
                    const qualDoc = verifications['Education']?.find(d => 
                      d.document_value === edu.qualification && d.document_type === 'Qualification'
                    );
                    const uniDoc = verifications['Education']?.find(d => 
                      d.document_value === edu.university_institution && d.document_type.includes('University')
                    );
                    const cgpaDoc = verifications['Education']?.find(d => 
                      d.document_value === edu.cgpa_percentage && d.document_type.includes('Cgpa')
                    );
                    const yearDoc = verifications['Education']?.find(d => 
                      d.document_value === edu.year_of_passing && d.document_type.includes('Year')
                    );
                    const docUrlDoc = verifications['Education']?.find(d => 
                      d.document_type === 'Documents'
                    );

                    // Create a combined document for row-level verification
                    const rowDoc: DocumentVerification = {
                      document_type: `Education Record ${idx + 1}`,
                      document_section: 'Education',
                      document_value: edu,
                      status: 'pending'
                    };

                    const status = getStatusBadge(rowDoc.status || 'pending');
                    const docKey = `${rowDoc.document_section}-${rowDoc.document_type}`;
                    const isProcessing = processingDocs.has(docKey);

                    return (
                      <tr key={idx} style={{
                        borderBottom: '1px solid #e5e7eb',
                        backgroundColor: idx % 2 === 0 ? 'white' : '#f9fafb'
                      }}>
                        <td style={{
                          padding: '12px 16px',
                          color: '#6b7280'
                        }}>
                          {edu.qualification_type || 'N/A'}
                        </td>
                        <td style={{
                          padding: '12px 16px',
                          color: '#6b7280'
                        }}>
                          {edu.qualification || 'N/A'}
                        </td>
                        <td style={{
                          padding: '12px 16px',
                          color: '#6b7280'
                        }}>
                          {edu.university_institution || 'N/A'}
                        </td>
                        <td style={{
                          padding: '12px 16px',
                          color: '#6b7280'
                        }}>
                          {edu.cgpa_percentage || 'N/A'}
                        </td>
                        <td style={{
                          padding: '12px 16px',
                          color: '#6b7280'
                        }}>
                          {edu.year_of_passing || 'N/A'}
                        </td>
                        <td style={{
                          padding: '12px 16px',
                          textAlign: 'center'
                        }}>
                          {(() => {
                            // Check for document_url (from database) or documents field
                            const docUrl = edu.document_url || edu.documents;
                            const hasDocument = docUrl && docUrl !== 'null' && docUrl.toString().trim() !== '';
                            
                            return hasDocument ? (
                              <button
                                onClick={async () => {
                                  try {
                                    let documentUrl = docUrl;
                                    
                                    // Parse if it's a JSON string containing document array
                                    if (typeof documentUrl === 'string' && documentUrl.trim().startsWith('[')) {
                                      const docs = JSON.parse(documentUrl);
                                      if (docs.length > 0 && docs[0].fileUrl) {
                                        documentUrl = docs[0].fileUrl;
                                      }
                                    }
                                    
                                    // If it's already a blob URL or http URL, open directly
                                    if (documentUrl && (documentViewerService.isBlobUrl(documentUrl) || documentUrl.startsWith('http'))) {
                                      window.open(documentUrl, '_blank');
                                    } else if (documentUrl) {
                                      // Otherwise use the view document handler
                                      handleViewDocument(documentUrl, 'Education Document');
                                    }
                                  } catch (error) {
                                    console.error('Error viewing document:', error);
                                    alert('Failed to view document');
                                  }
                                }}
                                style={{
                                  padding: '4px 12px',
                                  backgroundColor: '#3b82f6',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  fontSize: '12px',
                                  fontWeight: '500',
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                <FiEye size={12} />
                                View
                              </button>
                            ) : (
                              <span style={{ color: '#9ca3af', fontSize: '12px' }}>No document</span>
                            );
                          })()}
                        </td>
                        <td style={{
                          padding: '12px 16px',
                          textAlign: 'center'
                        }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px'
                          }}>
                            {isProcessing ? (
                              <div style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '4px 8px',
                                color: '#6b7280',
                                fontSize: '11px'
                              }}>
                                <div style={{
                                  width: '16px',
                                  height: '16px',
                                  border: '2px solid #e5e7eb',
                                  borderTop: '2px solid #3b82f6',
                                  borderRadius: '50%',
                                  animation: 'spin 0.6s linear infinite'
                                }} />
                                Processing...
                              </div>
                            ) : rowDoc.status === 'verified' ? (
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '4px 8px',
                                backgroundColor: status.bgColor,
                                color: status.color,
                                borderRadius: '12px',
                                fontSize: '11px',
                                fontWeight: '600'
                              }}>
                                {status.icon}
                                {status.label}
                              </span>
                            ) : rowDoc.status === 'rejected' ? (
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '4px 8px',
                                backgroundColor: status.bgColor,
                                color: status.color,
                                borderRadius: '12px',
                                fontSize: '11px',
                                fontWeight: '600'
                              }}>
                                {status.icon}
                                {status.label}
                              </span>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleVerify(rowDoc)}
                                  disabled={isProcessing}
                                  title="Verify"
                                  style={{
                                    padding: '6px',
                                    backgroundColor: isProcessing ? '#9ca3af' : '#10b981',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: isProcessing ? 'not-allowed' : 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}
                                >
                                  <FiCheckCircle size={16} />
                                </button>
                                <button
                                  onClick={() => handleReject(rowDoc)}
                                  disabled={isProcessing}
                                  title="Reject"
                                  style={{
                                    padding: '6px',
                                    backgroundColor: isProcessing ? '#9ca3af' : '#ef4444',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: isProcessing ? 'not-allowed' : 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}
                                >
                                  <FiX size={16} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Employment History Section */}
        {verifications['Employment'] && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '700',
                color: '#1f2937',
                margin: 0
              }}>
                Employment History
              </h3>
              <div style={{
                fontSize: '14px',
                fontWeight: '600',
                color: getSectionVerificationStatus('Employment').allVerified ? '#10b981' : '#eab308',
                padding: '6px 12px',
                backgroundColor: getSectionVerificationStatus('Employment').allVerified ? '#d1fae5' : '#fef9c3',
                borderRadius: '12px'
              }}>
                {getSectionVerificationStatus('Employment').verified} / {getSectionVerificationStatus('Employment').total} verified
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '14px'
              }}>
                <thead>
                  <tr style={{ backgroundColor: '#f9fafb' }}>
                    <th style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      fontWeight: '600',
                      color: '#374151',
                      borderBottom: '2px solid #e5e7eb',
                      width: '30%'
                    }}>Property</th>
                    <th style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      fontWeight: '600',
                      color: '#374151',
                      borderBottom: '2px solid #e5e7eb',
                      width: '50%'
                    }}>Value</th>
                    <th style={{
                      padding: '12px 16px',
                      textAlign: 'center',
                      fontWeight: '600',
                      color: '#374151',
                      borderBottom: '2px solid #e5e7eb',
                      width: '20%'
                    }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {verifications['Employment'].length === 0 ? (
                    <tr>
                      <td colSpan={3} style={{
                        padding: '40px',
                        textAlign: 'center',
                        color: '#9ca3af',
                        fontSize: '14px'
                      }}>
                        No employment history data submitted yet
                      </td>
                    </tr>
                  ) : (
                    verifications['Employment'].map((doc, idx) => {
                      const status = getStatusBadge(doc.status || 'pending');
                      const docKey = `${doc.document_section}-${doc.document_type}`;
                      const isProcessing = processingDocs.has(docKey);
                      
                      return (
                      <tr key={idx} style={{
                        borderBottom: '1px solid #e5e7eb',
                        backgroundColor: idx % 2 === 0 ? 'white' : '#f9fafb'
                      }}>
                        <td style={{
                          padding: '12px 16px',
                          fontWeight: '500',
                          color: '#1f2937'
                        }}>
                          {doc.document_type}
                        </td>
                        <td style={{
                          padding: '12px 16px',
                          color: '#6b7280',
                          wordBreak: 'break-word'
                        }}>
                          {formatValue(doc.document_value, doc.document_type)}
                          {doc.comments && (
                            <div style={{
                              marginTop: '8px',
                              padding: '8px',
                              backgroundColor: '#fef2f2',
                              borderRadius: '4px',
                              borderLeft: '3px solid #ef4444',
                              fontSize: '12px'
                            }}>
                              <strong style={{ color: '#991b1b' }}>Rejection: </strong>
                              <span style={{ color: '#7f1d1d' }}>{doc.comments}</span>
                            </div>
                          )}
                        </td>
                        <td style={{
                          padding: '12px 16px',
                          textAlign: 'center'
                        }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px'
                          }}>
                            {isProcessing ? (
                              <div style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '4px 8px',
                                color: '#6b7280',
                                fontSize: '11px'
                              }}>
                                <div style={{
                                  width: '16px',
                                  height: '16px',
                                  border: '2px solid #e5e7eb',
                                  borderTop: '2px solid #3b82f6',
                                  borderRadius: '50%',
                                  animation: 'spin 0.6s linear infinite'
                                }} />
                                Processing...
                              </div>
                            ) : doc.status === 'verified' || doc.status === 'rejected' ? (
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '4px 8px',
                                backgroundColor: status.bgColor,
                                color: status.color,
                                borderRadius: '12px',
                                fontSize: '11px',
                                fontWeight: '600'
                              }}>
                                {status.icon}
                                {status.label}
                              </span>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleVerify(doc)}
                                  disabled={isProcessing}
                                  title="Verify"
                                  style={{
                                    padding: '6px',
                                    backgroundColor: isProcessing ? '#9ca3af' : '#10b981',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: isProcessing ? 'not-allowed' : 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}
                                >
                                  <FiCheckCircle size={16} />
                                </button>
                                <button
                                  onClick={() => handleReject(doc)}
                                  disabled={isProcessing}
                                  title="Reject"
                                  style={{
                                    padding: '6px',
                                    backgroundColor: isProcessing ? '#9ca3af' : '#ef4444',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: isProcessing ? 'not-allowed' : 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}
                                >
                                  <FiX size={16} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Passport & Visa Section */}
        {verifications['Passport'] && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '700',
                color: '#1f2937',
                margin: 0
              }}>
                Passport & Visa
              </h3>
              <div style={{
                fontSize: '14px',
                fontWeight: '600',
                color: getSectionVerificationStatus('Passport').allVerified ? '#10b981' : '#eab308',
                padding: '6px 12px',
                backgroundColor: getSectionVerificationStatus('Passport').allVerified ? '#d1fae5' : '#fef9c3',
                borderRadius: '12px'
              }}>
                {getSectionVerificationStatus('Passport').verified} / {getSectionVerificationStatus('Passport').total} verified
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '14px'
              }}>
                <thead>
                  <tr style={{ backgroundColor: '#f9fafb' }}>
                    <th style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      fontWeight: '600',
                      color: '#374151',
                      borderBottom: '2px solid #e5e7eb',
                      width: '30%'
                    }}>Property</th>
                    <th style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      fontWeight: '600',
                      color: '#374151',
                      borderBottom: '2px solid #e5e7eb',
                      width: '50%'
                    }}>Value</th>
                    <th style={{
                      padding: '12px 16px',
                      textAlign: 'center',
                      fontWeight: '600',
                      color: '#374151',
                      borderBottom: '2px solid #e5e7eb',
                      width: '20%'
                    }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {verifications['Passport'].length === 0 ? (
                    <tr>
                      <td colSpan={3} style={{
                        padding: '40px',
                        textAlign: 'center',
                        color: '#9ca3af',
                        fontSize: '14px'
                      }}>
                        No passport/visa data submitted yet
                      </td>
                    </tr>
                  ) : (
                    verifications['Passport'].map((doc, idx) => {
                      const status = getStatusBadge(doc.status || 'pending');
                      const docKey = `${doc.document_section}-${doc.document_type}`;
                      const isProcessing = processingDocs.has(docKey);
                      
                      return (
                      <tr key={idx} style={{
                        borderBottom: '1px solid #e5e7eb',
                        backgroundColor: idx % 2 === 0 ? 'white' : '#f9fafb'
                      }}>
                        <td style={{
                          padding: '12px 16px',
                          fontWeight: '500',
                          color: '#1f2937'
                        }}>
                          {doc.document_type}
                        </td>
                        <td style={{
                          padding: '12px 16px',
                          color: '#6b7280',
                          wordBreak: 'break-word'
                        }}>
                          {formatValue(doc.document_value, doc.document_type)}
                          {doc.comments && (
                            <div style={{
                              marginTop: '8px',
                              padding: '8px',
                              backgroundColor: '#fef2f2',
                              borderRadius: '4px',
                              borderLeft: '3px solid #ef4444',
                              fontSize: '12px'
                            }}>
                              <strong style={{ color: '#991b1b' }}>Rejection: </strong>
                              <span style={{ color: '#7f1d1d' }}>{doc.comments}</span>
                            </div>
                          )}
                        </td>
                        <td style={{
                          padding: '12px 16px',
                          textAlign: 'center'
                        }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px'
                          }}>
                            {isProcessing ? (
                              <div style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '4px 8px',
                                color: '#6b7280',
                                fontSize: '11px'
                              }}>
                                <div style={{
                                  width: '16px',
                                  height: '16px',
                                  border: '2px solid #e5e7eb',
                                  borderTop: '2px solid #3b82f6',
                                  borderRadius: '50%',
                                  animation: 'spin 0.6s linear infinite'
                                }} />
                                Processing...
                              </div>
                            ) : doc.status === 'verified' || doc.status === 'rejected' ? (
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '4px 8px',
                                backgroundColor: status.bgColor,
                                color: status.color,
                                borderRadius: '12px',
                                fontSize: '11px',
                                fontWeight: '600'
                              }}>
                                {status.icon}
                                {status.label}
                              </span>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleVerify(doc)}
                                  disabled={isProcessing}
                                  title="Verify"
                                  style={{
                                    padding: '6px',
                                    backgroundColor: isProcessing ? '#9ca3af' : '#10b981',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: isProcessing ? 'not-allowed' : 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}
                                >
                                  <FiCheckCircle size={16} />
                                </button>
                                <button
                                  onClick={() => handleReject(doc)}
                                  disabled={isProcessing}
                                  title="Reject"
                                  style={{
                                    padding: '6px',
                                    backgroundColor: isProcessing ? '#9ca3af' : '#ef4444',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: isProcessing ? 'not-allowed' : 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}
                                >
                                  <FiX size={16} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Bank/PF/NPS Section */}
        {verifications['Banking'] && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '700',
                color: '#1f2937',
                margin: 0
              }}>
                Bank/PF/NPS Details
              </h3>
              <div style={{
                fontSize: '14px',
                fontWeight: '600',
                color: getSectionVerificationStatus('Banking').allVerified ? '#10b981' : '#eab308',
                padding: '6px 12px',
                backgroundColor: getSectionVerificationStatus('Banking').allVerified ? '#d1fae5' : '#fef9c3',
                borderRadius: '12px'
              }}>
                {getSectionVerificationStatus('Banking').verified} / {getSectionVerificationStatus('Banking').total} verified
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '14px'
              }}>
                <thead>
                  <tr style={{ backgroundColor: '#f9fafb' }}>
                    <th style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      fontWeight: '600',
                      color: '#374151',
                      borderBottom: '2px solid #e5e7eb',
                      width: '30%'
                    }}>Property</th>
                    <th style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      fontWeight: '600',
                      color: '#374151',
                      borderBottom: '2px solid #e5e7eb',
                      width: '50%'
                    }}>Value</th>
                    <th style={{
                      padding: '12px 16px',
                      textAlign: 'center',
                      fontWeight: '600',
                      color: '#374151',
                      borderBottom: '2px solid #e5e7eb',
                      width: '20%'
                    }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {verifications['Banking'].length === 0 ? (
                    <tr>
                      <td colSpan={3} style={{
                        padding: '40px',
                        textAlign: 'center',
                        color: '#9ca3af',
                        fontSize: '14px'
                      }}>
                        No bank/PF/NPS data submitted yet
                      </td>
                    </tr>
                  ) : (
                    verifications['Banking'].map((doc, idx) => {
                      const status = getStatusBadge(doc.status || 'pending');
                      const docKey = `${doc.document_section}-${doc.document_type}`;
                      const isProcessing = processingDocs.has(docKey);
                    
                    return (
                      <tr key={idx} style={{
                        borderBottom: '1px solid #e5e7eb',
                        backgroundColor: idx % 2 === 0 ? 'white' : '#f9fafb'
                      }}>
                        <td style={{
                          padding: '12px 16px',
                          fontWeight: '500',
                          color: '#1f2937'
                        }}>
                          {doc.document_type}
                        </td>
                        <td style={{
                          padding: '12px 16px',
                          color: '#6b7280',
                          wordBreak: 'break-word'
                        }}>
                          {formatValue(doc.document_value, doc.document_type)}
                          {doc.comments && (
                            <div style={{
                              marginTop: '8px',
                              padding: '8px',
                              backgroundColor: '#fef2f2',
                              borderRadius: '4px',
                              borderLeft: '3px solid #ef4444',
                              fontSize: '12px'
                            }}>
                              <strong style={{ color: '#991b1b' }}>Rejection: </strong>
                              <span style={{ color: '#7f1d1d' }}>{doc.comments}</span>
                            </div>
                          )}
                        </td>
                        <td style={{
                          padding: '12px 16px',
                          textAlign: 'center'
                        }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px'
                          }}>
                            {isProcessing ? (
                              <div style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '4px 8px',
                                color: '#6b7280',
                                fontSize: '11px'
                              }}>
                                <div style={{
                                  width: '16px',
                                  height: '16px',
                                  border: '2px solid #e5e7eb',
                                  borderTop: '2px solid #3b82f6',
                                  borderRadius: '50%',
                                  animation: 'spin 0.6s linear infinite'
                                }} />
                                Processing...
                              </div>
                            ) : doc.status === 'verified' || doc.status === 'rejected' ? (
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '4px 8px',
                                backgroundColor: status.bgColor,
                                color: status.color,
                                borderRadius: '12px',
                                fontSize: '11px',
                                fontWeight: '600'
                              }}>
                                {status.icon}
                                {status.label}
                              </span>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleVerify(doc)}
                                  disabled={isProcessing}
                                  title="Verify"
                                  style={{
                                    padding: '6px',
                                    backgroundColor: isProcessing ? '#9ca3af' : '#10b981',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: isProcessing ? 'not-allowed' : 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}
                                >
                                  <FiCheckCircle size={16} />
                                </button>
                                <button
                                  onClick={() => handleReject(doc)}
                                  disabled={isProcessing}
                                  title="Reject"
                                  style={{
                                    padding: '6px',
                                    backgroundColor: isProcessing ? '#9ca3af' : '#ef4444',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: isProcessing ? 'not-allowed' : 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}
                                >
                                  <FiX size={16} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
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
