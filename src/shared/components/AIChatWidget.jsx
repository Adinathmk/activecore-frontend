import { useEffect, useRef, useState, useCallback} from "react";
import { useSelector } from "react-redux";
import {
  connectChatSocket,
  sendChatMessage,
  disconnectChatSocket,
} from "@/services/chatSocket";
import axiosInstance from "@/services/axiosInstance";

/* ─────────────────────────────────────────────
   Icons (inline SVG – no extra dependencies)
───────────────────────────────────────────── */
const IconChat = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
    <path
      d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z"
      fill="rgba(255,255,255,0.92)"
    />
    <circle cx="8" cy="10" r="1.2" fill="#0f3460" />
    <circle cx="12" cy="10" r="1.2" fill="#0f3460" />
    <circle cx="16" cy="10" r="1.2" fill="#0f3460" />
  </svg>
);

const IconClose = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path
      d="M1 1L13 13M13 1L1 13"
      stroke="rgba(255,255,255,0.85)"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

const IconSend = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
    <path
      d="M22 2L11 13"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M22 2L15 22L11 13L2 9L22 2Z"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const IconLogo = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="rgba(255,255,255,0.9)" />
    <path
      d="M2 17L12 22L22 17"
      stroke="rgba(255,255,255,0.7)"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M2 12L12 17L22 12"
      stroke="rgba(255,255,255,0.5)"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

/* ─────────────────────────────────────────────
   Suggestion chips shown on first open
───────────────────────────────────────────── */
const CHIPS = [
  "Best gym outfit",
  "What to buy today",
  "Running shoes guide",
  "Best tshirt for gym",
];

/* ─────────────────────────────────────────────
   Hook: detect mobile viewport
───────────────────────────────────────────── */
function useIsMobile(breakpoint = 480) {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth <= breakpoint
  );

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [breakpoint]);

  return isMobile;
}

