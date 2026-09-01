import { useState } from 'react';
import CodeEditor from '../components/CodeEditor.jsx';
import { pairAssist } from '../lib/api.js';

const LANGUAGES = ['python', 'javascript', 'java', 'c'];

const ACTIONS = [
  { id: 'explain', label: 'Explain this code' },
  { id: 'bugs', label: 'Find bugs' },
  { id: 'improve', label: 'Suggest improvements' },
  { id: 'complete', label: 'Complete what I started' }
];

const STARTER_CODE = {
  python: 'def total(nums):\n    result = 0\n    for n in nums:\n        result += n\n    return result\n',
  javascript: 'function total(nums) {\n  let result = 0;\n  for (const n of nums) {\n    result += n;\n  }\n  return result;\n}\n',
  java: 'int total(int[] nums) {\n    int result = 0;\n    for (int n : nums) {\n        result += n;\n    }\n    return result;\n}\n',
  c: 'int total(int nums[], int len) {\n    int result = 0;\n    for (int i = 0; i < len; i++) {\n        result += nums[i];\n    }\n    return result;\n}\n'
};

export default function AIPairProgrammer() {
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState(STARTER_CODE.python);
  const [activeAction, setActiveAction] = useState(null);
  const [response, setResponse] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);

  function handleLanguageChange(lang) {
    setLanguage(lang);
    setCode(STARTER_CODE[lang]);
    setResponse('');
  }

  async function runAction(actionId) {
    if (pending) return;
    setActiveAction(actionId);
    setPending(true);
    setError(null);
    setResponse('');
    try {
      const result = await pairAssist({ code, language, action: actionId });
      setResponse(result.content);
    } catch (err) {
      setError(err.message);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="pair-page">
      <div className="editor-pane">
        <div className="editor-toolbar">
          <select value={language} onChange={(e) => handleLanguageChange(e.target.value)}>
            {LANGUAGES.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>
        <div className="editor-wrap">
          <CodeEditor value={code} onChange={setCode} language={language} />
        </div>
      </div>

      <div className="assist-pane">
        <h3>AI Pair Programmer</h3>
        <p className="lede">Pick what you want help with.</p>
        <div className="actions">
          {ACTIONS.map((a) => (
            <button
              key={a.id}
              className={'action' + (activeAction === a.id ? ' active' : '')}
              onClick={() => runAction(a.id)}
              disabled={pending}
            >
              {a.label}
            </button>
          ))}
        </div>

        <div className="response">
          {pending && <p className="muted">Reading your code…</p>}
          {error && <p className="error">Couldn't reach the pair: {error}</p>}
          {!pending && !error && response && <pre>{response}</pre>}
          {!pending && !error && !response && (
            <p className="muted">Choose an action above — the response shows up here.</p>
          )}
        </div>
      </div>

      <style>{`
        .pair-page {
          display: flex;
          height: 100%;
        }
        .editor-pane {
          flex: 1.4;
          display: flex;
          flex-direction: column;
          border-right: 1px solid var(--border);
          min-width: 0;
        }
        .editor-toolbar {
          padding: 12px 16px;
          border-bottom: 1px solid var(--border);
        }
        .editor-toolbar select {
          background: var(--panel);
          color: var(--text);
          border: 1px solid var(--border);
          border-radius: 6px;
          padding: 6px 10px;
          font-family: var(--font-mono);
          font-size: 13px;
        }
        .editor-wrap {
          flex: 1;
          overflow: hidden;
        }
        .assist-pane {
          flex: 1;
          padding: 28px 28px 0;
          overflow-y: auto;
          max-width: 420px;
        }
        .assist-pane h3 { font-size: 20px; }
        .lede { color: var(--text-dim); margin: 6px 0 20px; font-size: 14px; }
        .actions {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 24px;
        }
        .action {
          text-align: left;
          background: var(--panel);
          border: 1px solid var(--border);
          color: var(--text);
          padding: 11px 14px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 13.5px;
        }
        .action:hover { border-color: var(--teal-dim); }
        .action.active { border-color: var(--teal); color: var(--teal); }
        .action:disabled { opacity: 0.6; cursor: not-allowed; }
        .response pre {
          white-space: pre-wrap;
          font-family: var(--font-mono);
          font-size: 13px;
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 14px;
          color: var(--teal);
        }
        .muted { color: var(--text-dim); font-size: 13.5px; }
        .error { color: var(--error); font-size: 13.5px; }
      `}</style>
    </div>
  );
}
