import { Router } from 'express';
import { documentsController } from '../controllers/documents.controller';
import { validateJWT } from '../middleware/auth.middleware';

const router = Router();

// Employment History Routes
router.post('/employment-history', validateJWT, (req, res) => documentsController.saveEmploymentHistory(req, res));
router.get('/employment-history', validateJWT, (req, res) => documentsController.getEmploymentHistory(req, res));

// Passport & Visa Routes
router.post('/passport-visa', validateJWT, (req, res) => documentsController.savePassportVisa(req, res));
router.get('/passport-visa', validateJWT, (req, res) => documentsController.getPassportVisa(req, res));

// Bank/PF/NPS Routes
router.post('/bank-pf-nps', validateJWT, (req, res) => documentsController.saveBankPfNps(req, res));
router.get('/bank-pf-nps', validateJWT, (req, res) => documentsController.getBankPfNps(req, res));

export { router as documentsRoutes };
