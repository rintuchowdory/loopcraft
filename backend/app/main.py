from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import challenges, concepts, conversations, pair_programmer, snippets, tutor

app = FastAPI(title="Loopcraft API", version="0.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(tutor.router, prefix="/api")
app.include_router(pair_programmer.router, prefix="/api")
app.include_router(challenges.router, prefix="/api")
app.include_router(concepts.router, prefix="/api")
app.include_router(conversations.router, prefix="/api")
app.include_router(snippets.router, prefix="/api")


@app.get("/api/health")
async def health():
    return {"status": "ok"}
