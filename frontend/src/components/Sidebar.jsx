import { NavLink } from 'react-router-dom';

const nav = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/tutor', label: 'AI Tutor' },
  { to: '/pair', label: 'AI Pair Programmer' },
  { to: '/courses', label: 'Courses' },
  { to: '/practice', label: 'Practice' },
  { to: '/challenges', label: 'Challenges' },
  { to: '/leaderboard', label: 'Leaderboard' },
  { to: '/achievements', label: 'Achievements' },
  { to: '/settings', label: 'Settings' }
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-mark">{'{ }'}</span>
        <h1>Loopcraft</h1>
      </div>
      <nav>
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-foot">
        <p>Built from scratch — no relation to any other coding-education app.</p>
      </div>

      <style>{`
        .sidebar {
          width: 232px;
          flex-shrink: 0;
          background: var(--ink-raised);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          padding: 24px 16px;
          height: 100%;
        }
        .brand {
          display: flex;
          align-items: baseline;
          gap: 8px;
          padding: 0 8px 24px;
        }
        .brand-mark {
          font-family: var(--font-mono);
          color: var(--amber);
          font-size: 15px;
        }
        .brand h1 {
          font-size: 20px;
        }
        nav {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .nav-link {
          text-decoration: none;
          color: var(--text-dim);
          padding: 9px 12px;
          border-radius: 6px;
          font-size: 14px;
        }
        .nav-link:hover {
          color: var(--text);
          background: var(--panel);
        }
        .nav-link.active {
          color: var(--text);
          background: var(--panel-raised);
          box-shadow: inset 2px 0 0 var(--amber);
        }
        .sidebar-foot {
          margin-top: auto;
          padding: 0 8px;
        }
        .sidebar-foot p {
          font-size: 12px;
          color: var(--text-dim);
          line-height: 1.5;
        }
      `}</style>
    </aside>
  );
}
