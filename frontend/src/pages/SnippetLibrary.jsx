import { useEffect, useState, useCallback } from 'react';
import CodeEditor from '../components/CodeEditor.jsx';
import { snippets as snippetApi } from '../lib/api.js';

export default function SnippetLibrary() {
  const [snippets, setSnippets] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editTags, setEditTags] = useState('');
  const [editCode, setEditCode] = useState('');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      const list = await snippetApi.list();
      setSnippets(list);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  function selectSnippet(s) {
    setSelected(s);
    setEditing(false);
    setSaved(false);
    setError(null);
  }

  function startEdit() {
    if (!selected) return;
    setEditTitle(selected.title);
    setEditTags((selected.tags || []).join(', '));
    setEditCode(selected.code);
    setEditing(true);
    setSaved(false);
  }

  async function saveEdit() {
    if (!selected) return;
    try {
      await snippetApi.update(selected.id, {
        title: editTitle,
        code: editCode,
        tags: editTags.split(',').map(t => t.trim()).filter(Boolean),
      });
      setSaved(true);
      setEditing(false);
      await load();
      const updated = snippets.find(s => s.id === selected.id);
      if (updated) {
        setSelected({ ...selected, title: editTitle, code: editCode, tags: editTags.split(',').map(t => t.trim()).filter(Boolean) });
      }
    } catch (err) {
      setError(err.message);
    }
  }

  async function deleteSnippet(id) {
    try {
      await snippetApi.delete(id);
      if (selected?.id === id) setSelected(null);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  const filtered = search
    ? snippets.filter(s =>
        s.title.toLowerCase().includes(search.toLowerCase()) ||
        (s.tags || []).some(t => t.toLowerCase().includes(search.toLowerCase())) ||
        s.language.toLowerCase().includes(search.toLowerCase())
      )
    : snippets;

  return (
    <div className="snippets-page">
      <div className="sn-list">
        <header>
          <h3>Snippets</h3>
          <span className="count">{snippets.length}</span>
        </header>
        <input
          className="sn-search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search title, tag, language…"
        />
        <div className="sn-items">
          {loading && <p className="muted">Loading…</p>}
          {!loading && filtered.length === 0 && <p className="muted">No snippets yet. Save code from the Pair Programmer or add one here.</p>}
          {filtered.map(s => (
            <button
              key={s.id}
              className={'sn-item' + (selected?.id === s.id ? ' active' : '')}
              onClick={() => selectSnippet(s)}
            >
              <span className="sn-title">{s.title}</span>
              <div className="sn-meta">
                <span className="sn-lang">{s.language}</span>
                {(s.tags || []).slice(0, 2).map(t => <span key={t} className="sn-tag">{t}</span>)}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="sn-detail">
        {selected ? (
          editing ? (
            <>
              <div className="edit-header">
                <input className="edit-title" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                <button className="save-btn" onClick={saveEdit}>Save changes</button>
                <button className="cancel-btn" onClick={() => setEditing(false)}>Cancel</button>
              </div>
              <input className="edit-tags" value={editTags} onChange={(e) => setEditTags(e.target.value)} placeholder="Tags (comma-separated)…" />
              <div className="editor-wrap">
                <CodeEditor value={editCode} onChange={setEditCode} language={selected.language} />
              </div>
              {error && <p className="error">{error}</p>}
            </>
          ) : (
            <>
              <div className="detail-header">
                <div>
                  <h2>{selected.title}</h2>
                  <div className="detail-meta">
                    <span className="sn-lang">{selected.language}</span>
                    {(selected.tags || []).map(t => <span key={t} className="sn-tag">{t}</span>)}
                    {selected.source && <span className="sn-source">from {selected.source}</span>}
                  </div>
                </div>
                <div className="detail-actions">
                  <button className="action-btn" onClick={startEdit}>Edit</button>
                  <button className="action-btn danger" onClick={() => deleteSnippet(selected.id)}>Delete</button>
                </div>
              </div>
              <div className="editor-wrap read-only">
                <CodeEditor value={selected.code} onChange={() => {}} language={selected.language} />
              </div>
              {saved && <p className="saved-msg">✓ Snippet saved</p>}
              {error && <p className="error">{error}</p>}
            </>
          )
        ) : (
          <div className="sn-empty">
            <h2>Snippet Library</h2>
            <p className="muted">Select a snippet to view it, or save code from the Pair Programmer to build your collection.</p>
          </div>
        )}
      </div>

      <style>{`
        .snippets-page { display: flex; height: 100%; }
        .sn-list {
          width: 280px;
          flex-shrink: 0;
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          padding: 16px;
        }
        .sn-list header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
        }
        .sn-list h3 { font-size: 16px; font-family: var(--font-body); font-weight: 600; }
        .count {
          font-size: 12px;
          color: var(--text-faint);
          background: var(--panel);
          padding: 2px 8px;
          border-radius: 10px;
        }
        .sn-search {
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          padding: 8px 12px;
          color: var(--text);
          font-size: 13px;
          margin-bottom: 12px;
        }
        .sn-search:focus { border-color: var(--teal-dim); }
        .sn-items {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .sn-item {
          display: flex;
          flex-direction: column;
          gap: 6px;
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
        .sn-item:hover { background: var(--panel); }
        .sn-item.active { background: var(--panel-raised); border-color: var(--border); color: var(--text); }
        .sn-title { font-size: 13px; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .sn-meta { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }
        .sn-lang {
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--blue);
          background: rgba(107,164,232,0.1);
          padding: 1px 6px;
          border-radius: 3px;
        }
        .sn-tag {
          font-size: 10px;
          color: var(--text-dim);
          background: var(--panel);
          padding: 1px 6px;
          border-radius: 3px;
        }

        .sn-detail {
          flex: 1;
          display: flex;
          flex-direction: column;
          padding: 28px 32px;
          overflow-y: auto;
          min-width: 0;
        }
        .detail-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
        }
        .detail-header h2 { font-size: 22px; margin-bottom: 8px; }
        .detail-meta {
          display: flex;
          gap: 8px;
          align-items: center;
          flex-wrap: wrap;
        }
        .sn-source { font-size: 12px; color: var(--text-faint); }
        .detail-actions { display: flex; gap: 8px; }
        .action-btn {
          background: var(--panel);
          border: 1px solid var(--border);
          color: var(--text);
          padding: 6px 14px;
          border-radius: var(--radius-sm);
          cursor: pointer;
          font-size: 13px;
          transition: border-color 0.15s ease;
        }
        .action-btn:hover { border-color: var(--border-light); }
        .action-btn.danger:hover { border-color: var(--error-dim); color: var(--error); }
        .edit-header {
          display: flex;
          gap: 10px;
          align-items: center;
          margin-bottom: 16px;
        }
        .edit-title {
          flex: 1;
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          padding: 8px 12px;
          color: var(--text);
          font-size: 16px;
          font-family: var(--font-display);
        }
        .edit-tags {
          width: 100%;
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          padding: 8px 12px;
          color: var(--text);
          font-size: 13px;
          margin-bottom: 16px;
        }
        .save-btn {
          background: var(--green);
          color: var(--ink);
          border: none;
          border-radius: var(--radius-sm);
          padding: 6px 14px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 500;
        }
        .cancel-btn {
          background: var(--panel);
          border: 1px solid var(--border);
          color: var(--text-dim);
          padding: 6px 14px;
          border-radius: var(--radius-sm);
          cursor: pointer;
          font-size: 13px;
        }
        .editor-wrap {
          flex: 1;
          min-height: 300px;
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          overflow: hidden;
        }
        .read-only { opacity: 0.9; }
        .muted { color: var(--text-dim); font-size: 13px; }
        .error { color: var(--error); font-size: 13px; margin-top: 8px; }
        .saved-msg { color: var(--green); font-size: 13px; margin-top: 8px; }
        .sn-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          text-align: center;
        }
        .sn-empty h2 { margin-bottom: 8px; }

        @media (max-width: 768px) {
          .snippets-page { flex-direction: column; }
          .sn-list { width: 100%; max-height: 200px; border-right: none; border-bottom: 1px solid var(--border); }
          .sn-detail { padding: 20px 16px; }
          .editor-wrap { min-height: 200px; }
        }
      `}</style>
    </div>
  );
}
