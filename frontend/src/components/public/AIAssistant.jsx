import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FiSend, FiRefreshCw, FiChevronDown } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';
import { api } from '../../services/api';

/* ── Suggested starter questions ─────────────────────────────────────────── */
const SUGGESTIONS = [
  { emoji: '🚩', text: 'What is the history of Pandharpur Wari?' },
  { emoji: '📜', text: 'Tell me about Sant Tukaram and his abhangs' },
  { emoji: '🛕', text: 'What is the significance of Vitthal and Pandharpur?' },
  { emoji: '🎶', text: 'What happens during Ashadhi Ekadashi?' },
  { emoji: '🙏', text: 'Explain the Varkari tradition and philosophy' },
  { emoji: '🗺️', text: 'What is the route of the Dnyaneshwar Palkhi?' },
];

/* ── Typing indicator ─────────────────────────────────────────────────────── */
const TypingDots = () => (
  <div className="flex items-center gap-1.5 px-1 py-1">
    {[0, 1, 2].map((i) => (
      <span
        key={i}
        className="w-2.5 h-2.5 rounded-full bg-[#DD6B35]"
        style={{
          animation: `typingBounce 1.4s ${i * 0.2}s infinite ease-in-out`,
          opacity: 0.7,
        }}
      />
    ))}
    <style>{`
      @keyframes typingBounce {
        0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
        30%            { transform: translateY(-6px); opacity: 1; }
      }
    `}</style>
  </div>
);

/* ── Single message bubble ────────────────────────────────────────────────── */
const MessageBubble = ({ msg }) => {
  const isUser = msg.role === 'user';

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} items-end`}>
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold shadow-sm select-none
          ${isUser
            ? 'bg-[#DD6B35] text-white'
            : 'bg-white border-2 border-[#E8D9C3] text-[#DD6B35]'
          }`}
      >
        {isUser ? 'You' : <HiSparkles size={14} />}
      </div>

      {/* Bubble */}
      <div
        className={`max-w-[78%] sm:max-w-[70%] text-sm leading-relaxed shadow-sm
          ${isUser
            ? 'bg-[#DD6B35] text-white rounded-2xl rounded-br-sm px-4 py-3'
            : 'bg-white border border-[#E8D9C3] text-[#2B1B12] rounded-2xl rounded-bl-sm px-4 py-3'
          }`}
      >
        {/* Render markdown-style bold */}
        <p className="whitespace-pre-wrap" style={{ wordBreak: 'break-word' }}>
          {msg.content}
        </p>
        {msg.timestamp && (
          <p className={`text-[10px] mt-1.5 ${isUser ? 'text-white/50 text-right' : 'text-[#4A392E]/35'}`}>
            {msg.timestamp}
          </p>
        )}
      </div>
    </div>
  );
};

