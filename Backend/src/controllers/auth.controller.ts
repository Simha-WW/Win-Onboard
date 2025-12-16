/**
 * Authentication Controller
 * Handles authentication endpoints for HR and freshers
 */

import { Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { AuthService } from '../services/auth.service';
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
    } catch (error) {
      console.error('Setup HR table error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to setup HR table',
        error: error.message
      });
    }
  }
}