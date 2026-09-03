/*
# Create Loopcraft core schema (single-tenant, no auth)

1. New Tables
- `conversations` — tutor chat sessions (id, title, topic, created_at, updated_at)
- `messages` — individual messages within a conversation (id, conversation_id FK, role, content, created_at)
- `snippets` — saved code snippets from any tool (id, title, code, language, tags, source, created_at)
- `challenges` — AI-generated coding challenges (id, title, description, language, difficulty, starter_code, solution, hints, created_at)
- `challenge_submissions` — user attempts at challenges (id, challenge_id FK, code, status, feedback, score, created_at)

2. Relationships
- messages.conversation_id → conversations.id (CASCADE on delete)
- challenge_submissions.challenge_id → challenges.id (CASCADE on delete)

3. Security
- RLS enabled on all tables.
- This is a single-tenant app with no sign-in screen, so all policies use TO anon, authenticated
  with USING (true) / WITH CHECK (true) — the data is intentionally shared/public.

4. Indexes
- messages.conversation_id (frequent lookups by conversation)
- challenge_submissions.challenge_id (frequent lookups by challenge)
- snippets.created_at DESC (recent snippets listing)
*/

CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT 'New conversation',
  topic text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS snippets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  code text NOT NULL,
  language text NOT NULL DEFAULT 'python',
  tags text[] NOT NULL DEFAULT '{}',
  source text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  language text NOT NULL DEFAULT 'python',
  difficulty text NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  starter_code text,
  solution text,
  hints text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS challenge_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  code text NOT NULL,
  status text NOT NULL CHECK (status IN ('pending', 'passed', 'failed')),
  feedback text,
  score integer,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_challenge_submissions_challenge_id ON challenge_submissions(challenge_id);
CREATE INDEX IF NOT EXISTS idx_snippets_created_at ON snippets(created_at DESC);

-- Enable RLS on all tables
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE snippets ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_submissions ENABLE ROW LEVEL SECURITY;

-- conversations policies (single-tenant, public access)
DROP POLICY IF EXISTS "anon_select_conversations" ON conversations;
CREATE POLICY "anon_select_conversations" ON conversations FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_conversations" ON conversations;
CREATE POLICY "anon_insert_conversations" ON conversations FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_conversations" ON conversations;
CREATE POLICY "anon_update_conversations" ON conversations FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_conversations" ON conversations;
CREATE POLICY "anon_delete_conversations" ON conversations FOR DELETE
  TO anon, authenticated USING (true);

-- messages policies
DROP POLICY IF EXISTS "anon_select_messages" ON messages;
CREATE POLICY "anon_select_messages" ON messages FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_messages" ON messages;
CREATE POLICY "anon_insert_messages" ON messages FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_messages" ON messages;
CREATE POLICY "anon_update_messages" ON messages FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_messages" ON messages;
CREATE POLICY "anon_delete_messages" ON messages FOR DELETE
  TO anon, authenticated USING (true);

-- snippets policies
DROP POLICY IF EXISTS "anon_select_snippets" ON snippets;
CREATE POLICY "anon_select_snippets" ON snippets FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_snippets" ON snippets;
CREATE POLICY "anon_insert_snippets" ON snippets FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_snippets" ON snippets;
CREATE POLICY "anon_update_snippets" ON snippets FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_snippets" ON snippets;
CREATE POLICY "anon_delete_snippets" ON snippets FOR DELETE
  TO anon, authenticated USING (true);

-- challenges policies
DROP POLICY IF EXISTS "anon_select_challenges" ON challenges;
CREATE POLICY "anon_select_challenges" ON challenges FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_challenges" ON challenges;
CREATE POLICY "anon_insert_challenges" ON challenges FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_challenges" ON challenges;
CREATE POLICY "anon_update_challenges" ON challenges FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_challenges" ON challenges;
CREATE POLICY "anon_delete_challenges" ON challenges FOR DELETE
  TO anon, authenticated USING (true);

-- challenge_submissions policies
DROP POLICY IF EXISTS "anon_select_challenge_submissions" ON challenge_submissions;
CREATE POLICY "anon_select_challenge_submissions" ON challenge_submissions FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_challenge_submissions" ON challenge_submissions;
CREATE POLICY "anon_insert_challenge_submissions" ON challenge_submissions FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_challenge_submissions" ON challenge_submissions;
CREATE POLICY "anon_update_challenge_submissions" ON challenge_submissions FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_challenge_submissions" ON challenge_submissions;
CREATE POLICY "anon_delete_challenge_submissions" ON challenge_submissions FOR DELETE
  TO anon, authenticated USING (true);