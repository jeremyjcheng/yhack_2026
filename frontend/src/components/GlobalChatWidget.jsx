import { useMemo, useState } from 'react';
import { sendChatMessage } from '../utils/chatApi';
import styles from './GlobalChatWidget.module.css';

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

  return null;
}

export default function GlobalChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [lastError, setLastError] = useState('');

  const canSend = input.trim().length > 0 && !isSending;
  const history = useMemo(
    () =>
      messages.map((msg) => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content,
      })),
    [messages],
  );

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

      const citations = result.citations.length
        ? `\n\nSources: ${result.citations.join('; ')}`
        : '';
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `${result.answer}${citations}`.trim() },
      ]);
    } catch (error) {
      setLastError('Could not get an answer. Please try again.');
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            'I could not answer that right now. Please include county and state (or FIPS) and retry.',
        },
      ]);
      console.error('[chat] request failed:', error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <button
        type="button"
        className={styles.launcher}
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
        aria-controls="global-chat-panel"
      >
        {isOpen ? 'Close Chat' : 'Ask Data Chat'}
      </button>

      {isOpen ? (
        <section id="global-chat-panel" className={styles.panel} aria-label="Data-grounded chatbox">
          <header className={styles.header}>
            <h2 className={styles.title}>County Data Chat</h2>
            <p className={styles.subtitle}>
              Grounded on `combined_final.csv` and the app risk equation.
            </p>
          </header>

          <div className={styles.messageList} role="log" aria-live="polite">
            {!messages.length ? (
              <p className={styles.hint}>
                Ask a county question, for example: Why is Catron County New Mexico heat risk low?
              </p>
            ) : null}
            {messages.map((msg, idx) => (
              <div
                key={`${msg.role}-${idx}`}
                className={msg.role === 'assistant' ? styles.assistantBubble : styles.userBubble}
              >
                {msg.content}
              </div>
            ))}
            {isSending ? (
              <div className={styles.assistantBubble}>Analyzing county evidence...</div>
            ) : null}
          </div>

          {lastError ? <p className={styles.errorText}>{lastError}</p> : null}

          <div className={styles.inputRow}>
            <textarea
              className={styles.input}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={2}
              placeholder="Ask about county risk and why the score is high/low..."
            />
            <button type="button" className={styles.sendButton} disabled={!canSend} onClick={handleSend}>
              Send
            </button>
          </div>
        </section>
      ) : null}
    </>
  );
}
