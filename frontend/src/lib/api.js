import { supabase } from './supabase.js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

async function callEdgeFunction(slug, path, body) {
  const url = `${SUPABASE_URL}/functions/v1/${slug}${path || ''}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ANON_KEY}`,
      'apikey': ANON_KEY,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Request failed (${res.status}): ${detail}`);
  }

  return res.json();
}

// AI endpoints (Supabase Edge Functions)
export function askTutor(messages) {
  return callEdgeFunction('ai-tutor', '', { messages });
}

export function pairAssist({ code, language, action }) {
  return callEdgeFunction('pair-programmer', '', { code, language, action });
}

export function gradeSubmission({ challengeId, code, language }) {
  return callEdgeFunction('challenges', '/grade', { challenge_id: challengeId, code, language });
}

export function generateChallenge({ language, difficulty }) {
  return callEdgeFunction('challenges', '/generate', { language, difficulty });
}

export function explainConcept({ concept, language }) {
  return callEdgeFunction('concepts', '', { concept, language });
}

// Conversation management — direct Supabase queries
export const conversations = {
  async list() {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .order('updated_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async create(title = 'New conversation', topic = null) {
    const { data, error } = await supabase
      .from('conversations')
      .insert({ title, topic })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('conversations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase.from('conversations').delete().eq('id', id);
    if (error) throw error;
  },

  async messages(id) {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', id)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data;
  },

  async addMessage(id, role, content) {
    const { data, error } = await supabase
      .from('messages')
      .insert({ conversation_id: id, role, content })
      .select()
      .single();
    if (error) throw error;

    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', id);

    return data;
  },
};

// Snippet management — direct Supabase queries
export const snippets = {
  async list() {
    const { data, error } = await supabase
      .from('snippets')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async create(payload) {
    const { data, error } = await supabase
      .from('snippets')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('snippets')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase.from('snippets').delete().eq('id', id);
    if (error) throw error;
  },
};
