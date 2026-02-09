/**
 * Authentication Routes
 * Defines all authentication-related endpoints
 */

import { Router } from 'express';
import { AuthController, authRateLimit } from '../controllers/auth.controller';
import { 
  validateJWT, 
  validateMicrosoftToken,
  requireHRRole,
  requireFresherRole,
  requireAuthenticated
} from '../middleware/auth.middleware';

const router = Router();

/**
 * Public authentication routes (with rate limiting)
 */

// Google OAuth authentication for admins (HR, IT, L&D)
router.post('/google',
  authRateLimit,
  AuthController.authenticateWithGoogle
);

// HR login with email and password (NEW)
router.post('/hr/login',
  authRateLimit,
  AuthController.authenticateHRWithCredentials
);

// Microsoft authentication for HR (DEPRECATED - kept for backward compatibility)
router.post('/microsoft', 
  authRateLimit,
  validateMicrosoftToken,
  AuthController.authenticateWithMicrosoft
);

// HR email authentication (development bypass)
router.post('/hr-email',
  authRateLimit,
  AuthController.authenticateWithHREmail
);

// Fresher credentials authentication
router.post('/fresher',
  authRateLimit,
  AuthController.authenticateWithCredentials
);

/**
 * Protected routes (require authentication)
 */

// Token validation
router.post('/validate',
  validateJWT,
  AuthController.validateToken
);

// Admin endpoint to setup HR table (development only)
router.post('/setup-hr-table',
  AuthController.setupHRTable
);

// Token refresh
router.post('/refresh',
  AuthController.refreshToken
);

// Get current user info
router.get('/me',
  validateJWT,
  AuthController.getCurrentUser
);

// Logout
router.post('/logout',
  validateJWT,
  AuthController.logout
);

export { router as authRoutes };