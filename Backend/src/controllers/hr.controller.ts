/**
 * HR Controller
 * Handles HTTP requests and responses for HR operations
 * 
 * RESPONSIBILITIES:
 * - Request validation and parsing
 * - HTTP response formatting
 * - Error handling and status codes
 * - Security checks (authentication/authorization)
 */

import { Request, Response } from 'express';
import { fresherService, FresherInput } from '../services/fresher.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

/**
 * HR Controller Class
 * Handles all HR-related HTTP endpoints
 */
class HrController {

  /**
   * Create a new fresher
   * POST /api/hr/freshers
   * 
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   */
  async createFresher(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Authentication is already handled by middleware

      // Extract and validate request body
      const fresherData: FresherInput = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        dateOfBirth: req.body.dateOfBirth,
        phoneNumber: req.body.phoneNumber,
        joiningDate: req.body.joiningDate,
        designation: req.body.designation
      };

      // Validate required fields
      if (!fresherData.firstName || !fresherData.lastName || !fresherData.email || !fresherData.dateOfBirth) {
        res.status(400).json({
          success: false,
          message: 'Missing required fields: firstName, lastName, email, and dateOfBirth are required'
        });
        return;
      }

      // Get the HR user who is creating the account
      const createdBy = req.user?.email || 'UNKNOWN_HR';

      // Call service to create fresher
      const result = await fresherService.createFresher(fresherData, createdBy);

