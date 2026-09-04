import { useEffect, useState, useCallback } from 'react';
import CodeEditor from '../components/CodeEditor.jsx';
import { supabase } from '../lib/supabase.js';
import { gradeSubmission, generateChallenge } from '../lib/api.js';

const DIFFICULTY_COLORS = {
  easy: 'green',
  medium: 'amber',
  hard: 'error',
};

export default function Challenges() {
  const [challenges, setChallenges] = useState([]);
  const [selected, setSelected] = useState(null);
  const [code, setCode] = useState('');
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [genPending, setGenPending] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadChallenges = useCallback(async () => {
    try {
      const { data } = await supabase.from('challenges').select('*').order('created_at', desc=true);
      setChallenges(data || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadChallenges(); }, [loadChallenges]);

  function selectChallenge(ch) {
    setSelected(ch);
    setCode(ch.starter_code || '');
    setResult(null);
    setError(null);
  }

  async function submit() {
    if (!selected || pending) return;
    setPending(true);
    setError(null);
    setResult(null);
    try {
      const res = await gradeSubmission({
        challengeId: selected.id,
        code,
        language: selected.language,
      });
      setResult(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setPending(false);
    }
  }

  async function generateNew() {
    setGenPending(true);
    setError(null);
    try {
      const data = await generateChallenge({ language: 'python', difficulty: filter === 'all' ? 'medium' : filter });
      const { data: inserted } = await supabase.from('challenges').insert({
        title: data.title,
        description: data.description,
        language: data.language || 'python',
        difficulty: data.difficulty || 'medium',
        starter_code: data.starter_code,
        solution: data.solution,
        hints: data.hints,
      }).select().single();
      await loadChallenges();
      if (inserted) selectChallenge(inserted);
    } catch (err) {
      setError(err.message);
    } finally {
      setGenPending(false);
    }
  }

  const filtered = filter === 'all' ? challenges : challenges.filter(c => c.difficulty === filter);

  return (
    <div className="challenges-page">
      <div className="ch-list">
        <header>
          <h3>Challenges</h3>
          <button className="gen-btn" onClick={generateNew} disabled={genPending}>
            {genPending ? 'Generating…' : '+ New challenge'}
          </button>
        </header>
        <div className="filters">
          {['all', 'easy', 'medium', 'hard'].map(f => (
            <button key={f} className={'filter-btn' + (filter === f ? ' active' : '')} onClick={() => setFilter(f)}>
              {f}
            </button>
          ))}
        </div>
        <div className="ch-items">
          {loading && <p className="muted">Loading…</p>}
          {!loading && filtered.length === 0 && <p className="muted">No challenges found.</p>}
          {filtered.map(ch => (
            <button
              key={ch.id}
              className={'ch-item' + (selected?.id === ch.id ? ' active' : '')}
              onClick={() => selectChallenge(ch)}
            >
              <span className={`diff-badge ${DIFFICULTY_COLORS[ch.difficulty]}`}>{ch.difficulty}</span>
              <span className="ch-title">{ch.title}</span>
              <span className="ch-lang">{ch.language}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="ch-workspace">
        {selected ? (
          <>
            <div className="ch-header">
              <div>
                <h2>{selected.title}</h2>
                <span className={`diff-badge ${DIFFICULTY_COLORS[selected.difficulty]}`}>{selected.difficulty}</span>
                <span className="ch-lang-tag">{selected.language}</span>
              </div>
            </div>
            <p className="ch-desc">{selected.description}</p>
            {selected.hints && <p className="ch-hint">💡 {selected.hints}</p>}
            <div className="editor-wrap">
              <CodeEditor value={code} onChange={setCode} language={selected.language} />
            </div>
            <div className="ch-actions">
              <button className="submit-btn" onClick={submit} disabled={pending}>
                {pending ? 'Grading…' : 'Submit solution'}
              </button>
              {error && <p className="error">{error}</p>}
              {result && (
                <div className={`result-card ${result.status}`}>
                  <h4>{result.status === 'passed' ? '✓ Passed!' : '✗ Needs work'}</h4>
                  <p>{result.feedback}</p>
                  <span className="score">Score: {result.score}/100</span>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="ch-empty">
            <h2>Pick a challenge</h2>
            <p className="muted">Select a challenge from the list, or generate a new one with AI.</p>
          </div>
        )}
      </div>

      <style>{`
        .challenges-page { display: flex; height: 100%; }
        .ch-list {
          width: 280px;
          flex-shrink: 0;
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          padding: 16px;
        }
        .ch-list header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }
        .ch-list h3 { font-size: 16px; font-family: var(--font-body); font-weight: 600; }
        .gen-btn {
          background: var(--panel);
          border: 1px solid var(--border);
          color: var(--teal);
          padding: 4px 10px;
          border-radius: var(--radius-sm);
          cursor: pointer;
          font-size: 12px;
          transition: border-color 0.15s ease;
        }
        .gen-btn:hover { border-color: var(--teal-dim); }
        .gen-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .filters {
          display: flex;
          gap: 4px;
          margin-bottom: 12px;
        }
        .filter-btn {
          background: var(--panel);
          border: 1px solid var(--border);
          color: var(--text-dim);
          padding: 4px 10px;
          border-radius: var(--radius-sm);
          cursor: pointer;
          font-size: 12px;
          text-transform: capitalize;
          transition: border-color 0.15s ease, color 0.15s ease;
        }
        .filter-btn:hover { color: var(--text); }
        .filter-btn.active { border-color: var(--amber); color: var(--amber); }
        .ch-items {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .ch-item {
          display: flex;
          align-items: center;
          gap: 8px;
          background: none;
          border: 1px solid transparent;
          color: var(--text-dim);
          padding: 10px 12px;
          border-radius: var(--radius-sm);
          cursor: pointer;
          font-size: 13px;
          text-align: left;
          transition: background 0.15s ease, border-color 0.15s ease;
        }
        .ch-item:hover { background: var(--panel); }
        .ch-item.active { background: var(--panel-raised); border-color: var(--border); color: var(--text); }
        .ch-title { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .ch-lang { font-family: var(--font-mono); font-size: 11px; color: var(--text-faint); }
        .diff-badge {
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          padding: 2px 6px;
          border-radius: 3px;
        }
        .diff-badge.green { color: var(--green); background: rgba(109,213,140,0.12); }
        .diff-badge.amber { color: var(--amber); background: rgba(227,168,87,0.12); }
        .diff-badge.error { color: var(--error); background: rgba(232,105,94,0.12); }

        .ch-workspace {
          flex: 1;
          display: flex;
          flex-direction: column;
          padding: 28px 32px;
          overflow-y: auto;
          min-width: 0;
        }
        .ch-header > div {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 12px;
        }
        .ch-header h2 { font-size: 24px; }
        .ch-lang-tag {
          font-family: var(--font-mono);
          font-size: 12px;
          color: var(--blue);
          background: rgba(107,164,232,0.12);
          padding: 2px 8px;
          border-radius: 4px;
        }
        .ch-desc {
          color: var(--text-dim);
          font-size: 14px;
          line-height: 1.6;
          margin: 0 0 12px;
        }
        .ch-hint {
          color: var(--warning);
          font-size: 13px;
          background: rgba(232,195,94,0.08);
          border: 1px solid var(--warning-dim);
          border-radius: var(--radius-sm);
          padding: 8px 12px;
          margin: 0 0 16px;
        }
        .editor-wrap {
          flex: 1;
          min-height: 300px;
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          overflow: hidden;
          margin-bottom: 16px;
        }
        .ch-actions {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .submit-btn {
          align-self: flex-start;
          background: var(--teal);
          color: var(--ink);
          border: none;
          border-radius: var(--radius-md);
          padding: 10px 24px;
          font-weight: 500;
          cursor: pointer;
          font-size: 14px;
          transition: background 0.15s ease;
        }
        .submit-btn:hover { background: var(--teal-light); }
        .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .result-card {
          border-radius: var(--radius-md);
          padding: 16px;
          border: 1px solid;
        }
        .result-card.passed {
          background: rgba(109,213,140,0.08);
          border-color: var(--green-dim);
        }
        .result-card.failed {
          background: rgba(232,105,94,0.08);
          border-color: var(--error-dim);
        }
        .result-card h4 { font-size: 16px; margin-bottom: 8px; }
        .result-card.passed h4 { color: var(--green); }
        .result-card.failed h4 { color: var(--error); }
        .result-card p { font-size: 13px; color: var(--text-dim); margin: 0 0 8px; }
        .score { font-family: var(--font-mono); font-size: 14px; color: var(--text); }
        .muted { color: var(--text-dim); font-size: 13px; }
        .error { color: var(--error); font-size: 13px; }
        .ch-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          text-align: center;
        }
        .ch-empty h2 { margin-bottom: 8px; }

        @media (max-width: 768px) {
          .challenges-page { flex-direction: column; }
          .ch-list { width: 100%; max-height: 200px; border-right: none; border-bottom: 1px solid var(--border); }
          .ch-workspace { padding: 20px 16px; }
          .editor-wrap { min-height: 200px; }
        }
      `}</style>
    </div>
  );
}
