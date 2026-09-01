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
