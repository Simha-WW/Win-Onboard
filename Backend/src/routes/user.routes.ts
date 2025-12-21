/**
 * User Routes
 * Routes for user/fresher-specific endpoints
 */

import { Router } from 'express';
import { getUserLearningPlan, updateUserLearningProgress } from '../controllers/user.controller';
import { validateJWT, requireAuthenticated } from '../middleware/auth.middleware';

const router = Router();

// Apply JWT validation and authentication middleware to all user routes
router.use(validateJWT);
router.use(requireAuthenticated);

// Learning plan routes
router.get('/learning-plan', getUserLearningPlan);
router.put('/learning-plan/:progressId', updateUserLearningProgress);

export default router;
