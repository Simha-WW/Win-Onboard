/**
 * HR API Service
 * Handles all HTTP requests to HR-related backend endpoints
 */

// Function to get auth token from localStorage
function getAuthToken(): string | null {
  return localStorage.getItem('auth_token');
}

interface FresherData {
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  phoneNumber?: string;
  joiningDate?: string;
  designation?: string;
  department?: string;
  baseLocation?: string;
}

interface CreateFresherResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    username: string;
    email: string;
    fullName: string;
  };
}

interface ApiError {
  success: false;
  message: string;
  code?: string;
}

interface ItTask {
  id: number;
  fresher_id: number;
  sent_to_it_date: string;
  work_email_generated: boolean;
  laptop_allocated: boolean;
  software_installed: boolean;
  access_cards_issued: boolean;
  training_scheduled: boolean;
  hardware_accessories: boolean;
  vpn_setup: boolean;
  network_access_granted: boolean;
  domain_account_created: boolean;
  security_tools_configured: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
  fresher_name?: string;
  email?: string;
  role?: string;
  completionPercentage?: number;
}

interface ItTaskUpdate {
  work_email_generated?: boolean;
  laptop_allocated?: boolean;
  software_installed?: boolean;
  access_cards_issued?: boolean;
  training_scheduled?: boolean;
  hardware_accessories?: boolean;
  vpn_setup?: boolean;
  network_access_granted?: boolean;
  domain_account_created?: boolean;
  security_tools_configured?: boolean;
  notes?: string;
}

/**
 * HR API Service Class
 * Centralized service for all HR-related API calls
 */
class HrApiService {
  private baseUrl = `${import.meta.env.VITE_API_BASE_URL || import.meta.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api'}/hr`;

  /**
   * Create a new fresher account
   * @param fresherData - Fresher information from the form
   * @returns Promise with creation result
   */
  async createFresher(fresherData: FresherData): Promise<CreateFresherResponse> {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Access token is required');
      }

      const response = await fetch(`${this.baseUrl}/freshers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(fresherData),
      });

      if (!response.ok) {
        // Handle HTTP error responses
        const errorData: ApiError = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result: CreateFresherResponse = await response.json();
      return result;

    } catch (error) {
      // Only log actual network/system errors, not user validation errors
      if (error instanceof Error && !error.message.includes('already been added')) {
        console.error('API Error - Create Fresher:', error);
      }
      
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error('An unexpected error occurred while creating the user account.');
      }
    }
  }

  /**
   * Send fresher to IT team
   * @param fresherId - ID of the fresher to send to IT
   */
  async sendToIt(fresherId: number): Promise<{ success: boolean; message: string; data: ItTask }> {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Access token is required');
      }

      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api';
      const response = await fetch(`${API_BASE_URL}/it/send-to-it`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ fresherId }),
      });

      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new Error(errorData.message || `Failed to send to IT`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Error - Send to IT:', error);
      throw error;
    }
  }

  /**
   * Get all IT tasks
   */
  async getItTasks(): Promise<ItTask[]> {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Access token is required');
      }

      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api';
      const response = await fetch(`${API_BASE_URL}/it/tasks`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch IT tasks`);
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('API Error - Get IT Tasks:', error);
      throw error;
    }
  }

  /**
   * Get IT task by ID
   * @param taskId - ID of the IT task
   */
  async getItTaskById(taskId: number): Promise<ItTask> {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Access token is required');
      }

      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api';
      const response = await fetch(`${API_BASE_URL}/it/tasks/${taskId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch IT task`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('API Error - Get IT Task:', error);
      throw error;
    }
  }

  /**
   * Update IT task status
   * @param taskId - ID of the IT task
   * @param updates - Fields to update
   */
  async updateItTask(taskId: number, updates: ItTaskUpdate): Promise<ItTask> {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Access token is required');
      }

      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api';
      const response = await fetch(`${API_BASE_URL}/it/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error(`Failed to update IT task`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('API Error - Update IT Task:', error);
      throw error;
    }
  }

  // TODO: Add additional HR API methods as needed
  // TODO: async getFreshers(): Promise<Fresher[]>
  // TODO: async updateFresher(id: number, data: Partial<FresherData>): Promise<Fresher>
  // TODO: async deleteFresher(id: number): Promise<void>
  // TODO: async resendWelcomeEmail(id: number): Promise<void>
}

// Export singleton instance
export const hrApiService = new HrApiService();

// Export types for use in components
export type { FresherData, CreateFresherResponse, ApiError, ItTask, ItTaskUpdate };