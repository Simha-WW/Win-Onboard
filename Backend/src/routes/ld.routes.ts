/**
 * L&D Routes
 * Routes for Learning & Development portal
 */

import { Router } from 'express';
import {
  getLDEmployees,
  getEmployeeLearningProgress,
  updateEmployeeLearningProgress,
  addLearningResource
} from '../controllers/ld.controller';

const router = Router();

// Get all employees with learning assignments
router.get('/employees', getLDEmployees);

// Get learning progress for specific employee
router.get('/employee/:id/progress', getEmployeeLearningProgress);

// Update learning progress for an employee
router.put('/employee/:fresherId/progress/:progressId', updateEmployeeLearningProgress);

// Add a new learning resource for an employee
router.post('/employee/:id/add-resource', addLearningResource);

export default router;
