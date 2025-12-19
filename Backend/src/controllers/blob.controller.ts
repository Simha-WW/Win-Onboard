import { Request, Response } from 'express';
import { blobStorage } from '../services/blob.service';

/**
 * Generate SAS token for frontend file upload
 * POST /api/bgv/upload-token
 */
export const generateUploadToken = async (req: Request, res: Response) => {
  try {
    const { fileName, documentType, fresherId } = req.body;
    
    if (!fileName || !documentType || !fresherId) {
      return res.status(400).json({
        error: 'Missing required fields: fileName, documentType, fresherId'
      });
    }

    // Generate blob name with folder structure
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 10);
    const ext = fileName.substring(fileName.lastIndexOf('.'));
    const blobName = `freshers/${fresherId}/${documentType}/${timestamp}_${randomStr}${ext}`;
    
    // Generate SAS URL with write permissions (valid for 1 hour)
    const sasUrl = await blobStorage.generateUploadSasUrl(blobName, 60);
    
    return res.json({
      sasUrl,
      blobName,
      expiresIn: 3600 // 1 hour in seconds
    });
  } catch (error: any) {
    console.error('Error generating upload token:', error);
    return res.status(500).json({
      error: 'Failed to generate upload token',
      message: error.message
    });
  }
};
