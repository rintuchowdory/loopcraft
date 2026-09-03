from typing import Literal

from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class TutorChatRequest(BaseModel):
    messages: list[ChatMessage] = Field(..., min_length=1)


class PairAssistRequest(BaseModel):
    code: str
    language: str = "python"
    action: Literal["explain", "bugs", "improve", "complete"]


class AIReply(BaseModel):
    content: str


class GenerateChallengeRequest(BaseModel):
    language: str = "python"
    difficulty: Literal["easy", "medium", "hard"] = "easy"


class GradeSubmissionRequest(BaseModel):
    challenge_id: str
    code: str
    language: str = "python"


class GradeResult(BaseModel):
    status: Literal["passed", "failed"]
    feedback: str
    score: int


class ExplainConceptRequest(BaseModel):
    concept: str
    language: str = "python"


class ConceptReply(BaseModel):
    explanation: str
    quiz_question: str
    quiz_answer: str
