/**
 * Mock Database Service for Development
 * Used when real database is not accessible
 */

import { AuthResult } from '../services/auth.service';

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'HR' | 'FRESHER';
}

// Mock HR users data (Microsoft authentication structure)
const mockHRUsers = [
  {
    id: 1,
    email: 'simha.pulipati@winwire.com',
    microsoft_id: null,
    first_name: 'Simha',
    last_name: 'Pulipati',
    display_name: 'Simha Pulipati',
    role: 'hr_admin',
    department: 'Human Resources',
    is_active: 1
  },
  {
    id: 2,
    email: 'vijayasimhatest@gmail.com',
    microsoft_id: null,
    first_name: 'Vijaya Simha',
    last_name: 'Test',
    display_name: 'Vijaya Simha Test',
    role: 'hr_admin',
    department: 'Human Resources',
    is_active: 1
  },
  {
    id: 3,
    email: 'pulipatisimha@gmail.com',
    microsoft_id: null,
    first_name: 'Pulipati',
    last_name: 'Simha',
    display_name: 'Pulipati Simha',
    role: 'hr_admin',
    department: 'Human Resources',
    is_active: 1
  }
];

// Mock freshers data (matches actual database structure)
const mockFreshers = [
  {
    id: 1,
    email: 'testuser@example.com',
    username: 'testuser',
    password_hash: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewydBpgZ0CPko/.u', // password: 'test123'
    first_name: 'Test',
    last_name: 'User',
    status: 'active'
  },
  {
    id: 2,
    email: 'john.doe@example.com',
    username: 'john.doe',
    password_hash: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewydBpgZ0CPko/.u', // password: 'test123'
    first_name: 'John',
    last_name: 'Doe',
    status: 'active'
  },
  {
    id: 3,
    email: 'jane.smith@example.com',
    username: 'jane.smith',
    password_hash: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewydBpgZ0CPko/.u', // password: 'test123'
    first_name: 'Jane',
    last_name: 'Smith',
    status: 'active'
  }
];

export class MockDatabaseService {
  /**
   * Validate HR user by email (Microsoft authentication)
   */
  static async validateHRUser(email: string, microsoftId?: string, displayName?: string): Promise<AuthResult> {
    try {
      console.log('MockDB: Validating HR user:', email);
      
      const hrUser = mockHRUsers.find(user => 
        user.email.toLowerCase() === email.toLowerCase() && user.is_active === 1
      );

      if (!hrUser) {
        return {
          success: false,
          error: 'HR access denied. Your email is not authorized for HR portal access.'
        };
      }

      const user: User = {
        id: hrUser.id.toString(),
        email: hrUser.email,
        firstName: hrUser.first_name,
        lastName: hrUser.last_name,
        role: 'HR'
      };

      console.log('MockDB: HR user found:', user);

      return {
        success: true,
        user
      };
    } catch (error) {
      console.error('MockDB: HR validation error:', error);
      return {
        success: false,
        error: 'HR validation failed'
      };
    }
  }

  /**
   * Validate fresher credentials
   */
  static async validateFresherCredentials(username: string, password: string): Promise<AuthResult> {
    try {
      console.log('MockDB: Validating fresher:', username);
      
      const fresher = mockFreshers.find(user => user.username === username);

      if (!fresher) {
        return {
          success: false,
          error: 'Invalid username or password'
        };
      }

      if (fresher.status !== 'active') {
        return {
          success: false,
          error: 'Account is not active. Please contact HR.'
        };
      }

      // Simple password check for mock (in real app, use bcrypt)
      if (password !== 'test123') {
        return {
          success: false,
          error: 'Invalid username or password'
        };
      }

      const user: User = {
        id: fresher.id.toString(),
        email: fresher.email,
        firstName: fresher.first_name,
        lastName: fresher.last_name,
        role: 'FRESHER'
      };

      console.log('MockDB: Fresher user found:', user);

      return {
        success: true,
        user
      };
    } catch (error) {
      console.error('MockDB: Fresher validation error:', error);
      return {
        success: false,
        error: 'Login failed'
      };
    }
  }
}

export default MockDatabaseService;