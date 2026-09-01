from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import pair_programmer, tutor

app = FastAPI(title="Loopcraft API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(tutor.router, prefix="/api")
app.include_router(pair_programmer.router, prefix="/api")


@app.get("/api/health")
async def health():
    return {"status": "ok"}
