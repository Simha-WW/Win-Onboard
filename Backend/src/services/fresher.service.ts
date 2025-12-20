/**
 * Fresher Service
 * Handles all business logic related to fresher management
 * 
 * RESPONSIBILITIES:
 * - Validate fresher data
 * - Generate credentials
 * - Database operations
 * - Email notifications
 * - Error handling and rollback logic
 */

import { hashPassword, generateTemporaryPassword, generateUsername } from '../utils/password.util';
import { emailService, WelcomeEmailData } from './email.service';

interface FresherInput {
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  phoneNumber?: string;
  joiningDate?: string;
  designation?: string;
  department?: string;
  managerEmail?: string;
}

interface FresherRecord {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  phoneNumber?: string;
  joiningDate?: string;
  designation?: string;
  department?: string;
  managerEmail?: string;
  username: string;
  passwordHash: string;
  createdAt: Date;
  createdBy: string; // HR user ID or email
  status: 'pending' | 'active' | 'inactive' | 'onboarding';
  hrId?: number;
}

interface FresherWithHR {
  fresher: FresherRecord;
  hrName: string;
  hrEmail: string;
}

interface CreateFresherResult {
  success: boolean;
  fresher?: {
    id: number;
    username: string;
    email: string;
    fullName: string;
  };
  error?: string;
}

/**
 * Fresher Service Class
 * Handles all fresher-related business operations
 */
class FresherService {
  
