import { useRef, useState } from 'react';
import ChatMessage from '../components/ChatMessage.jsx';
import { askTutor } from '../lib/api.js';

const STARTER_TOPICS = [
  'Why does recursion need a base case?',
  "What's the difference between a list and a tuple?",
  'Explain Big-O like I\u2019m new to it',
  'Why did my loop run one extra time?'
];

export default function AITutor() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);
  const listEnd = useRef(null);

  async function send(text) {
    const question = text ?? input;
    if (!question.trim() || pending) return;

    const next = [...messages, { role: 'user', content: question }];
    setMessages(next);
    setInput('');
    setPending(true);
    setError(null);

    try {
      const reply = await askTutor(next);
      setMessages([...next, { role: 'assistant', content: reply.content }]);
    } catch (err) {
      setError(err.message);
    } finally {
      setPending(false);
      setTimeout(() => listEnd.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    }
  }

  return (
    <div className="tutor-page">
      <header>
        <h2>AI Tutor</h2>
        <p className="lede">Ask about a concept. It'll explain, then check you understood.</p>
      </header>

      <div className="chat-area">
        {messages.length === 0 && (
          <div className="starters">
            {STARTER_TOPICS.map((t) => (
              <button key={t} className="starter" onClick={() => send(t)}>
                {t}
              </button>
            ))}
          </div>
        )}

        {messages.map((m, i) => (
          <ChatMessage key={i} role={m.role} content={m.content} />
        ))}

        {pending && (
          <div className="thinking">
            <span className="dot" />
            <span className="dot" />
            <span className="dot" />
          </div>
        )}

        {error && <p className="error">Couldn't reach the tutor: {error}</p>}

        <div ref={listEnd} />
      </div>

      <form
        className="composer"
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about your code or a concept…"
        />
        <button type="submit" disabled={pending || !input.trim()}>
          Send
        </button>
      </form>

      <style>{`
        .tutor-page {
          display: flex;
          flex-direction: column;
          height: 100%;
          max-width: 880px;
          margin: 0 auto;
          padding: 32px 32px 0;
        }
        header { margin-bottom: 20px; }
        header h2 { font-size: 26px; }
        .lede { color: var(--text-dim); margin-top: 6px; }
        .chat-area {
          flex: 1;
          overflow-y: auto;
          padding-bottom: 16px;
        }
        .starters {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-bottom: 8px;
        }
        .starter {
          text-align: left;
          background: var(--panel);
          border: 1px solid var(--border);
          color: var(--text);
          padding: 14px 16px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 13.5px;
        }
        .starter:hover { border-color: var(--amber-dim); }
        .thinking {
          display: inline-flex;
          gap: 4px;
          padding: 12px 16px;
        }
        .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--text-dim);
          animation: pulse 1.1s infinite ease-in-out;
        }
        .dot:nth-child(2) { animation-delay: 0.15s; }
        .dot:nth-child(3) { animation-delay: 0.3s; }
        @keyframes pulse {
          0%, 80%, 100% { opacity: 0.25; }
          40% { opacity: 1; }
        }
        .error { color: var(--error); font-size: 13.5px; }
        .composer {
          display: flex;
          gap: 10px;
          padding: 16px 0 24px;
          border-top: 1px solid var(--border);
        }
        .composer input {
          flex: 1;
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 12px 14px;
          color: var(--text);
          font-size: 14px;
        }
        .composer button {
          background: var(--amber);
          color: var(--ink);
          border: none;
          border-radius: 8px;
          padding: 0 20px;
          font-weight: 500;
          cursor: pointer;
        }
        .composer button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
