/**
 * BGV Routes
 * Routes for Background Verification document submissions
 */

import { Router } from 'express';
import { BGVController } from '../controllers/bgv.controller';
import { validateJWT, requireAuthenticated } from '../middleware/auth.middleware';

const router = Router();
const bgvController = new BGVController();

// Apply JWT validation and authentication middleware to all BGV routes
router.use(validateJWT);
router.use(requireAuthenticated);

// User BGV routes
router.get('/fresher-details', bgvController.getFresherDetails.bind(bgvController));
router.get('/submission', bgvController.getSubmission.bind(bgvController));
router.post('/demographics', bgvController.saveDemographics.bind(bgvController));
router.post('/personal', bgvController.savePersonalInfo.bind(bgvController));
router.get('/education', bgvController.getEducation.bind(bgvController));
router.post('/education', bgvController.saveEducation.bind(bgvController));
router.post('/employment', bgvController.saveEmploymentHistory.bind(bgvController));
router.post('/upload', bgvController.uploadDocument.bind(bgvController));
router.post('/submit', bgvController.submitBGV.bind(bgvController));
router.post('/progress', bgvController.updateProgress.bind(bgvController));

// HR BGV routes
router.get('/hr/submissions', bgvController.getHRSubmissions.bind(bgvController));
router.post('/hr/document/:documentId/verify', bgvController.verifyDocument.bind(bgvController));

// Document download route
router.get('/documents/:documentId', bgvController.getDocument.bind(bgvController));

export { router as bgvRoutes };