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

/**
 * HR API Service Class
 * Centralized service for all HR-related API calls
 */
class HrApiService {
  private baseUrl = 'http://localhost:3000/api/hr';

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

  // TODO: Add additional HR API methods as needed
  // TODO: async getFreshers(): Promise<Fresher[]>
  // TODO: async updateFresher(id: number, data: Partial<FresherData>): Promise<Fresher>
  // TODO: async deleteFresher(id: number): Promise<void>
  // TODO: async resendWelcomeEmail(id: number): Promise<void>
}

// Export singleton instance
export const hrApiService = new HrApiService();

// Export types for use in components
export type { FresherData, CreateFresherResponse, ApiError };