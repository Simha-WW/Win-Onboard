// import { Router, Request, Response, NextFunction } from 'express';
// import { AIService } from '../services/aiAgent.service';

// const router = Router();
// const ai = new AIService();

/**
 * POST /api/ai/agent
 * Proxy request body to configured Azure AI Foundry project endpoint.
 * Expects the frontend to send an object appropriate for the Foundry project.
 */
import { Router, Request, Response, NextFunction } from "express";
import { AIService, ChatCompletionPayload } from "../services/aiAgent.service";

const router = Router();
const aiService = new AIService();

/**
 * POST /api/ai/agent
 */
router.post(
  "/agent",
  async (
    req: Request<{}, {}, ChatCompletionPayload>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const payload = req.body;

      if (!payload?.messages || !Array.isArray(payload.messages)) {
        return res.status(400).json({
          error: "Request body must contain messages[]"
        });
      }

      const response = await aiService.send(payload);
      res.status(200).json(response.data);
    } catch (err) {
      next(err);
    }
  }
);

export { router as aiRoutes };


