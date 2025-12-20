/**
 * HR Add User - Manual fresher onboarding form
 * Allows HR to create new user accounts and send welcome emails
 */

import React, { useState } from 'react';
import { 
  FiUser, 
  FiMail, 
  FiCalendar, 
  FiPhone, 
  FiBriefcase, 
  FiUserPlus,
  FiLoader,
  FiCheckCircle,
  FiAlertCircle
} from 'react-icons/fi';
import { hrApiService } from '../../services/hrApi';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  phoneNumber: string;
  joiningDate: string;
  designation: string;
  department: string;
  baseLocation: string;
}

interface FormErrors {
  [key: string]: string;
}

export const HrAddUser = () => {
  console.log('HR Add User rendering...');

  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    dateOfBirth: '',
    phoneNumber: '',
    joiningDate: '',
    designation: '',
    department: '',
    baseLocation: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Required field validations
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    } else {
      const dob = new Date(formData.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - dob.getFullYear();
      if (age < 16 || age > 70) {
        newErrors.dateOfBirth = 'Please enter a valid date of birth (age 16-70)';
      }
    }

    // Optional field validations
    if (formData.phoneNumber && !/^[\+]?[1-9][\d]{0,15}$/.test(formData.phoneNumber.replace(/[\s\-\(\)]/g, ''))) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }

    if (formData.joiningDate) {
      const joiningDate = new Date(formData.joiningDate);
      const today = new Date();
      if (joiningDate < today) {
        newErrors.joiningDate = 'Joining date cannot be in the past';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setSubmitStatus('idle');

    try {
      // Use the HR API service to create the fresher
      const result = await hrApiService.createFresher({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        dateOfBirth: formData.dateOfBirth,
        phoneNumber: formData.phoneNumber || undefined,
        joiningDate: formData.joiningDate || undefined,
        designation: formData.designation || undefined,
        department: formData.department || undefined,
        baseLocation: formData.baseLocation || undefined,
      });
      
      // TODO: Handle different response scenarios based on backend implementation
      setSubmitStatus('success');
      setSubmitMessage(`User account created successfully! Welcome email sent to ${formData.email}`);
      
      // Reset form on success
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        dateOfBirth: '',
        phoneNumber: '',
        joiningDate: '',
        designation: '',
        department: '',
        baseLocation: ''
      });

    } catch (error) {
      console.error('Error creating user:', error);
      setSubmitStatus('error');
      
      // Show the specific error message from the backend
      const errorMessage = error instanceof Error ? error.message : 'Failed to create user account. Please try again or contact IT support.';
      setSubmitMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', backgroundColor: 'white', minHeight: '500px' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <FiUserPlus style={{ width: '32px', height: '32px', color: '#2563eb' }} />
          <h1 style={{ 
            color: '#1f2937', 
            fontSize: '32px', 
            fontWeight: 'bold',
            margin: 0
          }}>
            Add New User
          </h1>
        </div>
        <p style={{ 
          color: '#6b7280', 
          fontSize: '16px',
          margin: 0
        }}>
          Create a new fresher account and send welcome email with login credentials
        </p>
      </div>

      {/* Submit Status Messages */}
      {submitStatus !== 'idle' && (
        <div style={{
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          backgroundColor: submitStatus === 'success' ? '#f0fdf4' : '#fef2f2',
          border: `1px solid ${submitStatus === 'success' ? '#bbf7d0' : '#fecaca'}`,
          color: submitStatus === 'success' ? '#166534' : '#dc2626'
        }}>
          {submitStatus === 'success' ? (
            <FiCheckCircle style={{ width: '20px', height: '20px' }} />
          ) : (
            <FiAlertCircle style={{ width: '20px', height: '20px' }} />
          )}
          <span style={{ fontSize: '14px', fontWeight: '500' }}>
            {submitMessage}
          </span>
        </div>
      )}

      {/* Add User Form */}
      <form onSubmit={handleSubmit} style={{
        backgroundColor: 'white',
        padding: '32px',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        maxWidth: '800px'
      }}>
        {/* Personal Information Section */}
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <FiUser style={{ width: '20px', height: '20px', color: '#2563eb' }} />
            Personal Information
          </h3>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px',
            marginBottom: '20px'
          }}>
            {/* First Name */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                First Name *
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                placeholder="Enter first name"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: `1px solid ${errors.firstName ? '#ef4444' : '#d1d5db'}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: '#374151',
                  backgroundColor: 'white'
                }}
              />
              {errors.firstName && (
                <span style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px', display: 'block' }}>
                  {errors.firstName}
                </span>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Last Name *
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                placeholder="Enter last name"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: `1px solid ${errors.lastName ? '#ef4444' : '#d1d5db'}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: '#374151',
                  backgroundColor: 'white'
                }}
              />
              {errors.lastName && (
                <span style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px', display: 'block' }}>
                  {errors.lastName}
                </span>
              )}
            </div>
          </div>

          {/* Email and Date of Birth */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px'
          }}>
            {/* Email */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                <FiMail style={{ width: '14px', height: '14px', display: 'inline', marginRight: '6px' }} />
                Email Address *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter email address"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: `1px solid ${errors.email ? '#ef4444' : '#d1d5db'}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: '#374151',
                  backgroundColor: 'white'
                }}
              />
              {errors.email && (
                <span style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px', display: 'block' }}>
                  {errors.email}
                </span>
              )}
            </div>

            {/* Date of Birth */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                <FiCalendar style={{ width: '14px', height: '14px', display: 'inline', marginRight: '6px' }} />
                Date of Birth *
              </label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: `1px solid ${errors.dateOfBirth ? '#ef4444' : '#d1d5db'}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: '#374151',
                  backgroundColor: 'white'
                }}
              />
              {errors.dateOfBirth && (
                <span style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px', display: 'block' }}>
                  {errors.dateOfBirth}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Professional Information Section */}
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <FiBriefcase style={{ width: '20px', height: '20px', color: '#2563eb' }} />
            Professional Information
          </h3>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px',
            marginBottom: '20px'
          }}>
            {/* Phone Number */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                <FiPhone style={{ width: '14px', height: '14px', display: 'inline', marginRight: '6px' }} />
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                placeholder="Enter phone number"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: `1px solid ${errors.phoneNumber ? '#ef4444' : '#d1d5db'}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: '#374151',
                  backgroundColor: 'white'
                }}
              />
              {errors.phoneNumber && (
                <span style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px', display: 'block' }}>
                  {errors.phoneNumber}
                </span>
              )}
            </div>

            {/* Joining Date */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                <FiCalendar style={{ width: '14px', height: '14px', display: 'inline', marginRight: '6px' }} />
                Joining Date
              </label>
              <input
                type="date"
                value={formData.joiningDate}
                onChange={(e) => handleInputChange('joiningDate', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: `1px solid ${errors.joiningDate ? '#ef4444' : '#d1d5db'}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: '#374151',
                  backgroundColor: 'white'
                }}
              />
              {errors.joiningDate && (
                <span style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px', display: 'block' }}>
                  {errors.joiningDate}
                </span>
              )}
            </div>
          </div>

          {/* Role/Designation */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Role / Designation
            </label>
            <select
              value={formData.designation}
              onChange={(e) => handleInputChange('designation', e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: `1px solid ${errors.designation ? '#ef4444' : '#d1d5db'}`,
                borderRadius: '8px',
                fontSize: '14px',
                color: '#374151',
                backgroundColor: 'white',
                cursor: 'pointer'
              }}
            >
              <option value="">Select designation</option>
              <option value="SDT">SDT</option>
              <option value="SDE">SDE</option>
              <option value="Technical Lead">Technical Lead</option>
              <option value="Module Lead">Module Lead</option>
              <option value="Architect">Architect</option>
              <option value="Principal Architect">Principal Architect</option>
            </select>
            {errors.designation && (
              <span style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px', display: 'block' }}>
                {errors.designation}
              </span>
            )}
          </div>

          {/* Department */}
          <div style={{ marginTop: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Department
            </label>
            <select
              value={formData.department}
              onChange={(e) => handleInputChange('department', e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: `1px solid ${errors.department ? '#ef4444' : '#d1d5db'}`,
                borderRadius: '8px',
                fontSize: '14px',
                color: '#374151',
                backgroundColor: 'white',
                cursor: 'pointer'
              }}
            >
              <option value="">Select department</option>
              <option value="D&A">D&A</option>
              <option value="App Dev">App Dev</option>
              <option value="Agentic AI">Agentic AI</option>
              <option value="HR">HR</option>
              <option value="Admin">Admin</option>
              <option value="Finance">Finance</option>
              <option value="Delivery">Delivery</option>
              <option value="IT">IT</option>
              <option value="L&D">L&D</option>
              <option value="Operations">Operations</option>
              <option value="Support">Support</option>
            </select>
            {errors.department && (
              <span style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px', display: 'block' }}>
                {errors.department}
              </span>
            )}
          </div>

          {/* Location */}
          <div style={{ marginTop: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Location
            </label>
            <select
              value={formData.baseLocation}
              onChange={(e) => handleInputChange('baseLocation', e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: `1px solid ${errors.baseLocation ? '#ef4444' : '#d1d5db'}`,
                borderRadius: '8px',
                fontSize: '14px',
                color: '#374151',
                backgroundColor: 'white',
                cursor: 'pointer'
              }}
            >
              <option value="">Select location</option>
              <option value="Hyderabad">Hyderabad</option>
              <option value="Banglore">Banglore</option>
            </select>
            {errors.baseLocation && (
              <span style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px', display: 'block' }}>
                {errors.baseLocation}
              </span>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: '24px',
          borderTop: '1px solid #e2e8f0'
        }}>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>
            * Required fields
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '14px 24px',
              backgroundColor: isLoading ? '#9ca3af' : '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s ease'
            }}
          >
            {isLoading ? (
              <FiLoader style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
            ) : (
              <FiUserPlus style={{ width: '16px', height: '16px' }} />
            )}
            {isLoading ? 'Creating User...' : 'Create User & Send Welcome Email'}
          </button>
        </div>
      </form>

      {/* Security Note */}
      <div style={{
        marginTop: '24px',
        padding: '16px',
        backgroundColor: '#f0f9ff',
        border: '1px solid #bae6fd',
        borderRadius: '8px',
        fontSize: '14px',
        color: '#0c4a6e'
      }}>
        <strong>Security Note:</strong> A temporary password will be generated and sent to the user's email. 
        Users will be required to change their password on first login for security.
      </div>

      {/* TODO Comments for Future Enhancements */}
      {/* TODO: Add bulk user upload feature */}
      {/* TODO: Implement user role management */}
      {/* TODO: Add user avatar upload */}
      {/* TODO: Integrate with LDAP/Active Directory */}
      {/* TODO: Add email template customization */}
      {/* TODO: Implement magic link authentication flow */}
    </div>
  );
};