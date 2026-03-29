import { useEffect, useMemo, useRef, useState } from 'react';
import { sendChatMessage } from '../utils/chatApi';

function toCountyHint(text) {
  const cleaned = text.trim();
  if (!cleaned) return null;

  const countyStateMatch = cleaned.match(
    /([a-zA-Z .'-]+)\s+county[,\s]+([a-zA-Z .'-]{2,})/i,
  );
  if (countyStateMatch) {
    return {
      county: countyStateMatch[1].trim(),
      state: countyStateMatch[2].trim(),
    };
  }

  const looseMatch = cleaned.match(
    /\b([a-zA-Z .'-]+?)\s*,\s*([a-zA-Z .'-]{2,})\b/i,
  );
  if (looseMatch) {
    return {
      county: looseMatch[1].trim(),
      state: looseMatch[2].trim(),
    };
  }

  return null;
}

function ChatIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

const MIN_W = 320;
const MIN_H = 340;
const DEFAULT_W = 400;
const DEFAULT_H = 520;

export default function GlobalChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [lastError, setLastError] = useState('');
  const scrollRef = useRef(null);
  const [size, setSize] = useState({ w: DEFAULT_W, h: DEFAULT_H });
  const dragRef = useRef(null);

  const canSend = input.trim().length > 0 && !isSending;
  const history = useMemo(
    () =>
      messages.map((msg) => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content,
      })),
    [messages],
  );

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isSending]);

  const onResizeStart = (e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const startW = size.w;
    const startH = size.h;

    const onMove = (ev) => {
      const dw = startX - ev.clientX;
      const dh = startY - ev.clientY;
      const maxW = Math.min(window.innerWidth - 48, 720);
      const maxH = Math.min(window.innerHeight - 100, 860);
      setSize({
        w: Math.max(MIN_W, Math.min(maxW, startW + dw)),
        h: Math.max(MIN_H, Math.min(maxH, startH + dh)),
      });
    };

    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  const handleSend = async () => {
    const question = input.trim();
    if (!question || isSending) return;

    setIsSending(true);
    setLastError('');
    setInput('');

    const nextUserMessage = { role: 'user', content: question };
    const nextMessages = [...messages, nextUserMessage];
    setMessages(nextMessages);

    const hint = toCountyHint(question);
    try {
      const result = await sendChatMessage({
        question,
        county: hint?.county ?? null,
        state: hint?.state ?? null,
        history,
      });

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: result.answer.trim() },
      ]);
    } catch (error) {
      setLastError('Could not get an answer. Please try again.');
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            'I could not answer that right now. Try rephrasing your question.',
        },
      ]);
      console.error('[chat] request failed:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Launcher button */}
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
        aria-controls="global-chat-panel"
        className="fixed right-5 bottom-5 z-[60] flex items-center gap-2 rounded-full bg-app-primary px-5 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-primary/50 focus-visible:ring-offset-2"
      >
        <ChatIcon />
        <span>{isOpen ? 'Close' : 'Risk Advisor'}</span>
      </button>

      {/* Chat panel */}
      {isOpen ? (
        <section
          id="global-chat-panel"
          aria-label="Climate risk chat"
          className="fixed right-5 bottom-20 z-[60] flex flex-col overflow-hidden rounded-2xl border border-app-border bg-app-bg shadow-2xl"
          style={{
            width: `min(92vw, ${size.w}px)`,
            height: `min(80vh, ${size.h}px)`,
          }}
        >
          {/* Resize handle (top-left corner) */}
          <div
            ref={dragRef}
            onPointerDown={onResizeStart}
            className="absolute top-0 left-0 z-10 h-5 w-5 cursor-nwse-resize"
            aria-hidden="true"
          >
            <svg viewBox="0 0 20 20" className="h-full w-full text-app-muted/40">
              <line x1="4" y1="16" x2="16" y2="4" stroke="currentColor" strokeWidth="1.5" />
              <line x1="4" y1="11" x2="11" y2="4" stroke="currentColor" strokeWidth="1.5" />
              <line x1="4" y1="6" x2="6" y2="4" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </div>

          {/* Header */}
          <header className="border-b border-app-border bg-app-primary px-4 py-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold tracking-tight text-white">
                  Climate Risk Advisor
                </h2>
                <p className="mt-0.5 text-xs text-white/70">
                  Powered by FEMA National Risk Index
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/15 hover:text-white"
                aria-label="Close chat"
              >
                &times;
              </button>
            </div>
          </header>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
            role="log"
            aria-live="polite"
          >
            {!messages.length ? (
              <div className="rounded-xl bg-app-primary/5 p-4">
                <p className="text-xs font-medium text-app-muted">
                  Ask about FEMA risk methodology, for example:
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-app-text/80">
                  How does FEMA calculate Expected Annual Loss?
                </p>
              </div>
            ) : null}
            {messages.map((msg, idx) => (
              <div
                key={`${msg.role}-${idx}`}
                className={
                  msg.role === 'assistant'
                    ? 'mr-6 rounded-2xl rounded-tl-sm border border-app-border bg-app-surface px-3.5 py-2.5 text-[0.84rem] leading-relaxed text-app-text whitespace-pre-wrap'
                    : 'ml-6 rounded-2xl rounded-tr-sm bg-app-primary px-3.5 py-2.5 text-[0.84rem] leading-relaxed text-white whitespace-pre-wrap'
                }
              >
                {msg.content}
              </div>
            ))}
            {isSending ? (
              <div className="mr-6 flex items-center gap-2 rounded-2xl rounded-tl-sm border border-app-border bg-app-surface px-3.5 py-2.5 text-[0.84rem] text-app-muted">
                <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-app-primary/60" />
                Searching FEMA documentation...
              </div>
            ) : null}
          </div>

          {/* Error */}
          {lastError ? (
            <p className="px-4 pb-1 text-xs text-red-600">{lastError}</p>
          ) : null}

          {/* Input */}
          <div className="border-t border-app-border px-3 py-3">
            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                placeholder="Ask a question..."
                className="flex-1 resize-none rounded-xl border border-app-border bg-app-bg px-3 py-2 text-sm text-app-text outline-none transition-colors placeholder:text-app-muted/60 focus:border-app-primary/40 focus:ring-1 focus:ring-app-primary/20"
              />
              <button
                type="button"
                disabled={!canSend}
                onClick={handleSend}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-app-primary text-white transition-all hover:brightness-110 disabled:opacity-40 disabled:hover:brightness-100"
              >
                <SendIcon />
              </button>
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
