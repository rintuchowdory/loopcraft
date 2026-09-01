# Loopcraft

An original coding-education app, started from scratch. This first pass builds out two
features — everything else in the sidebar is a placeholder route to fill in later.

- **AI Tutor** — a chat interface for explaining concepts and answering "why" questions.
- **AI Pair Programmer** — paste code into an editor and ask it to explain, find bugs,
  suggest improvements, or complete what you started.

Stack: Vite + React frontend, FastAPI backend, calling any OpenAI-compatible chat
endpoint (Groq, OpenAI, a self-hosted model, or a proxy in front of one).

## Project structure

```
loopcraft/
  frontend/          Vite + React app
    src/pages/        one file per route
    src/components/   Sidebar, ChatMessage, CodeEditor
    src/lib/api.js     talks to the backend
  backend/
    app/main.py        FastAPI app + CORS
    app/routers/        /tutor and /pair endpoints
    app/services/        ai_client.py — swap the provider via env vars
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
local development.

## Pointing it at your own AI provider

`backend/app/services/ai_client.py` calls whatever OpenAI-compatible endpoint is set in
`AI_API_URL`. Point it at Groq directly, OpenAI, or a proxy you already run — the request
shape is the standard `{model, messages, temperature}` chat-completions body.

## Pushing to GitHub

```bash
gh repo create loopcraft --private --source=. --remote=origin
git add -A
git commit -m "Initial scaffold: AI Tutor + AI Pair Programmer"
git push -u origin main
```

## What's not built yet

Courses, Practice, Challenges, Leaderboard, Achievements, and Settings are stub routes
(`ComingSoon.jsx`) — same pattern as the two built pages, just without the feature behind
them yet.
