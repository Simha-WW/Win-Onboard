/**
 * IT Routes
 * Routes for IT onboarding task management
 */

import express from 'express';
import {
  sendToIt,
  getAllItTasks,
  getItTaskById,
  updateItTask,
  deleteItTask,
  getItTaskByFresherId
} from '../controllers/it.controller';

const router = express.Router();

// Send fresher to IT
router.post('/send-to-it', sendToIt);

// Get all IT tasks
router.get('/tasks', getAllItTasks);

// Get IT task by fresher ID
router.get('/tasks/fresher/:fresherId', getItTaskByFresherId);

// Get IT task by ID
router.get('/tasks/:id', getItTaskById);

// Update IT task status
router.patch('/tasks/:id', updateItTask);

// Delete IT task
router.delete('/tasks/:id', deleteItTask);

export default router;
