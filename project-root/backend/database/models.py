"""
SQLAlchemy ORM models for the AI Career Mentor platform.

Tables: User, Profile, Resume, ChatHistory, Roadmap, Interview
"""

import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import (
    Column, String, Integer, Float, Boolean, DateTime,
    ForeignKey, Text, JSON, func,
)
from sqlalchemy.orm import relationship

from database.session import Base


def _uuid() -> str:
    return str(uuid.uuid4())


class User(Base):
    """Registered user account."""
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=_uuid)
    name = Column(String(120), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    profile = relationship("Profile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    resumes = relationship("Resume", back_populates="user", cascade="all, delete-orphan")
    chat_histories = relationship("ChatHistory", back_populates="user", cascade="all, delete-orphan")
    roadmaps = relationship("Roadmap", back_populates="user", cascade="all, delete-orphan")
    interviews = relationship("Interview", back_populates="user", cascade="all, delete-orphan")


class Profile(Base):
    """Extended profile information for a user."""
    __tablename__ = "profiles"

    id = Column(String, primary_key=True, default=_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    skills = Column(JSON, default=list)
    cgpa = Column(Float, nullable=True)
    interest = Column(String(255), nullable=True)
    experience = Column(JSON, default=list)
    bio = Column(Text, nullable=True)
    target_role = Column(String(255), nullable=True)

    user = relationship("User", back_populates="profile")


class Resume(Base):
    """Uploaded resume with analysis results."""
    __tablename__ = "resumes"

    id = Column(String, primary_key=True, default=_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    raw_text = Column(Text, nullable=True)
    score = Column(Float, nullable=True)
    feedback = Column(JSON, nullable=True)
    skills_detected = Column(JSON, default=list)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="resumes")


class ChatHistory(Base):
    """Conversation history between user and AI career mentor."""
    __tablename__ = "chat_histories"

    id = Column(String, primary_key=True, default=_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    messages = Column(JSON, default=list)  # [{role, content, timestamp}, ...]
    title = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="chat_histories")


class Roadmap(Base):
    """AI-generated career roadmap."""
    __tablename__ = "roadmaps"

    id = Column(String, primary_key=True, default=_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    goal = Column(String(500), nullable=False)
    timeline = Column(JSON, default=list)  # [{week, title, description}, ...]
    tasks = Column(JSON, default=list)     # [{task, status, resources}, ...]
    duration_weeks = Column(Integer, default=10)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="roadmaps")


class Interview(Base):
    """Mock interview session record."""
    __tablename__ = "interviews"

    id = Column(String, primary_key=True, default=_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    interview_type = Column(String(50), default="technical")  # technical, behavioral, hr
    questions = Column(JSON, default=list)
    answers = Column(JSON, default=list)
    score = Column(Float, nullable=True)
    feedback = Column(JSON, nullable=True)
    emotion_data = Column(JSON, nullable=True)
    voice_analysis = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="interviews")
