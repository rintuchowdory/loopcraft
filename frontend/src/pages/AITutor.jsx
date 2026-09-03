import { useRef, useState, useEffect, useCallback } from 'react';
import ChatMessage from '../components/ChatMessage.jsx';
import { askTutor, conversations as convApi } from '../lib/api.js';

const STARTER_TOPICS = [
  'Why does recursion need a base case?',
  "What's the difference between a list and a tuple?",
  'Explain Big-O like I\u2019m new to it',
  'Why did my loop run one extra time?',
];

export default function AITutor() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);
  const [convList, setConvList] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const listEnd = useRef(null);

  const loadConversations = useCallback(async () => {
    try {
      const list = await convApi.list();
      setConvList(list);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  async function startNewConversation() {
    try {
      const conv = await convApi.create('New conversation', null);
      setActiveConv(conv.id);
      setMessages([]);
      setError(null);
      await loadConversations();
    } catch (err) {
      setError(err.message);
    }
  }

  async function loadConversation(convId) {
    try {
      const msgs = await convApi.messages(convId);
      setMessages(msgs.map(m => ({ role: m.role, content: m.content })));
      setActiveConv(convId);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  }

  async function deleteConversation(convId, e) {
    e.preventDefault();
    e.stopPropagation();
    try {
      await convApi.delete(convId);
      if (activeConv === convId) {
        setActiveConv(null);
        setMessages([]);
      }
      await loadConversations();
    } catch {
      // ignore
    }
  }

  async function send(text) {
    const question = text ?? input;
    if (!question.trim() || pending) return;

    let convId = activeConv;
    if (!convId) {
      try {
        const conv = await convApi.create(question.slice(0, 50), null);
        convId = conv.id;
        setActiveConv(convId);
        await loadConversations();
      } catch (err) {
        setError(err.message);
        return;
      }
    }

    const next = [...messages, { role: 'user', content: question }];
    setMessages(next);
    setInput('');
    setPending(true);
    setError(null);

    try {
      await convApi.addMessage(convId, 'user', question);
      const reply = await askTutor(next);
      setMessages([...next, { role: 'assistant', content: reply.content }]);
      await convApi.addMessage(convId, 'assistant', reply.content);
      await loadConversations();
    } catch (err) {
      setError(err.message);
    } finally {
      setPending(false);
      setTimeout(() => listEnd.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    }
  }

  return (
    <div className="tutor-page">
      {showSidebar && (
        <div className="conv-sidebar">
          <button className="new-conv-btn" onClick={startNewConversation}>+ New chat</button>
          <div className="conv-list">
            {convList.length === 0 && <p className="conv-empty">No conversations yet</p>}
            {convList.map(c => (
              <button
                key={c.id}
                className={'conv-item' + (activeConv === c.id ? ' active' : '')}
                onClick={() => loadConversation(c.id)}
              >
                <span className="conv-title">{c.title}</span>
                <span className="conv-del" onClick={(e) => deleteConversation(c.id, e)}>×</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="chat-main">
        <header>
          <h2>AI Tutor</h2>
          <button className="toggle-sidebar" onClick={() => setShowSidebar(!showSidebar)}>
            {showSidebar ? '◀ Hide' : '▶ Show history'}
          </button>
        </header>

        <div className="chat-area">
          {messages.length === 0 && (
            <div className="starters">
              {STARTER_TOPICS.map(t => (
                <button key={t} className="starter" onClick={() => send(t)}>{t}</button>
              ))}
            </div>
          )}
          {messages.map((m, i) => (
            <ChatMessage key={i} role={m.role} content={m.content} />
          ))}
          {pending && (
            <div className="thinking">
              <span className="dot" /><span className="dot" /><span className="dot" />
            </div>
          )}
          {error && <p className="error">Couldn't reach the tutor: {error}</p>}
          <div ref={listEnd} />
        </div>

        <form className="composer" onSubmit={(e) => { e.preventDefault(); send(); }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about your code or a concept…"
          />
          <button type="submit" disabled={pending || !input.trim()}>Send</button>
        </form>
      </div>

      <style>{`
        .tutor-page {
          display: flex;
          height: 100%;
        }
        .conv-sidebar {
          width: 220px;
          flex-shrink: 0;
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          padding: 16px;
        }
        .new-conv-btn {
          background: var(--amber);
          color: var(--ink);
          border: none;
          border-radius: var(--radius-sm);
          padding: 10px;
          font-weight: 500;
          cursor: pointer;
          margin-bottom: 12px;
          font-size: 13px;
          transition: background 0.15s ease;
        }
        .new-conv-btn:hover { background: var(--amber-light); }
        .conv-list {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .conv-empty {
          color: var(--text-faint);
          font-size: 12px;
          text-align: center;
          padding: 20px 0;
        }
        .conv-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: none;
          border: 1px solid transparent;
          color: var(--text-dim);
          padding: 8px 10px;
          border-radius: var(--radius-sm);
          cursor: pointer;
          font-size: 13px;
          text-align: left;
          transition: background 0.15s ease, border-color 0.15s ease;
        }
        .conv-item:hover { background: var(--panel); }
        .conv-item.active { background: var(--panel-raised); border-color: var(--border); color: var(--text); }
        .conv-title {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          flex: 1;
        }
        .conv-del {
          opacity: 0;
          color: var(--error);
          font-size: 16px;
          padding: 0 4px;
          transition: opacity 0.15s ease;
        }
        .conv-item:hover .conv-del { opacity: 0.6; }
        .conv-del:hover { opacity: 1 !important; }
        .chat-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          max-width: 880px;
          margin: 0 auto;
          padding: 28px 28px 0;
          min-width: 0;
        }
        header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }
        header h2 { font-size: 24px; }
        .toggle-sidebar {
          background: var(--panel);
          border: 1px solid var(--border);
          color: var(--text-dim);
          padding: 4px 10px;
          border-radius: var(--radius-sm);
          cursor: pointer;
          font-size: 12px;
        }
        .toggle-sidebar:hover { color: var(--text); }
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
          border-radius: var(--radius-md);
          cursor: pointer;
          font-size: 13.5px;
          transition: border-color 0.15s ease;
        }
        .starter:hover { border-color: var(--amber-dim); }
        .thinking {
          display: inline-flex;
          gap: 4px;
          padding: 12px 16px;
        }
        .dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: var(--text-dim);
          animation: pulse 1.1s infinite ease-in-out;
        }
        .dot:nth-child(2) { animation-delay: 0.15s; }
        .dot:nth-child(3) { animation-delay: 0.3s; }
        .error { color: var(--error); font-size: 13.5px; }
        .composer {
          display: flex;
          gap: 10px;
          padding: 16px 0 20px;
          border-top: 1px solid var(--border);
        }
        .composer input {
          flex: 1;
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 12px 14px;
          color: var(--text);
          font-size: 14px;
        }
        .composer input:focus { border-color: var(--teal-dim); }
        .composer button {
          background: var(--amber);
          color: var(--ink);
          border: none;
          border-radius: var(--radius-md);
          padding: 0 20px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.15s ease;
        }
        .composer button:hover { background: var(--amber-light); }
        .composer button:disabled { opacity: 0.5; cursor: not-allowed; }

        @media (max-width: 768px) {
          .conv-sidebar { display: none; }
          .chat-main { padding: 20px 16px 0; }
          .starters { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
