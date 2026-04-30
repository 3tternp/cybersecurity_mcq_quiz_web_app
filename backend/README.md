# Cybersecurity MCQ Quiz Backend

FastAPI backend for the Exam Compass style cybersecurity quiz.

## Run locally

```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

API will run at: http://localhost:8000

## Endpoints

- `GET /api/health` - health check
- `GET /api/questions` - returns quiz questions without answers
- `POST /api/submit` - grades submitted answers and returns dashboard data
