# AI Career Mentor — Project Overview

This repository contains a full-stack AI Career Mentor application with a Python FastAPI backend and a Next.js frontend. It includes resume analysis, mock interviews, RAG (retrieval-augmented generation), and simple ML/DL artifacts used for scoring and emotion detection.

## Repository layout

- `backend/` — FastAPI backend, database models, API routes, ML helpers, and trained model artifacts.
  - `main.py` — application entrypoint (runs Uvicorn).
  - `requirements.txt` — Python dependencies for the backend.
  - `config.py` — pydantic settings (reads `.env`).
  - `api/` — API routers (auth, chat, resume, rag, interview, agents).
  - `database/` — DB initialization and models.
  - `dl/` — small DL helpers and model artifact (`emotion_model.keras`).
  - `ml/` — training/inference utilities for resume scoring.
  - `chroma_data/` — ChromaDB persistence directory (vector DB).

- `frontend/` — Next.js app (React). Use `npm run dev` to start in development.

## What I removed

I removed compiled Python cache files from the repository to reduce clutter:

- Removed `*.pyc` files and cleaned `__pycache__` directories across the project.

No source code or model artifacts were deleted.

## Quickstart — Backend

1. Create and activate a virtual environment (recommended):
   - Windows PowerShell:

     ```powershell
     python -m venv .venv
     .\.venv\Scripts\Activate.ps1
     pip install -r backend/requirements.txt
     ```

   - macOS / Linux:
     ```bash
     python3 -m venv .venv
     source .venv/bin/activate
     pip install -r backend/requirements.txt
     ```

2. Start the API (from `backend/` directory):

   ```bash
   cd backend
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

3. Healthcheck and docs:
   - Health: `GET /` → JSON status
   - Interactive docs: `http://localhost:8000/docs`

## Quickstart — Frontend

1. Install and run the Next.js app:

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

2. Open `http://localhost:3000` in your browser.

## Environment variables

The backend reads settings from `backend/.env` (see `backend/config.py`). Important keys:

- `DATABASE_URL` — PostgreSQL connection string (defaults to a local DB)
- `SECRET_KEY`, `ALGORITHM`, `ACCESS_TOKEN_EXPIRE_MINUTES` — JWT settings
- `GROQ_API_KEY` — if using Groq APIs
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` — Google OAuth credentials
- `CHROMA_PERSIST_DIR` — location for ChromaDB persistence (defaults to `./chroma_data`)
- `FRONTEND_URL` — allowed origin for CORS

Keep `.env` out of source control; do not commit secrets.

## Data and model artifacts

- `backend/chroma_data/` — persisted vector DB used by RAG.
- `backend/dl/emotion_model.keras` — trained Keras model for emotion detection.
- `backend/ml/` — scripts and training data (e.g., `resume_data.csv`) used for model training and inference.

If you want to retrain models, see `backend/dl/train_emotion_model.py` and `backend/ml/train.py`.

## Notes and next steps

- If you'd like, I can also:
  - Remove large artifacts you consider unnecessary (for example the Keras model or the Chroma DB). I will not delete these without your confirmation.
  - Add a Dockerfile or docker-compose for easier local setup.

## License

This repository does not include a license file. Add one if you intend to publish or share the code.

---

If you want me to remove other files (databases, trained models, or other large artifacts), tell me which ones and I'll proceed after your confirmation.
