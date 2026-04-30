# Cybersecurity MCQ Quiz Web Application

A web-based MCQ quiz application inspired by Exam Compass. It includes:

- 40 cybersecurity multiple-choice questions
- Questions based on uploaded training decks:
  - Introduction to Cyber Security
  - Introduction to Ethical Hacking
  - Introduction to Penetration Testing
  - Introduction to Bug Bounty Hunting
  - Introduction to IS Audit and GRC
- Python FastAPI backend
- React JS frontend
- Final dashboard with score, correct/incorrect answers, domain-wise results, and visual charts
- Correct answer and explanation shown after quiz submission

## Project Structure

```text
mcq_quiz_exam_compass_app/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   └── questions.json
│   ├── requirements.txt
│   └── README.md
├── frontend/
│   ├── src/
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── index.html
│   ├── package.json
│   └── README.md
└── README.md
```

## 1. Start Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
# Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Backend API: http://localhost:8000

## 2. Start Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend: http://localhost:5173

## 3. How the Quiz Works

1. Frontend loads questions from `/api/questions`.
2. The user selects MCQ answers.
3. On final submission, frontend posts answers to `/api/submit`.
4. Backend calculates score, domain-wise performance, difficulty-wise performance, and returns correct answers.
5. Frontend displays a result dashboard and detailed answer review.

## Customizing Questions

Edit:

```text
backend/app/questions.json
```

Each question uses this format:

```json
{
  "id": 1,
  "domain": "Penetration Testing",
  "difficulty": "Medium",
  "question": "Question text?",
  "options": ["A", "B", "C", "D"],
  "answerIndex": 0,
  "explanation": "Why the answer is correct."
}
```
