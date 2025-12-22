/**
 * L&D Controller
 * Handles Learning & Development portal endpoints for employee learning management
 */

import { Request, Response } from 'express';
import { LearningDevelopmentService } from '../services/learning-development.service';

/**
 * Get all employees with learning assignments
 * GET /api/ld/employees
 */
export const getLDEmployees = async (req: Request, res: Response) => {
  try {
    const employees = await LearningDevelopmentService.getAllLDEmployees();
    
    res.json({
      success: true,
      data: employees
    });
  } catch (error: any) {
    console.error('Error in getLDEmployees controller:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch L&D employees'
    });
  }
};

/**
 * Get learning progress for a specific employee
 * GET /api/ld/employee/:id/progress
 */
export const getEmployeeLearningProgress = async (req: Request, res: Response) => {
  try {
    const fresherId = parseInt(req.params.id || '');
    
    if (isNaN(fresherId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid employee ID'
      });
    }

    const progressData = await LearningDevelopmentService.getUserLearningProgress(fresherId);
    
    res.json({
      success: true,
      data: progressData
    });
  } catch (error: any) {
    console.error('Error in getEmployeeLearningProgress controller:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch employee learning progress'
    });
  }
};

/**
 * Update learning progress for an employee
 * PUT /api/ld/employee/:fresherId/progress/:progressId
 */
export const updateEmployeeLearningProgress = async (req: Request, res: Response) => {
  try {
    const fresherId = parseInt(req.params.fresherId || '');
    const progressId = parseInt(req.params.progressId || '');
    const { isCompleted, progressPercentage, notes } = req.body;

    if (isNaN(fresherId) || isNaN(progressId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid employee or progress ID'
      });
    }

    await LearningDevelopmentService.updateLearningProgress(
      fresherId,
      progressId,
      {
        isCompleted,
        progressPercentage,
        notes
      }
    );

    res.json({
      success: true,
      message: 'Learning progress updated successfully'
    });
  } catch (error: any) {
    console.error('Error in updateEmployeeLearningProgress controller:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update learning progress'
    });
  }
};

/**
 * Add a new custom learning resource for an employee
 * POST /api/ld/employee/:id/add-resource
 */
export const addLearningResource = async (req: Request, res: Response) => {
  try {
    const fresherId = parseInt(req.params.id || '');
    const { learning_title, description, learning_link, duration_minutes } = req.body;

    if (isNaN(fresherId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid employee ID'
      });
    }

    if (!learning_title || !learning_link) {
      return res.status(400).json({
        success: false,
        message: 'Title and link are required'
      });
    }

    await LearningDevelopmentService.addCustomLearningResource(fresherId, {
      learning_title,
      description,
      learning_link,
      duration_minutes: duration_minutes ? parseInt(duration_minutes) : 0
    });

    res.json({
      success: true,
      message: 'Learning resource added successfully'
    });
  } catch (error: any) {
    console.error('Error in addLearningResource controller:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to add learning resource'
    });
  }
};
