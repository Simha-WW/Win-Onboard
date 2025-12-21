/**
 * L&D API Service
 * Service for Learning & Development portal API calls
 */

import { API_BASE_URL } from '../config';

interface LDEmployee {
  fresher_id: number;
  first_name: string;
  last_name: string;
  email: string;
  designation: string;
  department: string;
  assigned_date: string;
  completed_count: number;
  total_count: number;
  progress_percentage: number;
}

interface LearningItem {
  id: number;
  fresher_id: number;
  learning_id: number;
  learning_table: string;
  learning_title: string;
  learning_link: string;
  is_completed: boolean;
  completed_at?: string;
  started_at?: string;
  time_spent_minutes?: number;
  notes?: string;
}

interface EmployeeLearningProgress {
  employee: {
    fresher_id: number;
    first_name: string;
    last_name: string;
    email: string;
    designation: string;
    department: string;
    assigned_date: string;
    completed_count: number;
    total_count: number;
  };
  learnings: LearningItem[];
  stats: {
    completed_count: number;
    total_count: number;
    progress_percentage: number;
  };
}

class LDApiService {
  private getAuthToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  private getHeaders(): HeadersInit {
    const token = this.getAuthToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  /**
   * Get all employees with learning assignments
   */
  async getEmployees(): Promise<LDEmployee[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/ld/employees`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch employees');
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('API Error - Get Employees:', error);
      throw error;
    }
  }

  /**
   * Get learning progress for a specific employee
   */
  async getEmployeeLearningProgress(employeeId: number): Promise<EmployeeLearningProgress> {
    try {
      const response = await fetch(`${API_BASE_URL}/ld/employee/${employeeId}/progress`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch employee learning progress');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('API Error - Get Employee Learning Progress:', error);
      throw error;
    }
  }

  /**
   * Add a new learning resource for an employee
   */
  async addLearningResource(
    employeeId: number,
    resource: {
      learning_title: string;
      description?: string;
      learning_link: string;
      duration_minutes?: number;
    }
  ): Promise<void> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/ld/employee/${employeeId}/add-resource`,
        {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify(resource),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add learning resource');
      }
    } catch (error) {
      console.error('API Error - Add Learning Resource:', error);
      throw error;
    }
  }
}

export const ldApiService = new LDApiService();
export type { LDEmployee, LearningItem, EmployeeLearningProgress };
