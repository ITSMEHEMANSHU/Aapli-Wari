import React, { useState, useRef, useEffect } from 'react';
import { FaRobot, FaPaperPlane, FaBook, FaUser, FaExclamationTriangle } from 'react-icons/fa';

import Loader from '../../components/common/Loader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { api } from '../../services/api';

// Error Boundary Class
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full p-6 text-center bg-[#faf8f5] border border-[#3c2a21]/20 rounded-2xl shadow-sm my-4">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#efe8e0] text-[#3c2a21] flex items-center justify-center text-xl">
            <FaExclamationTriangle />
          </div>
          <h3 className="text-lg font-semibold text-[#3c2a21] mb-1">Something went wrong</h3>
          <p className="text-sm text-[#6c584c] mb-4 max-w-md mx-auto">
            {this.state.error?.message || 'An unexpected error occurred.'}
          </p>
          <button
            onClick={this.handleReset}
            className="px-4 py-2 bg-[#3c2a21] text-[#f5ebe0] text-sm font-medium rounded-xl hover:bg-[#2b1e17] transition-colors"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const SUGGESTED_PROMPTS = [
  'What is the history of Wari?',
  'Tell me about Palkhi tradition',
  'Who are the key Sants?'
];

const AIAssistantContent = () => {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend) => {
    const queryText = textToSend || question;
    if (!queryText.trim() || loading) return;

    const userMessage = { role: 'user', content: queryText };
    setMessages((prev) => [...prev, userMessage]);
    setQuestion('');
    setLoading(true);

    try {
      const response = await api.chat({ query: queryText });
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: response?.answer || 'No answer received.',
          sources: response?.sources || []
        }
      ]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSend();
  };

  return (
    <div className="w-full h-[750px] flex flex-col p-2 sm:p-4">
      <Card className="flex-1 flex flex-col overflow-hidden shadow-md border border-[#3c2a21]/20 rounded-2xl bg-[#faf8f5]">
        
        {/* Header */}
        <div className="bg-[#3c2a21] text-[#f5ebe0] px-6 py-4 flex items-center justify-between border-b border-[#2b1e17]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#d5aea1]/20 flex items-center justify-center border border-[#d5aea1]/30 text-[#e6ccb2]">
              <FaRobot className="text-xl" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#f5ebe0]">Wari Heritage Assistant</h2>
              <p className="text-xs text-[#d5aea1]">Ask about culture, Sants, and Palkhi history</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#fdfbf7]">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-6">
              <div className="p-5 bg-[#efe8e0] rounded-full border border-[#e5dfd8] text-[#3c2a21]">
                <FaRobot className="text-4xl" />
              </div>
              <div className="max-w-md">
                <h3 className="text-xl font-semibold text-[#3c2a21] mb-1">Welcome to Wari Assistant</h3>
                <p className="text-sm text-[#6c584c]">Explore centuries of rich spiritual tradition and heritage. Select a topic below or type your question.</p>
              </div>
              
              <div className="flex flex-wrap justify-center gap-2 max-w-3xl">
                {SUGGESTED_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSend(prompt)}
                    className="text-xs text-[#3c2a21] bg-[#efe8e0] hover:bg-[#3c2a21] hover:text-[#f5ebe0] transition-all px-4 py-2.5 rounded-full border border-[#d5aea1]/50 font-medium"
                  >
                    "{prompt}"
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={idx}
                  className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs shadow-sm ${
                    isUser ? 'bg-[#3c2a21] text-[#f5ebe0]' : 'bg-[#efe8e0] text-[#3c2a21] border border-[#d5aea1]/40'
                  }`}>
                    {isUser ? <FaUser /> : <FaRobot />}
                  </div>

                  <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                    isUser 
                      ? 'bg-[#3c2a21] text-[#f5ebe0] rounded-tr-none' 
                      : 'bg-[#efe8e0] text-[#2b1e17] rounded-tl-none border border-[#e5dfd8]'
                  }`}>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    
                    {/* Safe Sources Rendering */}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-3 pt-2 border-t border-[#d5aea1]/30 flex flex-wrap items-center gap-1.5 text-xs text-[#6c584c]">
                        <FaBook className="text-xs text-[#8c6d58]" />
                        <span className="font-semibold text-[#3c2a21]">Sources:</span>
                        {msg.sources.map((src, sIdx) => {
                          const sourceText = typeof src === 'object' ? (src.title || src.name || src.url || JSON.stringify(src)) : src;
                          const sourceUrl = typeof src === 'object' ? src.url : null;

                          return sourceUrl ? (
                            <a
                              key={sIdx}
                              href={sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-[#faf8f5] text-[#3c2a21] hover:underline px-2 py-0.5 rounded text-[11px] border border-[#d5aea1]/40"
                            >
                              {sourceText}
                            </a>
                          ) : (
                            <span key={sIdx} className="bg-[#faf8f5] text-[#3c2a21] px-2 py-0.5 rounded text-[11px] border border-[#d5aea1]/40">
                              {sourceText}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}

          {loading && (
            <div className="flex gap-3 items-center">
              <div className="w-8 h-8 rounded-full bg-[#efe8e0] text-[#3c2a21] flex items-center justify-center flex-shrink-0 border border-[#d5aea1]/40 text-xs">
                <FaRobot />
              </div>
              <div className="bg-[#efe8e0] border border-[#e5dfd8] rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-2">
                <Loader size="sm" />
                <span className="text-xs text-[#6c584c]">Assistant is thinking...</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="p-3 sm:p-4 border-t border-[#e5dfd8] bg-[#efe8e0]/80">
          <div className="flex items-center gap-2">
            <Button 
              type="submit" 
              disabled={loading || !question.trim()} 
              className="flex items-center justify-center gap-2 px-5 py-3 bg-[#3c2a21] hover:bg-[#2b1e17] disabled:bg-[#a89f91] text-[#f5ebe0] rounded-xl transition-colors text-sm font-medium h-full shrink-0"
            >
              <FaPaperPlane className="text-xs" />
              <span className="hidden sm:inline">Send</span>
            </Button>

            <input
              type="text"
              placeholder="Ask about Wari heritage..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="flex-1 w-full bg-white text-[#2b1e17] placeholder-[#8c6d58] text-sm px-4 py-3 rounded-xl border border-[#3c2a21]/40 focus:border-[#3c2a21] focus:ring-1 focus:ring-[#3c2a21] outline-none shadow-sm transition-all"
            />
          </div>
        </form>

      </Card>
    </div>
  );
};

export const AIAssistant = () => (
  <ErrorBoundary>
    <AIAssistantContent />
  </ErrorBoundary>
);

export default AIAssistant;