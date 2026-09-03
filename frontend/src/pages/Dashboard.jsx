import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase.js';

const TOOLS = [
  { to: '/tutor', title: 'AI Tutor', desc: 'Ask questions and learn concepts through guided conversation.', tag: 'Ask & understand', accent: 'amber' },
  { to: '/pair', title: 'Pair Programmer', desc: 'Paste code and get explanations, bug reports, or improvements.', tag: 'Write & fix', accent: 'teal' },
  { to: '/challenges', title: 'Code Challenges', desc: 'Solve timed coding problems and get instant AI-graded feedback.', tag: 'Practice', accent: 'blue' },
  { to: '/concepts', title: 'Concept Explorer', desc: 'Pick a topic, get a clear explanation and a quick quiz to test yourself.', tag: 'Learn', accent: 'green' },
  { to: '/snippets', title: 'Snippet Library', desc: 'Save and organize reusable code snippets from any tool session.', tag: 'Organize', accent: 'amber' },
];

export default function Dashboard() {
  const [stats, setStats] = useState({
    conversations: 0,
    snippets: 0,
    challenges: 0,
    submissions: 0,
    passed: 0,
  });
  const [recentConversations, setRecentConversations] = useState([]);
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [convs, snips, subs] = await Promise.all([
          supabase.from('conversations').select('*').order('updated_at', desc=true).limit(5),
          supabase.from('snippets').select('*', { count: 'exact', head: true }),
          supabase.from('challenge_submissions').select('*, challenges(title)').order('created_at', desc=true).limit(5),
        ]);

        setRecentConversations(convs.data || []);
        setRecentSubmissions(subs.data || []);
        setStats({
          conversations: convs.data?.length || 0,
          snippets: snips.count || 0,
          submissions: subs.data?.length || 0,
          passed: (subs.data || []).filter(s => s.status === 'passed').length,
          challenges: 10,
        });
      } catch {
        // tables might be empty — that's fine
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="dashboard">
      <div className="dash-header">
        <div>
          <h2>Welcome back</h2>
          <p className="lede">Your coding toolkit — five ways to learn, practice, and get unstuck.</p>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <span className="stat-num">{stats.conversations}</span>
          <span className="stat-label">Conversations</span>
        </div>
        <div className="stat-card">
          <span className="stat-num">{stats.snippets}</span>
          <span className="stat-label">Snippets</span>
        </div>
        <div className="stat-card">
          <span className="stat-num">{stats.challenges}</span>
          <span className="stat-label">Challenges</span>
        </div>
        <div className="stat-card">
          <span className="stat-num">{stats.passed}<span className="stat-sub">/{stats.submissions}</span></span>
          <span className="stat-label">Solved</span>
        </div>
      </div>

      <h3 className="section-title">Tools</h3>
      <div className="tool-grid">
        {TOOLS.map((tool) => (
          <Link key={tool.to} to={tool.to} className={`tool-card ${tool.accent}`}>
            <span className={`tool-tag ${tool.accent}`}>{tool.tag}</span>
            <h3>{tool.title}</h3>
            <p>{tool.desc}</p>
            <span className="tool-arrow">→</span>
          </Link>
        ))}
      </div>

      <div className="activity-row">
        <div className="activity-col">
          <h3 className="section-title">Recent Conversations</h3>
          {loading ? (
            <p className="muted">Loading…</p>
          ) : recentConversations.length === 0 ? (
            <p className="muted">No conversations yet. Start chatting with the AI Tutor.</p>
          ) : (
            <div className="list">
              {recentConversations.map((c) => (
                <Link key={c.id} to="/tutor" className="list-item">
                  <span className="list-title">{c.title}</span>
                  <span className="list-meta">{new Date(c.updated_at).toLocaleDateString()}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="activity-col">
          <h3 className="section-title">Recent Submissions</h3>
          {loading ? (
            <p className="muted">Loading…</p>
          ) : recentSubmissions.length === 0 ? (
            <p className="muted">No submissions yet. Try a challenge.</p>
          ) : (
            <div className="list">
              {recentSubmissions.map((s) => (
                <Link key={s.id} to="/challenges" className="list-item">
                  <span className="list-title">{s.challenges?.title || 'Challenge'}</span>
                  <span className={`badge ${s.status}`}>{s.status === 'passed' ? '✓ Passed' : '✗ Failed'}{s.score != null ? ` · ${s.score}` : ''}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .dashboard {
          padding: 40px 48px;
          max-width: 1100px;
          margin: 0 auto;
          animation: fadeIn 0.3s ease;
        }
        .dash-header {
          margin-bottom: 32px;
        }
        .dash-header h2 {
          font-size: 32px;
          margin-bottom: 8px;
        }
        .lede {
          color: var(--text-dim);
          font-size: 15px;
          max-width: 60ch;
        }
        .stats-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-bottom: 40px;
        }
        .stat-card {
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          transition: border-color 0.15s ease;
        }
        .stat-card:hover {
          border-color: var(--border-light);
        }
        .stat-num {
          font-family: var(--font-display);
          font-size: 32px;
          font-weight: 600;
          color: var(--text);
          line-height: 1;
        }
        .stat-sub {
          font-size: 18px;
          color: var(--text-dim);
        }
        .stat-label {
          font-size: 12px;
          color: var(--text-dim);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .section-title {
          font-size: 16px;
          font-family: var(--font-body);
          font-weight: 600;
          color: var(--text-dim);
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin-bottom: 16px;
        }
        .tool-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
          margin-bottom: 40px;
        }
        .tool-card {
          position: relative;
          display: block;
          text-decoration: none;
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 22px;
          transition: border-color 0.2s ease, transform 0.2s ease;
          overflow: hidden;
        }
        .tool-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          opacity: 0;
          transition: opacity 0.2s ease;
        }
        .tool-card.amber::before { background: var(--amber); }
        .tool-card.teal::before { background: var(--teal); }
        .tool-card.blue::before { background: var(--blue); }
        .tool-card.green::before { background: var(--green); }
        .tool-card:hover {
          border-color: var(--border-light);
          transform: translateY(-2px);
        }
        .tool-card:hover::before {
          opacity: 1;
        }
        .tool-tag {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 3px 8px;
          border-radius: 4px;
        }
        .tool-tag.amber { color: var(--amber); background: rgba(227,168,87,0.12); }
        .tool-tag.teal { color: var(--teal); background: rgba(94,234,212,0.12); }
        .tool-tag.blue { color: var(--blue); background: rgba(107,164,232,0.12); }
        .tool-tag.green { color: var(--green); background: rgba(109,213,140,0.12); }
        .tool-card h3 {
          font-size: 18px;
          margin: 10px 0 6px;
        }
        .tool-card p {
          color: var(--text-dim);
          font-size: 13px;
          margin: 0;
          line-height: 1.5;
        }
        .tool-arrow {
          position: absolute;
          bottom: 22px;
          right: 22px;
          color: var(--text-faint);
          font-size: 18px;
          transition: color 0.2s ease, transform 0.2s ease;
        }
        .tool-card:hover .tool-arrow {
          color: var(--text);
          transform: translateX(4px);
        }
        .activity-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }
        .activity-col {
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 22px;
        }
        .muted { color: var(--text-dim); font-size: 13px; }
        .list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .list-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          text-decoration: none;
          padding: 10px 12px;
          border-radius: var(--radius-sm);
          background: var(--ink-raised);
          border: 1px solid var(--border);
          transition: border-color 0.15s ease;
        }
        .list-item:hover {
          border-color: var(--border-light);
        }
        .list-title {
          font-size: 13px;
          color: var(--text);
        }
        .list-meta {
          font-size: 12px;
          color: var(--text-faint);
        }
        .badge {
          font-size: 12px;
          font-weight: 500;
          padding: 2px 8px;
          border-radius: 4px;
        }
        .badge.passed { color: var(--green); background: rgba(109,213,140,0.12); }
        .badge.failed { color: var(--error); background: rgba(232,105,94,0.12); }

        @media (max-width: 1024px) {
          .tool-grid { grid-template-columns: repeat(2, 1fr); }
          .stats-row { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 768px) {
          .dashboard { padding: 24px 20px; }
          .tool-grid { grid-template-columns: 1fr; }
          .stats-row { grid-template-columns: repeat(2, 1fr); }
          .activity-row { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
