/**
 * IT Controller
 * Handles HTTP requests for IT onboarding tasks
 */

import { Request, Response } from 'express';
import { ITService } from '../services/it.service';

/**
 * Send fresher to IT for onboarding
 * POST /api/it/send-to-it
 */
export const sendToIt = async (req: Request, res: Response) => {
  try {
    const { fresherId } = req.body;

    if (!fresherId) {
      return res.status(400).json({
        success: false,
        message: 'Fresher ID is required'
      });
    }

    const itTask = await ITService.sendToIt(fresherId);

    return res.status(201).json({
      success: true,
      message: 'Successfully sent to IT team',
      data: itTask
    });
  } catch (error: any) {
    console.error('Error in sendToIt controller:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to send to IT'
    });
  }
};

/**
 * Get all IT tasks
 * GET /api/it/tasks
 */
export const getAllItTasks = async (req: Request, res: Response) => {
  try {
    const tasks = await ITService.getAllItTasks();

    res.status(200).json({
      success: true,
      data: tasks,
      count: tasks.length
    });
  } catch (error: any) {
    console.error('Error in getAllItTasks controller:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch IT tasks'
    });
  }
};

/**
 * Get IT task by ID
 * GET /api/it/tasks/:id
 */
export const getItTaskById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Task ID is required'
      });
    }
    const taskId = parseInt(id, 10);

    if (isNaN(taskId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid task ID'
      });
    }

    const task = await ITService.getItTaskById(taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'IT task not found'
      });
    }

    // Calculate completion percentage
    const completionPercentage = await ITService.getTaskCompletionPercentage(taskId);

    return res.status(200).json({
      success: true,
      data: {
        ...task,
        completionPercentage
      }
    });
  } catch (error: any) {
    console.error('Error in getItTaskById controller:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch IT task'
    });
  }
};

/**
 * Update IT task status
 * PATCH /api/it/tasks/:id
 */
export const updateItTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Task ID is required'
      });
    }
    const taskId = parseInt(id, 10);

    if (isNaN(taskId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid task ID'
      });
    }

    const updates = req.body;

    // Validate that at least one field is provided
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No update fields provided'
      });
    }

    const updatedTask = await ITService.updateItTask(taskId, updates);

    return res.status(200).json({
      success: true,
      message: 'IT task updated successfully',
      data: updatedTask
    });
  } catch (error: any) {
    console.error('Error in updateItTask controller:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update IT task'
    });
  }
};

/**
 * Delete IT task
 * DELETE /api/it/tasks/:id
 */
export const deleteItTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Task ID is required'
      });
    }
    const taskId = parseInt(id, 10);

    if (isNaN(taskId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid task ID'
      });
    }

    await ITService.deleteItTask(taskId);

    return res.status(200).json({
      success: true,
      message: 'IT task deleted successfully'
    });
  } catch (error: any) {
    console.error('Error in deleteItTask controller:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete IT task'
    });
  }
};

/**
 * Get IT task by fresher ID
 * GET /api/it/tasks/fresher/:fresherId
 */
export const getItTaskByFresherId = async (req: Request, res: Response) => {
  try {
    const { fresherId } = req.params;
    if (!fresherId) {
      return res.status(400).json({
        success: false,
        message: 'Fresher ID is required'
      });
    }
    const id = parseInt(fresherId, 10);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid fresher ID'
      });
    }

    const task = await ITService.getItTaskByFresherId(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'No IT task found for this fresher'
      });
    }

    return res.status(200).json({
      success: true,
      data: task
    });
  } catch (error: any) {
    console.error('Error in getItTaskByFresherId controller:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch IT task'
    });
  }
};

/**
 * Update specific task status by fresher ID
 * PUT /api/it/tasks/:fresherId/update
 */
export const updateTaskStatusByFresherId = async (req: Request, res: Response) => {
  try {
    const { fresherId } = req.params;
    const { taskName, status } = req.body;

    if (!fresherId) {
      return res.status(400).json({
        success: false,
        message: 'Fresher ID is required'
      });
    }

    const id = parseInt(fresherId, 10);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid fresher ID'
      });
    }

    if (!taskName) {
      return res.status(400).json({
        success: false,
        message: 'Task name is required'
      });
    }

    if (status === undefined || status === null) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const updatedTask = await ITService.updateTaskStatusByFresherId(id, taskName, status);

    return res.status(200).json({
      success: true,
      message: 'Task status updated successfully',
      data: updatedTask
    });
  } catch (error: any) {
    console.error('Error in updateTaskStatusByFresherId controller:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update task status'
    });
  }
};
