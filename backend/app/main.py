from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from pathlib import Path
from typing import Dict, List, Optional
import json

BASE_DIR = Path(__file__).resolve().parent
QUESTION_FILE = BASE_DIR / "questions.json"

app = FastAPI(
    title="Cybersecurity MCQ Quiz API",
    description="Backend API for an Exam Compass style quiz based on cybersecurity training slides.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnswerSubmission(BaseModel):
    answers: Dict[int, int] = Field(default_factory=dict, description="Map of question ID to selected option index")

class QuestionPublic(BaseModel):
    id: int
    domain: str
    difficulty: str
    question: str
    options: List[str]

class QuestionResult(BaseModel):
    id: int
    domain: str
    difficulty: str
    question: str
    options: List[str]
    selectedIndex: Optional[int]
    answerIndex: int
    correct: bool
    explanation: str


def load_questions() -> list[dict]:
    with QUESTION_FILE.open("r", encoding="utf-8") as f:
        return json.load(f)

@app.get("/api/health")
def health():
    return {"status": "ok", "questionCount": len(load_questions())}

@app.get("/api/questions", response_model=List[QuestionPublic])
def get_questions():
    questions = load_questions()
    # Hide answer and explanation until final submission.
    return [
        {
            "id": q["id"],
            "domain": q["domain"],
            "difficulty": q["difficulty"],
            "question": q["question"],
            "options": q["options"],
        }
        for q in questions
    ]

@app.post("/api/submit")
def submit_quiz(payload: AnswerSubmission):
    questions = load_questions()
    if not questions:
        raise HTTPException(status_code=500, detail="No questions found")

    results = []
    score = 0
    domain_summary = {}
    difficulty_summary = {}

    for q in questions:
        qid = int(q["id"])
        selected = payload.answers.get(qid)
        is_correct = selected == q["answerIndex"]
        score += int(is_correct)

        domain = q["domain"]
        difficulty = q["difficulty"]
        domain_summary.setdefault(domain, {"correct": 0, "total": 0})
        difficulty_summary.setdefault(difficulty, {"correct": 0, "total": 0})
        domain_summary[domain]["total"] += 1
        difficulty_summary[difficulty]["total"] += 1
        if is_correct:
            domain_summary[domain]["correct"] += 1
            difficulty_summary[difficulty]["correct"] += 1

        results.append(
            QuestionResult(
                id=qid,
                domain=domain,
                difficulty=difficulty,
                question=q["question"],
                options=q["options"],
                selectedIndex=selected,
                answerIndex=q["answerIndex"],
                correct=is_correct,
                explanation=q["explanation"],
            ).model_dump()
        )

    total = len(questions)
    percentage = round((score / total) * 100, 2)

    grade = "Needs Improvement"
    if percentage >= 85:
        grade = "Excellent"
    elif percentage >= 70:
        grade = "Good"
    elif percentage >= 50:
        grade = "Fair"

    return {
        "score": score,
        "total": total,
        "percentage": percentage,
        "grade": grade,
        "domainSummary": domain_summary,
        "difficultySummary": difficulty_summary,
        "results": results,
    }
