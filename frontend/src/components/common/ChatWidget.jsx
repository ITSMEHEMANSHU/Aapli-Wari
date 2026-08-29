import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FiSend, FiX, FiRefreshCw, FiChevronDown, FiMessageCircle } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';
import { api } from '../../services/api';

const SUGGESTIONS = [
  { emoji: '🚩', text: 'What is the history of Pandharpur Wari?' },
  { emoji: '📜', text: 'Tell me about Sant Tukaram' },
  { emoji: '🛕', text: 'What is significance of Vitthal?' },
  { emoji: '🎶', text: 'What happens during Ashadhi Ekadashi?' },
];

const TypingDots = () => (
  <div className="flex items-center gap-1.5 px-1 py-1">
    {[0, 1, 2].map((i) => (
      <span
        key={i}
        className="w-2 h-2 rounded-full bg-[#DD6B35]"
        style={{ animation: `wdot 1.4s ${i * 0.2}s infinite ease-in-out`, opacity: 0.7 }}
      />
    ))}
    <style>{`
      @keyframes wdot {
        0%,60%,100% { transform:translateY(0); opacity:.5; }
        30%          { transform:translateY(-5px); opacity:1; }
      }
    `}</style>
  </div>
);

const Bubble = ({ msg }) => {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'} items-end`}>
      <div className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold
        ${isUser ? 'bg-[#DD6B35] text-white' : 'bg-[#FBF5EC] border border-[#E8D9C3] text-[#DD6B35]'}`}>
        {isUser ? 'Y' : <HiSparkles size={11} />}
      </div>
      <div className={`max-w-[82%] text-xs leading-relaxed px-3 py-2 rounded-2xl shadow-sm
        ${isUser
          ? 'bg-[#DD6B35] text-white rounded-br-sm'
          : 'bg-white border border-[#E8D9C3] text-[#2B1B12] rounded-bl-sm'
        }`}
        style={{ wordBreak: 'break-word' }}
      >
        <p className="whitespace-pre-wrap">{msg.content}</p>
        {msg.ts && (
          <p className={`text-[9px] mt-1 ${isUser ? 'text-white/50 text-right' : 'text-[#4A392E]/35'}`}>
            {msg.ts}
          </p>
        )}
      </div>
    </div>
  );
};

const ChatWidget = () => {
  const [open, setOpen]           = useState(false);
  const [messages, setMessages]   = useState([]);
  const [input, setInput]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [unread, setUnread]       = useState(0);

  const scrollRef  = useRef(null);
  const inputRef   = useRef(null);
  const nearBottom = useRef(true);

  const scrollBottom = useCallback(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(scrollBottom, 80);
      setTimeout(() => inputRef.current?.focus(), 120);
    }
  }, [open, scrollBottom]);

  useEffect(() => {
    if (nearBottom.current) scrollBottom();
    if (!open && messages.length > 0 && messages[messages.length - 1].role === 'assistant') {
      setUnread((n) => n + 1);
    }
  }, [messages, loading, open, scrollBottom]);

  const send = useCallback(async (text) => {
    const q = (text || input).trim();
    if (!q || loading) return;
    const ts = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages((p) => [...p, { role: 'user', content: q, ts }]);
    setInput('');
    setLoading(true);

    const history = messages.slice(-6).map(({ role, content }) => ({ role, content }));
    try {
      const res = await api.chat({ query: q, history });
      setMessages((p) => [...p, {
        role: 'assistant',
        content: res?.answer || 'No response.',
        ts: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
    } catch {
      setMessages((p) => [...p, {
        role: 'assistant',
        content: 'Unable to connect. Please try again.',
        ts: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages]);

  return (
    <>
      {/* ── Chat panel ── */}
      {open && (
        <div
          className="fixed bottom-20 right-4 sm:right-6 z-50
            w-[calc(100vw-2rem)] sm:w-[380px] max-w-[420px]
            flex flex-col rounded-3xl overflow-hidden shadow-2xl border border-[#E8D9C3]
            bg-white"
          style={{ height: '520px' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#DD6B35] shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                <HiSparkles className="text-white text-base" />
              </div>
              <div>
                <p className="text-white font-bold text-sm leading-none">Aapli Wari AI</p>
                <p className="text-white/70 text-[10px] mt-0.5">Wari heritage assistant</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <button
                  onClick={() => { setMessages([]); setInput(''); }}
                  className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/20 transition"
                  title="New chat"
                >
                  <FiRefreshCw size={13} />
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/20 transition"
                aria-label="Close chat"
              >
                <FiX size={16} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            onScroll={() => {
              const el = scrollRef.current;
              if (!el) return;
              nearBottom.current = (el.scrollHeight - el.scrollTop - el.clientHeight) < 80;
            }}
            className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-[#FDFAF6]
              [&::-webkit-scrollbar]:w-1
              [&::-webkit-scrollbar-thumb]:bg-[#E8D9C3]
              [&::-webkit-scrollbar-thumb]:rounded-full"
          >
            {messages.length === 0 && (
              <div className="flex flex-col items-center text-center pt-4 pb-2">
                <div className="w-14 h-14 rounded-2xl bg-[#FBF5EC] border border-[#E8D9C3] flex items-center justify-center mb-3">
                  <span className="text-2xl">🚩</span>
                </div>
                <p className="font-serif font-bold text-[#2B1B12] text-base mb-1">ज्ञानबा-तुकाराम!</p>
                <p className="text-[11px] text-[#4A392E]/60 leading-relaxed mb-4 max-w-[240px]">
                  Ask about Pandharpur Wari, Palkhi, saints, abhangs and Varkari heritage.
                </p>
                <div className="grid grid-cols-1 gap-1.5 w-full">
                  {SUGGESTIONS.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => send(s.text)}
                      className="flex items-center gap-2 px-3 py-2 bg-white border border-[#E8D9C3] hover:border-[#DD6B35]/50 hover:bg-[#FBF5EC] rounded-xl text-[11px] text-[#2B1B12] font-medium transition text-left cursor-pointer active:scale-[0.98]"
                    >
                      <span className="text-sm shrink-0">{s.emoji}</span>
                      <span className="leading-snug">{s.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => <Bubble key={i} msg={m} />)}

            {loading && (
              <div className="flex gap-2 items-end">
                <div className="w-6 h-6 rounded-full bg-[#FBF5EC] border border-[#E8D9C3] flex items-center justify-center shrink-0">
                  <HiSparkles size={11} className="text-[#DD6B35]" />
                </div>
                <div className="bg-white border border-[#E8D9C3] rounded-2xl rounded-bl-sm px-3 py-2 shadow-sm">
                  <TypingDots />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="shrink-0 border-t border-[#E8D9C3] bg-white px-3 py-2.5">
            <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about Wari..."
                disabled={loading}
                className="flex-1 bg-[#FBF5EC] border border-[#E8D9C3] rounded-xl px-3 py-2 text-xs text-[#2B1B12] placeholder-[#4A392E]/40 focus:outline-none focus:border-[#DD6B35] focus:ring-2 focus:ring-[#DD6B35]/15 transition disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="w-8 h-8 rounded-xl bg-[#DD6B35] hover:bg-[#C85A28] disabled:bg-[#E8D9C3] disabled:cursor-not-allowed text-white flex items-center justify-center shrink-0 transition active:scale-95 cursor-pointer"
              >
                {loading
                  ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <FiSend size={12} />
                }
              </button>
            </form>
            <p className="text-[9px] text-[#4A392E]/35 text-center mt-1.5">
              Only answers about Maharashtra Wari &amp; Varkari heritage
            </p>
          </div>
        </div>
      )}

      {/* ── Floating trigger button ── */}
      <button
        onClick={() => setOpen((p) => !p)}
        aria-label="Open Wari AI Chat"
        className="fixed bottom-5 right-4 sm:right-6 z-50
          w-14 h-14 rounded-full bg-[#DD6B35] hover:bg-[#C85A28]
          text-white shadow-xl flex items-center justify-center
          transition-all duration-300 active:scale-95 cursor-pointer
          hover:shadow-[0_8px_25px_rgba(221,107,53,0.45)]"
      >
        {open
          ? <FiChevronDown size={22} />
          : <FiMessageCircle size={22} />
        }
        {/* Unread badge */}
        {!open && unread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
            {unread}
          </span>
        )}
      </button>
    </>
  );
};

export default ChatWidget;
