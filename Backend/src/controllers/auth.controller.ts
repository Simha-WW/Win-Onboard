/**
 * Authentication Controller
 * Handles authentication endpoints for HR and freshers
 */

import { Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { AuthService } from '../services/auth.service';
import { googleAuthService } from '../services/googleAuth.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

// Rate limiting for auth endpoints
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 100 : 20, // More lenient in development
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again in a few minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for development bypass users
    return process.env.NODE_ENV === 'development' && 
           req.body?.username === 'gaddam.lalithya';
  }
});

export class AuthController {
  
  /**
   * Microsoft authentication endpoint
   * POST /api/auth/microsoft
   */
  static async authenticateWithMicrosoft(req: Request, res: Response): Promise<Response | void> {
    try {
      const { microsoftUser } = req as any;
      
      if (!microsoftUser || !microsoftUser.email) {
        return res.status(400).json({
          success: false,
          message: 'Microsoft user information is required'
        });
      }

      // Validate HR user with Microsoft profile data
      const authResult = await AuthService.validateHRUser(
        microsoftUser.email,
        microsoftUser.id,
        microsoftUser.displayName
      );
      
      if (!authResult.success) {
        return res.status(403).json({
          success: false,
          message: authResult.error
        });
      }

      res.json({
        success: true,
        user: authResult.user,
        token: authResult.token,
        message: 'HR authentication successful'
      });
    } catch (error) {
      console.error('Microsoft auth error:', error);
      res.status(500).json({
        success: false,
        message: 'Authentication failed'
      });
    }
  }

