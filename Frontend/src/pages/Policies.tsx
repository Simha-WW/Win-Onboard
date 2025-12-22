/**
 * Policies Page - Contains company policies and documents for download
 */

import React, { useState, useEffect } from 'react';
import { FiFileText, FiDownload, FiEye, FiFile } from 'react-icons/fi';
import { API_BASE_URL } from '../config';

interface PolicyDocument {
  id: string;
  name: string;
  fileName: string;
  type: string;
  size: string;
  status: 'required' | 'optional';
  sasUrl?: string;
}

export const Policies = () => {
  console.log('Policies component rendering...');
  
  const [documents, setDocuments] = useState<PolicyDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch(`${API_BASE_URL}/policies`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch policies');
      }

      const result = await response.json();
      setDocuments(result.data || []);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching policies:', err);
      setError(err.message || 'Failed to load policies');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (doc: PolicyDocument) => {
    if (doc.sasUrl) {
      const link = document.createElement('a');
      link.href = doc.sasUrl;
      link.download = doc.fileName || doc.name + '.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert('This document is not yet available. Please check back later.');
    }
  };

  const handleView = (doc: PolicyDocument) => {
    if (doc.sasUrl) {
      window.open(doc.sasUrl, '_blank');
    } else {
      alert('This document is not yet available. Please check back later.');
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'PDF': return <FiFileText style={{ color: '#dc2626', width: '24px', height: '24px' }} />;
      default: return <FiFile style={{ color: '#6b7280', width: '24px', height: '24px' }} />;
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', backgroundColor: 'white', minHeight: '500px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div>Loading policies...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', backgroundColor: 'white', minHeight: '500px' }}>
        <div style={{
          padding: '16px',
          backgroundColor: '#fee2e2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          color: '#dc2626'
        }}>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', backgroundColor: 'white', minHeight: '500px' }}>
      <h1 style={{ color: 'black', fontSize: '28px', marginBottom: '20px', fontWeight: 'bold' }}>
        📋 Company Policies
      </h1>
      
      <p style={{ color: '#6b7280', fontSize: '16px', marginBottom: '30px' }}>
        Download and review these important policies and documents for your onboarding process.
      </p>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '16px' 
      }}>
        {documents.map((doc) => (
          <div key={doc.id} style={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '20px',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}>
            
            <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div style={{ marginRight: '12px', marginTop: '4px' }}>
                {getFileIcon(doc.type)}
              </div>
              
              <div style={{ flex: 1 }}>
                <h3 style={{ 
                  color: 'black', 
                  fontSize: '18px', 
                  fontWeight: '600',
                  margin: '0 0 8px 0',
                  lineHeight: '1.4'
                }}>
                  {doc.name}
                </h3>
                
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ 
                    color: '#6b7280', 
                    fontSize: '14px',
                    backgroundColor: '#f3f4f6',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    marginRight: '8px'
                  }}>
                    {doc.type}
                  </span>
                  <span style={{ color: '#6b7280', fontSize: '14px' }}>
                    {doc.size}
                  </span>
                </div>

                <span style={{
                  color: doc.status === 'required' ? '#dc2626' : '#16a34a',
                  backgroundColor: doc.status === 'required' ? '#fef2f2' : '#f0fdf4',
                  fontSize: '12px',
                  fontWeight: '600',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  {doc.status}
                </span>
              </div>
            </div>

            <div style={{ 
              display: 'flex', 
              gap: '8px',
              paddingTop: '12px',
              borderTop: '1px solid #f3f4f6'
            }}>
              <button style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px 16px',
                backgroundColor: doc.sasUrl ? '#3b82f6' : '#d1d5db',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: doc.sasUrl ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s ease',
                opacity: doc.sasUrl ? 1 : 0.6
              }}
              onClick={() => handleDownload(doc)}
              onMouseOver={(e) => {
                if (doc.sasUrl) {
                  e.currentTarget.style.backgroundColor = '#2563eb';
                }
              }}
              onMouseOut={(e) => {
                if (doc.sasUrl) {
                  e.currentTarget.style.backgroundColor = '#3b82f6';
                }
              }}>
                <FiDownload style={{ width: '16px', height: '16px' }} />
                Download
              </button>

              <button style={{
                padding: '10px',
                backgroundColor: doc.sasUrl ? '#f8f9fa' : '#f3f4f6',
                color: doc.sasUrl ? '#6b7280' : '#9ca3af',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                cursor: doc.sasUrl ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s ease',
                opacity: doc.sasUrl ? 1 : 0.6
              }}
              onClick={() => handleView(doc)}
              onMouseOver={(e) => {
                if (doc.sasUrl) {
                  e.currentTarget.style.backgroundColor = '#e5e7eb';
                  e.currentTarget.style.color = '#374151';
                }
              }}
              onMouseOut={(e) => {
                if (doc.sasUrl) {
                  e.currentTarget.style.backgroundColor = '#f8f9fa';
                  e.currentTarget.style.color = '#6b7280';
                }
              }}>
                <FiEye style={{ width: '16px', height: '16px' }} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};