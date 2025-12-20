import axios, { AxiosResponse } from 'axios';

/**
 * AI Agent Service
 * Handles communication with Azure AI Foundry agent using the thread-based pattern
 * 
 * Pattern:
 * 1. Create or get thread
 * 2. Add user message to thread
 * 3. Run agent on thread
 * 4. Retrieve messages
 * 
 * DEMO MODE: If API key is invalid, runs in demo mode with simulated responses
 */
export class AIAgentService {
  private endpoint: string;
  private apiKey: string;
  private agentId: string = 'asst_LfrmJixgihcM4gRdBqqEkvY0';
  private demoMode: boolean = false;

  constructor() {
    this.endpoint = process.env.AZURE_FOUNDRY_PROJECT_ENDPOINT || '';
    this.apiKey = process.env.AZURE_FOUNDRY_API_KEY || '';

    if (!this.endpoint) {
      console.warn('⚠️ AZURE_FOUNDRY_PROJECT_ENDPOINT not configured');
    }
    if (!this.apiKey) {
      console.warn('⚠️ AZURE_FOUNDRY_API_KEY not configured');
      this.demoMode = true;
    }
    
    // Enable demo mode for development (dummy/invalid keys)
    if (this.apiKey && (this.apiKey.length < 50 || this.apiKey.toLowerCase().includes('dummy') || this.apiKey.toLowerCase().includes('demo') || this.apiKey.toLowerCase().includes('test') || this.apiKey.toLowerCase().includes('placeholder'))) {
      console.warn('⚠️ Using DEMO MODE - API key appears to be a placeholder');
      this.demoMode = true;
    }
  }

  /**
   * Get headers with authentication
   */
  private getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`
    };
  }

  /**
   * Create a new thread for conversation
   */
  async createThread(): Promise<string> {
    if (this.demoMode) {
      const threadId = `thread_demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      console.log(`[DEMO] Created thread: ${threadId}`);
      return threadId;
    }

    try {
      const url = `${this.endpoint}/threads`;
      console.log(`Creating thread at: ${url}`);
      
      const resp = await axios.post(
        url,
        {},
        { headers: this.getHeaders(), timeout: 30000 }
      );
      
      console.log('Thread created:', resp.data);
      return resp.data?.id || resp.data?.thread_id;
    } catch (err: any) {
      console.error('Error creating thread:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data
      });
      throw err;
    }
  }

  /**
   * Add a message to a thread
   */
  async addMessage(threadId: string, content: string): Promise<void> {
    if (this.demoMode) {
      console.log(`[DEMO] Added message to ${threadId}: ${content}`);
      return;
    }

    try {
      const url = `${this.endpoint}/threads/${threadId}/messages`;
      console.log(`Adding message to thread: ${threadId}`);
      
      const resp = await axios.post(
        url,
        {
          role: 'user',
          content: content
        },
        { headers: this.getHeaders(), timeout: 30000 }
      );
      
      console.log('Message added:', resp.data);
    } catch (err: any) {
      console.error('Error adding message:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data
      });
      throw err;
    }
  }

  /**
   * Run the agent on a thread
   */
  async runAgent(threadId: string): Promise<string> {
    if (this.demoMode) {
      const runId = `run_demo_${Date.now()}`;
      console.log(`[DEMO] Running agent on thread: ${threadId}`);
      return runId;
    }

    try {
      const url = `${this.endpoint}/threads/${threadId}/runs`;
      console.log(`Running agent on thread: ${threadId}`);
      
      const resp = await axios.post(
        url,
        {
          assistant_id: this.agentId
        },
        { headers: this.getHeaders(), timeout: 60000 }
      );
      
      console.log('Agent run created:', resp.data);
      const runId = resp.data?.id || resp.data?.run_id;
      
      // Wait for run to complete
      await this.waitForRun(threadId, runId);
      
      return runId;
    } catch (err: any) {
      console.error('Error running agent:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data
      });
      throw err;
    }
  }

  /**
   * Wait for agent run to complete
   */
  async waitForRun(threadId: string, runId: string, maxAttempts: number = 10): Promise<void> {
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const url = `${this.endpoint}/threads/${threadId}/runs/${runId}`;
        const resp = await axios.get(url, { headers: this.getHeaders(), timeout: 30000 });
        
        const status = resp.data?.status;
        console.log(`Run status: ${status}`);
        
        if (status === 'completed' || status === 'success') {
          return;
        }
        
        if (status === 'failed' || status === 'error') {
          throw new Error(`Run failed with status: ${status}`);
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (err: any) {
        console.error(`Error checking run status (attempt ${i + 1}):`, err.message);
        if (i === maxAttempts - 1) throw err;
      }
    }
  }

  /**
   * Get messages from a thread
   */
  async getMessages(threadId: string): Promise<any[]> {
    if (this.demoMode) {
      console.log(`[DEMO] Fetching messages from thread: ${threadId}`);
      // Return a demo response
      return [
        {
          id: 'msg_demo_1',
          role: 'user',
          content: 'User message',
          created_at: new Date().toISOString()
        },
        {
          id: 'msg_demo_2',
          role: 'assistant',
          content: 'This is a demo response from the AI agent. In production, this would be connected to your Azure AI Foundry agent.',
          created_at: new Date().toISOString()
        }
      ];
    }

    try {
      const url = `${this.endpoint}/threads/${threadId}/messages`;
      console.log(`Fetching messages from thread: ${threadId}`);
      
      const resp = await axios.get(
        url,
        { headers: this.getHeaders(), timeout: 30000 }
      );
      
      console.log('Messages fetched:', resp.data);
      return resp.data?.data || resp.data?.messages || [];
    } catch (err: any) {
      console.error('Error getting messages:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data
      });
      throw err;
    }
  }

  /**
   * Process user message: create thread, add message, run agent, get response
   */
  async processMessage(userMessage: string, threadId?: string): Promise<string> {
    try {
      // Create new thread if not provided
      if (!threadId) {
        threadId = await this.createThread();
        console.log(`Created new thread: ${threadId}`);
      }

      // Add user message
      await this.addMessage(threadId, userMessage);

      // Run agent
      const runId = await this.runAgent(threadId);
      console.log(`Started run ${runId}`);

      // Get messages
      const messages = await this.getMessages(threadId);
      console.log(`Retrieved ${messages.length} messages`);

      // Extract the latest assistant response
      // Azure Foundry format: messages array with role and content fields
      const assistantMessage = messages
        .reverse()
        .find((m: any) => m.role === 'assistant' || m.role === 'assistant_message');

      if (assistantMessage) {
        // Try multiple content extraction paths
        if (assistantMessage.content) {
          return assistantMessage.content;
        }
        if (assistantMessage.text) {
          return assistantMessage.text;
        }
        if (assistantMessage.text_content) {
          return assistantMessage.text_content;
        }
        if (Array.isArray(assistantMessage.content) && assistantMessage.content[0]) {
          const content = assistantMessage.content[0];
          if (typeof content === 'string') return content;
          if (content.text) return content.text;
        }
      }

      return 'No response from assistant';
    } catch (err: any) {
      console.error('Error processing message:', {
        message: err.message,
        stack: err.stack
      });
      throw err;
    }
  }

  /**
   * Validate that the service is properly configured
   */
  isConfigured(): boolean {
    return !!(this.endpoint && this.apiKey);
  }

  /**
   * Check if running in demo mode
   */
  isDemoMode(): boolean {
    return this.demoMode;
  }
}