      if (result.success) {
        // Success response
        res.status(201).json({
          success: true,
          message: 'Fresher account created successfully and welcome email sent',
          data: result.fresher
        });
      } else {
        // Business logic error (e.g., duplicate email)
        res.status(400).json({
          success: false,
          message: result.error || 'Failed to create fresher account'
        });
      }

    } catch (error) {
      // Only log actual system errors, not validation errors
      if (error instanceof Error && !error.message.includes('already been added')) {
        console.error('Controller error - createFresher:', error);
      }
      
      // Internal server error
      res.status(500).json({
        success: false,
        message: 'Internal server error. Please try again later.'
      });
    }
  }

  /**
   * Get all freshers (pagination support)
   * GET /api/hr/freshers
   * 
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   */
  async getFreshers(req: Request, res: Response): Promise<void> {
    try {
      // TODO: Add authentication check
      
      // TODO: Extract query parameters
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const status = req.query.status as string;

      // TODO: Implement service method
      // const result = await fresherService.getFreshers({ page, limit, status });

      // Mock response for now
      res.status(200).json({
        success: true,
        data: {
          freshers: [],
          pagination: {
            page,
            limit,
            total: 0,
            totalPages: 0
          }
        }
      });

    } catch (error) {
      console.error('Controller error - getFreshers:', error);
      
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Get fresher by ID
   * GET /api/hr/freshers/:id
   * 
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   */
  async getFresherById(req: Request, res: Response): Promise<void> {
    try {
      // TODO: Add authentication check
      
      const fresherId = parseInt(req.params.id!);
      
      if (!fresherId || fresherId < 1) {
        res.status(400).json({
          success: false,
          message: 'Invalid fresher ID'
        });
        return;
      }

      // TODO: Implement service method
      // const fresher = await fresherService.getFresherById(fresherId);

      // Mock response for now
      res.status(404).json({
        success: false,
        message: 'Fresher not found'
      });

    } catch (error) {
      console.error('Controller error - getFresherById:', error);
      
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Resend welcome email
   * POST /api/hr/freshers/:id/resend-email
   * 
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   */
  async resendWelcomeEmail(req: Request, res: Response): Promise<void> {
    try {
      // TODO: Add authentication check
      
      const fresherId = parseInt(req.params.id!);
      
      if (!fresherId || fresherId < 1) {
        res.status(400).json({
          success: false,
          message: 'Invalid fresher ID'
        });
        return;
      }

      // TODO: Implement service method
      // const result = await fresherService.resendWelcomeEmail(fresherId);

      // Mock response for now
      res.status(200).json({
        success: true,
        message: 'Welcome email resent successfully'
      });

    } catch (error) {
      console.error('Controller error - resendWelcomeEmail:', error);
      
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Mark vendor verification as verified
   * POST /api/hr/vendor-verify
   */
  async vendorVerify(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { fresherId } = req.body;

      console.log('vendorVerify called with:', { fresherId, userId: req.user?.id });

      if (!fresherId) {
        res.status(400).json({
          success: false,
          message: 'Fresher ID is required'
        });
        return;
      }

      if (!req.user || !req.user.id) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      const { getMSSQLPool } = await import('../config/database');
      const pool = getMSSQLPool();
      const mssql = await import('mssql');

      // Check if already verified
      const existing = await pool.request()
        .input('fresherId', mssql.Int, fresherId)
        .query('SELECT id FROM vendor_verified WHERE fresher_id = @fresherId');

      if (existing.recordset.length > 0) {
        res.status(400).json({
          success: false,
          message: 'This candidate is already marked as verified'
        });
        return;
      }

      // Parse user ID (could be string from JWT)
      const hrUserId = typeof req.user.id === 'string' ? parseInt(req.user.id) : req.user.id;
      
      console.log('Inserting into vendor_verified:', { fresherId, hrUserId });

      // Insert into vendor_verified table
      await pool.request()
        .input('fresherId', mssql.Int, fresherId)
        .input('hrUserId', mssql.Int, hrUserId)
        .query(`
          INSERT INTO vendor_verified (fresher_id, verified_by, verified_at)
          VALUES (@fresherId, @hrUserId, GETDATE())
        `);

      console.log('Successfully inserted into vendor_verified');

      res.status(200).json({
        success: true,
        message: 'Candidate marked as verified successfully'
      });

    } catch (error) {
      console.error('Controller error - vendorVerify:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  }

  /**
   * Mark vendor verification as rejected
   * POST /api/hr/vendor-reject
   */
  async vendorReject(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { fresherId, reason } = req.body;

      console.log('vendorReject called with:', { fresherId, reason, userId: req.user?.id });

      if (!fresherId) {
        res.status(400).json({
          success: false,
          message: 'Fresher ID is required'
        });
        return;
      }

      if (!req.user || !req.user.id) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      const { getMSSQLPool } = await import('../config/database');
      const pool = getMSSQLPool();
      const mssql = await import('mssql');

      // Check if already rejected
      const existing = await pool.request()
        .input('fresherId', mssql.Int, fresherId)
        .query('SELECT id FROM vendor_rejected WHERE fresher_id = @fresherId');

      if (existing.recordset.length > 0) {
        res.status(400).json({
          success: false,
          message: 'This candidate is already marked as rejected'
        });
        return;
      }

      // Parse user ID (could be string from JWT)
      const hrUserId = typeof req.user.id === 'string' ? parseInt(req.user.id) : req.user.id;

      console.log('Inserting into vendor_rejected:', { fresherId, hrUserId, reason });

      // Insert into vendor_rejected table
      await pool.request()
        .input('fresherId', mssql.Int, fresherId)
        .input('hrUserId', mssql.Int, hrUserId)
        .input('reason', mssql.NVarChar, reason || null)
        .query(`
          INSERT INTO vendor_rejected (fresher_id, rejected_by, rejection_reason, rejected_at)
          VALUES (@fresherId, @hrUserId, @reason, GETDATE())
        `);

      console.log('Successfully inserted into vendor_rejected');

      res.status(200).json({
        success: true,
        message: 'Candidate marked as rejected successfully'
      });

    } catch (error) {
      console.error('Controller error - vendorReject:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  }

  // TODO: Implement additional controller methods
  // TODO: updateFresher(req: Request, res: Response)
  // TODO: deleteFresher(req: Request, res: Response)
  // TODO: resetPassword(req: Request, res: Response)
  // TODO: bulkCreateFreshers(req: Request, res: Response)
}

// Export singleton instance
export const hrController = new HrController();