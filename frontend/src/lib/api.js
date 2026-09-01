const BASE = import.meta.env.VITE_API_BASE || '/api';

async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Request failed (${res.status}): ${detail}`);
  }
  return res.json();
}

export function askTutor(messages) {
  return post('/tutor/chat', { messages });
}

export function pairAssist({ code, language, action }) {
  return post('/pair/assist', { code, language, action });
}
