const BASE = import.meta.env.VITE_API_BASE || '/api';

async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Request failed (${res.status}): ${detail}`);
  }
  return res.json();
}

async function get(path) {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Request failed (${res.status}): ${detail}`);
  }
  return res.json();
}

async function put(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Request failed (${res.status}): ${detail}`);
  }
  return res.json();
}

async function del(path) {
  const res = await fetch(`${BASE}${path}`, { method: 'DELETE' });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Request failed (${res.status}): ${detail}`);
  }
  return res.json();
}

// AI endpoints (backend proxy)
export function askTutor(messages) {
  return post('/tutor/chat', { messages });
}

export function pairAssist({ code, language, action }) {
  return post('/pair/assist', { code, language, action });
}

export function gradeSubmission({ challengeId, code, language }) {
  return post('/challenges/grade', { challenge_id: challengeId, code, language });
}

export function generateChallenge({ language, difficulty }) {
  return post('/challenges/generate', { language, difficulty });
}

export function explainConcept({ concept, language }) {
  return post('/concepts/explain', { concept, language });
}

// Conversation endpoints (backend → Supabase)
export const conversations = {
  list: () => get('/conversations'),
  create: (title = 'New conversation', topic = null) =>
    post('/conversations', { title, topic }),
  update: (id, data) => put(`/conversations/${id}`, data),
  delete: (id) => del(`/conversations/${id}`),
  messages: (id) => get(`/conversations/${id}/messages`),
  addMessage: (id, role, content) =>
    post(`/conversations/${id}/messages`, { role, content }),
};

// Snippet endpoints (backend → Supabase)
export const snippets = {
  list: () => get('/snippets'),
  create: (data) => post('/snippets', data),
  update: (id, data) => put(`/snippets/${id}`, data),
  delete: (id) => del(`/snippets/${id}`),
};
