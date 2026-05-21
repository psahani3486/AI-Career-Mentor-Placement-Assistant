"""
AI Career Chat API router.

Provides a conversational AI career mentor powered by Groq.
"""

from datetime import datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from config import settings
from database.session import get_db
from database.models import User, ChatHistory
from api.auth import get_current_user

router = APIRouter(prefix="/api/chat", tags=["Chat"])

SYSTEM_PROMPT = """You are an expert AI career mentor helping students and professionals with:
- Career guidance and planning
- Skill development advice
- Resume and portfolio tips
- Interview preparation strategies
- Industry insights and trends
- Learning resource recommendations

Be encouraging, specific, and actionable in your advice. Use examples when helpful.
Format your responses clearly with bullet points and headers when appropriate."""


# ── Schemas ──────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None

class ChatResponse(BaseModel):
    reply: str
    session_id: str

class ChatHistoryResponse(BaseModel):
    id: str
    title: Optional[str] = None
    messages: list
    created_at: Optional[str] = None


# ── Routes ───────────────────────────────────────────────────────

@router.post("/", response_model=ChatResponse)
async def send_message(
    req: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Send a message and get an AI career mentor response."""
    # Find or create session
    session = None
    if req.session_id:
        session = db.query(ChatHistory).filter(
            ChatHistory.id == req.session_id,
            ChatHistory.user_id == current_user.id,
        ).first()

    if not session:
        session = ChatHistory(
            user_id=current_user.id,
            messages=[],
            title=req.message[:80],
        )
        db.add(session)
        db.flush()

    # Build message history
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    for msg in (session.messages or [])[-10:]:  # Last 10 messages for context
        messages.append({"role": msg["role"], "content": msg["content"]})
    messages.append({"role": "user", "content": req.message})

    # Call Groq
    try:
        from groq import Groq
        client = Groq(api_key=settings.GROQ_API_KEY)
        response = client.chat.completions.create(
            model="mixtral-8x7b-32768",
            messages=messages,
            max_tokens=1000,
            temperature=0.7,
        )
        ai_reply = response.choices[0].message.content
    except Exception as e:
        # Fallback response when API is unavailable
        ai_reply = (
            "I'm currently unable to connect to the AI service. "
            "Here are some general career tips:\n\n"
            "• Keep your skills up-to-date with industry trends\n"
            "• Build projects that demonstrate your abilities\n"
            "• Network with professionals in your target field\n"
            "• Practice coding challenges and system design regularly\n\n"
            f"Your question: '{req.message}' — I'll provide a detailed answer once the service is restored."
        )

    # Save messages
    now = datetime.now(timezone.utc).isoformat()
    updated_messages = list(session.messages or [])
    updated_messages.append({"role": "user", "content": req.message, "timestamp": now})
    updated_messages.append({"role": "assistant", "content": ai_reply, "timestamp": now})
    session.messages = updated_messages
    db.commit()
    db.refresh(session)

    return ChatResponse(reply=ai_reply, session_id=session.id)


@router.get("/history", response_model=List[ChatHistoryResponse])
async def get_chat_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return all chat sessions for the current user."""
    sessions = db.query(ChatHistory).filter(
        ChatHistory.user_id == current_user.id
    ).order_by(ChatHistory.created_at.desc()).all()

    return [
        ChatHistoryResponse(
            id=s.id,
            title=s.title,
            messages=s.messages or [],
            created_at=str(s.created_at) if s.created_at else None,
        )
        for s in sessions
    ]
