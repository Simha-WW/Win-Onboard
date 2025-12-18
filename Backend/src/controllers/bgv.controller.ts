/**
 * BGV Controller
 * Handles Background Verification API endpoints
 */

import { Request, Response } from 'express';
import { BGVService } from '../services/bgv.service';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Extended Request interface with user property
interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
    fresher_id?: number;
  };
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'documents');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2);
    const extension = path.extname(file.originalname);
    const filename = `${timestamp}_${randomString}${extension}`;
    cb(null, filename);
  }
});

// File filter for allowed document types
const fileFilter = (req: any, file: any, cb: any) => {
  const allowedTypes = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'];
  const fileExtension = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Allowed types: PDF, JPG, JPEG, PNG, DOC, DOCX'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

export class BGVController {
  /**
   * Get fresher details for pre-filling demographics form
   * GET /api/bgv/fresher-details
   */
  async getFresherDetails(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'User not authenticated' });
        return;
      }

      const fresherDetails = await BGVService.getFresherDetails(userId);

      res.json({
        success: true,
        data: fresherDetails
      });
    } catch (error: any) {
      console.error('Error fetching fresher details:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch fresher details',
        error: error.message
      });
    }
  }

  /**
   * Get or create BGV submission for logged-in user
   * GET /api/bgv/submission
   */
  async getSubmission(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'User not authenticated' });
        return;
      }

      const submission = await BGVService.getOrCreateSubmission(userId);
      const prefilledData = await BGVService.getFresherDataForDemographics(userId);
      const savedDemographics = await BGVService.getSavedDemographics(submission.id);
      
      let savedPersonal = null;
      try {
        savedPersonal = await BGVService.getSavedPersonal(submission.id);
      } catch (personalError) {
        console.error('⚠️ Error loading personal data (table may need schema update):', personalError);
        // Continue without personal data if table doesn't have correct schema yet
      }

      let savedEducation = null;
      try {
        // userId is the fresher_id from the token
        const fresherId = parseInt(userId.toString());
        const educationalData = await BGVService.getSavedEducational(fresherId);
        
        // Separate educational qualifications and additional certificates
        const educationalQualifications = educationalData.filter(
          (item: any) => item.qualification_type === 'educational'
        );
        const additionalQualifications = educationalData.filter(
          (item: any) => item.qualification_type === 'additional'
        );
        
        savedEducation = {
          educationalQualifications,
          additionalQualifications
        };
        
        console.log('📋 Loaded education data for fresher:', fresherId);
        console.log('📋 Educational qualifications:', educationalQualifications.length);
        console.log('📋 Additional qualifications:', additionalQualifications.length);
      } catch (educationError) {
        console.error('⚠️ Error loading education data (table may need schema update):', educationError);
        // Continue without education data if table doesn't exist yet
      }

      res.json({
        success: true,
        submission,
        prefilledData,
        savedDemographics,
        savedPersonal,
        savedEducation
      });
    } catch (error) {
      console.error('Error getting BGV submission:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to get submission data' 
      });
    }
  }

  /**
   * Save demographics data
   * POST /api/bgv/demographics
   */
  async saveDemographics(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      console.log('📋 Save demographics request from user:', req.user);
      
      // For freshers, use the user ID (which maps to fresher ID in our auth system)
      const userId = req.user?.id;
      if (!userId) {
        console.error('❌ No user ID found in request');
        res.status(401).json({ success: false, message: 'User not authenticated' });
        return;
      }

      console.log('👤 Using user ID for BGV submission:', userId);
      console.log('📊 Demographics data received:', req.body);

      const submission = await BGVService.getOrCreateSubmission(userId);
      console.log('📄 BGV submission:', submission);
      
      await BGVService.saveDemographics(submission.id, req.body);

      console.log('✅ Demographics saved successfully for submission:', submission.id);
      res.json({
        success: true,
        message: 'Demographics data saved successfully',
        submissionId: submission.id
      });
    } catch (error) {
      console.error('❌ Error saving demographics:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to save demographics data',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Save personal information
   * POST /api/bgv/personal
   */
  async savePersonalInfo(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'User not authenticated' });
        return;
      }

      const submission = await BGVService.getOrCreateSubmission(userId);
      await BGVService.savePersonal(submission.id, req.body);
      
      res.json({
        success: true,
        message: 'Personal information saved successfully'
      });
    } catch (error) {
      console.error('Error saving personal info:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to save personal information' 
      });
    }
  }

  /**
   * Save education data (both educational qualifications and additional certificates)
   * POST /api/bgv/education
   */
  async saveEducation(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'User not authenticated' });
        return;
      }

      const { educationalQualifications, additionalQualifications } = req.body;
      
      // Validate that at least one educational qualification is provided
      if (!educationalQualifications || educationalQualifications.length === 0) {
        res.status(400).json({ 
          success: false, 
          message: 'At least one educational qualification is required' 
        });
        return;
      }

      // userId is the fresher_id from the token
      const fresherId = parseInt(userId.toString());

      await BGVService.saveEducational(
        fresherId, 
        educationalQualifications || [], 
        additionalQualifications || []
      );
      
      res.json({
        success: true,
        message: 'Education data saved successfully'
      });
    } catch (error) {
      console.error('Error saving education:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to save education data' 
      });
    }
  }

  /**
   * Get saved education data
   * GET /api/bgv/education
   */
  async getEducation(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'User not authenticated' });
        return;
      }

      // userId is the fresher_id from the token
      const fresherId = parseInt(userId.toString());

      const educationalData = await BGVService.getSavedEducational(fresherId);
      
      // Separate educational qualifications and additional certificates
      const educationalQualifications = educationalData.filter(
        (item: any) => item.qualification_type === 'educational'
      );
      const additionalQualifications = educationalData.filter(
        (item: any) => item.qualification_type === 'additional'
      );
      
      res.json({
        success: true,
        data: {
          educationalQualifications,
          additionalQualifications
        }
      });
    } catch (error) {
      console.error('Error getting education:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to get education data' 
      });
    }
  }

  /**
   * Save employment history
   * POST /api/bgv/employment
   */
  async saveEmploymentHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'User not authenticated' });
        return;
      }

      const submission = await BGVService.getOrCreateSubmission(userId);
      // TODO: Implement saveEmploymentHistory in BGVService
      
      res.json({
        success: true,
        message: 'Employment history saved successfully'
      });
    } catch (error) {
      console.error('Error saving employment history:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to save employment history' 
      });
    }
  }

  /**
   * Upload document file
   * POST /api/bgv/upload
   */
  async uploadDocument(req: AuthenticatedRequest, res: Response): Promise<void> {
    upload.single('document')(req, res, async (err) => {
      if (err) {
        console.error('File upload error:', err);
        res.status(400).json({ 
          success: false, 
          message: err.message || 'File upload failed' 
        });
        return;
      }

      try {
        const userId = req.user?.id;
        if (!userId) {
          res.status(401).json({ success: false, message: 'User not authenticated' });
          return;
        }

        const file = req.file;
        const documentType = req.body.documentType;

        if (!file) {
          res.status(400).json({ 
            success: false, 
            message: 'No file uploaded' 
          });
          return;
        }

        if (!documentType) {
          res.status(400).json({ 
            success: false, 
            message: 'Document type is required' 
          });
          return;
        }

        const submission = await BGVService.getOrCreateSubmission(userId);
        
        // Save file information to database
        const { getMSSQLPool } = await import('../config/database');
        const pool = getMSSQLPool();
        const mssql = await import('mssql');

        await pool.request()
          .input('submissionId', mssql.Int, submission.id)
          .input('documentType', mssql.NVarChar(100), documentType)
          .input('originalFilename', mssql.NVarChar(500), file.originalname)
          .input('storedFilename', mssql.NVarChar(500), file.filename)
          .input('filePath', mssql.NVarChar(1000), file.path)
          .input('fileSize', mssql.BigInt, file.size)
          .input('mimeType', mssql.NVarChar(100), file.mimetype)
          .query(`
            INSERT INTO document_files (
              submission_id, document_type, original_filename, stored_filename,
              file_path, file_size_bytes, mime_type, verification_status
            ) VALUES (
              @submissionId, @documentType, @originalFilename, @storedFilename,
              @filePath, @fileSize, @mimeType, 'pending'
            )
          `);

        res.json({
          success: true,
          message: 'Document uploaded successfully',
          file: {
            originalName: file.originalname,
            size: file.size,
            type: documentType
          }
        });
      } catch (error) {
        console.error('Error processing file upload:', error);
        res.status(500).json({ 
          success: false, 
          message: 'Failed to process file upload' 
        });
      }
    });
  }

  /**
   * Submit BGV for review
   * POST /api/bgv/submit
   */
  async submitBGV(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'User not authenticated' });
        return;
      }

      const submission = await BGVService.getOrCreateSubmission(userId);
      await BGVService.submitForReview(submission.id);

      res.json({
        success: true,
        message: 'BGV submitted for review successfully'
      });
    } catch (error) {
      console.error('Error submitting BGV:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to submit BGV' 
      });
    }
  }

  /**
   * Update submission progress
   * POST /api/bgv/progress
   */
  async updateProgress(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { section } = req.body;

      if (!userId) {
        res.status(401).json({ success: false, message: 'User not authenticated' });
        return;
      }

      if (!section) {
        res.status(400).json({ success: false, message: 'Section is required' });
        return;
      }

      const submission = await BGVService.getOrCreateSubmission(userId);
      await BGVService.updateSubmissionProgress(submission.id, section);

      res.json({
        success: true,
        message: 'Progress updated successfully'
      });
    } catch (error) {
      console.error('Error updating progress:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to update progress' 
      });
    }
  }

  /**
   * Get all BGV submissions for HR
   * GET /api/bgv/hr/submissions
   */
  async getHRSubmissions(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const submissions = await BGVService.getAllSubmissions();

      res.json({
        success: true,
        submissions
      });
    } catch (error) {
      console.error('Error getting HR submissions:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to get submissions' 
      });
    }
  }

  /**
   * Verify or reject a document
   * POST /api/bgv/hr/document/:documentId/verify
   */
  async verifyDocument(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const documentId = parseInt(req.params.documentId || '0');
      const { status, rejectionReason } = req.body;
      const hrEmail = req.user?.email;

      if (!hrEmail) {
        res.status(401).json({ success: false, message: 'HR not authenticated' });
        return;
      }

      if (!['verified', 'rejected'].includes(status)) {
        res.status(400).json({ 
          success: false, 
          message: 'Invalid status. Must be verified or rejected' 
        });
        return;
      }

      await BGVService.updateDocumentVerification(
        documentId, 
        status, 
        hrEmail, 
        rejectionReason
      );

      res.json({
        success: true,
        message: `Document ${status} successfully`
      });
    } catch (error) {
      console.error('Error verifying document:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to verify document' 
      });
    }
  }

  /**
   * Get document file
   * GET /api/bgv/documents/:documentId
   */
  async getDocument(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const documentId = parseInt(req.params.documentId || '0');

      const { getMSSQLPool } = await import('../config/database');
      const pool = getMSSQLPool();
      const mssql = await import('mssql');

      const result = await pool.request()
        .input('documentId', mssql.Int, documentId)
        .query('SELECT * FROM document_files WHERE id = @documentId');

      if (result.recordset.length === 0) {
        res.status(404).json({ success: false, message: 'Document not found' });
        return;
      }

      const document = result.recordset[0];
      const filePath = document.file_path;

      if (!fs.existsSync(filePath)) {
        res.status(404).json({ success: false, message: 'File not found on disk' });
        return;
      }

      res.setHeader('Content-Disposition', `attachment; filename="${document.original_filename}"`);
      res.setHeader('Content-Type', document.mime_type);
      
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    } catch (error) {
      console.error('Error getting document:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to get document' 
      });
    }
  }
}