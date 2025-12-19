import { Router } from 'express';
import { generateUploadToken, generateViewToken } from '../controllers/blob.controller';
import { validateJWT } from '../middleware/auth.middleware';

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
router.post('/upload-token', validateJWT, generateUploadToken);

/**
 * Generate SAS token for viewing a document
 * POST /api/blob/view-token
 * 
 * Request body:
 * {
 *   blobUrl: string
 * }
 * 
 * Response:
 * {
 *   sasUrl: string,
 *   expiresIn: number
 * }
 */
router.post('/view-token', validateJWT, generateViewToken);

export default router;
