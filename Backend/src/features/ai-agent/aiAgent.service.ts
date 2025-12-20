import axios from 'axios';

/**
 * AI Agent Service
 * Uses Azure OpenAI Chat Completions API with company knowledge in system prompt
 * More reliable than Azure AI Foundry and uses existing credentials
 */
export class AIAgentService {
  private endpoint: string;
  private apiKey: string;
  private deployment: string;
  private apiVersion: string;
  private demoMode: boolean = false;
  
  // Store conversation history per thread
  private conversationHistory: Map<string, Array<{ role: string; content: string }>> = new Map();

  constructor() {
    this.endpoint = process.env.AZURE_OPENAI_ENDPOINT || '';
    this.apiKey = process.env.AZURE_OPENAI_API_KEY || '';
    this.deployment = process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4o-mini';
    this.apiVersion = process.env.AZURE_OPENAI_API_VERSION || '2024-02-15-preview';

    if (!this.endpoint || !this.apiKey) {
      console.warn('⚠️ Azure OpenAI not configured - using DEMO MODE');
      this.demoMode = true;
    } else if (this.apiKey.length < 50 || this.apiKey.toLowerCase().includes('demo')) {
      console.warn('⚠️ Using DEMO MODE - API key appears to be a placeholder');
      this.demoMode = true;
    } else {
      console.log('✅ Azure OpenAI AI Agent configured:', {
        endpoint: this.endpoint,
        deployment: this.deployment,
        apiVersion: this.apiVersion
      });
    }
  }

  private getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'api-key': this.apiKey
    };
  }

  private getConversationHistory(threadId: string): Array<{ role: string; content: string }> {
    if (!this.conversationHistory.has(threadId)) {
      this.conversationHistory.set(threadId, [
        {
          role: 'system',
          content: `You are an AI assistant for WinOnboard, an employee onboarding platform.

COMPANY KNOWLEDGE BASE:
- WinOnboard is a comprehensive employee onboarding system for new hires
- The platform handles Background Verification (BGV), document submission, and HR processes
- New employees (freshers) receive welcome emails with their credentials

ONBOARDING DOCUMENTS REQUIRED:
1. Personal Information:
   - Full name, date of birth, gender
   - Contact details (phone, email, address)
   - Emergency contact information
   - PAN card, Aadhaar card

2. Educational Documents:
   - 10th grade certificate and marksheet
   - 12th grade/Diploma certificate and marksheet  
   - Degree certificate and all semester marksheets
   - Any additional certifications

3. Employment History:
   - Previous employment details (if applicable)
   - Experience letters
   - Relieving letters
   - Salary slips (last 3 months)

4. Other Documents:
   - Passport size photographs
   - Passport (if available)
   - Bank account details and cancelled cheque
   - Address proof

BACKGROUND VERIFICATION PROCESS:
1. Document Submission: Upload all required documents in the portal
2. Document Verification: HR team reviews submitted documents
3. Background Check: Education and employment verification
4. IT Onboarding: Once approved, IT team provides equipment and access
5. Final Approval: Complete onboarding and joining formalities

PLATFORM FEATURES:
- Secure document upload to Azure Blob Storage
- Real-time submission status tracking
- Email notifications for important updates
- HR and IT team dashboards
- Birthday tracking and celebrations
- Vendor verification integration

Be helpful, professional, and provide accurate information based on this knowledge base. If asked about specific personal data or status, guide them to check their dashboard or contact HR.`
        }
      ]);
    }
    return this.conversationHistory.get(threadId)!;
  }

  async processMessage(userMessage: string, threadId?: string): Promise<string> {
    try {
      if (!threadId) {
        threadId = `thread_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      }

      console.log(`[AI Agent] Processing message for thread: ${threadId}`);

      // Demo mode
      if (this.demoMode) {
        const responses = [
          "Hello! I'm your WinOnboard AI assistant. I can help you with onboarding questions, document requirements, and HR policies.",
          "For onboarding, you'll need educational certificates, employment records, ID proof, and bank details.",
          "The onboarding process includes document submission, verification, background checks, and IT setup.",
          "I can help you understand what documents are required and guide you through the onboarding process."
        ];
        return responses[Math.floor(Math.random() * responses.length)];
      }

      // Get conversation history
      const messages = this.getConversationHistory(threadId);
      
      // Add user message
      messages.push({
        role: 'user',
        content: userMessage
      });

      // Call Azure OpenAI
      const url = `${this.endpoint.replace(/\/$/, '')}/openai/deployments/${this.deployment}/chat/completions?api-version=${this.apiVersion}`;
      
      console.log(`[AI Agent] Calling Azure OpenAI: ${this.deployment}`);
      
      const response = await axios.post(
        url,
        {
          messages: messages,
          max_tokens: 1000,
          temperature: 0.7,
          top_p: 0.95,
          frequency_penalty: 0,
          presence_penalty: 0
        },
        {
          headers: this.getHeaders(),
          timeout: 30000
        }
      );

      const assistantMessage = response.data?.choices?.[0]?.message?.content || 'I apologize, but I could not generate a response. Please try again.';
      
      // Add assistant response to history
      messages.push({
        role: 'assistant',
        content: assistantMessage
      });

      // Keep only last 10 messages to avoid token limits
      if (messages.length > 11) {
        const systemMessage = messages[0];
        this.conversationHistory.set(threadId, [systemMessage, ...messages.slice(-10)]);
      }

      console.log(`[AI Agent] Response generated successfully`);
      
      return assistantMessage;
    } catch (err: any) {
      console.error('[AI Agent] Error:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data
      });

      if (err.response?.status === 401) {
        return "I'm having trouble connecting to the AI service. Please check the API configuration.";
      } else if (err.response?.status === 429) {
        return "I'm currently experiencing high demand. Please try again in a moment.";
      } else {
        return "I apologize, but I encountered an error. Please try again.";
      }
    }
  }

  isConfigured(): boolean {
    return !this.demoMode;
  }

  isDemoMode(): boolean {
    return this.demoMode;
  }
}


