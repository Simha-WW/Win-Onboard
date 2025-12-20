import { AIProjectsClient } from '@azure/ai-projects';
import { AzureKeyCredential } from '@azure/core-auth';

/**
 * AI Agent Service
 * Handles communication with Azure AI Foundry Agent with custom knowledge base
 * 
 * Uses Azure AI Projects SDK to connect to your configured agent
 * The agent has access to custom knowledge/data sources you configured in Azure AI Foundry
 */
export class AIAgentService {
  private client: AIProjectsClient | null = null;
  private agentId: string;
  private demoMode: boolean = false;
  private projectEndpoint: string;
  private apiKey: string;

  constructor() {
    this.projectEndpoint = process.env.AZURE_FOUNDRY_PROJECT_ENDPOINT || '';
    this.apiKey = process.env.AZURE_FOUNDRY_API_KEY || process.env.AZURE_OPENAI_API_KEY || '';
    this.agentId = process.env.AZURE_FOUNDRY_AGENT_ID || 'asst_LfrmJixgihcM4gRdBqqEkvY0';

    if (!this.projectEndpoint || !this.apiKey) {
      console.warn('⚠️ Azure AI Foundry not configured - using DEMO MODE');
      this.demoMode = true;
    } else if (this.apiKey.length < 50 || this.apiKey.toLowerCase().includes('dummy') || this.apiKey.toLowerCase().includes('demo') || this.apiKey.toLowerCase().includes('test') || this.apiKey.toLowerCase().includes('placeholder')) {
      console.warn('⚠️ Using DEMO MODE - API key appears to be a placeholder');
      this.demoMode = true;
    } else {
      try {
        // Initialize Azure AI Projects client with API key authentication
        const credential = new AzureKeyCredential(this.apiKey);
        this.client = new AIProjectsClient(this.projectEndpoint, credential);
        
        console.log('✅ Azure AI Foundry Agent configured:', {
          endpoint: this.projectEndpoint,
          agentId: this.agentId,
          hasKnowledgeBase: true
        });
      } catch (error: any) {
        console.error('❌ Failed to initialize Azure AI Projects client:', error.message);
        this.demoMode = true;
      }
    }
  }

  /**
   * Process user message using Azure AI Foundry Agent with knowledge base
   */
  async processMessage(userMessage: string, threadId?: string): Promise<string> {
    try {
      console.log(`[AI Agent] Processing message: "${userMessage.substring(0, 50)}..."`);

      // Demo mode response
      if (this.demoMode || !this.client) {
        const demoResponses = [
          "Hello! I'm your WinOnboard AI assistant with access to company knowledge. I can help you with onboarding questions, document requirements, and HR policies. How can I assist you today?",
          "Based on the company documentation, you'll typically need to submit educational certificates, previous employment records, and identity proof for onboarding. Would you like more specific information?",
          "I can help you with your onboarding journey. I have access to all company policies and procedures. What would you like to know?",
          "The onboarding process includes document verification, background checks, and completing personal information forms. I can guide you through each step based on our company's specific requirements."
        ];
        const response = demoResponses[Math.floor(Math.random() * demoResponses.length)];
        console.log(`[DEMO] Generated response`);
        return response;
      }

      // Create or get thread
      if (!threadId) {
        console.log('[AI Agent] Creating new thread...');
        const thread = await this.client.agents.createThread();
        threadId = thread.id;
        console.log(`[AI Agent] Created thread: ${threadId}`);
      }

      // Add user message to thread
      console.log(`[AI Agent] Adding message to thread ${threadId}`);
      await this.client.agents.createMessage(threadId, {
        role: 'user',
        content: userMessage
      });

      // Run the agent (this will use your agent's knowledge base)
      console.log(`[AI Agent] Running agent ${this.agentId} on thread ${threadId}`);
      const run = await this.client.agents.createRun(threadId, {
        assistantId: this.agentId
      });

      console.log(`[AI Agent] Run created: ${run.id}, waiting for completion...`);

      // Poll for run completion
      let runStatus = await this.client.agents.getRun(threadId, run.id);
      let attempts = 0;
      const maxAttempts = 30;

      while (runStatus.status === 'queued' || runStatus.status === 'in_progress') {
        if (attempts >= maxAttempts) {
          throw new Error('Agent run timed out');
        }
        
        console.log(`[AI Agent] Run status: ${runStatus.status} (attempt ${attempts + 1}/${maxAttempts})`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        runStatus = await this.client.agents.getRun(threadId, run.id);
        attempts++;
      }

      if (runStatus.status === 'failed') {
        console.error('[AI Agent] Run failed:', runStatus);
        throw new Error(`Agent run failed: ${runStatus.lastError?.message || 'Unknown error'}`);
      }

      if (runStatus.status !== 'completed') {
        console.error('[AI Agent] Unexpected run status:', runStatus.status);
        throw new Error(`Unexpected run status: ${runStatus.status}`);
      }

      console.log('[AI Agent] Run completed, fetching messages...');

      // Get messages from the thread
      const messages = await this.client.agents.listMessages(threadId);
      
      // Find the latest assistant message
      const assistantMessages = messages.data
        .filter((msg: any) => msg.role === 'assistant')
        .sort((a: any, b: any) => b.createdAt - a.createdAt);

      if (assistantMessages.length === 0) {
        console.warn('[AI Agent] No assistant messages found');
        return "I apologize, but I couldn't generate a response. Please try again.";
      }

      const latestMessage = assistantMessages[0];
      
      // Extract text content
      let responseText = '';
      if (latestMessage.content && Array.isArray(latestMessage.content)) {
        for (const contentItem of latestMessage.content) {
          if (contentItem.type === 'text' && contentItem.text) {
            responseText += contentItem.text.value || contentItem.text;
          }
        }
      } else if (typeof latestMessage.content === 'string') {
        responseText = latestMessage.content;
      }

      if (!responseText) {
        console.warn('[AI Agent] Empty response text');
        return "I received your message but couldn't formulate a response. Please try rephrasing your question.";
      }

      console.log(`[AI Agent] Response generated (${responseText.length} chars)`);
      return responseText;

    } catch (err: any) {
      console.error('[AI Agent] Error processing message:', {
        message: err.message,
        stack: err.stack,
        response: err.response?.data
      });
      
      // Return friendly error messages
      if (err.message?.includes('401') || err.message?.includes('Unauthorized')) {
        return "I'm having trouble authenticating with the AI service. Please check the configuration.";
      } else if (err.message?.includes('429') || err.message?.includes('rate limit')) {
        return "I'm currently experiencing high demand. Please try again in a moment.";
      } else if (err.message?.includes('timeout')) {
        return "The request took too long to process. Please try a simpler question.";
      } else {
        return "I apologize, but I encountered an error processing your request. Please try again or contact support if the issue persists.";
      }
    }
  }

  /**
   * Validate that the service is properly configured
   */
  isConfigured(): boolean {
    return !!(this.endpoint && this.apiKey && !this.demoMode);
  }

  /**
   * Check if running in demo mode
   */
  isDemoMode(): boolean {
    return this.demoMode;
  }
}


