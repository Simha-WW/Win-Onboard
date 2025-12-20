/**
 * HR Routes
 * Defines all HTTP routes for HR operations
 * 
 * Routes:
 * - POST /api/hr/freshers - Create new fresher
 * - GET /api/hr/freshers - Get all freshers (with pagination)
 * - GET /api/hr/freshers/:id - Get fresher by ID
 * - PUT /api/hr/freshers/:id - Update fresher
 * - DELETE /api/hr/freshers/:id - Delete fresher
 * - POST /api/hr/freshers/:id/resend-email - Resend welcome email
 */

import { Router } from 'express';
import { hrController } from '../controllers/hr.controller';
import { validateJWT, requireHRRole } from '../middleware/auth.middleware';

const router = Router();

/**
 * All HR routes require authentication and HR role
 */
router.use(validateJWT, requireHRRole);

/**
 * Fresher management routes
 */

// Create new fresher account
router.post('/freshers', hrController.createFresher.bind(hrController));

// Get HR KPIs with optional filters
router.get('/kpis', hrController.getHRKPIs.bind(hrController));

// Get detailed KPI records
router.get('/kpi-details', hrController.getKPIDetails.bind(hrController));

// Get all freshers with pagination and filtering
router.get('/freshers', hrController.getFreshers.bind(hrController));

// Get pending offers (freshers with future joining dates)
router.get('/pending-offers', hrController.getPendingOffers.bind(hrController));

// Get specific fresher by ID
router.get('/freshers/:id', hrController.getFresherById.bind(hrController));

// Resend welcome email for specific fresher
router.post('/freshers/:id/resend-email', hrController.resendWelcomeEmail.bind(hrController));

// Vendor verification routes
router.post('/vendor-verify', hrController.vendorVerify.bind(hrController));
router.post('/vendor-reject', hrController.vendorReject.bind(hrController));

// TODO: Implement additional routes when services are ready
// router.put('/freshers/:id', hrController.updateFresher.bind(hrController));
// router.delete('/freshers/:id', hrController.deleteFresher.bind(hrController));
// router.post('/freshers/:id/reset-password', hrController.resetPassword.bind(hrController));
// router.post('/freshers/bulk', hrController.bulkCreateFreshers.bind(hrController));

/**
 * Middleware for request logging (optional)
 */
router.use((req, res, next) => {
  console.log(`HR API: ${req.method} ${req.path}`, {
    timestamp: new Date().toISOString(),
    // SECURITY: Don't log sensitive request body data
    hasBody: Object.keys(req.body || {}).length > 0
  });
  next();
});

export { router as hrRoutes };