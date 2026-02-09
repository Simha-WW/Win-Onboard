/**
 * Google OAuth Service
 * Handles Google authentication verification and admin user lookup
 */

import { OAuth2Client } from 'google-auth-library';
import sql from 'mssql';
import { getMSSQLPool } from '../config/database';

interface GoogleUserInfo {
  email: string;
  name: string;
  picture?: string;
  email_verified: boolean;
}

interface AdminUser {
  id: number;
  email: string;
  name: string;
  department: 'HR' | 'IT' | 'LD';
  role: string;
  is_active: boolean;
}

class GoogleAuthService {
  private client: OAuth2Client;

  constructor() {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      throw new Error('GOOGLE_CLIENT_ID is not configured in environment variables');
    }
    this.client = new OAuth2Client(clientId);
  }

  /**
   * Verify Google OAuth token and extract user information
   */
  async verifyGoogleToken(token: string): Promise<GoogleUserInfo> {
    try {
      const ticket = await this.client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      
      if (!payload) {
        throw new Error('Invalid token payload');
      }

      if (!payload.email_verified) {
        throw new Error('Email not verified by Google');
      }

      return {
        email: payload.email!,
        name: payload.name || payload.email!,
        picture: payload.picture,
        email_verified: payload.email_verified,
      };
    } catch (error) {
      console.error('Google token verification failed:', error);
      throw new Error('Invalid Google token');
    }
  }

  /**
   * Check if email exists in HR normal login table
   */
  private async checkHRUser(email: string): Promise<AdminUser | null> {
    try {
      const pool = getMSSQLPool();
      const result = await pool.request()
        .input('email', sql.VarChar, email)
        .query(`
          SELECT 
            id,
            email,
            display_name as name,
            'HR' as department,
            role,
            is_active
          FROM dbo.hr_normal_login 
          WHERE email = @email AND is_active = 1
        `);

      if (result.recordset.length > 0) {
        return result.recordset[0] as AdminUser;
      }
      return null;
    } catch (error) {
      console.error('Error checking HR user:', error);
      return null;
    }
  }

  /**
   * Check if email exists in Learning & Development table
   */
  private async checkLDUser(email: string): Promise<AdminUser | null> {
    try {
      const pool = getMSSQLPool();
      const result = await pool.request()
        .input('email', sql.VarChar, email)
        .query(`
          SELECT 
            id,
            email,
            CONCAT(first_name, ' ', last_name) as name,
            'LD' as department,
            'learning_admin' as role,
            is_active
          FROM dbo.learning_dept 
          WHERE email = @email AND is_active = 1
        `);

      if (result.recordset.length > 0) {
        return result.recordset[0] as AdminUser;
      }
      return null;
    } catch (error) {
      console.error('Error checking LD user:', error);
      return null;
    }
  }

  /**
   * Check if email exists in IT users table
   */
  private async checkITUser(email: string): Promise<AdminUser | null> {
    try {
      const pool = getMSSQLPool();
      const result = await pool.request()
        .input('email', sql.VarChar, email)
        .query(`
          SELECT 
            id,
            email,
            CONCAT(first_name, ' ', last_name) as name,
            'IT' as department,
            'it_admin' as role,
            is_active
          FROM dbo.it_users 
          WHERE email = @email AND is_active = 1
        `);

      if (result.recordset.length > 0) {
        return result.recordset[0] as AdminUser;
      }
      return null;
    } catch (error) {
      console.error('Error checking IT user:', error);
      return null;
    }
  }

  /**
   * Find admin user by email across all department tables
   * Returns user info with department if found, null otherwise
   */
  async findAdminUser(email: string): Promise<AdminUser | null> {
    // Check HR table first
    let user = await this.checkHRUser(email);
    if (user) return user;

    // Check Learning & Development table
    user = await this.checkLDUser(email);
    if (user) return user;

    // Check IT users table
    user = await this.checkITUser(email);
    if (user) return user;

    // User not found in any admin table
    return null;
  }

  /**
   * Authenticate admin user with Google OAuth token
   * Verifies token and checks if user exists in admin tables
   */
  async authenticateAdmin(googleToken: string): Promise<AdminUser> {
    // Step 1: Verify Google token and get user info
    const googleUser = await this.verifyGoogleToken(googleToken);

    // Step 2: Check if user exists in any admin table
    const adminUser = await this.findAdminUser(googleUser.email);

    if (!adminUser) {
      throw new Error('UNAUTHORIZED: Email not registered for admin access');
    }

    if (!adminUser.is_active) {
      throw new Error('INACTIVE: User account is deactivated');
    }

    // Return admin user with department info
    return {
      ...adminUser,
      name: adminUser.name || googleUser.name, // Use Google name if DB name is empty
    };
  }
}

export const googleAuthService = new GoogleAuthService();
export type { GoogleUserInfo, AdminUser };
