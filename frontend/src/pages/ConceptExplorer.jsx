import { useState } from 'react';
import { explainConcept } from '../lib/api.js';

const SUGGESTED_CONCEPTS = [
  'Recursion',
  'Big-O notation',
  'Hash maps',
  'Pointers',
  'Object-oriented programming',
  'Async/await',
  'Binary search',
  'Linked lists',
  ' closures',
  'REST APIs',
  'Graphs',
  'Dynamic programming',
];

export default function ConceptExplorer() {
  const [concept, setConcept] = useState('');
  const [language, setLanguage] = useState('python');
  const [result, setResult] = useState(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);

  async function explore(text) {
    const topic = text ?? concept;
    if (!topic.trim() || pending) return;
    setPending(true);
    setError(null);
    setResult(null);
    setShowAnswer(false);
    setConcept(topic);
    try {
      const res = await explainConcept({ concept: topic, language });
      setResult(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="concepts-page">
      <header>
        <h2>Concept Explorer</h2>
        <p className="lede">Type a concept or pick one below. Get a clear explanation and a quiz to test yourself.</p>
      </header>

      <div className="search-row">
        <input
          value={concept}
          onChange={(e) => setConcept(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && explore()}
          placeholder="Search a concept, e.g. recursion…"
        />
        <select value={language} onChange={(e) => setLanguage(e.target.value)}>
          <option value="python">Python</option>
          <option value="javascript">JavaScript</option>
          <option value="java">Java</option>
          <option value="c">C</option>
        </select>
        <button onClick={() => explore()} disabled={pending || !concept.trim()}>
          {pending ? 'Explaining…' : 'Explore'}
        </button>
      </div>

      <div className="suggestions">
        {SUGGESTED_CONCEPTS.map(c => (
          <button key={c} className="suggestion-chip" onClick={() => explore(c)}>
            {c}
          </button>
        ))}
      </div>

      {error && <p className="error">{error}</p>}

      {pending && (
        <div className="loading-card">
          <div className="thinking"><span className="dot" /><span className="dot" /><span className="dot" /></div>
        </div>
      )}

      {result && (
        <div className="result-section">
          <div className="card explanation-card">
            <h3>Explanation</h3>
            <div className="explanation-body">
              {result.explanation.split(/```/).map((part, i) => {
                if (i % 2 === 1) {
                  const lines = part.split('\n');
                  const maybeLang = lines[0].trim();
                  const codeText = maybeLang && lines.length > 1 ? lines.slice(1).join('\n') : part;
                  return <pre key={i} className="code-block"><code>{codeText.trim()}</code></pre>;
                }
                return <p key={i} style={{ whiteSpace: 'pre-wrap' }}>{part}</p>;
              })}
            </div>
          </div>

          {result.quiz_question && (
            <div className="card quiz-card">
              <h3>Quiz yourself</h3>
              <p className="quiz-question">{result.quiz_question}</p>
              <button className="reveal-btn" onClick={() => setShowAnswer(!showAnswer)}>
                {showAnswer ? 'Hide answer' : 'Reveal answer'}
              </button>
              {showAnswer && <p className="quiz-answer">{result.quiz_answer}</p>}
            </div>
          )}
        </div>
      )}

      <style>{`
        .concepts-page {
          padding: 40px 48px;
          max-width: 820px;
          margin: 0 auto;
          animation: fadeIn 0.3s ease;
        }
        header { margin-bottom: 28px; }
        header h2 { font-size: 28px; margin-bottom: 8px; }
        .lede { color: var(--text-dim); font-size: 15px; }
        .search-row {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
        }
        .search-row input {
          flex: 1;
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 12px 14px;
          color: var(--text);
          font-size: 14px;
        }
        .search-row input:focus { border-color: var(--teal-dim); }
        .search-row select {
          background: var(--panel);
          color: var(--text);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 0 10px;
          font-size: 13px;
        }
        .search-row button {
          background: var(--teal);
          color: var(--ink);
          border: none;
          border-radius: var(--radius-md);
          padding: 0 20px;
          font-weight: 500;
          cursor: pointer;
          font-size: 14px;
          transition: background 0.15s ease;
        }
        .search-row button:hover { background: var(--teal-light); }
        .search-row button:disabled { opacity: 0.5; cursor: not-allowed; }
        .suggestions {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 28px;
        }
        .suggestion-chip {
          background: var(--panel);
          border: 1px solid var(--border);
          color: var(--text-dim);
          padding: 6px 14px;
          border-radius: 20px;
          cursor: pointer;
          font-size: 13px;
          transition: border-color 0.15s ease, color 0.15s ease;
        }
        .suggestion-chip:hover {
          border-color: var(--teal-dim);
          color: var(--teal);
        }
        .error { color: var(--error); font-size: 13.5px; margin-bottom: 16px; }
        .loading-card {
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 32px;
          margin-bottom: 20px;
        }
        .thinking {
          display: inline-flex;
          gap: 4px;
        }
        .dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: var(--text-dim);
          animation: pulse 1.1s infinite ease-in-out;
        }
        .dot:nth-child(2) { animation-delay: 0.15s; }
        .dot:nth-child(3) { animation-delay: 0.3s; }
        .result-section {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .card {
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 24px;
        }
        .card h3 {
          font-size: 16px;
          font-family: var(--font-body);
          font-weight: 600;
          margin-bottom: 14px;
        }
        .explanation-body p { font-size: 14px; line-height: 1.6; margin: 0 0 10px; }
        .code-block {
          background: var(--ink);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          padding: 12px;
          overflow-x: auto;
          font-family: var(--font-mono);
          font-size: 13px;
          color: var(--teal);
          margin: 8px 0;
        }
        .quiz-card {
          border-color: var(--blue-dim);
        }
        .quiz-question {
          font-size: 15px;
          color: var(--text);
          margin-bottom: 16px;
        }
        .reveal-btn {
          background: var(--panel-raised);
          border: 1px solid var(--border);
          color: var(--blue);
          padding: 8px 16px;
          border-radius: var(--radius-sm);
          cursor: pointer;
          font-size: 13px;
          transition: border-color 0.15s ease;
        }
        .reveal-btn:hover { border-color: var(--blue-dim); }
        .quiz-answer {
          margin-top: 14px;
          padding: 14px;
          background: rgba(107,164,232,0.08);
          border-radius: var(--radius-sm);
          font-size: 14px;
          color: var(--text);
          animation: fadeIn 0.2s ease;
        }

        @media (max-width: 768px) {
          .concepts-page { padding: 24px 16px; }
          .search-row { flex-direction: column; }
          .search-row button { padding: 10px; }
        }
      `}</style>
    </div>
  );
}