/* ─────────────────────────────────────────────
   Main Component
───────────────────────────────────────────── */
export default function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [usedChips, setUsedChips] = useState([]);
  const [historyLoaded, setHistoryLoaded] = useState(false);

  const msgListRef = useRef(null);
  const inputRef = useRef(null);
  const isMobile = useIsMobile(480);

  /* ── Prevent body scroll when chat is open on mobile ── */
  useEffect(() => {
    if (isMobile) {
      document.body.style.overflow = isOpen ? "hidden" : "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, isMobile]);

  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  /* ── Load history + connect socket ── */
  useEffect(() => {
    if (!isAuthenticated) return;

    axiosInstance
      .get("/api/chat/history/")
      .then((res) => {
        // Normalize role names: "assistant"/"bot" → "ai", everything else → "user"
        const normalized = (res.data || []).map((msg) => ({
          ...msg,
          role: msg.role === "user" ? "user" : "ai",
          text: msg.text || msg.content || msg.message || "",
        }));
        setMessages(normalized);
        setHistoryLoaded(true);
      })
      .catch((err) => {
        console.error("Failed to load chat history", err);
        setHistoryLoaded(true);
      });

    const socket = connectChatSocket((data) => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: data.response },
      ]);
    });


    return () => disconnectChatSocket();
  }, [isAuthenticated]);

  /* ── Auto-scroll to bottom on new messages ── */
  useEffect(() => {
    if (msgListRef.current) {
      msgListRef.current.scrollTop = msgListRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  /* ── Focus input when chat opens ── */
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 350);
    }
  }, [isOpen]);

  /* ── Send a message ── */
  const handleSend = useCallback((text = input) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setMessages((prev) => [...prev, { role: "user", text: trimmed }]);
    setInput("");
    setIsTyping(true);
    sendChatMessage(trimmed);
  }, [input]);

  const handleChip = useCallback((chip) => {
    if (usedChips.includes(chip)) return;
    setUsedChips((prev) => [...prev, chip]);
    handleSend(chip);
  }, [usedChips, handleSend]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  /* ── Greeting message (shown when no history) ── */
  const showGreeting = historyLoaded && messages.length === 0;

  if (!isAuthenticated) return null;

  return (
    <>
      {/* ── Global Styles ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Sora:wght@400;500;600&display=swap');

        /* ── FAB ── */
        .acw-fab {
          width: 58px;
          height: 58px;
          border-radius: 50%;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
          box-shadow: 0 8px 32px rgba(15,52,96,0.45), 0 2px 8px rgba(0,0,0,0.2);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          position: fixed;
          bottom: 24px;
          right: 24px;
          border: none;
          outline: none;
          transition: transform 0.2s cubic-bezier(.34,1.56,.64,1), box-shadow 0.2s ease, opacity 0.2s ease;
          animation: acwFabBounce 2.8s ease-in-out infinite;
          z-index: 9998;
        }
        @media (max-width: 480px) {
          .acw-fab {
            bottom: calc(20px + env(safe-area-inset-bottom));
            right: 20px;
          }
        }
        .acw-fab:hover {
          transform: scale(1.08) !important;
          box-shadow: 0 12px 40px rgba(15,52,96,0.55), 0 4px 12px rgba(0,0,0,0.25) !important;
          animation: none !important;
        }
        .acw-fab.acw-fab-hidden {
          animation: none;
          transform: scale(0.7) !important;
          opacity: 0;
          pointer-events: none;
        }
        @keyframes acwFabBounce {
          0%, 100% { transform: translateY(0) scale(1); }
          30%       { transform: translateY(-7px) scale(1.04); }
          60%       { transform: translateY(-3px) scale(1.01); }
          80%       { transform: translateY(-5px) scale(1.02); }
        }

        .acw-ping {
          position: absolute;
          inset: -6px;
          border-radius: 50%;
          border: 2px solid rgba(99,179,237,0.6);
          animation: acwPing 2.8s ease-in-out infinite;
          pointer-events: none;
        }
        @keyframes acwPing {
          0%   { transform: scale(1);    opacity: 0.7; }
          70%  { transform: scale(1.35); opacity: 0;   }
          100% { transform: scale(1.35); opacity: 0;   }
        }

        /* ── Chat Box ── */
        .acw-box {
          position: fixed;
          bottom: 90px;
          right: 24px;
          width: 360px;
          height: 520px;
          background: #ffffff;
          border-radius: 24px;
          box-shadow: 0 24px 80px rgba(0,0,0,0.18), 0 8px 24px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.05);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          transform-origin: bottom right;
          transform: scale(0.7) translateY(20px);
          opacity: 0;
          pointer-events: none;
          transition: transform 0.35s cubic-bezier(.34,1.32,.64,1), opacity 0.25s ease;
          z-index: 9999;
          font-family: 'DM Sans', sans-serif;
        }

        /* Tablet: slightly wider */
        @media (min-width: 481px) and (max-width: 768px) {
          .acw-box {
            width: min(400px, calc(100vw - 32px));
            height: min(560px, calc(100vh - 120px));
            bottom: 90px;
            right: 16px;
          }
        }

        /* Mobile: full screen sheet */
        @media (max-width: 480px) {
          .acw-box {
            inset: 0;
            width: 100%;
            height: 100%;
            border-radius: 0;
            bottom: 0;
            right: 0;
            transform-origin: bottom center;
            transform: translateY(100%);
            box-shadow: none;
          }
          .acw-box.acw-box-open {
            transform: translateY(0) !important;
          }
        }

        .acw-box.acw-box-open {
          transform: scale(1) translateY(0);
          opacity: 1;
          pointer-events: all;
        }

        /* ── Header ── */
        .acw-header {
          background: linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%);
          padding: 16px 18px 14px;
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
        }
        @media (max-width: 480px) {
          .acw-header {
            padding: calc(14px + env(safe-area-inset-top)) 18px 14px;
          }
        }
        .acw-header-avatar {
          width: 38px;
          height: 38px;
          border-radius: 12px;
          background: rgba(255,255,255,0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .acw-header-name {
          font-family: 'Sora', sans-serif;
          font-size: 14px;
          font-weight: 600;
          color: #fff;
          letter-spacing: -0.01em;
        }
        .acw-header-status {
          display: flex;
          align-items: center;
          gap: 5px;
          margin-top: 2px;
        }
        .acw-status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #4ade80;
          box-shadow: 0 0 6px rgba(74,222,128,0.7);
          animation: acwStatusPulse 2s ease-in-out infinite;
        }
        @keyframes acwStatusPulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.5; }
        }
        .acw-status-text {
          font-size: 11px;
          color: rgba(255,255,255,0.65);
        }
        .acw-close-btn {
          width: 30px;
          height: 30px;
          border-radius: 9px;
          background: rgba(255,255,255,0.12);
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.15s;
          margin-left: auto;
          flex-shrink: 0;
          /* Larger tap target on mobile */
          min-width: 44px;
          min-height: 44px;
        }
        .acw-close-btn:hover { background: rgba(255,255,255,0.22); }

        /* ── Messages ── */
        .acw-messages {
          flex: 1;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
          overscroll-behavior: contain;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          background: #f8f9fc;
          scroll-behavior: smooth;
        }
        @media (max-width: 480px) {
          .acw-messages {
            padding: 12px;
            gap: 8px;
          }
        }
        .acw-messages::-webkit-scrollbar { width: 4px; }
        .acw-messages::-webkit-scrollbar-track { background: transparent; }
        .acw-messages::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 4px; }

        .acw-msg-row {
          display: flex;
          align-items: flex-end;
          gap: 8px;
          width: 100%;
          animation: acwMsgIn 0.3s cubic-bezier(.34,1.56,.64,1) both;
        }
        /* User messages: avatar + bubble pushed to right */
        .acw-msg-row.user {
          flex-direction: row-reverse;
          justify-content: flex-start;
        }
        /* AI messages: avatar + bubble on left */
        .acw-msg-row.ai {
          flex-direction: row;
          justify-content: flex-start;
        }
        @keyframes acwMsgIn {
          from { opacity: 0; transform: translateY(10px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }

        .acw-avatar {
          width: 28px;
          height: 28px;
          min-width: 28px;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 600;
          flex-shrink: 0;
          align-self: flex-end;
          font-family: 'DM Sans', sans-serif;
          line-height: 1;
        }
        .acw-avatar.ai   { background: linear-gradient(135deg,#1a1a2e,#0f3460); color:#fff; }
        .acw-avatar.user { background: linear-gradient(135deg,#3b82f6,#1d4ed8); color:#fff; }

        .acw-bubble {
          max-width: min(240px, calc(100% - 44px));
          padding: 10px 13px;
          font-size: 13.5px;
          line-height: 1.55;
          word-break: break-word;
          overflow-wrap: anywhere;
        }
        @media (max-width: 480px) {
          .acw-bubble {
            max-width: calc(100% - 44px);
            font-size: 14px;
          }
        }
        .acw-bubble.ai {
          background: #fff;
          color: #1e293b;
          border-radius: 4px 16px 16px 16px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.04);
        }
        .acw-bubble.user {
          background: linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%);
          color: #fff;
          border-radius: 16px 4px 16px 16px;
          box-shadow: 0 4px 12px rgba(15,52,96,0.3);
        }

        /* ── Typing indicator ── */
        .acw-typing {
          background: #fff;
          border-radius: 4px 16px 16px 16px;
          padding: 12px 16px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.04);
          display: flex;
          gap: 4px;
          align-items: center;
        }
        .acw-typing-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #94a3b8;
          animation: acwDot 1.2s ease-in-out infinite;
        }
        .acw-typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .acw-typing-dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes acwDot {
          0%, 100% { transform: translateY(0);    opacity: 0.4; }
          50%       { transform: translateY(-4px); opacity: 1;   }
        }

        /* ── Chips ── */
        .acw-chips {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          padding: 2px 0;
        }
        .acw-chip {
          font-size: 11.5px;
          padding: 5px 11px;
          border-radius: 20px;
          border: 1px solid #d1d5db;
          background: #fff;
          color: #374151;
          cursor: pointer;
          transition: all 0.15s;
          font-family: 'DM Sans', sans-serif;
          white-space: nowrap;
          outline: none;
          /* Mobile: easier to tap */
          min-height: 34px;
        }
        @media (max-width: 480px) {
          .acw-chip {
            font-size: 12.5px;
            padding: 6px 14px;
            min-height: 38px;
          }
        }
        .acw-chip:hover:not(:disabled) {
          background: #1a1a2e;
          color: #fff;
          border-color: #1a1a2e;
        }
        .acw-chip:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }

        /* ── Input area ── */
        .acw-input-wrap {
          padding: 12px 14px;
          padding-bottom: calc(12px + env(safe-area-inset-bottom));
          background: #fff;
          border-top: 1px solid #eef0f4;
          display: flex;
          align-items: flex-end;
          gap: 8px;
          flex-shrink: 0;
        }
        .acw-input-inner {
          flex: 1;
          display: flex;
          align-items: center;
          background: #f1f5f9;
          border-radius: 14px;
          border: 1.5px solid transparent;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
          padding: 0 12px;
          min-height: 42px;
        }
        @media (max-width: 480px) {
          .acw-input-inner {
            min-height: 48px;
            border-radius: 16px;
          }
        }
        .acw-input-inner:focus-within {
          background: #fff;
          border-color: #0f3460;
          box-shadow: 0 0 0 3px rgba(15,52,96,0.08);
        }
        .acw-input {
          flex: 1;
          border: none;
          background: transparent;
          outline: none;
          font-size: 13.5px;
          font-family: 'DM Sans', sans-serif;
          color: #1e293b;
          padding: 10px 0;
          /* Prevent iOS zoom on focus (font-size must be >= 16px to suppress) */
        }
        @media (max-width: 480px) {
          .acw-input {
            font-size: 16px;
          }
        }
        .acw-input::placeholder { color: #94a3b8; }

        .acw-send-btn {
          width: 40px;
          height: 40px;
          border-radius: 13px;
          background: linear-gradient(135deg, #1a1a2e, #0f3460);
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: transform 0.15s cubic-bezier(.34,1.56,.64,1), box-shadow 0.15s;
          box-shadow: 0 4px 12px rgba(15,52,96,0.35);
        }
        @media (max-width: 480px) {
          .acw-send-btn {
            width: 48px;
            height: 48px;
            border-radius: 15px;
          }
        }
        .acw-send-btn:hover:not(:disabled) {
          transform: scale(1.08);
          box-shadow: 0 6px 18px rgba(15,52,96,0.45);
        }
        .acw-send-btn:active:not(:disabled) { transform: scale(0.96); }
        .acw-send-btn:disabled {
          opacity: 0.38;
          cursor: not-allowed;
          box-shadow: none;
        }

        .acw-powered {
          text-align: center;
          font-size: 10.5px;
          color: #94a3b8;
          padding: 5px 0 7px;
          font-family: 'DM Sans', sans-serif;
          letter-spacing: 0.01em;
          flex-shrink: 0;
        }
      `}</style>

      {/* ── Floating Action Button ── */}
      <button
        className={`acw-fab${isOpen ? " acw-fab-hidden" : ""}`}
        onClick={() => setIsOpen(true)}
        aria-label="Open ActiveCore Assistant"
      >
        <div className="acw-ping" />
        <IconChat />
      </button>

      {/* ── Mobile backdrop ── */}
      {isMobile && isOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            zIndex: 9998,
            backdropFilter: "blur(2px)",
          }}
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Chat Box ── */}
      <div
        className={`acw-box${isOpen ? " acw-box-open" : ""}`}
        role="dialog"
        aria-label="ActiveCore Assistant"
        aria-modal="true"
      >
        {/* Header */}
        <div className="acw-header">
          <div className="acw-header-avatar">
            <IconLogo />
          </div>
          <div style={{ flex: 1 }}>
            <div className="acw-header-name">ActiveCore Assistant</div>
            <div className="acw-header-status">
              <div className="acw-status-dot" />
              <span className="acw-status-text">Always here to help</span>
            </div>
          </div>
          <button
            className="acw-close-btn"
            onClick={() => setIsOpen(false)}
            aria-label="Close chat"
          >
            <IconClose />
          </button>
        </div>

        {/* Messages */}
        <div className="acw-messages" ref={msgListRef}>

          {/* Greeting */}
          {showGreeting && (
            <>
              <div className="acw-msg-row ai">
                <div className="acw-avatar ai">AC</div>
                <div className="acw-bubble ai">
                  Hey there! I'm your ActiveCore assistant. How can I help you find the perfect workout gear today?
                </div>
              </div>
              <div className="acw-chips">
                {CHIPS.map((chip) => (
                  <button
                    key={chip}
                    className="acw-chip"
                    disabled={usedChips.includes(chip)}
                    onClick={() => handleChip(chip)}
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Message history */}
          {messages.map((msg, i) => {
            const isUser = msg.role === "user";
            return (
              <div key={i} className={`acw-msg-row ${isUser ? "user" : "ai"}`}>
                <div className={`acw-avatar ${isUser ? "user" : "ai"}`}>
                  {isUser ? "U" : "AC"}
                </div>
                <div className={`acw-bubble ${isUser ? "user" : "ai"}`}>{msg.text}</div>
              </div>
            );
          })}

          {/* Typing indicator */}
          {isTyping && (
            <div className="acw-msg-row ai">
              <div className="acw-avatar ai">AC</div>
              <div className="acw-typing">
                <div className="acw-typing-dot" />
                <div className="acw-typing-dot" />
                <div className="acw-typing-dot" />
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="acw-input-wrap">
          <div className="acw-input-inner">
            <input
              ref={inputRef}
              className="acw-input"
              placeholder="Ask about workout clothing…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete="off"
              enterKeyHint="send"
            />
          </div>
          <button
            className="acw-send-btn"
            disabled={!input.trim() || isTyping}
            onClick={() => handleSend()}
            aria-label="Send message"
          >
            <IconSend />
          </button>
        </div>

        <div className="acw-powered">Powered by ActiveCore AI</div>
      </div>
    </>
  );
}