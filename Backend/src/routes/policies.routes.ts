/**
 * Policies Routes
 * Routes for accessing company policy documents from blob storage
 */

import { Router } from 'express';
import { getPolicies } from '../controllers/policies.controller';
import { validateJWT, requireAuthenticated } from '../middleware/auth.middleware';

const router = Router();

// Apply authentication middleware to all routes
router.use(validateJWT);
router.use(requireAuthenticated);

/**
 * GET /api/policies
 * Get all policy documents with SAS URLs
 */
router.get('/', getPolicies);

export default router;
