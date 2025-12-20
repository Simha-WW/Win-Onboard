/**
 * BGV Routes
 * Routes for Background Verification document submissions
 */

import { Router } from 'express';
import { BGVController, uploadMemory } from '../controllers/bgv.controller';
import { validateJWT, requireAuthenticated } from '../middleware/auth.middleware';

const router = Router();
const bgvController = new BGVController();

// Apply JWT validation and authentication middleware to all BGV routes
router.use(validateJWT);
router.use(requireAuthenticated);

// User BGV routes
router.get('/fresher-details', bgvController.getFresherDetails.bind(bgvController));
router.get('/submission', bgvController.getSubmissionData.bind(bgvController));
router.post('/demographics', bgvController.saveDemographics.bind(bgvController));
router.post('/personal', bgvController.savePersonalInfo.bind(bgvController));
router.get('/education', bgvController.getEducation.bind(bgvController));
router.post('/education', bgvController.saveEducation.bind(bgvController));
router.post('/employment', bgvController.saveEmploymentHistory.bind(bgvController));
router.post('/passport-visa', bgvController.savePassportVisa.bind(bgvController));
router.post('/bank-pf-nps', bgvController.saveBankPfNps.bind(bgvController));
router.post('/upload', bgvController.uploadDocument.bind(bgvController));
router.post('/submit', bgvController.submitBGV.bind(bgvController));
router.post('/final-submit', bgvController.finalSubmit.bind(bgvController));
router.post('/progress', bgvController.updateProgress.bind(bgvController));

// HR BGV routes
router.get('/hr/submissions', bgvController.getHRSubmissions.bind(bgvController));
router.get('/hr/verification/:fresherId', bgvController.getVerificationStatus.bind(bgvController));
router.post('/hr/verify', bgvController.saveVerification.bind(bgvController));
router.post('/hr/send-email', bgvController.sendVerificationEmail.bind(bgvController));
router.post('/hr/document/:documentId/verify', bgvController.verifyDocument.bind(bgvController));
router.post('/hr/upload-verification-document', uploadMemory.single('file'), bgvController.uploadHRVerificationDocument.bind(bgvController));
router.get('/submission-details/:fresherId', bgvController.getCompleteSubmissionData.bind(bgvController));

// Document download route
router.get('/documents/:documentId', bgvController.getDocument.bind(bgvController));

export { router as bgvRoutes };