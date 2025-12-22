/**
 * Policies Controller
 * Handles policy document retrieval endpoints
 */

import { Request, Response } from 'express';
import { policiesService } from '../services/policies.service';

/**
 * Get all policy documents
 * GET /api/policies
 */
export const getPolicies = async (req: Request, res: Response) => {
  try {
    const policies = await policiesService.listPolicies();

    res.json({
      success: true,
      data: policies
    });
  } catch (error: any) {
    console.error('Error in getPolicies controller:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch policies'
    });
  }
};
