/**
 * Authentication Service
 * Handles authentication logic for both HR and freshers
 */

import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'HR' | 'FRESHER';
  department?: string;
  designation?: string;
  username?: string;
}

export interface AuthResult {
  success: boolean;
  user?: User;
  token?: string;
  error?: string;
}

export class AuthService {
  /**
   * Generate JWT token for user
   */
  static generateToken(user: User): string {
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    
    // Normalize role to match middleware expectations
    let normalizedRole: 'HR' | 'FRESHER' = 'HR';
    if (user.role.toLowerCase().includes('hr')) {
      normalizedRole = 'HR';
    } else if (user.role === 'FRESHER') {
      normalizedRole = 'FRESHER';
    }
    
    return jwt.sign(
      { 
        sub: user.id.toString(),
        id: user.id.toString(),
        email: user.email, 
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        designation: user.designation,
        department: user.department,
        role: normalizedRole,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour
      },
      jwtSecret
    );
  }

  /**
   * Validate HR user by Microsoft profile
   */
  static async validateHRUser(email: string, microsoftId?: string, displayName?: string): Promise<AuthResult> {
    try {
      // Temporary fix: Allow pulipatisimha@gmail.com to bypass database validation
      if (email.toLowerCase() === 'pulipatisimha@gmail.com') {
        console.log('✅ Bypassing database validation for authorized user:', email);
        const hrUser: HRUser = {
          id: 1,
          email: email.toLowerCase(),
          microsoft_id: microsoftId || null,
          display_name: displayName || 'Pulipati Simha',
          first_name: 'Pulipati',
          last_name: 'Simha',
          role: 'lead_hr' as HRRole,
          department: 'Human Resources',
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        };
        
        // Transform to user format expected by frontend
        const user = {
          id: hrUser.id.toString(),
          email: hrUser.email,
          firstName: hrUser.first_name,
          lastName: hrUser.last_name,
          role: hrUser.role,
          department: hrUser.department
        };

        // Generate JWT token
        const token = this.generateToken(user);
        
        return { success: true, user, token };
      }

      const { getMSSQLPool } = await import('../config/database');
      const pool = getMSSQLPool();
      const mssql = await import('mssql');

      // First, ensure hr_users table exists with correct structure
      await this.ensureHRUsersTable(pool, mssql);
      
      const query = `
        SELECT id, microsoft_id, email, display_name, first_name, last_name, role
        FROM hr_users 
        WHERE email = @email AND is_active = 1
      `;
      
      const result = await pool.request()
        .input('email', mssql.NVarChar(255), email.toLowerCase())
        .query(query);

      if (result.recordset.length === 0) {
        return {
          success: false,
          error: 'Access denied. This Microsoft account is not authorized for HR portal access. Please contact your system administrator if you believe this is an error.'
        };
      }

      const hrUser = result.recordset[0];
      
      // Update Microsoft ID if provided and not set
      if (microsoftId && !hrUser.microsoft_id) {
        const updateQuery = `
          UPDATE hr_users 
          SET microsoft_id = @microsoftId, display_name = @displayName, updated_at = GETUTCDATE()
          WHERE id = @id
        `;
        
        await pool.request()
          .input('microsoftId', mssql.NVarChar(255), microsoftId)
          .input('displayName', mssql.NVarChar(255), displayName || hrUser.display_name)
          .input('id', mssql.Int, hrUser.id)
          .query(updateQuery);
      }

      // Transform to user format expected by frontend
      const user = {
        id: hrUser.id.toString(),
        email: hrUser.email,
        firstName: hrUser.first_name || displayName?.split(' ')[0],
        lastName: hrUser.last_name || displayName?.split(' ').slice(1).join(' '),
        role: hrUser.role || 'HR',
        department: hrUser.department
      };

      // Generate JWT token
      const token = this.generateToken(user);

      return {
        success: true,
        user,
        token
      };
    } catch (error) {
      console.error('HR validation error:', error);
      return {
        success: false,
        error: 'HR validation failed'
      };
    }
  }

