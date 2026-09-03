import json

from fastapi import APIRouter, HTTPException

from app.schemas import ConceptReply, ExplainConceptRequest
from app.services.ai_client import AIClientError, chat_completion

router = APIRouter(prefix="/concepts", tags=["concepts"])

SYSTEM_PROMPT = (
    "You are a coding concept explainer. The learner asks about a programming concept. "
    "Explain it in clear, beginner-friendly terms with a short code example. "
    "Then provide a quiz question to test understanding, along with the answer. "
    "Respond as JSON with fields: explanation, quiz_question, quiz_answer."
)


@router.post("/explain", response_model=ConceptReply)
async def explain_concept(payload: ExplainConceptRequest):
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": f"Explain the concept: {payload.concept} (in {payload.language})"},
    ]

    try:
        content = await chat_completion(messages, temperature=0.4)
    except AIClientError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    try:
        data = json.loads(content.strip().strip("`").strip())
    except json.JSONDecodeError:
        cleaned = content.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1].rsplit("```", 1)[0]
        try:
            data = json.loads(cleaned.strip())
        except json.JSONDecodeError as exc:
            raise HTTPException(status_code=502, detail="AI returned malformed response") from exc

    return ConceptReply(
        explanation=data.get("explanation", ""),
        quiz_question=data.get("quiz_question", ""),
        quiz_answer=data.get("quiz_answer", ""),
    )
