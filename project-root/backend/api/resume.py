"""
Resume upload and analysis API router.

Handles PDF upload, text extraction via PyMuPDF, and ML-based scoring.
"""

import os
import uuid
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from config import settings
from database.session import get_db
from database.models import User, Resume
from api.auth import get_current_user
from ml.resume_scorer import ResumeScorer

router = APIRouter(prefix="/api/resume", tags=["Resume"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

scorer = ResumeScorer()


# ── Schemas ──────────────────────────────────────────────────────

class ResumeResponse(BaseModel):
    id: str
    filename: str
    score: Optional[float] = None
    feedback: Optional[dict] = None
    skills_detected: Optional[list] = None
    uploaded_at: Optional[str] = None

class AnalysisResponse(BaseModel):
    resume_id: str
    score: float
    feedback: dict
    skills_detected: list


# ── Helpers ──────────────────────────────────────────────────────

def extract_text_from_pdf(file_path: str) -> str:
    """Extract text from a PDF using PyMuPDF."""
    try:
        import fitz  # PyMuPDF
        doc = fitz.open(file_path)
        text = ""
        for page in doc:
            text += page.get_text()
        doc.close()
        return text.strip()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to extract PDF text: {str(e)}")


# ── Routes ───────────────────────────────────────────────────────

@router.post("/upload", response_model=ResumeResponse, status_code=status.HTTP_201_CREATED)
async def upload_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Upload a PDF resume and extract its text."""
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted")

    # Save file
    file_id = str(uuid.uuid4())
    filename = f"{file_id}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    content = await file.read()
    with open(file_path, "wb") as f:
        f.write(content)

    # Extract text
    raw_text = extract_text_from_pdf(file_path)

    resume = Resume(
        user_id=current_user.id,
        filename=file.filename,
        file_path=file_path,
        raw_text=raw_text,
    )
    db.add(resume)
    db.commit()
    db.refresh(resume)

    return ResumeResponse(
        id=resume.id,
        filename=resume.filename,
        uploaded_at=str(resume.uploaded_at) if resume.uploaded_at else None,
    )


@router.post("/analyze/{resume_id}", response_model=AnalysisResponse)
async def analyze_resume(
    resume_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Run ML scoring pipeline on an uploaded resume."""
    resume = db.query(Resume).filter(
        Resume.id == resume_id, Resume.user_id == current_user.id
    ).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    if not resume.raw_text:
        raise HTTPException(status_code=400, detail="No text extracted from resume")

    # Score
    score = scorer.score(resume.raw_text)
    feedback = scorer.generate_feedback(resume.raw_text, score)
    skills = scorer.extract_skills(resume.raw_text)

    # Persist
    resume.score = score
    resume.feedback = feedback
    resume.skills_detected = skills
    db.commit()

    return AnalysisResponse(
        resume_id=resume.id,
        score=score,
        feedback=feedback,
        skills_detected=skills,
    )


@router.get("/history", response_model=List[ResumeResponse])
async def resume_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return the current user's uploaded resumes."""
    resumes = db.query(Resume).filter(Resume.user_id == current_user.id).order_by(Resume.uploaded_at.desc()).all()
    return [
        ResumeResponse(
            id=r.id,
            filename=r.filename,
            score=r.score,
            feedback=r.feedback,
            skills_detected=r.skills_detected,
            uploaded_at=str(r.uploaded_at) if r.uploaded_at else None,
        )
        for r in resumes
    ]
