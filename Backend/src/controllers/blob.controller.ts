import { Request, Response } from 'express';
import { blobStorage } from '../services/blob.service';

/**
 * Generate SAS token for frontend file upload
 * POST /api/bgv/upload-token
 */
export const generateUploadToken = async (req: Request, res: Response) => {
  try {
    console.log('📤 Upload token request received:', req.body);
    
    const { fileName, documentType, fresherId } = req.body;
    
    if (!fileName || !documentType || fresherId === undefined || fresherId === null) {
      console.error('❌ Missing required fields:', { fileName, documentType, fresherId });
      return res.status(400).json({
        error: 'Missing required fields: fileName, documentType, fresherId'
      });
    }

    console.log('📝 Generating blob name for:', { fileName, documentType, fresherId });

    // Generate blob name with folder structure
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 10);
    const ext = fileName.substring(fileName.lastIndexOf('.'));
    const blobName = `freshers/${fresherId}/${documentType}/${timestamp}_${randomStr}${ext}`;
    
    console.log('🔐 Generating SAS URL for blob:', blobName);
    
    // Generate SAS URL with write permissions (valid for 1 hour)
    const sasUrl = await blobStorage.generateUploadSasUrl(blobName, 60);
    
    console.log('✅ SAS URL generated successfully');
    
    return res.json({
      sasUrl,
      blobName,
      expiresIn: 3600 // 1 hour in seconds
    });
  } catch (error: any) {
    console.error('❌ Error generating upload token:', error);
    console.error('Error stack:', error.stack);
    return res.status(500).json({
      error: 'Failed to generate upload token',
      message: error.message
    });
  }
};

/**
 * Generate SAS URL for viewing a document
 * POST /api/blob/view-token
 * 
 * Request body:
 * {
 *   blobUrl: string  // Full blob URL
 * }
 * 
 * Response:
 * {
 *   sasUrl: string,
 *   expiresIn: number
 * }
 */
export const generateViewToken = async (req: Request, res: Response) => {
  try {
    const { blobUrl } = req.body;
    
    if (!blobUrl) {
      return res.status(400).json({
        error: 'Missing required field: blobUrl'
      });
    }

    // Extract blob name from full URL
    // URL format: https://accountname.blob.core.windows.net/container/path/to/blob
    const urlParts = blobUrl.split('/');
    const containerIndex = urlParts.findIndex((part: any) => part === process.env.AZURE_STORAGE_CONTAINER_NAME);
    
    if (containerIndex === -1) {
      return res.status(400).json({
        error: 'Invalid blob URL format'
      });
    }

    const blobName = urlParts.slice(containerIndex + 1).join('/');
    
    // Generate SAS URL with read permissions (valid for 15 minutes)
    const sasUrl = await blobStorage.generateSasUrl(blobName, 15);
    
    return res.json({
      sasUrl,
      expiresIn: 900 // 15 minutes in seconds
    });
  } catch (error: any) {
    console.error('Error generating view token:', error);
    return res.status(500).json({
      error: 'Failed to generate view token',
      message: error.message
    });
  }
};
