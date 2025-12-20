/**
 * IT Service
 * Handles API calls for IT portal functionality
 */

import { API_BASE_URL } from '../config';

export interface ITTask {
  id: number;
  fresher_id: number;
  fresher_name: string;
  email: string;
  role: string;
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
}

export interface TaskStatusUpdate {
  taskName: string;
  status: number;
}

/**
 * Get all IT tasks with fresher details
 */
export const getAllITTasks = async (): Promise<ITTask[]> => {
  try {
    const token = localStorage.getItem('auth_token');
    
    if (!token) {
      throw new Error('Authentication token not found');
    }

    const response = await fetch(`${API_BASE_URL}/it/tasks`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch IT tasks');
    }

    const data = await response.json();
    return data.data || [];
  } catch (error: any) {
    console.error('Error fetching IT tasks:', error);
    throw error;
  }
};

/**
 * Get IT tasks for a specific fresher
 */
export const getITTasksForFresher = async (fresherId: number): Promise<ITTask> => {
  try {
    const token = localStorage.getItem('auth_token');
    
    if (!token) {
      throw new Error('Authentication token not found');
    }

    const response = await fetch(`${API_BASE_URL}/it/tasks/fresher/${fresherId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch IT task details');
    }

    const data = await response.json();
    return data.data;
  } catch (error: any) {
    console.error('Error fetching IT task details:', error);
    throw error;
  }
};

/**
 * Update task status for a specific fresher
 */
export const updateTaskStatus = async (
  fresherId: number, 
  taskName: string, 
  status: number
): Promise<ITTask> => {
  try {
    const token = localStorage.getItem('auth_token');
    
    if (!token) {
      throw new Error('Authentication token not found');
    }

    const response = await fetch(`${API_BASE_URL}/it/tasks/${fresherId}/update`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ taskName, status })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update task status');
    }

    const data = await response.json();
    return data.data;
  } catch (error: any) {
    console.error('Error updating task status:', error);
    throw error;
  }
};
