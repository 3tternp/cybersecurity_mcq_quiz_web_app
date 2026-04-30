import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { CheckCircle2, XCircle, BarChart3, RefreshCcw, ShieldCheck, Trophy } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import './styles.css';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

function App() {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${API_BASE}/api/questions`)
      .then((res) => {
        if (!res.ok) throw new Error('Unable to load questions');
        return res.json();
      })
      .then((data) => setQuestions(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const answeredCount = Object.keys(answers).length;
  const progress = questions.length ? Math.round((answeredCount / questions.length) * 100) : 0;

  const domains = useMemo(() => [...new Set(questions.map(q => q.domain))], [questions]);

  const handleAnswer = (questionId, optionIndex) => {
    if (result) return;
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const submitQuiz = async () => {
    setSubmitting(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE}/api/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers })
      });
      if (!response.ok) throw new Error('Unable to submit quiz');
      const data = await response.json();
      setResult(data);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const resetQuiz = () => {
    setAnswers({});
    setResult(null);
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) return <div className="page"><div className="loader">Loading quiz...</div></div>;
  if (error && !questions.length) return <div className="page"><div className="error">{error}</div></div>;

  return (
    <div className="page">
      <header className="hero">
        <div>
          <div className="eyebrow"><ShieldCheck size={18} /> Cybersecurity Training Assessment</div>
          <h1>MCQ Quiz: Cyber Security, Ethical Hacking, Pentesting, Bug Bounty & GRC</h1>
          <p>Exam Compass style quiz with {questions.length} multiple-choice questions, instant grading, answer review, and dashboard visualization at the end.</p>
        </div>
        <div className="score-card">
          <span>Progress</span>
          <strong>{progress}%</strong>
          <small>{answeredCount} / {questions.length} answered</small>
        </div>
      </header>

      <section className="stats-row">
        <div className="stat"><span>Total Questions</span><strong>{questions.length}</strong></div>
        <div className="stat"><span>Domains</span><strong>{domains.length}</strong></div>
        <div className="stat"><span>Passing Target</span><strong>70%</strong></div>
      </section>

      {result && <Dashboard result={result} onReset={resetQuiz} />}

      {!result && (
        <div className="instructions">
          <h2>Instructions</h2>
          <p>Select one answer for each question. Correct answers and explanations will be shown only after final submission.</p>
          {error && <p className="error small">{error}</p>}
        </div>
      )}

      <main className="quiz-list">
        {(result ? result.results : questions).map((q, index) => (
          <QuestionCard
            key={q.id}
            index={index}
            question={q}
            selected={answers[q.id] ?? q.selectedIndex}
            resultMode={Boolean(result)}
            onAnswer={handleAnswer}
          />
        ))}
      </main>

      {!result && (
        <div className="submit-bar">
          <button className="primary-btn" onClick={submitQuiz} disabled={submitting || answeredCount === 0}>
            {submitting ? 'Submitting...' : 'Submit Quiz & View Dashboard'}
          </button>
          <button className="ghost-btn" onClick={resetQuiz}><RefreshCcw size={16} /> Reset</button>
        </div>
      )}
    </div>
  );
}

function QuestionCard({ index, question, selected, resultMode, onAnswer }) {
  return (
    <article className={`question-card ${resultMode ? (question.correct ? 'correct' : 'wrong') : ''}`}>
      <div className="question-head">
        <div>
          <span className="q-number">Question {index + 1}</span>
          <h3>{question.question}</h3>
        </div>
        <div className="badges">
          <span>{question.domain}</span>
          <span>{question.difficulty}</span>
        </div>
      </div>

      <div className="options">
        {question.options.map((option, optionIndex) => {
          const isSelected = selected === optionIndex;
          const isAnswer = resultMode && question.answerIndex === optionIndex;
          const isWrongSelected = resultMode && isSelected && !isAnswer;
          return (
            <button
              key={optionIndex}
              className={`option ${isSelected ? 'selected' : ''} ${isAnswer ? 'answer' : ''} ${isWrongSelected ? 'wrong-answer' : ''}`}
              onClick={() => onAnswer(question.id, optionIndex)}
            >
              <span className="option-letter">{String.fromCharCode(65 + optionIndex)}</span>
              <span>{option}</span>
              {resultMode && isAnswer && <CheckCircle2 size={18} />}
              {resultMode && isWrongSelected && <XCircle size={18} />}
            </button>
          );
        })}
      </div>

      {resultMode && (
        <div className="explanation">
          <strong>{question.correct ? 'Correct' : 'Review'}:</strong> {question.explanation}
        </div>
      )}
    </article>
  );
}

function Dashboard({ result, onReset }) {
  const domainData = Object.entries(result.domainSummary).map(([domain, value]) => ({
    domain,
    Correct: value.correct,
    Incorrect: value.total - value.correct,
    Total: value.total,
    Percent: Math.round((value.correct / value.total) * 100)
  }));

  const difficultyData = Object.entries(result.difficultySummary).map(([difficulty, value]) => ({
    name: difficulty,
    value: value.correct,
    total: value.total,
    percent: Math.round((value.correct / value.total) * 100)
  }));

  const overallData = [
    { name: 'Correct', value: result.score },
    { name: 'Incorrect', value: result.total - result.score }
  ];

  return (
    <section className="dashboard">
      <div className="dashboard-title">
        <div>
          <div className="eyebrow"><BarChart3 size={18} /> Result Dashboard</div>
          <h2>Your Score: {result.score} / {result.total} ({result.percentage}%)</h2>
          <p>Performance Level: <strong>{result.grade}</strong></p>
        </div>
        <button className="ghost-btn" onClick={onReset}><RefreshCcw size={16} /> Retake Quiz</button>
      </div>

      <div className="result-cards">
        <div className="result-card"><Trophy size={24} /><span>Score</span><strong>{result.score}/{result.total}</strong></div>
        <div className="result-card"><CheckCircle2 size={24} /><span>Correct</span><strong>{result.score}</strong></div>
        <div className="result-card"><XCircle size={24} /><span>Incorrect</span><strong>{result.total - result.score}</strong></div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Overall Result</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={overallData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                {overallData.map((entry, index) => <Cell key={entry.name} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card wide">
          <h3>Performance by Domain</h3>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={domainData} margin={{ top: 20, right: 30, left: 0, bottom: 70 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="domain" angle={-30} textAnchor="end" interval={0} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="Correct" stackId="a" />
              <Bar dataKey="Incorrect" stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="domain-table">
        <h3>Domain Summary</h3>
        <table>
          <thead><tr><th>Domain</th><th>Correct</th><th>Total</th><th>Score</th></tr></thead>
          <tbody>
            {domainData.map(row => <tr key={row.domain}><td>{row.domain}</td><td>{row.Correct}</td><td>{row.Total}</td><td>{row.Percent}%</td></tr>)}
          </tbody>
        </table>
      </div>
    </section>
  );
}

createRoot(document.getElementById('root')).render(<App />);