  /**
   * Create a new fresher account
   * 
   * @param {FresherInput} fresherData - Input data from the form
   * @param {string} createdBy - HR user identifier
   * @returns {Promise<CreateFresherResult>} Creation result
   */
  async createFresher(fresherData: FresherInput, createdBy: string): Promise<CreateFresherResult> {
    let temporaryPassword = '';
    
    try {
      // Step 1: Validate input data
      this.validateFresherInput(fresherData);

      // Step 2: Check if email already exists
      const existingFresherWithHR = await this.findFresherWithHRInfo(fresherData.email);
      if (existingFresherWithHR) {
        return {
          success: false,
          error: `User with email ${fresherData.email} has already been added by ${existingFresherWithHR.hrName} (${existingFresherWithHR.hrEmail}). Please use a different email address.`
        };
      }

      // Step 3: Generate credentials
      const username = generateUsername(fresherData.firstName, fresherData.lastName, fresherData.email);
      temporaryPassword = generateTemporaryPassword();

      // SECURITY: Hash the password before storage
      const passwordHash = await hashPassword(temporaryPassword);

      // Step 4: Prepare fresher record
      const fresherRecord: FresherRecord = {
        firstName: fresherData.firstName.trim(),
        lastName: fresherData.lastName.trim(),
        email: fresherData.email.toLowerCase().trim(),
        dateOfBirth: fresherData.dateOfBirth,
        phoneNumber: fresherData.phoneNumber?.trim() || undefined,
        joiningDate: fresherData.joiningDate || undefined,
        designation: fresherData.designation?.trim() || undefined,
        department: fresherData.department?.trim() || undefined,
        managerEmail: fresherData.managerEmail?.trim() || undefined,
        username,
        passwordHash,
        createdAt: new Date(),
        createdBy,
        status: 'pending'
      };

      // Step 5: Insert into database
      const createdFresher = await this.insertFresherToDatabase(fresherRecord);

      // Step 6: Send welcome email
      const emailData: WelcomeEmailData = {
        firstName: fresherRecord.firstName,
        lastName: fresherRecord.lastName,
        email: fresherRecord.email,
        username: username,
        temporaryPassword: temporaryPassword
      };

      const emailResult = await emailService.sendWelcomeEmail(emailData);
      
      if (!emailResult.success) {
        // TODO: Implement rollback logic or mark for retry
        console.error('Email send failed for fresher:', {
          fresherId: createdFresher.id,
          email: fresherRecord.email,
          error: emailResult.error
        });
        
        // Continue with success but log the email failure
        // In production, you might want to:
        // 1. Mark the record for email retry
        // 2. Send notification to admin
        // 3. Or rollback the entire transaction
      }

      // Note: IT equipment notification is now sent when HR clicks "Send to IT and Vendor" button
      // in the Documents and BGV section, not during user creation

      // Step 7: Clear sensitive data from memory
      temporaryPassword = '';

      // Step 8: Return success result
      return {
        success: true,
        fresher: {
          id: createdFresher.id!,
          username: createdFresher.username,
          email: createdFresher.email,
          fullName: `${createdFresher.firstName} ${createdFresher.lastName}`
        }
      };

    } catch (error) {
      // Clear sensitive data on error
      temporaryPassword = '';
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create user account'
      };
    }
  }

  /**
   * Validate fresher input data
   * 
   * @param {FresherInput} data - Data to validate
   * @throws {Error} If validation fails
   */
  private validateFresherInput(data: FresherInput): void {
    const errors: string[] = [];

    // Required field validations
    if (!data.firstName?.trim()) {
      errors.push('First name is required');
    }

    if (!data.lastName?.trim()) {
      errors.push('Last name is required');
    }

    if (!data.email?.trim()) {
      errors.push('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push('Invalid email format');
    }

    if (!data.dateOfBirth) {
      errors.push('Date of birth is required');
    } else {
      const dob = new Date(data.dateOfBirth);
      const age = new Date().getFullYear() - dob.getFullYear();
      if (age < 16 || age > 70) {
        errors.push('Invalid age (must be between 16 and 70)');
      }
    }

    // Optional field validations
    if (data.phoneNumber && !/^[\+]?[1-9][\d]{0,15}$/.test(data.phoneNumber.replace(/[\s\-\(\)]/g, ''))) {
      errors.push('Invalid phone number format');
    }

    if (data.joiningDate) {
      const joiningDate = new Date(data.joiningDate);
      if (joiningDate < new Date()) {
        errors.push('Joining date cannot be in the past');
      }
    }

    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }
  }

  /**
   * Find fresher by email
   * 
   * @param {string} email - Email to search for
   * @returns {Promise<FresherRecord | null>} Existing fresher or null
   */
  /**
   * Find fresher by email with HR information
   * 
   * @param {string} email - Email to search for
   * @returns {Promise<FresherWithHR | null>} Fresher with HR info or null if not found
   */
  private async findFresherWithHRInfo(email: string): Promise<FresherWithHR | null> {
    try {
      console.log('Checking for existing email with HR info:', email);
      const { getMSSQLPool } = await import('../config/database');
      const mssql = await import('mssql');
      const pool = getMSSQLPool();
      
      const query = `
        SELECT 
          f.id, f.first_name, f.last_name, f.email, f.date_of_birth, f.phone,
          f.username, f.password_hash, f.department, f.designation, f.joining_date,
          f.manager_email, f.status, f.hr_id, f.created_at, f.updated_at,
          hr.first_name as hr_first_name, hr.last_name as hr_last_name, hr.email as hr_email
        FROM freshers f
        INNER JOIN hr_users hr ON f.hr_id = hr.id
        WHERE f.email = @email
      `;
      
      const result = await pool.request()
        .input('email', mssql.NVarChar(255), email.toLowerCase())
        .query(query);
      
      if (result.recordset.length > 0) {
        const row = result.recordset[0];
        const fresher: FresherRecord = {
          id: row.id,
          firstName: row.first_name,
          lastName: row.last_name,
          email: row.email,
          dateOfBirth: row.date_of_birth,
          phoneNumber: row.phone,
          username: row.username,
          passwordHash: row.password_hash,
          department: row.department,
          designation: row.designation,
          joiningDate: row.joining_date,
          managerEmail: row.manager_email,
          status: row.status,
          hrId: row.hr_id,
          createdAt: row.created_at,
          createdBy: row.hr_email
        };
        
        return {
          fresher,
          hrName: `${row.hr_first_name} ${row.hr_last_name}`,
          hrEmail: row.hr_email
        };
      }
      
      return null;
    } catch (error) {
      console.error('Database error finding fresher with HR info:', error);
      return null;
    }
  }

  private async findFresherByEmail(email: string): Promise<FresherRecord | null> {
    try {
      console.log('Checking for existing email:', email);
      const { getMSSQLPool } = await import('../config/database');
      const mssql = await import('mssql');
      const pool = getMSSQLPool();
      
      const query = `
        SELECT id, first_name, last_name, email, date_of_birth, phone,
               username, password_hash, department, designation, joining_date,
               manager_email, status, hr_id, created_at, updated_at
        FROM freshers 
        WHERE email = @email
      `;
      
      const result = await pool.request()
        .input('email', mssql.NVarChar(255), email.toLowerCase())
        .query(query);
      
      if (result.recordset.length > 0) {
        const row = result.recordset[0];
        return {
          id: row.id,
          firstName: row.first_name,
          lastName: row.last_name,
          email: row.email,
          dateOfBirth: row.date_of_birth,
          phoneNumber: row.phone,
          username: row.username,
          passwordHash: row.password_hash,
          department: row.department,
          designation: row.designation,
          joiningDate: row.joining_date,
          managerEmail: row.manager_email,
          status: row.status,
          hrId: row.hr_id,
          createdAt: row.created_at,
          createdBy: 'HR System'
        };
      }
      
      return null;
    } catch (error) {
      console.error('Database error finding fresher by email:', error);
      return null;
    }
  }

  /**
   * Insert fresher record into database
   * 
   * @param {FresherRecord} fresher - Fresher record to insert
   * @returns {Promise<FresherRecord>} Created fresher with ID
   */
  private async insertFresherToDatabase(fresher: FresherRecord): Promise<FresherRecord> {
    // TODO: Implement actual database insertion
    // This is a mock implementation - replace with your database logic
    
    /*
    Example implementation with your database:
    
    const query = `
      INSERT INTO freshers (
        first_name, last_name, email, dob, phone_number, 
        joining_date, designation, username, password_hash, 
        created_at, created_by, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const values = [
      fresher.firstName, fresher.lastName, fresher.email, fresher.dateOfBirth,
      fresher.phoneNumber, fresher.joiningDate, fresher.designation,
      fresher.username, fresher.passwordHash, fresher.createdAt,
      fresher.createdBy, fresher.status
    ];
    
    const result = await database.query(query, values);
    return { ...fresher, id: result.insertId };
    */
    
    // Mock implementation
    console.log('Inserting fresher to database:', {
      email: fresher.email,
      username: fresher.username,
      // SECURITY: Never log password hash or sensitive data
    });
    
    try {
      const { executeMSSQLQuery } = await import('../config/database');
      
      // Get the HR ID using the authenticated user's email
      const hrQuery = `SELECT id FROM hr_users WHERE email = '${fresher.createdBy.replace(/'/g, "''")}'`;
      const hrResult = await executeMSSQLQuery<{id: number}>(hrQuery);
      
      if (hrResult.length === 0) {
        throw new Error(`HR user not found for email: ${fresher.createdBy}. Please ensure the user is registered in hr_users table.`);
      }
      
      const hrId = hrResult[0]!.id;
      
      const insertQuery = `
        INSERT INTO freshers (
          first_name, last_name, email, date_of_birth, phone,
          username, password_hash, department, designation, joining_date,
          manager_email, status, hr_id
        ) VALUES (
          @firstName, @lastName, @email, @dateOfBirth, @phone,
          @username, @passwordHash, @department, @designation, @joiningDate,
          @managerEmail, @status, @hrId
        );
        SELECT SCOPE_IDENTITY() as newId;
      `;
      
      // Use parameterized query to prevent SQL injection
      const mssql = await import('mssql');
      const { getMSSQLPool } = await import('../config/database');
      const pool = getMSSQLPool();
      
      const result = await pool.request()
        .input('firstName', mssql.NVarChar(100), fresher.firstName)
        .input('lastName', mssql.NVarChar(100), fresher.lastName)
        .input('email', mssql.NVarChar(255), fresher.email.toLowerCase())
        .input('dateOfBirth', mssql.Date, fresher.dateOfBirth ? new Date(fresher.dateOfBirth) : null)
        .input('phone', mssql.NVarChar(20), fresher.phoneNumber || null)
        .input('username', mssql.NVarChar(100), fresher.username)
        .input('passwordHash', mssql.NVarChar(255), fresher.passwordHash)
        .input('department', mssql.NVarChar(100), fresher.department || null)
        .input('designation', mssql.NVarChar(100), fresher.designation || null)
        .input('joiningDate', mssql.Date, fresher.joiningDate ? new Date(fresher.joiningDate) : null)
        .input('managerEmail', mssql.NVarChar(255), fresher.managerEmail || null)
        .input('status', mssql.NVarChar(20), fresher.status)
        .input('hrId', mssql.Int, hrId)
        .query(insertQuery);
      const newId = result.recordset[0]?.newId;
      
      if (!newId) {
        throw new Error('Failed to get new fresher ID from database');
      }
      
      return {
        ...fresher,
        id: newId,
        hrId: hrId
      };
      
    } catch (error) {
      // Only log actual database errors, not validation errors
      if (error instanceof Error && !error.message.includes('already been added')) {
        console.error('Database error inserting fresher:', error);
      }
      throw new Error(`Failed to create fresher account: ${error}`);
    }
  }

  // TODO: Implement additional methods
  // TODO: async getFresherById(id: number): Promise<FresherRecord | null>
  // TODO: async updateFresher(id: number, data: Partial<FresherInput>): Promise<boolean>
  // TODO: async deleteFresher(id: number): Promise<boolean>
  // TODO: async resendWelcomeEmail(id: number): Promise<boolean>
  // TODO: async resetPassword(id: number): Promise<string>
}

// Export singleton instance
export const fresherService = new FresherService();

// Export types
export type { FresherInput, FresherRecord, CreateFresherResult };