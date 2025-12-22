import React, { useState, useRef, useEffect } from 'react';
import './AIAgentChat.css';

export default function AIAgentChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [threadId, setThreadId] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const send = async () => {
    if (!input.trim()) return;
    
    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api';
      const resp = await fetch(`${API_BASE_URL}/features/ai-agent/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: input,
          userId: threadId || undefined
        })
      });
      
      if (!resp.ok) {
        throw new Error(`API error: ${resp.status}`);
      }
      
      const data = await resp.json();
      
      if (data.threadId) {
        setThreadId(data.threadId);
      }
      
      const assistantText = data.message || 'No response';
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: assistantText 
      }]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `❌ Error: ${err.message}` 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      send();
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button 
        className="ai-chat-fab"
        onClick={() => setIsOpen(!isOpen)}
        title={isOpen ? 'Close chat' : 'Open chat'}
      >
        {isOpen ? '✕' : '💬'}
      </button>

      {/* Chat Widget */}
      {isOpen && (
        <div className="ai-chat">
          <div className="ai-chat-header">
            <h3>🤖 AI Assistant</h3>
            <p className="ai-chat-subtitle">Powered by WinOnboard Agent</p>
          </div>
          <div className="ai-chat-messages">
            {messages.length === 0 && (
              <div className="ai-chat-empty">
                <p>👋 Hi! I'm your WinOnboard AI Assistant.</p>
                <p>How can I help you today?</p>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`ai-chat-message ai-chat-message--${m.role}`}>
                <div className="ai-chat-message-role">
                  {m.role === 'user' ? '👤' : '🤖'}
                </div>
                <div className="ai-chat-message-content">{m.content}</div>
              </div>
            ))}
            {loading && (
              <div className="ai-chat-message ai-chat-message--assistant">
                <div className="ai-chat-message-role">🤖</div>
                <div className="ai-chat-loading">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="ai-chat-input-area">
            <input 
              type="text"
              value={input} 
              onChange={e => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your question..." 
              disabled={loading}
              maxLength={500}
              autoFocus
            />
            <button onClick={send} disabled={loading} title="Send message">
              {loading ? '⏳' : '📤'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
