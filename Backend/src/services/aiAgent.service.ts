// import axios from 'axios';

// /**
//  * AI Agent Service - Azure AI Foundry Integration
//  * 
//  * Based on Python implementation using DefaultAzureCredential
//  * For production: Use Azure SDK with proper managed identity authentication
//  * For development: Demo mode with simulated responses
//  */
// export class AIService {
//   private endpoint: string;
//   private apiKey: string;
//   private agentId: string = 'asst_LfrmJixgihcM4gRdBqqEkvY0';
//   private demoMode: boolean = false;

//   constructor() {
//     this.endpoint = process.env.AZURE_FOUNDRY_PROJECT_ENDPOINT || '';
//     this.apiKey = process.env.AZURE_FOUNDRY_API_KEY || '';

//     // Enable demo mode for development/testing
//     if (!this.endpoint || !this.apiKey) {
//       console.warn('⚠️ Azure AI Foundry not fully configured - using DEMO MODE');
//       this.demoMode = true;
//     } else if (this.apiKey.length < 50 || this.apiKey.toLowerCase().includes('dummy')) {
//       console.warn('⚠️ API key appears to be a placeholder - using DEMO MODE');
//       this.demoMode = true;
//     }

//     if (this.demoMode) {
//       console.log('📋 AI Agent running in DEMO MODE with simulated responses');
//     }
//   }

//   /**
//    * Get authentication headers
//    * Azure AI Foundry expects Bearer token authentication
//    */
//   private getHeaders(): Record<string, string> {
//     return {
//       'Content-Type': 'application/json',
//       'Authorization': `Bearer ${this.apiKey}`
//     };
//   }

//   /**
//    * Create a new thread for conversation
//    * Pattern from Python: project.agents.threads.create()
//    */
//   async createThread(): Promise<string> {
//     if (this.demoMode) {
//       const threadId = `thread_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
//       console.log(`[DEMO] Created thread: ${threadId}`);
//       return threadId;
//     }

//     try {
//       const url = `${this.endpoint}/threads`;
//       console.log(`Creating thread at: ${url}`);

//       const resp = await axios.post(url, {}, {
//         headers: this.getHeaders(),
//         timeout: 30000
//       });

//       const threadId = resp.data?.id || resp.data?.thread_id;
//       console.log(`✅ Thread created: ${threadId}`);
//       return threadId;
//     } catch (err: any) {
//       console.error('❌ Error creating thread:', {
//         message: err.message,
//         status: err.response?.status,
//         data: err.response?.data
//       });
//       throw err;
//     }
//   }

//   /**
//    * Add a message to a thread
//    * Pattern from Python: project.agents.messages.create(thread_id, role, content)
//    */
//   async addMessage(threadId: string, content: string): Promise<void> {
//     if (this.demoMode) {
//       console.log(`[DEMO] Added message to thread ${threadId}: "${content}"`);
//       return;
//     }

//     try {
//       const url = `${this.endpoint}/threads/${threadId}/messages`;
//       console.log(`Adding message to thread: ${threadId}`);

//       const resp = await axios.post(url, {
//         role: 'user',
//         content: content
//       }, {
//         headers: this.getHeaders(),
//         timeout: 30000
//       });

//       console.log('✅ Message added');
//     } catch (err: any) {
//       console.error('❌ Error adding message:', {
//         message: err.message,
//         status: err.response?.status,
//         data: err.response?.data
//       });
//       throw err;
//     }
//   }

//   /**
//    * Run agent and wait for completion
//    * Pattern from Python: project.agents.runs.create_and_process(thread_id, agent_id)
//    */
//   async createAndProcessRun(threadId: string): Promise<string> {
//     if (this.demoMode) {
//       const runId = `run_${Date.now()}`;
//       console.log(`[DEMO] Run created and processed: ${runId}`);
//       return runId;
//     }

//     try {
//       const url = `${this.endpoint}/threads/${threadId}/runs`;
//       console.log(`Running agent on thread: ${threadId}`);

//       const resp = await axios.post(url, {
//         assistant_id: this.agentId
//       }, {
//         headers: this.getHeaders(),
//         timeout: 60000
//       });

//       const runId = resp.data?.id || resp.data?.run_id;
//       console.log(`✅ Run created: ${runId}`);

//       // Wait for run to complete
//       await this.waitForRunCompletion(threadId, runId);
//       return runId;
//     } catch (err: any) {
//       console.error('❌ Error running agent:', {
//         message: err.message,
//         status: err.response?.status,
//         data: err.response?.data
//       });
//       throw err;
//     }
//   }

//   /**
//    * Poll run status until completion
//    */
//   private async waitForRunCompletion(threadId: string, runId: string): Promise<void> {
//     const maxAttempts = 20;
//     const pollInterval = 1000; // 1 second

//     for (let attempt = 0; attempt < maxAttempts; attempt++) {
//       try {
//         const url = `${this.endpoint}/threads/${threadId}/runs/${runId}`;
//         const resp = await axios.get(url, {
//           headers: this.getHeaders(),
//           timeout: 30000
//         });

//         const status = resp.data?.status;
//         console.log(`Run status (${attempt + 1}/${maxAttempts}): ${status}`);

//         if (status === 'completed' || status === 'succeeded' || status === 'success') {
//           console.log('✅ Run completed successfully');
//           return;
//         }

//         if (status === 'failed' || status === 'error') {
//           const error = resp.data?.last_error || 'Unknown error';
//           throw new Error(`Run failed: ${error}`);
//         }