  /**
   * Ensure HR users table exists with correct structure
   */
  static async ensureHRUsersTable(pool: any, mssql: any): Promise<void> {
    try {
      // Check if table exists first
      const checkTable = await pool.request().query(`
        SELECT COUNT(*) as tableExists 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = 'hr_users'
      `);

      if (checkTable.recordset[0].tableExists > 0) {
        // Drop foreign key constraints first
        await pool.request().query(`
          DECLARE @sql NVARCHAR(MAX) = ''
          SELECT @sql = @sql + 'ALTER TABLE ' + QUOTENAME(OBJECT_SCHEMA_NAME(parent_object_id)) + '.' + QUOTENAME(OBJECT_NAME(parent_object_id)) + ' DROP CONSTRAINT ' + QUOTENAME(name) + ';'
          FROM sys.foreign_keys
          WHERE referenced_object_id = OBJECT_ID('dbo.hr_users')
          EXEC sp_executesql @sql
        `);
        
        // Now drop the table
        await pool.request().query(`DROP TABLE dbo.hr_users;`);
        console.log('🗑️ Dropped existing hr_users table and constraints');
      }

      // Create new hr_users table for Microsoft authentication
      await pool.request().query(`
        CREATE TABLE dbo.hr_users (
          id INT IDENTITY(1,1) PRIMARY KEY,
          email NVARCHAR(255) UNIQUE NOT NULL,
          microsoft_id NVARCHAR(255),
          display_name NVARCHAR(255),
          first_name NVARCHAR(100),
          last_name NVARCHAR(100),
          role NVARCHAR(50) DEFAULT 'hr',
          department NVARCHAR(100),
          is_active BIT DEFAULT 1,
          created_at DATETIME2 DEFAULT GETUTCDATE(),
          updated_at DATETIME2 DEFAULT GETUTCDATE()
        );
      `);

      // Create indexes
      await pool.request().query('CREATE INDEX IX_hr_users_email ON dbo.hr_users(email);');
      await pool.request().query('CREATE INDEX IX_hr_users_microsoft_id ON dbo.hr_users(microsoft_id);');
      await pool.request().query('CREATE INDEX IX_hr_users_is_active ON dbo.hr_users(is_active);');

      // Insert pulipatisimha@gmail.com as authorized HR user
      await pool.request().query(`
        INSERT INTO dbo.hr_users (email, display_name, first_name, last_name, role, department, is_active)
        VALUES ('pulipatisimha@gmail.com', 'Pulipati Simha', 'Pulipati', 'Simha', 'lead_hr', 'Human Resources', 1);
      `);

      console.log('✅ Created new hr_users table and added pulipatisimha@gmail.com as lead HR');
      
      // Verify the data
      const result = await pool.request().query('SELECT * FROM dbo.hr_users;');
      console.log('📋 HR Users Table Data:');
      console.table(result.recordset);
    } catch (error) {
      console.error('Error setting up hr_users table:', error);
      throw error;
    }
  }

  /**
   * Validate fresher login credentials
   */
  static async validateFresherCredentials(username: string, password: string): Promise<AuthResult> {
    try {
      console.log('🔍 Validating fresher credentials for username:', username);

      const query = `
        SELECT id, email, first_name, last_name, username, designation, department, password_hash, status 
        FROM freshers 
        WHERE username = @username
      `;

      const { getMSSQLPool } = await import('../config/database');
      const pool = getMSSQLPool();
      const mssql = await import('mssql');
      
      const result = await pool.request()
        .input('username', mssql.NVarChar(100), username)
        .query(query);

      if (result.recordset.length === 0) {
        return {
          success: false,
          error: 'Invalid username or password'
        };
      }

      const fresher = result.recordset[0];

      // Check if account is active
      if (fresher.status !== 'active' && fresher.status !== 'pending') {
        return {
          success: false,
          error: 'Your account is currently inactive or suspended. Please contact HR for assistance.'
        };
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, fresher.password_hash);
      if (!isPasswordValid) {
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
        username: fresher.username,
        designation: fresher.designation,
        department: fresher.department,
        role: 'FRESHER'
      };

      const token = this.generateToken(user);

      return {
        success: true,
        user,
        token
      };
    } catch (error) {
      console.error('Fresher validation error:', error);
      
      // Handle database connection issues
      if (error instanceof Error && (error.message.includes('Connection is closed') || error.message.includes('ENOTFOUND'))) {
        return {
          success: false,
          error: 'System temporarily unavailable. Please try again in a few moments or contact support if the issue persists.'
        };
      }
      
      return {
        success: false,
        error: 'Login failed'
      };
    }
  }

  /**
   * Validate and refresh token
   */
  static async validateToken(token: string): Promise<AuthResult> {
    try {
      const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
      
      const decoded = jwt.verify(token, jwtSecret) as any;
      
      // Create user object from token payload
      const user: User = {
        id: decoded.id || decoded.sub,
        email: decoded.email,
        firstName: decoded.firstName || '',
        lastName: decoded.lastName || '',
        username: decoded.username,
        designation: decoded.designation,
        department: decoded.department,
        role: decoded.role
      };

      return {
        success: true,
        user,
        token
      };
    } catch (error) {
      return {
        success: false,
        error: 'Invalid or expired token'
      };
    }
  }
}