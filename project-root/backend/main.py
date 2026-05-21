"""
AI Career Mentor Backend FastAPI Application.

Main entry point containing middleware configurations, DB tables initialization,
CORS setups, and router mount points.
"""

from contextlib import asynccontextmanager
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from database.session import init_db
from api.auth import router as auth_router
from api.resume import router as resume_router
from api.chat import router as chat_router
from api.rag import router as rag_router
from api.interview import router as interview_router
from api.agents import router as agents_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle events to handle DB creation at startup."""
    try:
        # Create database tables if they do not exist
        init_db()
        print("Database tables initialized successfully.")
    except Exception as e:
        print(f"Error initializing database tables: {e}")
    yield


app = FastAPI(
    title="AI Career Mentor & Placement Assistant API",
    description="Backend API powering resume analyzer, mock interviews, career roadmaps and RAG.",
    version="1.0.0",
    lifespan=lifespan
)

# ── CORS Middleware Configuration ──────────────────────────────────
# Allow frontend URL to interact with this backend API seamlessly
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Route Registrations ───────────────────────────────────────────
app.include_router(auth_router)
app.include_router(resume_router)
app.include_router(chat_router)
app.include_router(rag_router)
app.include_router(interview_router)
app.include_router(agents_router)


@app.get("/")
async def root():
    """Health check response for the API service."""
    return {
        "status": "healthy",
        "service": "AI Career Mentor Backend",
        "documentation_url": "/docs"
    }


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
