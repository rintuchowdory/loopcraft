from fastapi import APIRouter, HTTPException

from app.schemas import AIReply, TutorChatRequest
from app.services.ai_client import AIClientError, chat_completion

router = APIRouter(prefix="/tutor", tags=["tutor"])

SYSTEM_PROMPT = (
    "You are a patient coding tutor. Explain concepts clearly with a short example, "
    "check understanding by asking one follow-up question when it helps, and never "
    "just hand over a finished solution to a problem the learner is working through — "
    "guide them toward it instead."
)


@router.post("/chat", response_model=AIReply)
async def tutor_chat(payload: TutorChatRequest) -> AIReply:
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    messages += [{"role": m.role, "content": m.content} for m in payload.messages]

    try:
        content = await chat_completion(messages)
    except AIClientError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    return AIReply(content=content)
