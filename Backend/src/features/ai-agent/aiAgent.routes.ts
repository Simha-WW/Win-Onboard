import { Router, Request, Response, NextFunction } from 'express';
import { AIAgentService } from './aiAgent.service';

const router = Router();
const aiService = new AIAgentService();

// Store threads in memory (in production, use a database)
const userThreads: Map<string, string> = new Map();

/**
 * POST /api/features/ai-agent/chat
 * Send a message to the AI agent
 * 
 * Request body:
 * {
 *   "message": "Your question here",
 *   "userId": "optional-user-id-for-session"
 * }
 */
router.post('/chat', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!aiService.isConfigured()) {
      return res.status(503).json({
        error: 'Service Unavailable',
        message: 'AI Agent service is not configured'
      });
    }
 
    const { message, userId } = req.body;
    
    if (!message) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Message is required'
      });
    }

    // Get or create thread for user
    const userKey = userId || req.ip || 'default';
    let threadId = userThreads.get(userKey);

    console.log(`[AI Agent] Processing message from user: ${userKey}, thread: ${threadId}`);

    // Process message
    const response = await aiService.processMessage(message, threadId);

    // Store thread for future use (in production, save to DB)
    if (!threadId) {
      threadId = `thread_${userKey}_${Date.now()}`;
      userThreads.set(userKey, threadId);
    }

    console.log(`[AI Agent] Response ready for user ${userKey}`);

    return res.status(200).json({
      success: true,
      message: response,
      threadId: threadId
    });
  } catch (err: any) {
    console.error('[AI Agent] Error:', {
      message: err.message,
      status: err.response?.status,
      apiData: err.response?.data
    });
    
    return res.status(500).json({
      error: 'Internal Server Error',
      message: err.message,
      details: err.response?.data || 'No additional details'
    });
  }
});

/**
 * GET /api/features/ai-agent/health
 * Check if AI Agent service is configured and accessible
 */
router.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: aiService.isConfigured() ? 'ok' : 'unconfigured',
    configured: aiService.isConfigured(),
    demoMode: aiService.isDemoMode(),
    message: aiService.isDemoMode() 
      ? 'Running in DEMO MODE - responses are simulated' 
      : 'Connected to Azure AI Foundry'
  });
});

export { router as aiAgentRoutes };


