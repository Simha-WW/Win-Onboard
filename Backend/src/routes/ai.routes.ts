import { Router, Request, Response, NextFunction } from 'express';
import { AIService } from '../services/aiAgent.service';

const router = Router();
const ai = new AIService();

/**
 * POST /api/ai/agent
 * Proxy request body to configured Azure AI Foundry project endpoint.
 * Expects the frontend to send an object appropriate for the Foundry project.
 */
router.post('/agent', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = req.body || {};
    const response = await ai.send(payload);

    // Forward response body from Foundry
    res.status(response.status || 200).json(response.data ?? response);
  } catch (err) {
    next(err);
  }
});

export { router as aiRoutes };