  /**
   * Fresher credentials authentication endpoint
   * POST /api/auth/fresher
   */
  static async authenticateWithCredentials(req: Request, res: Response): Promise<Response | void> {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: 'Username and password are required'
        });
      }

      // Validate fresher credentials
      const authResult = await AuthService.validateFresherCredentials(
        username.trim(),
        password
      );
      
      if (!authResult.success) {
        return res.status(401).json({
          success: false,
          message: authResult.error
        });
      }

      res.json({
        success: true,
        user: authResult.user,
        token: authResult.token,
        message: 'Authentication successful'
      });
    } catch (error) {
      console.error('Credentials auth error:', error);
      res.status(500).json({
        success: false,
        message: 'Authentication failed'
      });
    }
  }

  /**
   * HR login with email and password
   * POST /api/auth/hr/login
   */
  static async authenticateHRWithCredentials(req: Request, res: Response): Promise<Response | void> {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required'
        });
      }

      // Validate HR credentials
      const authResult = await AuthService.validateHRCredentials(
        email.trim(),
        password
      );
      
      if (!authResult.success) {
        return res.status(401).json({
          success: false,
          message: authResult.error
        });
      }

      res.json({
        success: true,
        user: authResult.user,
        token: authResult.token,
        userType: authResult.userType,  // Include user type in response
        message: 'Authentication successful'
      });
    } catch (error) {
      console.error('HR login error:', error);
      res.status(500).json({
        success: false,
        message: 'Authentication failed'
      });
    }
  }

  /**
   * HR email authentication endpoint (development bypass)
   * POST /api/auth/hr-email
   */
  static async authenticateWithHREmail(req: Request, res: Response): Promise<Response | void> {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email is required'
        });
      }

      // Validate HR user by email
      const authResult = await AuthService.validateHRUser(email);
      
      if (!authResult.success) {
        return res.status(403).json({
          success: false,
          message: authResult.error
        });
      }

      res.json({
        success: true,
        user: authResult.user,
        token: authResult.token,
        message: 'HR authentication successful'
      });
    } catch (error) {
      console.error('HR email auth error:', error);
      res.status(500).json({
        success: false,
        message: 'HR email authentication failed'
      });
    }
  }

  /**
   * Token validation endpoint
   * POST /api/auth/validate
   */
  static async validateToken(req: AuthenticatedRequest, res: Response): Promise<Response | void> {
    try {
      // If we reach here, the JWT middleware has already validated the token
      res.json({
        success: true,
        user: req.user,
        message: 'Token is valid'
      });
    } catch (error) {
      console.error('Token validation error:', error);
      res.status(500).json({
        success: false,
        message: 'Token validation failed'
      });
    }
  }

  /**
   * Token refresh endpoint
   * POST /api/auth/refresh
   */
  static async refreshToken(req: AuthenticatedRequest, res: Response): Promise<Response | void> {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          message: 'Access token is required'
        });
      }

      const token = authHeader.substring(7);
      const refreshResult = await AuthService.validateToken(token);
      
      if (!refreshResult.success) {
        return res.status(401).json({
          success: false,
          message: refreshResult.error
        });
      }

      res.json({
        success: true,
        user: refreshResult.user,
        token: refreshResult.token,
        message: 'Token refreshed successfully'
      });
    } catch (error) {
      console.error('Token refresh error:', error);
      res.status(500).json({
        success: false,
        message: 'Token refresh failed'
      });
    }
  }

  /**
   * Logout endpoint
   * POST /api/auth/logout
   */
  static async logout(req: AuthenticatedRequest, res: Response): Promise<Response | void> {
    try {
      // For JWT tokens, logout is handled client-side
      // Server can optionally maintain a blacklist of tokens
      
      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        message: 'Logout failed'
      });
    }
  }

  /**
   * Get current user info
   * GET /api/auth/me
   */
  static async getCurrentUser(req: AuthenticatedRequest, res: Response): Promise<Response | void> {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      res.json({
        success: true,
        user: req.user
      });
    } catch (error) {
      console.error('Get current user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get user information'
      });
    }
  }

  /**
   * Setup HR Users Table (Development endpoint)
   * POST /api/auth/setup-hr-table
   */
  static async setupHRTable(req: Request, res: Response): Promise<Response | void> {
    try {
      console.log('🔧 Admin request to setup HR users table...');
      
      // Import AuthService to trigger table setup
      const { AuthService } = await import('../services/auth.service');
      const { getMSSQLPool } = await import('../config/database');
      
      const pool = getMSSQLPool();
      const mssql = await import('mssql');
      
      // Force table recreation
      await AuthService.ensureHRUsersTable(pool, mssql);
      
      res.json({
        success: true,
        message: 'HR users table setup completed successfully',
        data: {
          authorizedEmail: 'pulipatisimha@gmail.com',
          role: 'lead_hr',
          department: 'Human Resources'
        }
      });
    } catch (error: any) {
      console.error('Setup HR table error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to setup HR table',
        error: error?.message || 'Unknown error'
      });
    }
  }

  /**
   * Google OAuth authentication for admin users (HR, IT, L&D)
   * POST /api/auth/google
   * Body: { token: string } - Google OAuth token from frontend
   */
  static async authenticateWithGoogle(req: Request, res: Response): Promise<Response | void> {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({
          success: false,
          message: 'Google OAuth token is required'
        });
      }

      console.log('🔐 Google OAuth authentication attempt...');

      // Verify token and authenticate admin user
      const adminUser = await googleAuthService.authenticateAdmin(token);

      // Parse name into first and last name
      const nameParts = adminUser.name ? adminUser.name.split(' ') : ['', ''];
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Transform to User format expected by generateToken
      const user = {
        id: adminUser.id.toString(),
        email: adminUser.email,
        firstName: firstName,
        lastName: lastName,
        username: adminUser.email.split('@')[0],
        designation: adminUser.role,
        department: adminUser.department,
        role: adminUser.department // 'HR', 'IT', or 'LD'
      };

      // Generate JWT token for session
      const jwtToken = AuthService.generateToken(user);

      console.log(`✅ Google OAuth authentication successful for ${adminUser.email} (${adminUser.department})`);

      return res.status(200).json({
        success: true,
        message: 'Authentication successful',
        data: {
          token: jwtToken,
          user: {
            id: adminUser.id,
            email: adminUser.email,
            name: adminUser.name,
            department: adminUser.department,
            role: adminUser.department, // Use department as role ('HR', 'IT', 'LD') for routing
            isAdmin: true
          }
        }
      });

    } catch (error: any) {
      console.error('Google OAuth authentication error:', error);

      // Handle specific error cases
      if (error.message?.includes('UNAUTHORIZED')) {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to access this system. Please contact your administrator.',
          error: 'EMAIL_NOT_REGISTERED'
        });
      }

      if (error.message?.includes('INACTIVE')) {
        return res.status(403).json({
          success: false,
          message: 'Your account has been deactivated. Please contact your administrator.',
          error: 'ACCOUNT_INACTIVE'
        });
      }

      if (error.message?.includes('Invalid Google token')) {
        return res.status(401).json({
          success: false,
          message: 'Invalid Google authentication token. Please try again.',
          error: 'INVALID_TOKEN'
        });
      }

      // Generic error response
      return res.status(500).json({
        success: false,
        message: 'Authentication failed. Please try again.',
        error: 'AUTHENTICATION_FAILED'
      });
    }
  }
}