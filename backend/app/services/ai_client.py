import httpx

from app.config import settings


class AIClientError(RuntimeError):
    pass


async def chat_completion(messages: list[dict], temperature: float = 0.4) -> str:
    """Call the configured OpenAI-compatible chat-completions endpoint.

    Swap AI_API_URL / AI_API_KEY / AI_MODEL in the environment to point this
    at Groq, OpenAI, a self-hosted model, or a proxy in front of any of them.
    """
    if not settings.ai_api_key:
        raise AIClientError(
            "AI_API_KEY is not set. Add it to backend/.env before calling the tutor or pair endpoints."
        )

    headers = {
        "Authorization": f"Bearer {settings.ai_api_key}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": settings.ai_model,
        "messages": messages,
        "temperature": temperature,
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            resp = await client.post(settings.ai_api_url, headers=headers, json=payload)
            resp.raise_for_status()
        except httpx.HTTPStatusError as exc:
            raise AIClientError(f"AI provider returned {exc.response.status_code}: {exc.response.text}") from exc
        except httpx.RequestError as exc:
            raise AIClientError(f"Could not reach AI provider: {exc}") from exc

    data = resp.json()
    try:
        return data["choices"][0]["message"]["content"]
    except (KeyError, IndexError) as exc:
        raise AIClientError(f"Unexpected response shape from AI provider: {data}") from exc
