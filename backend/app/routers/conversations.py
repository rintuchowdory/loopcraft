from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.supabase_client import supabase

router = APIRouter(prefix="/conversations", tags=["conversations"])


class CreateConversationRequest(BaseModel):
    title: str = "New conversation"
    topic: str | None = None


class UpdateConversationRequest(BaseModel):
    title: str | None = None
    topic: str | None = None


class AddMessageRequest(BaseModel):
    role: str
    content: str


@router.get("")
async def list_conversations():
    resp = (
        supabase.table("conversations")
        .select("*")
        .order("updated_at", desc=True)
        .execute()
    )
    return resp.data


@router.post("")
async def create_conversation(payload: CreateConversationRequest):
    resp = supabase.table("conversations").insert({
        "title": payload.title,
        "topic": payload.topic,
    }).execute()
    if not resp.data:
        raise HTTPException(status_code=500, detail="Failed to create conversation")
    return resp.data[0]


@router.get("/{conversation_id}/messages")
async def get_messages(conversation_id: str):
    resp = (
        supabase.table("messages")
        .select("*")
        .eq("conversation_id", conversation_id)
        .order("created_at", desc=False)
        .execute()
    )
    return resp.data


@router.post("/{conversation_id}/messages")
async def add_message(conversation_id: str, payload: AddMessageRequest):
    resp = supabase.table("messages").insert({
        "conversation_id": conversation_id,
        "role": payload.role,
        "content": payload.content,
    }).execute()
    if not resp.data:
        raise HTTPException(status_code=500, detail="Failed to add message")

    supabase.table("conversations").update({"updated_at": "now()"}).eq("id", conversation_id).execute()

    return resp.data[0]


@router.put("/{conversation_id}")
async def update_conversation(conversation_id: str, payload: UpdateConversationRequest):
    updates = {k: v for k, v in payload.model_dump().items() if v is not None}
    resp = supabase.table("conversations").update(updates).eq("id", conversation_id).execute()
    if not resp.data:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return resp.data[0]


@router.delete("/{conversation_id}")
async def delete_conversation(conversation_id: str):
    supabase.table("conversations").delete().eq("id", conversation_id).execute()
    return {"status": "deleted"}
