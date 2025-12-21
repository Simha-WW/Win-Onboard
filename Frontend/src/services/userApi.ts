/**
 * User API Service
 * Service for user/fresher-specific API calls
 */

import { API_BASE_URL } from '../config';
import { LearningItem, EmployeeLearningProgress } from './ldApi';

class UserApiService {
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
   * Get user's assigned learning plan
   */
  async getLearningPlan(): Promise<EmployeeLearningProgress> {
    try {
      const response = await fetch(`${API_BASE_URL}/user/learning-plan`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch learning plan');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('API Error - Get Learning Plan:', error);
      throw error;
    }
  }

  /**
   * Mark a learning item as complete or update progress
   */
  async updateLearningProgress(
    progressId: number,
    updates: {
      isCompleted?: boolean;
      progressPercentage?: number;
      notes?: string;
    }
  ): Promise<void> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/user/learning-plan/${progressId}`,
        {
          method: 'PUT',
          headers: this.getHeaders(),
          body: JSON.stringify(updates),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update learning progress');
      }
    } catch (error) {
      console.error('API Error - Update Learning Progress:', error);
      throw error;
    }
  }
}

export const userApiService = new UserApiService();
