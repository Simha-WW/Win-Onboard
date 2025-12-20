/**
 * HR Candidates & Offers - Manage candidate pipeline and offer status
 */

import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config';

interface PendingOffer {
  id: number;
  candidate_name: string;
  position: string;
  status: string;
  joining_date: string;
  email: string;
}

export const HrCandidatesOffers = () => {
  const [offers, setOffers] = useState<PendingOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingOffers();
  }, []);

  const fetchPendingOffers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch(`${API_BASE_URL}/hr/pending-offers`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch pending offers');
      }

      const data = await response.json();
      setOffers(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching pending offers:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) {
      return 'Apr 17, 2007';
    }
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div style={{ 
        padding: '20px', 
        backgroundColor: 'white', 
        minHeight: '500px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <p style={{ color: '#6b7280', fontSize: '16px' }}>Loading pending offers...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        padding: '20px', 
        backgroundColor: 'white', 
        minHeight: '500px'
      }}>
        <div style={{
          padding: '16px',
          backgroundColor: '#fee',
          border: '1px solid #fcc',
          borderRadius: '8px',
          color: '#c00'
        }}>
          Error: {error}
        </div>
      </div>
    );
  }

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
          Offers Rolledout
        </h1>
        <p style={{ 
          color: '#6b7280', 
          fontSize: '16px'
        }}>
          View all pending offers with future joining dates
        </p>
      </div>

      {/* Offers Table */}
      <div style={{
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        overflow: 'hidden',
        backgroundColor: 'white'
      }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse'
        }}>
          <thead>
            <tr style={{ backgroundColor: '#f9fafb' }}>
              <th style={{
                padding: '16px 24px',
                textAlign: 'left',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                borderBottom: '1px solid #e5e7eb'
              }}>
                Candidate
              </th>
              <th style={{
                padding: '16px 24px',
                textAlign: 'left',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                borderBottom: '1px solid #e5e7eb'
              }}>
                Position
              </th>
              <th style={{
                padding: '16px 24px',
                textAlign: 'center',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                borderBottom: '1px solid #e5e7eb'
              }}>
                Status
              </th>
              <th style={{
                padding: '16px 24px',
                textAlign: 'left',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                borderBottom: '1px solid #e5e7eb'
              }}>
                Joining Date
              </th>
            </tr>
          </thead>
          <tbody>
            {offers.length === 0 ? (
              <tr>
                <td colSpan={4} style={{
                  padding: '48px 24px',
                  textAlign: 'center',
                  color: '#6b7280',
                  fontSize: '14px'
                }}>
                  No pending offers found. All candidates have either joined or offers are expired.
                </td>
              </tr>
            ) : (
              offers.map((offer, index) => (
                <tr
                  key={offer.id}
                  style={{
                    backgroundColor: index % 2 === 0 ? 'white' : '#f9fafb',
                    transition: 'background-color 0.1s'
                  }}
                >
                  <td style={{
                    padding: '16px 24px',
                    fontSize: '14px',
                    color: '#374151',
                    borderBottom: '1px solid #e5e7eb'
                  }}>
                    <div>
                      <div style={{ fontWeight: '500' }}>{offer.candidate_name}</div>
                      <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                        {offer.email}
                      </div>
                    </div>
                  </td>
                  <td style={{
                    padding: '16px 24px',
                    fontSize: '14px',
                    color: '#374151',
                    borderBottom: '1px solid #e5e7eb'
                  }}>
                    {offer.position || 'Not specified'}
                  </td>
                  <td style={{
                    padding: '16px 24px',
                    textAlign: 'center',
                    borderBottom: '1px solid #e5e7eb'
                  }}>
                    <span style={{
                      backgroundColor: '#10b98120',
                      color: '#10b981',
                      padding: '4px 12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '600',
                      textTransform: 'uppercase'
                    }}>
                      {offer.status}
                    </span>
                  </td>
                  <td style={{
                    padding: '16px 24px',
                    fontSize: '14px',
                    color: '#374151',
                    borderBottom: '1px solid #e5e7eb',
                    fontWeight: '500'
                  }}>
                    {formatDate(offer.joining_date)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Summary Footer */}
      {offers.length > 0 && (
        <div style={{
          marginTop: '16px',
          padding: '12px 16px',
          backgroundColor: '#f9fafb',
          borderRadius: '8px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ fontSize: '14px', color: '#6b7280' }}>
            Total Pending Offers: <strong style={{ color: '#374151' }}>{offers.length}</strong>
          </span>
        </div>
      )}
    </div>
  );
};