/* ── Main component ───────────────────────────────────────────────────────── */
const AIAssistant = () => {
  const [messages, setMessages]       = useState([]);
  const [input, setInput]             = useState('');
  const [loading, setLoading]         = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  const scrollRef     = useRef(null);
  const inputRef      = useRef(null);
  const nearBottomRef = useRef(true);
  const textareaRef   = useRef(null);

  /* ── Scroll helpers ── */
  const scrollToBottom = useCallback((behavior = 'smooth') => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior });
    setShowScrollBtn(false);
  }, []);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const dist = el.scrollHeight - el.scrollTop - el.clientHeight;
    nearBottomRef.current = dist < 120;
    setShowScrollBtn(dist > 120 && messages.length > 0);
  }, [messages.length]);

  useEffect(() => {
    if (nearBottomRef.current) scrollToBottom();
  }, [messages, loading, scrollToBottom]);

  /* ── Auto-resize textarea ── */
  const resizeTextarea = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  };

  /* ── Send message ── */
  const send = useCallback(async (text) => {
    const q = (text || input).trim();
    if (!q || loading) return;

    const ts = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages((prev) => [...prev, { role: 'user', content: q, timestamp: ts }]);
    setInput('');

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    setLoading(true);

    const history = messages
      .slice(-8)
      .map(({ role, content }) => ({ role, content }));

    try {
      const res = await api.chat({ query: q, history });
      setMessages((prev) => [
        ...prev,
        {
          role:      'assistant',
          content:   res?.answer || 'No response received.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          role:      'assistant',
          content:   'Unable to connect. Please make sure the backend is running and try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [input, loading, messages]);

  const handleSubmit = (e) => { e.preventDefault(); send(); };

  const clearChat = () => {
    setMessages([]);
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    inputRef.current?.focus();
  };

  return (
    <div className="w-full min-h-[calc(100dvh-80px)] bg-[#FBF5EC] flex items-start justify-center px-4 py-6">
      <div className="w-full max-w-2xl flex flex-col" style={{ height: 'calc(100dvh - 112px)' }}>

        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#DD6B35] flex items-center justify-center shadow-md shrink-0">
              <HiSparkles className="text-white text-xl" />
            </div>
            <div>
              <h1 className="font-serif font-bold text-[#2B1B12] text-lg leading-none">
                Aapli Wari AI
              </h1>
              <p className="text-xs text-[#4A392E]/60 mt-0.5">Your guide to Wari heritage</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <button
                onClick={clearChat}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[#4A392E]/60 border border-[#E8D9C3] bg-white px-3 py-1.5 rounded-full hover:bg-[#F5EADA] hover:text-[#DD6B35] transition-colors"
              >
                <FiRefreshCw size={11} /> New chat
              </button>
            )}
          </div>
        </div>

        {/* ── Chat window ── */}
        <div className="flex-1 flex flex-col min-h-0 bg-white rounded-3xl border border-[#E8D9C3] shadow-sm overflow-hidden relative">

          {/* Messages area */}
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto px-4 sm:px-5 py-5 space-y-4
              [&::-webkit-scrollbar]:w-1
              [&::-webkit-scrollbar-thumb]:bg-[#E8D9C3]
              [&::-webkit-scrollbar-thumb]:rounded-full"
          >
            {/* Empty state */}
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center text-center h-full py-6 px-4">
                <div className="relative mb-5">
                  <div className="w-20 h-20 rounded-3xl bg-[#FBF5EC] border border-[#E8D9C3] flex items-center justify-center shadow-inner">
                    <span className="text-4xl">🚩</span>
                  </div>
                  <div className="absolute -top-1.5 -right-1.5 w-7 h-7 bg-[#DD6B35] rounded-full flex items-center justify-center shadow-sm">
                    <HiSparkles className="text-white text-sm" />
                  </div>
                </div>

                <h2 className="font-serif font-bold text-[#2B1B12] text-2xl mb-2">
                  ज्ञानबा-तुकाराम!
                </h2>
                <p className="text-sm text-[#4A392E]/65 max-w-xs leading-relaxed mb-7">
                  Ask me anything about Pandharpur Wari, Palkhi processions,
                  Varkari saints, and Maharashtra's living heritage.
                </p>

                {/* Suggestion grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
                  {SUGGESTIONS.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => send(s.text)}
                      className="flex items-start gap-2.5 px-4 py-3 bg-[#FBF5EC] hover:bg-[#F5EADA] border border-[#E8D9C3] hover:border-[#DD6B35]/50 rounded-xl text-xs text-[#2B1B12] font-medium transition-all text-left group cursor-pointer active:scale-[0.98]"
                    >
                      <span className="text-base shrink-0 mt-0.5 leading-none">{s.emoji}</span>
                      <span className="leading-snug group-hover:text-[#DD6B35] transition-colors">{s.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Message bubbles */}
            {messages.map((msg, i) => (
              <MessageBubble key={i} msg={msg} />
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="flex gap-3 items-end">
                <div className="w-8 h-8 rounded-full bg-white border-2 border-[#E8D9C3] flex items-center justify-center shrink-0">
                  <HiSparkles size={13} className="text-[#DD6B35]" />
                </div>
                <div className="bg-white border border-[#E8D9C3] rounded-2xl rounded-bl-sm px-4 py-2.5 shadow-sm">
                  <TypingDots />
                </div>
              </div>
            )}
          </div>

          {/* Scroll-to-bottom button */}
          {showScrollBtn && (
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10">
              <button
                onClick={() => scrollToBottom()}
                className="inline-flex items-center gap-1.5 bg-[#2B1B12]/90 text-white text-xs font-semibold px-3.5 py-1.5 rounded-full shadow-lg hover:bg-[#DD6B35] transition-colors backdrop-blur-sm"
              >
                <FiChevronDown size={12} /> Latest
              </button>
            </div>
          )}

          {/* ── Input area ── */}
          <div className="shrink-0 border-t border-[#E8D9C3] bg-[#FDFAF6] px-4 py-3">
            <form onSubmit={handleSubmit}>
              <div
                className="flex items-end gap-2.5 bg-white border border-[#E8D9C3] rounded-2xl px-4 py-2.5
                  focus-within:border-[#DD6B35] focus-within:shadow-[0_0_0_3px_rgba(221,107,53,0.12)]
                  transition-all"
              >
                <textarea
                  ref={(el) => { textareaRef.current = el; inputRef.current = el; }}
                  value={input}
                  onChange={(e) => { setInput(e.target.value); resizeTextarea(); }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      send();
                    }
                  }}
                  placeholder="Ask about Wari, Palkhi, saints..."
                  rows={1}
                  disabled={loading}
                  className="flex-1 bg-transparent resize-none text-sm text-[#2B1B12]
                    placeholder-[#4A392E]/40 focus:outline-none leading-relaxed py-0.5
                    disabled:opacity-60"
                  style={{ maxHeight: '120px' }}
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="w-9 h-9 rounded-xl bg-[#DD6B35] hover:bg-[#C85A28]
                    disabled:bg-[#E8D9C3] disabled:cursor-not-allowed
                    text-white flex items-center justify-center shrink-0
                    transition-colors shadow-sm active:scale-95 mb-0.5 cursor-pointer"
                  aria-label="Send"
                >
                  {loading
                    ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <FiSend size={14} />
                  }
                </button>
              </div>
              <p className="text-[10px] text-[#4A392E]/35 text-center mt-2 leading-none">
                Only answers questions about Maharashtra Wari &amp; Varkari heritage
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
