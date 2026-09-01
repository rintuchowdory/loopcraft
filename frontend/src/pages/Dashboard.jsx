import { Link } from 'react-router-dom';

export default function Dashboard() {
  return (
    <div className="dashboard">
      <h2>Two ways to get unstuck.</h2>
      <p className="lede">
        A tutor to explain the idea, and a pair to sit next to your code. Start with either —
        they don't share context yet, so pick whichever fits what you're stuck on.
      </p>

      <div className="cards">
        <Link to="/tutor" className="card">
          <span className="card-tag">Ask &amp; understand</span>
          <h3>AI Tutor</h3>
          <p>Explain a concept, walk through why something works, answer "wait, why?"</p>
        </Link>
        <Link to="/pair" className="card">
          <span className="card-tag">Write &amp; fix</span>
          <h3>AI Pair Programmer</h3>
          <p>Paste code, get it explained, reviewed for bugs, or improved line by line.</p>
        </Link>
      </div>

      <style>{`
        .dashboard {
          padding: 56px 64px;
          max-width: 720px;
        }
        .dashboard h2 {
          font-size: 34px;
          margin-bottom: 16px;
        }
        .lede {
          color: var(--text-dim);
          font-size: 16px;
          max-width: 60ch;
          margin-bottom: 40px;
        }
        .cards {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .card {
          display: block;
          text-decoration: none;
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 22px;
          transition: border-color 0.15s ease, transform 0.15s ease;
        }
        .card:hover {
          border-color: var(--amber-dim);
          transform: translateY(-1px);
        }
        .card-tag {
          font-size: 12px;
          color: var(--teal);
        }
        .card h3 {
          font-size: 20px;
          margin: 8px 0;
          color: var(--text);
        }
        .card p {
          color: var(--text-dim);
          font-size: 14px;
          margin: 0;
        }
        @media (max-width: 640px) {
          .cards { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
