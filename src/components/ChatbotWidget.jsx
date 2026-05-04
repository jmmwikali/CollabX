import { useState, useRef, useEffect } from 'react';
import { chatAPI } from '../services/api';

export default function ChatbotWidget() {
  const [open, setOpen]           = useState(false);
  const [closing, setClosing]     = useState(false);
  const [messages, setMessages]   = useState([
    { role: 'bot', text: "Hi there 👋 I'm the CollabX assistant. Ask me anything about the platform!" },
  ]);
  const [input, setInput]         = useState('');
  const [typing, setTyping]       = useState(false);
  const endRef                    = useRef(null);

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing, open]);

  const toggle = () => {
    if (open) {
      setClosing(true);
      setTimeout(() => { setOpen(false); setClosing(false); }, 280);
    } else {
      setOpen(true);
    }
  };

  const send = async () => {
    const text = input.trim();
    if (!text || typing) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text }]);
    setTyping(true);
    try {
      const res  = await chatAPI.sendMessage(text);
      setMessages(prev => [...prev, { role: 'bot', text: res.data.reply || "Sorry, I couldn't get a response." }]);
    } catch {
      setMessages(prev => [...prev, { role: 'bot', text: 'Oops, something went wrong. Please try again.' }]);
    } finally {
      setTyping(false);
    }
  };

  const handleKey = e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <>
      {/* Chat window */}
      {(open || closing) && (
        <div className={`cw-window${closing ? ' cw-closing' : ''}`}>

          {/* Header */}
          <div className="cw-header">
            <div className="cw-avatar"><img src="/images/CollabX(white).png" alt="logo" width="24px" height="24px" /></div>
            <div className="cw-header-info">
              <div className="cw-header-name">CollabX Assistant</div>
              <div className="cw-header-status">
                <span className="cw-status-dot" />
                Online · Always here to help
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="cw-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`cw-msg cw-msg--${msg.role}`}>
                {msg.role === 'bot' && <div className="cw-msg-icon">✦</div>}
                <div className="cw-bubble">{msg.text}</div>
              </div>
            ))}
            {typing && (
              <div className="cw-msg cw-msg--bot">
                <div className="cw-msg-icon">✦</div>
                <div className="cw-typing-dots">
                  <span /><span /><span />
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Input */}
          <div className="cw-input-area">
            <input
              className="cw-input"
              type="text"
              placeholder="Ask me anything…"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              disabled={typing}
            />
            <button
              className="cw-send"
              onClick={send}
              disabled={!input.trim() || typing}
              aria-label="Send message"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Trigger button */}
      <button
        className={`cw-trigger${open ? ' cw-trigger--open' : ''}`}
        onClick={toggle}
        aria-label="Toggle chat assistant"
      >
        <span className="cw-icon-chat">
          <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </span>
        <span className="cw-icon-close">
          <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </span>
      </button>
    </>
  );
}