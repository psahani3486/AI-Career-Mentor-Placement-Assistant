"""
AI Mock Interview API Router.

Exposes endpoints for generating interview questions, evaluating answers,
and fetching past interview results, incorporating facial/vocal sentiment simulation.
"""

from datetime import datetime, timezone
import json
from typing import List, Dict, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from config import settings
from database.session import get_db
from database.models import User, Profile, Interview
from api.auth import get_current_user
from dl.emotion_detector import EmotionDetector

router = APIRouter(prefix="/api/interview", tags=["Mock Interview"])

dl_analyst = EmotionDetector()

# ── Schemas ──────────────────────────────────────────────────────

class InterviewStartRequest(BaseModel):
    interview_type: str = "technical"  # technical, behavioral, hr
    role: Optional[str] = None
    skills: Optional[List[str]] = None

class QuestionResponse(BaseModel):
    interview_id: str
    questions: List[str]

class AnswerSubmission(BaseModel):
    interview_id: str
    answers: List[str]  # Ordered answers matching the generated questions
    video_stream_present: Optional[bool] = False
    audio_stream_present: Optional[bool] = False

class EvaluationResponse(BaseModel):
    interview_id: str
    score: float
    feedback: Dict
    emotion_analysis: Optional[Dict] = None
    voice_analysis: Optional[Dict] = None

class InterviewHistoryResponse(BaseModel):
    id: str
    interview_type: str
    score: Optional[float] = None
    feedback: Optional[Dict] = None
    created_at: Optional[str] = None

# ── Routes ───────────────────────────────────────────────────────

