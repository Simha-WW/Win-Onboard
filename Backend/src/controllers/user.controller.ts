/**
 * User Controller
 * Handles user/fresher-specific endpoints including learning assignments
 */

import { Request, Response } from 'express';
import { LearningDevelopmentService } from '../services/learning-development.service';

/**
 * Get learning plan assigned to the logged-in user
 * GET /api/user/learning-plan
 */
export const getUserLearningPlan = async (req: Request, res: Response) => {
  try {
    // @ts-ignore - fresherId is added by auth middleware
    const fresherId = req.user?.fresherId || req.user?.id;
    
    if (!fresherId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const progressData = await LearningDevelopmentService.getUserLearningProgress(fresherId);
    
    res.json({
      success: true,
      data: progressData
    });
  } catch (error: any) {
    console.error('Error in getUserLearningPlan controller:', error);
    
    // Handle case where user doesn't have learning assignment yet
    if (error.message === 'Employee not found in learning system') {
      return res.json({
        success: true,
        data: {
          employee: null,
          learnings: [],
          stats: {
            completed_count: 0,
            total_count: 0,
            progress_percentage: 0,
            total_duration_minutes: 0,
            completed_duration_minutes: 0,
            remaining_duration_minutes: 0
          }
        },
        message: 'No learning plan assigned yet'
      });
    }
    
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch learning plan'
    });
  }
};

/**
 * Mark a learning item as complete or update progress
 * PUT /api/user/learning-plan/:progressId
 */
export const updateUserLearningProgress = async (req: Request, res: Response) => {
  try {
    // @ts-ignore - fresherId is added by auth middleware
    const fresherId = req.user?.fresherId || req.user?.id;
    const progressId = parseInt(req.params.progressId || "0");
    const { isCompleted, progressPercentage, notes } = req.body;

    if (!fresherId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    if (isNaN(progressId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid progress ID'
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
    console.error('Error in updateUserLearningProgress controller:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update learning progress'
    });
  }
};
