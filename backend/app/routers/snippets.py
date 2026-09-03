from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.supabase_client import supabase

router = APIRouter(prefix="/snippets", tags=["snippets"])


class CreateSnippetRequest(BaseModel):
    title: str
    code: str
    language: str = "python"
    tags: list[str] = []
    source: str | None = None


class UpdateSnippetRequest(BaseModel):
    title: str | None = None
    code: str | None = None
    language: str | None = None
    tags: list[str] | None = None


@router.get("")
async def list_snippets():
    resp = supabase.table("snippets").select("*").order("created_at", desc=True).execute()
    return resp.data


@router.post("")
async def create_snippet(payload: CreateSnippetRequest):
    resp = supabase.table("snippets").insert({
        "title": payload.title,
        "code": payload.code,
        "language": payload.language,
        "tags": payload.tags,
        "source": payload.source,
    }).execute()
    if not resp.data:
        raise HTTPException(status_code=500, detail="Failed to create snippet")
    return resp.data[0]


@router.put("/{snippet_id}")
async def update_snippet(snippet_id: str, payload: UpdateSnippetRequest):
    updates = {k: v for k, v in payload.model_dump().items() if v is not None}
    resp = supabase.table("snippets").update(updates).eq("id", snippet_id).execute()
    if not resp.data:
        raise HTTPException(status_code=404, detail="Snippet not found")
    return resp.data[0]


@router.delete("/{snippet_id}")
async def delete_snippet(snippet_id: str):
    supabase.table("snippets").delete().eq("id", snippet_id).execute()
    return {"status": "deleted"}
