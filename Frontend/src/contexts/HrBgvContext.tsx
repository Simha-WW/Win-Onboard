/**
 * HR BGV Context - Manages BGV submissions data across HR portal
 * Prefetches data when HR portal loads to improve performance
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { API_BASE_URL } from '../config';

interface BGVSubmission {
  submission_id: number;
  fresher_id: number;
  submission_status: string;
  submitted_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  first_name: string;
  last_name: string;
  email: string;
  designation: string;
  date_of_joining: string;
  verified_count: number;
  rejected_count: number;
  total_verifications: number;
  sent_to_it: number;
  vendor_verified: number;
  vendor_rejected: number;
  sections_completed?: number;
  total_sections?: number;
}

interface HrBgvContextType {
  submissions: BGVSubmission[];
  loading: boolean;
  error: string | null;
  refreshSubmissions: () => Promise<void>;
}

const HrBgvContext = createContext<HrBgvContextType | undefined>(undefined);

export const useHrBgv = () => {
  const context = useContext(HrBgvContext);
  if (!context) {
    throw new Error('useHrBgv must be used within HrBgvProvider');
  }
  return context;
};

interface HrBgvProviderProps {
  children: ReactNode;
}

export const HrBgvProvider: React.FC<HrBgvProviderProps> = ({ children }) => {
  const [submissions, setSubmissions] = useState<BGVSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch(`${API_BASE_URL}/bgv/hr/submissions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch submissions');

      const data = await response.json();
      
      // Fetch detailed verification data for each submission to calculate sections completed
      const submissionsWithSections = await Promise.all(
        (data.data || []).map(async (submission: BGVSubmission) => {
          try {
            const verificationResponse = await fetch(
              `${API_BASE_URL}/bgv/hr/verification/${submission.fresher_id}`,
              {
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              }
            );

            if (verificationResponse.ok) {
              const verificationData = await verificationResponse.json();
              const sections = verificationData.data?.sections || [];
              
              const completedSections = sections.filter((section: any) => {
                if (section.section === 'education' || section.section === 'employment' || section.section === 'emergency_contacts') {
                  return section.items && section.items.length > 0;
                }
                return section.data && Object.keys(section.data).length > 0;
              }).length;

              return {
                ...submission,
                sections_completed: completedSections,
                total_sections: sections.length
              };
            }

            return submission;
          } catch (error) {
            console.error(`Error fetching verification for fresher ${submission.fresher_id}:`, error);
            return submission;
          }
        })
      );

      setSubmissions(submissionsWithSections);
    } catch (error: any) {
      console.error('Error fetching submissions:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const refreshSubmissions = async () => {
    await fetchSubmissions();
  };

  // Prefetch data when provider mounts
  useEffect(() => {
    fetchSubmissions();
  }, []);

  return (
    <HrBgvContext.Provider value={{ submissions, loading, error, refreshSubmissions }}>
      {children}
    </HrBgvContext.Provider>
  );
};
