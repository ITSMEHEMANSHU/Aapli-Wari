import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FaRobot, FaPaperPlane, FaBook, FaUser, FaExclamationTriangle, FaArrowDown } from 'react-icons/fa';

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
  const [showScrollBottomBtn, setShowScrollBottomBtn] = useState(false);

  const scrollContainerRef = useRef(null);
  const isNearBottomRef = useRef(true);

  // Smooth scroll to bottom
  const scrollToBottom = useCallback((behavior = 'smooth') => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior
      });
      setShowScrollBottomBtn(false);
    }
  }, []);

  // Monitor user scroll position (detect if user scrolled up)
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const threshold = 120; // px tolerance to be considered "at bottom"
    const distanceToBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    const isAtBottom = distanceToBottom <= threshold;

    isNearBottomRef.current = isAtBottom;

    if (isAtBottom) {
      setShowScrollBottomBtn(false);
    } else if (messages.length > 0) {
      setShowScrollBottomBtn(true);
    }
  }, [messages.length]);

  // Handle auto-scrolling when messages change or assistant starts thinking
  useEffect(() => {
    if (isNearBottomRef.current) {
      scrollToBottom('smooth');
    } else if (messages.length > 0) {
      setShowScrollBottomBtn(true);
    }
  }, [messages, loading, scrollToBottom]);

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
    <div className="w-full h-[calc(100dvh-1rem)] sm:h-[calc(100dvh-2rem)] max-h-[920px] flex flex-col p-1.5 sm:p-4">
      <Card className="flex-1 flex flex-col overflow-hidden shadow-md border border-[#3c2a21]/20 rounded-2xl bg-[#faf8f5] min-h-0 relative">
        
        {/* Sticky Header */}
        <div className="bg-[#3c2a21] text-[#f5ebe0] px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between border-b border-[#2b1e17] shrink-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#d5aea1]/20 flex items-center justify-center border border-[#d5aea1]/30 text-[#e6ccb2] shrink-0">
              <FaRobot className="text-lg sm:text-xl" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-semibold text-[#f5ebe0]">Wari Heritage Assistant</h2>
              <p className="text-xs text-[#d5aea1]">Ask about culture, Sants, and Palkhi history</p>
            </div>
          </div>
        </div>

        {/* Messages Container with custom subtle scrollbar & overflow anchor */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-3.5 sm:p-6 space-y-4 bg-[#fdfbf7] min-h-0 [overflow-anchor:auto] scroll-smooth [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-[#d5aea1]/40 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-[#d5aea1]/70"
        >
          {messages.length === 0 ? (
            <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-4 sm:p-6 space-y-5">
              <div className="p-4 sm:p-5 bg-[#efe8e0] rounded-full border border-[#e5dfd8] text-[#3c2a21] shadow-inner">
                <FaRobot className="text-3xl sm:text-4xl" />
              </div>
              <div className="max-w-md">
                <h3 className="text-lg sm:text-xl font-semibold text-[#3c2a21] mb-1">Welcome to Wari Assistant</h3>
                <p className="text-xs sm:text-sm text-[#6c584c]">Explore centuries of rich spiritual tradition and heritage. Select a topic below or type your question.</p>
              </div>
              
              <div className="flex flex-wrap justify-center gap-2 max-w-2xl">
                {SUGGESTED_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSend(prompt)}
                    className="text-xs text-[#3c2a21] bg-[#efe8e0] hover:bg-[#3c2a21] hover:text-[#f5ebe0] transition-all px-3.5 py-2 rounded-full border border-[#d5aea1]/50 font-medium active:scale-95 shadow-xs"
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
                  className={`flex gap-2.5 sm:gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start`}
                >
                  <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 text-xs shadow-xs mt-0.5 ${
                    isUser ? 'bg-[#3c2a21] text-[#f5ebe0]' : 'bg-[#efe8e0] text-[#3c2a21] border border-[#d5aea1]/40'
                  }`}>
                    {isUser ? <FaUser /> : <FaRobot />}
                  </div>

                  <div className={`max-w-[88%] sm:max-w-[80%] md:max-w-[75%] lg:max-w-[70%] rounded-2xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm leading-relaxed shadow-xs break-words overflow-hidden ${
                    isUser 
                      ? 'bg-[#3c2a21] text-[#f5ebe0] rounded-tr-none' 
                      : 'bg-[#efe8e0] text-[#2b1e17] rounded-tl-none border border-[#e5dfd8]'
                  }`}>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    
                    {/* Safe Sources Rendering */}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-[#d5aea1]/30 flex flex-wrap items-center gap-1.5 text-xs text-[#6c584c]">
                        <FaBook className="text-xs text-[#8c6d58] shrink-0" />
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
                              className="bg-[#faf8f5] text-[#3c2a21] hover:underline px-2 py-0.5 rounded text-[11px] border border-[#d5aea1]/40 break-all"
                            >
                              {sourceText}
                            </a>
                          ) : (
                            <span key={sIdx} className="bg-[#faf8f5] text-[#3c2a21] px-2 py-0.5 rounded text-[11px] border border-[#d5aea1]/40 break-all">
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
            <div className="flex gap-2.5 sm:gap-3 items-center">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#efe8e0] text-[#3c2a21] flex items-center justify-center shrink-0 border border-[#d5aea1]/40 text-xs">
                <FaRobot />
              </div>
              <div className="bg-[#efe8e0] border border-[#e5dfd8] rounded-2xl rounded-tl-none px-3.5 sm:px-4 py-2.5 sm:py-3 flex items-center gap-2">
                <Loader size="sm" />
                <span className="text-xs text-[#6c584c]">Assistant is thinking...</span>
              </div>
            </div>
          )}
        </div>

        {/* Floating "Scroll to Bottom" button (shown only when user has scrolled up) */}
        {showScrollBottomBtn && (
          <button
            type="button"
            onClick={() => scrollToBottom('smooth')}
            className="absolute bottom-20 right-6 z-20 flex items-center gap-1.5 px-3 py-1.5 bg-[#3c2a21] text-[#f5ebe0] text-xs font-medium rounded-full shadow-lg border border-[#d5aea1]/40 hover:bg-[#2b1e17] transition-all transform animate-bounce"
            aria-label="Scroll to latest messages"
          >
            <FaArrowDown className="text-[10px]" />
            <span>Latest message</span>
          </button>
        )}

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