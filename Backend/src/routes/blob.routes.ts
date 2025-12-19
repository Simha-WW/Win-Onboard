import { Router } from 'express';
import * as blobController from '../controllers/blob.controller';

const router = Router();

/**
 * Generate SAS token for frontend file upload
 * POST /api/blob/upload-token
 * 
 * Request body:
 * {
 *   fileName: string,
 *   documentType: 'aadhaar' | 'pan' | 'resume',
 *   fresherId: number
 * }
 * 
 * Response:
 * {
 *   sasUrl: string,
 *   blobName: string,
 *   expiresIn: number
 * }
 */
router.post('/upload-token', blobController.generateUploadToken);

export default router;