//         // Still running, wait and retry
//         await new Promise(resolve => setTimeout(resolve, pollInterval));
//       } catch (err: any) {
//         if (attempt === maxAttempts - 1) {
//           console.error('❌ Max polling attempts reached');
//           throw err;
//         }
//       }
//     }
//   }

//   /**
//    * Get messages from thread
//    * Pattern from Python: project.agents.messages.list(thread_id)
//    */
//   async getMessages(threadId: string): Promise<any[]> {
//     if (this.demoMode) {
//       console.log(`[DEMO] Retrieving messages from thread: ${threadId}`);
//       return [
//         {
//           id: 'msg_user',
//           role: 'user',
//           text_messages: [{ text: { value: 'User message' } }]
//         },
//         {
//           id: 'msg_assistant',
//           role: 'assistant',
//           text_messages: [{
//             text: {
//               value: 'This is a demo response from the AI agent. In production, this will be powered by your Azure AI Foundry agent.'
//             }
//           }]
//         }
//       ];
//     }

//     try {
//       const url = `${this.endpoint}/threads/${threadId}/messages`;
//       console.log(`Fetching messages from thread: ${threadId}`);

//       const resp = await axios.get(url, {
//         headers: this.getHeaders(),
//         timeout: 30000
//       });

//       const messages = resp.data?.data || resp.data?.messages || [];
//       console.log(`✅ Retrieved ${messages.length} messages`);
//       return messages;
//     } catch (err: any) {
//       console.error('❌ Error getting messages:', {
//         message: err.message,
//         status: err.response?.status,
//         data: err.response?.data
//       });
//       throw err;
//     }
//   }

//   /**
//    * Process a user message end-to-end
//    * Mirrors Python pattern: create thread → add message → run agent → get messages
//    */
//   async processMessage(userMessage: string, threadId?: string): Promise<string> {
//     try {
//       // Step 1: Create or get thread
//       if (!threadId) {
//         threadId = await this.createThread();
//       }

//       // Step 2: Add user message
//       await this.addMessage(threadId, userMessage);

//       // Step 3: Run agent (Python uses create_and_process)
//       const runId = await this.createAndProcessRun(threadId);

//       // Step 4: Get messages
//       const messages = await this.getMessages(threadId);

//       // Step 5: Extract assistant response
//       // Python pattern: message.text_messages[-1].text.value
//       const assistantMessage = messages
//         .reverse()
//         .find((m: any) => m.role === 'assistant');

//       if (assistantMessage) {
//         // Try multiple response formats
//         if (assistantMessage.text_messages?.length > 0) {
//           const textMsg = assistantMessage.text_messages[assistantMessage.text_messages.length - 1];
//           if (textMsg?.text?.value) {
//             return textMsg.text.value;
//           }
//         }
//         if (assistantMessage.content) {
//           if (typeof assistantMessage.content === 'string') {
//             return assistantMessage.content;
//           }
//           if (Array.isArray(assistantMessage.content) && assistantMessage.content[0]?.text) {
//             return assistantMessage.content[0].text;
//           }
//         }
//       }

//       return 'No response received from assistant';
//     } catch (err: any) {
//       console.error('❌ Error processing message:', err.message);
//       throw err;
//     }
//   }

//   /**
//    * Check if service is properly configured
//    */
//   isConfigured(): boolean {
//     return !!(this.endpoint && this.apiKey);
//   }

//   /**
//    * Check if running in demo mode
//    */
//   isDemoMode(): boolean {
//     return this.demoMode;
//   }

//   /**
//    * Legacy method for backward compatibility
//    */
//   async send(payload: any): Promise<any> {
//     if (!this.endpoint) {
//       throw new Error('Azure AI endpoint not configured');
//     }

//     try {
//       const resp = await axios.post(this.endpoint, payload, {
//         headers: this.getHeaders(),
//         timeout: 30000
//       });
//       return resp;
//     } catch (err: any) {
//       console.error('Error in send():', err.message);
//       throw err;
//     }
//   }
// }


import axios, { AxiosResponse } from "axios";
import { DefaultAzureCredential, AccessToken } from "@azure/identity";

export interface ChatCompletionPayload {
  messages: Array<{
    role: "system" | "user" | "assistant";
    content: string;
  }>;
  temperature?: number;
  max_tokens?: number;
}

export class AIService {
  private endpoint: string;
  private credential: DefaultAzureCredential;

  constructor() {
    const endpoint = process.env.AZURE_FOUNDRY_ENDPOINT;

    if (!endpoint) {
      throw new Error("AZURE_FOUNDRY_ENDPOINT is not configured");
    }

    this.endpoint = endpoint;
    this.credential = new DefaultAzureCredential();
  }

  /**
   * Acquire Azure AD token for Azure AI Foundry
   */
  private async getAuthHeaders(): Promise<Record<string, string>> {
    const token: AccessToken | null =
      await this.credential.getToken("https://ai.azure.com/.default");

    if (!token?.token) {
      throw new Error("Failed to acquire Azure AD token");
    }

    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token.token}`
    };
  }

  /**
   * Stateless chat completion request
   */
  async send(
    payload: ChatCompletionPayload
  ): Promise<AxiosResponse<any>> {
    const headers = await this.getAuthHeaders();

    return axios.post(
      `${this.endpoint}/inference/v1/chat/completions`,
      payload,
      {
        headers,
        timeout: 30_000
      }
    );
  }
}
