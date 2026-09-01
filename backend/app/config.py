import os


class Settings:
    # Any OpenAI-compatible chat-completions endpoint works here — point this
    # at Groq, OpenAI, a local model server, or a proxy in front of one.
    ai_api_url: str = os.getenv("AI_API_URL", "https://api.groq.com/openai/v1/chat/completions")
    ai_api_key: str = os.getenv("AI_API_KEY", "")
    ai_model: str = os.getenv("AI_MODEL", "openai/gpt-oss-120b")
    cors_origins: list[str] = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")


settings = Settings()
