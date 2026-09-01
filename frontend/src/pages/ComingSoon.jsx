export default function ComingSoon({ title }) {
  return (
    <div className="coming-soon">
      <h2>{title}</h2>
      <p>Not built yet. This section is a placeholder route — wire it up next.</p>
      <style>{`
        .coming-soon {
          padding: 48px;
          max-width: 480px;
        }
        .coming-soon h2 {
          font-size: 26px;
          margin-bottom: 12px;
        }
        .coming-soon p {
          color: var(--text-dim);
        }
      `}</style>
    </div>
  );
}