@router.post("/start", response_model=QuestionResponse)
async def start_interview(
    req: InterviewStartRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Generate professional customized interview questions based on role and skills."""
    role = req.role or (current_user.profile.target_role if current_user.profile else "Software Engineer")
    
    # Extract skills
    skills_list = []
    if req.skills:
        skills_list = req.skills
    elif current_user.profile and current_user.profile.skills:
        skills_list = current_user.profile.skills
    
    skills_str = ", ".join(skills_list) if skills_list else "general computer science, system design, problem solving"

    # Query OpenAI to generate 4 targeted questions
    prompt = f"""You are an expert tech recruiter/hiring manager. 
Generate exactly 4 realistic interview questions for a candidate interviewing for a '{role}' position.
The candidate has the following skills/experience: {skills_str}.
Interview Type: {req.interview_type.upper()}

Return ONLY a JSON array of strings containing the questions, without formatting block labels.
Example format:
["Question 1", "Question 2", "Question 3", "Question 4"]
"""

    try:
        import openai
        client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a professional HR assistant that outputs strict JSON formats."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=600,
            temperature=0.7,
        )
        content = response.choices[0].message.content.strip()
        
        # Parse JSON
        # Handle cases where LLM might wrap in ```json ... ```
        if content.startswith("```"):
            lines = content.split("\n")
            if lines[0].startswith("```json") or lines[0].startswith("```"):
                content = "\n".join(lines[1:-1]).strip()
        
        questions = json.loads(content)
        if not isinstance(questions, list):
            raise ValueError("Parsed output is not a list")
    except Exception:
        # Fallbacks
        if req.interview_type == "behavioral":
            questions = [
                "Tell me about a time you faced a significant conflict in a project team. How did you resolve it?",
                "Describe a situation where you had to quickly learn a new technology or domain. What was your approach?",
                "Can you talk about a project that failed? What did you learn and what would you do differently?",
                "How do you handle tight deadlines or multiple competing priorities in a team environment?"
            ]
        elif req.interview_type == "hr":
            questions = [
                "Why are you interested in joining our company, and what makes you a unique fit for this role?",
                "Where do you see your career progressing in the next 3 to 5 years?",
                "What are your core strengths and one weakness you are actively trying to improve?",
                "Describe your ideal working environment. Do you prefer working independently or in a highly collaborative setup?"
            ]
        else:  # Technical
            questions = [
                f"Can you explain the key architectural design and data flow of a complex '{role}' system?",
                f"How would you approach optimizing a slow API endpoint that has high database query load?",
                "What is the difference between SQL and NoSQL databases, and when would you use one over the other?",
                "Can you explain the difference between processes and threads, and how concurrency is managed in modern backends?"
            ]

    # Create interview session in DB
    interview = Interview(
        user_id=current_user.id,
        interview_type=req.interview_type,
        questions=questions,
        answers=[]
    )
    db.add(interview)
    db.commit()
    db.refresh(interview)

    return QuestionResponse(
        interview_id=interview.id,
        questions=questions
    )

@router.post("/evaluate", response_model=EvaluationResponse)
async def evaluate_interview(
    req: AnswerSubmission,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Submit candidate answers, evaluate them using LLMs, and compute feedback scores."""
    interview = db.query(Interview).filter(
        Interview.id == req.interview_id,
        Interview.user_id == current_user.id
    ).first()
    
    if not interview:
        raise HTTPException(status_code=404, detail="Interview session not found")

    questions = interview.questions
    answers = req.answers

    if len(answers) < len(questions):
        # Pad with blank answers if user submitted incomplete answers
        answers.extend([""] * (len(questions) - len(answers)))

    # Save answers
    interview.answers = answers

    # Formulate prompt for grading
    qa_pairs = []
    for i, (q, a) in enumerate(zip(questions, answers)):
        qa_pairs.append(f"Q{i+1}: {q}\nA{i+1}: {a if a else '[No Answer Provided]'}")
    qa_str = "\n\n".join(qa_pairs)

    prompt = f"""You are an expert interviewer evaluating a candidate's responses.
Please analyze the following questions and candidate answers, and grade them overall.

Questions and Answers:
{qa_str}

Evaluate carefully and return ONLY a valid JSON object with the following structure:
{{
  "score": 78.5,
  "overall_feedback": "Overall assessment of performance...",
  "strengths": ["Strength 1", "Strength 2"],
  "improvements": ["Critique/improvement tip 1", "Critique/improvement tip 2"],
  "detailed_breakdown": [
    {{"question": "Q1 text", "score": 80, "feedback": "Feedback for Q1"}}
  ]
}}
Ensure the overall score is between 0 and 100. Return ONLY raw JSON.
"""

    try:
        import openai
        client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a professional HR assessor. Return strict JSON."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=1000,
            temperature=0.2,
        )
        content = response.choices[0].message.content.strip()
        if content.startswith("```"):
            lines = content.split("\n")
            if lines[0].startswith("```json") or lines[0].startswith("```"):
                content = "\n".join(lines[1:-1]).strip()
        
        evaluation = json.loads(content)
        score = float(evaluation.get("score", 70.0))
        feedback = evaluation
    except Exception:
        # Heuristic/Fallback evaluation
        answered_count = sum(1 for a in answers if len(a.strip()) > 15)
        score = min(max(float(answered_count * 25.0), 30.0), 95.0)
        feedback = {
            "overall_feedback": f"Completed mock interview with {answered_count} answered questions. Try elaborating your answers with technical keywords and the STAR method.",
            "strengths": ["Completed all stages of the interview", "Maintained structured flow"],
            "improvements": ["Provide more technical details and practical examples in technical answers", "Avoid giving brief one-sentence responses"],
            "detailed_breakdown": [
                {"question": q, "score": score, "feedback": "Good attempt. Expand with more metrics."}
                for q in questions
            ]
        }

    # Simulate DL Emotion and Vocal analysis if video/audio streams are active
    emotion_metrics = dl_analyst.analyze_face() if req.video_stream_present else None
    voice_metrics = dl_analyst.analyze_voice() if req.audio_stream_present else None

    # Persist values
    interview.score = score
    interview.feedback = feedback
    interview.emotion_data = emotion_metrics
    interview.voice_analysis = voice_metrics
    db.commit()

    return EvaluationResponse(
        interview_id=interview.id,
        score=score,
        feedback=feedback,
        emotion_analysis=emotion_metrics,
        voice_analysis=voice_metrics
    )

@router.get("/history", response_model=List[InterviewHistoryResponse])
async def interview_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve the mock interview histories for the current logged-in user."""
    interviews = db.query(Interview).filter(
        Interview.user_id == current_user.id
    ).order_by(Interview.created_at.desc()).all()
    
    return [
        InterviewHistoryResponse(
            id=i.id,
            interview_type=i.interview_type,
            score=i.score,
            feedback=i.feedback,
            created_at=str(i.created_at) if i.created_at else None
        )
        for i in interviews
    ]
