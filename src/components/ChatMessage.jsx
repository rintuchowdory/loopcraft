// Splits a message on ``` fences so code blocks render in mono without
// pulling in a full markdown renderer for a first pass.
function renderContent(content) {
  const parts = content.split(/```/g);
  return parts.map((part, i) => {
    if (i % 2 === 1) {
      const lines = part.split('\n');
      const maybeLang = lines[0].trim();
      const code = maybeLang && lines.length > 1 ? lines.slice(1).join('\n') : part;
      return (
        <pre key={i} className="code-block">
          <code>{code.trim()}</code>
        </pre>
      );
    }
    return (
      <p key={i} style={{ whiteSpace: 'pre-wrap', margin: part.trim() ? '0 0 8px' : 0 }}>
        {part}
      </p>
    );
  });
}

export default function ChatMessage({ role, content }) {
  const isUser = role === 'user';
  return (
    <div className={'msg-row' + (isUser ? ' user' : '')}>
      <div className={'bubble' + (isUser ? ' user' : ' tutor')}>{renderContent(content)}</div>
      <style>{`
        .msg-row {
          display: flex;
          margin-bottom: 14px;
        }
        .msg-row.user {
          justify-content: flex-end;
        }
        .bubble {
          max-width: 68ch;
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 14.5px;
          line-height: 1.55;
        }
        .bubble.tutor {
          background: var(--panel);
          border: 1px solid var(--border);
          border-top-left-radius: 4px;
        }
        .bubble.user {
          background: var(--amber-dim);
          color: var(--text);
          border-top-right-radius: 4px;
        }
        .code-block {
          background: var(--ink);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 12px;
          overflow-x: auto;
          font-family: var(--font-mono);
          font-size: 13px;
          color: var(--teal);
          margin: 6px 0;
        }
      `}</style>
    </div>
  );
}
