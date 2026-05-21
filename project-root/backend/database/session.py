"""
Database session management.

Provides SQLAlchemy engine, session factory, and a FastAPI
dependency for injecting database sessions into route handlers.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session, DeclarativeBase
from typing import Generator

from config import settings


# PostgreSQL engine configuration
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
    echo=settings.DEBUG,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy ORM models."""
    pass


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency that yields a database session and closes it after use."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    """Create all tables defined by Base subclasses and seed the demo user if not exists."""
    Base.metadata.create_all(bind=engine)
    
    # Proactively seed the demo user to allow quick one-click evaluator access
    from database.models import User, Profile
    from passlib.context import CryptContext
    
    db = SessionLocal()
    try:
        demo_user = db.query(User).filter(User.email == "demo@example.com").first()
        if not demo_user:
            print("Seeding demo user...")
            pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
            hashed_pw = pwd_context.hash("password123")
            
            user = User(
                name="Demo Candidate",
                email="demo@example.com",
                hashed_password=hashed_pw,
            )
            db.add(user)
            db.flush()
            
            profile = Profile(
                user_id=user.id,
                skills=["Python", "FastAPI", "React", "Next.js", "SQL", "Machine Learning"],
                experience=[
                    {
                        "company": "Silicon Labs",
                        "role": "Full-Stack AI Developer Intern",
                        "duration": "6 Months",
                        "description": "Built interactive chat interfaces and structured databases. Optimized performance by 30% using FastAPI query caching."
                    }
                ],
                cgpa=8.8,
                interest="Generative AI & Software Systems",
                target_role="Full-Stack Engineer",
                bio="An ambitious developer passionate about building scalable AI products and elegant visual interfaces.",
            )
            db.add(profile)
            db.commit()
            print("Demo user ('demo@example.com' / 'password123') and profile seeded successfully!")
    except Exception as e:
        print(f"Error seeding demo user: {e}")
        db.rollback()
    finally:
        db.close()

