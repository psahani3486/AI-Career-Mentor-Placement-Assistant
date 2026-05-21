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

    # Call Groq with timeout
    import time
    import asyncio
    start_time = time.time()
    try:
        from groq import Groq
        import httpx
        
        if not settings.GROQ_API_KEY:
            raise ValueError("GROQ_API_KEY is not configured in environment variables")
        
        print(f"[CHAT] Initializing Groq client...")
        # Create Groq client with custom HTTP client that has a timeout
        http_client = httpx.Client(timeout=20.0)  # 20 second timeout
        client = Groq(api_key=settings.GROQ_API_KEY, http_client=http_client)
        
        print(f"[CHAT] Calling Groq API for message: {req.message[:50]}...")
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
            max_tokens=1000,
            temperature=0.7,
        )
        ai_reply = response.choices[0].message.content
        elapsed = time.time() - start_time
        print(f"[CHAT] Groq API responded in {elapsed:.2f}s")
        http_client.close()
    except asyncio.TimeoutError as e:
        elapsed = time.time() - start_time
        print(f"[CHAT] Groq API Timeout after {elapsed:.2f}s")
        ai_reply = "The AI service is currently unavailable (timeout). Please try again in a moment."
    except Exception as e:
        elapsed = time.time() - start_time
        print(f"[CHAT] Groq API Error after {elapsed:.2f}s: {str(e)}")
        import traceback
        traceback.print_exc()
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
