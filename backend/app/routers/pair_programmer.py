from fastapi import APIRouter, HTTPException

from app.schemas import AIReply, PairAssistRequest
from app.services.ai_client import AIClientError, chat_completion

router = APIRouter(prefix="/pair", tags=["pair"])

SYSTEM_PROMPT = (
    "You are an exacting but friendly pair-programming partner. Be specific and reference "
    "line-level details in the code you're given. Keep responses focused on the requested "
    "action only."
)

ACTION_PROMPTS = {
    "explain": "Explain what this {language} code does, in plain terms, section by section.",
    "bugs": "Review this {language} code for bugs, edge cases, and incorrect logic. List each issue found.",
    "improve": "Suggest concrete improvements to this {language} code: readability, performance, or idiom. "
    "Show the improved version.",
    "complete": "This {language} code looks unfinished. Complete it in a way consistent with its existing style.",
}


@router.post("/assist", response_model=AIReply)
async def pair_assist(payload: PairAssistRequest) -> AIReply:
    instruction = ACTION_PROMPTS[payload.action].format(language=payload.language)
    user_message = f"{instruction}\n\n```{payload.language}\n{payload.code}\n```"

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": user_message},
    ]

    try:
        content = await chat_completion(messages)
    except AIClientError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    return AIReply(content=content)
