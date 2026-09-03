# Loopcraft

A coding-education app with five AI-powered tools for learning, practicing, and organizing code.

## Features

- **Dashboard** — activity overview with stats, recent conversations, and submission history
- **AI Tutor** — chat-based concept tutor with saved conversation history
- **AI Pair Programmer** — paste code for explanations, bug reports, improvements, or completion
- **Code Challenges** — timed coding problems with AI-graded feedback (10 seeded + AI-generated)
- **Concept Explorer** — interactive topic search with explanations and self-check quizzes
- **Snippet Library** — save, tag, search, and edit reusable code snippets

## Stack

- Frontend: Vite + React 18, react-router-dom, CodeMirror 6, Supabase JS client
- Backend: FastAPI, httpx (AI proxy), Supabase Python client (persistence)
- Database: Supabase (Postgres with RLS)
- AI: any OpenAI-compatible chat-completions endpoint (Groq, OpenAI, local model)

## Project structure

```
loopcraft/
  frontend/                Vite + React SPA
    src/pages/             one file per route
    src/components/        Sidebar, ChatMessage, CodeEditor
    src/lib/               api.js (backend), supabase.js (database)
  backend/
    app/main.py            FastAPI app + CORS
    app/routers/           tutor, pair, challenges, concepts, conversations, snippets
    app/services/          ai_client.py, supabase_client.py
```

## Running it locally

**Backend**

```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # then fill in AI_API_KEY
python -m uvicorn app.main:app --reload --port 8000
```

**Frontend**

```bash
cd frontend
npm install
npm run dev
```

The dev server proxies `/api` to `localhost:8000`, so no extra config is needed for
local development. Supabase credentials are in `.env`.

## Database

Five tables in Supabase (single-tenant, no auth):
- `conversations` / `messages` — tutor chat history
- `snippets` — saved code snippets
- `challenges` — coding challenges (10 seeded)
- `challenge_submissions` — graded attempts

All tables have RLS enabled with anon+authenticated access.
