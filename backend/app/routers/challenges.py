from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.schemas import GenerateChallengeRequest, GradeSubmissionRequest, GradeResult
from app.services.ai_client import AIClientError, chat_completion

router = APIRouter(prefix="/challenges", tags=["challenges"])

GEN_PROMPT = (
    "You are a coding challenge generator. Create a single {difficulty} {language} coding challenge. "
    "Respond as JSON with these fields: title, description, starter_code, solution, hints. "
    "The starter_code should have a placeholder function with a pass statement. "
    "The hints should be a single helpful sentence. Keep the description concise."
)

GRADE_PROMPT = (
    "You are a code grader. Evaluate the submitted code against the challenge. "
    "Respond as JSON with: status (\"passed\" or \"failed\"), feedback (2-3 sentences), "
    "score (0-100 integer). Be fair but thorough."
)


@router.post("/generate")
async def generate_challenge(payload: GenerateChallengeRequest):
    import json

    messages = [
        {"role": "system", "content": GEN_PROMPT.format(
            difficulty=payload.difficulty, language=payload.language
        )},
        {"role": "user", "content": f"Generate a {payload.difficulty} {payload.language} challenge."},
    ]

    try:
        content = await chat_completion(messages, temperature=0.7)
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
            raise HTTPException(status_code=502, detail="AI returned malformed challenge") from exc

    return data


@router.post("/grade", response_model=GradeResult)
async def grade_submission(payload: GradeSubmissionRequest):
    import json

    from app.services.supabase_client import supabase

    challenge_resp = supabase.table("challenges").select("*").eq("id", payload.challenge_id).single().execute()
    challenge = challenge_resp.data

    messages = [
        {"role": "system", "content": GRADE_PROMPT},
        {"role": "user", "content": (
            f"Challenge: {challenge['title']}\n"
            f"Description: {challenge['description']}\n"
            f"Reference solution: {challenge.get('solution', 'N/A')}\n\n"
            f"Submitted {payload.language} code:\n```\n{payload.code}\n```"
        )},
    ]

    try:
        content = await chat_completion(messages, temperature=0.3)
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
            raise HTTPException(status_code=502, detail="AI returned malformed grade") from exc

    status_val = "passed" if data.get("status") == "passed" else "failed"
    feedback = data.get("feedback", "No feedback available.")
    score = int(data.get("score", 0))

    supabase.table("challenge_submissions").insert({
        "challenge_id": payload.challenge_id,
        "code": payload.code,
        "status": status_val,
        "feedback": feedback,
        "score": score,
    }).execute()

    return GradeResult(status=status_val, feedback=feedback, score=score)
