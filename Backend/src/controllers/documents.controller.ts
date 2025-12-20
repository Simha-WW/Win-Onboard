import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { documentsService } from '../services/documents.service';

export class DocumentsController {
  // Employment History
  async saveEmploymentHistory(req: AuthenticatedRequest, res: Response) {
    try {
      const fresherId = req.user?.id ? parseInt(req.user.id) : undefined;
      if (!fresherId) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
      }

      const employmentRecords = req.body.employmentHistory;
      if (!Array.isArray(employmentRecords)) {
        return res.status(400).json({ success: false, message: 'Employment history must be an array' });
      }

      // Add fresher_id to each record
      const records = employmentRecords.map(record => ({
        ...record,
        fresher_id: fresherId
      }));

      await documentsService.saveEmploymentHistory(records);
      
      return res.status(200).json({
        success: true,
        message: 'Employment history saved successfully'
      });
    } catch (error) {
      console.error('Error in saveEmploymentHistory:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to save employment history',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getEmploymentHistory(req: AuthenticatedRequest, res: Response) {
    try {
      const fresherId = req.user?.id ? parseInt(req.user.id) : undefined;
      if (!fresherId) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
      }

      const records = await documentsService.getEmploymentHistory(fresherId);
      
      return res.status(200).json({
        success: true,
        data: records
      });
    } catch (error) {
      console.error('Error in getEmploymentHistory:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch employment history',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Passport & Visa
  async savePassportVisa(req: AuthenticatedRequest, res: Response) {
    try {
      const fresherId = req.user?.id ? parseInt(req.user.id) : undefined;
      if (!fresherId) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
      }

      const data = {
        ...req.body,
        fresher_id: fresherId
      };

      await documentsService.savePassportVisa(data);
      
      return res.status(200).json({
        success: true,
        message: 'Passport & Visa information saved successfully'
      });
    } catch (error) {
      console.error('Error in savePassportVisa:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to save passport & visa information',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getPassportVisa(req: AuthenticatedRequest, res: Response) {
    try {
      const fresherId = req.user?.id ? parseInt(req.user.id) : undefined;
      if (!fresherId) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
      }

      const data = await documentsService.getPassportVisa(fresherId);
      
      return res.status(200).json({
        success: true,
        data: data || {}
      });
    } catch (error) {
      console.error('Error in getPassportVisa:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch passport & visa information',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Bank/PF/NPS
  async saveBankPfNps(req: AuthenticatedRequest, res: Response) {
    try {
      const fresherId = req.user?.id ? parseInt(req.user.id) : undefined;
      if (!fresherId) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
      }

      const data = {
        ...req.body,
        fresher_id: fresherId
      };

      await documentsService.saveBankPfNps(data);
      
      return res.status(200).json({
        success: true,
        message: 'Bank/PF/NPS information saved successfully'
      });
    } catch (error) {
      console.error('Error in saveBankPfNps:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to save bank/pf/nps information',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getBankPfNps(req: AuthenticatedRequest, res: Response) {
    try {
      const fresherId = req.user?.id ? parseInt(req.user.id) : undefined;
      if (!fresherId) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
      }

      const data = await documentsService.getBankPfNps(fresherId);
      
      return res.status(200).json({
        success: true,
        data: data || {}
      });
    } catch (error) {
      console.error('Error in getBankPfNps:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch bank/pf/nps information',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

export const documentsController = new DocumentsController();
