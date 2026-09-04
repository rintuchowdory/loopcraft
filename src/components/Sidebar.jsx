import { NavLink } from 'react-router-dom';

const SECTIONS = [
  {
    heading: 'Overview',
    items: [
      { to: '/', label: 'Dashboard', end: true, icon: 'home' },
    ],
  },
  {
    heading: 'AI Tools',
    items: [
      { to: '/tutor', label: 'AI Tutor', icon: 'tutor' },
      { to: '/pair', label: 'Pair Programmer', icon: 'pair' },
      { to: '/concepts', label: 'Concept Explorer', icon: 'concepts' },
    ],
  },
  {
    heading: 'Practice',
    items: [
      { to: '/challenges', label: 'Challenges', icon: 'challenges' },
      { to: '/snippets', label: 'Snippet Library', icon: 'snippets' },
    ],
  },
];

const ICONS = {
  home: 'M3 12L12 4l9 8M5 10v10h5v-6h4v6h5V10',
  tutor: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
  pair: 'M16 18l6-6-6-6M8 6l-6 6 6 6',
  concepts: 'M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 15h-2v-6h2zm0-8h-2V7h2z',
  challenges: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
  snippets: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6',
};

function Icon({ name }) {
  const path = ICONS[name];
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={path} />
    </svg>
  );
}

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-mark">{'{ }'}</span>
        <h1>Loopcraft</h1>
      </div>
      {SECTIONS.map((section) => (
        <div key={section.heading} className="nav-section">
          <p className="nav-heading">{section.heading}</p>
          <nav>
            {section.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
              >
                <Icon name={item.icon} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      ))}
      <div className="sidebar-foot">
        <p>Built from scratch — a coding-education playground.</p>
      </div>

      <style>{`
        .sidebar {
          width: 248px;
          flex-shrink: 0;
          background: var(--ink-raised);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          padding: 24px 12px 16px;
          height: 100%;
          overflow-y: auto;
        }
        .brand {
          display: flex;
          align-items: baseline;
          gap: 8px;
          padding: 0 8px 28px;
        }
        .brand-mark {
          font-family: var(--font-mono);
          color: var(--amber);
          font-size: 16px;
        }
        .brand h1 {
          font-size: 21px;
          font-weight: 600;
        }
        .nav-section {
          margin-bottom: 24px;
        }
        .nav-heading {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--text-faint);
          padding: 0 12px;
          margin: 0 0 6px;
        }
        nav {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .nav-link {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          color: var(--text-dim);
          padding: 9px 12px;
          border-radius: var(--radius-sm);
          font-size: 14px;
          transition: background 0.15s ease, color 0.15s ease;
        }
        .nav-link:hover {
          color: var(--text);
          background: var(--panel);
        }
        .nav-link.active {
          color: var(--amber-light);
          background: var(--panel-raised);
          box-shadow: inset 2px 0 0 var(--amber);
        }
        .nav-link svg {
          flex-shrink: 0;
          opacity: 0.7;
        }
        .nav-link.active svg {
          opacity: 1;
        }
        .sidebar-foot {
          margin-top: auto;
          padding: 12px 8px 0;
        }
        .sidebar-foot p {
          font-size: 11px;
          color: var(--text-faint);
          line-height: 1.5;
        }
        @media (max-width: 768px) {
          .sidebar {
            width: 60px;
            padding: 16px 4px;
          }
          .brand h1, .nav-heading, .nav-link span, .sidebar-foot p {
            display: none;
          }
          .brand {
            justify-content: center;
            padding: 0 0 20px;
          }
          .nav-link {
            justify-content: center;
            padding: 10px;
          }
        }
      `}</style>
    </aside>
  );
}
