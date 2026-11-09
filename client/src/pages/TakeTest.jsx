import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export default function TakeTest({ token }) {
  const { id } = useParams();
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deadline, setDeadline] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const submittedRef = useRef(false);

  // Load the questions, then ask the server to start the attempt
  useEffect(() => {
    let active = true;
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    async function begin() {
      try {
        const testResponse = await fetch(`/api/tests/${id}`, { headers });
        const testData = await testResponse.json();
        if (!testResponse.ok) throw new Error(testData.message || "Unable to load the test.");

        const startResponse = await fetch(`/api/tests/${id}/start`, { method: "POST", headers });
        const startData = await startResponse.json();
        if (!startResponse.ok) throw new Error(startData.message || "Unable to start the test.");

        if (!active) return;
        setTest(testData.test);
        setDeadline(Date.now() + startData.remainingSeconds * 1000);
        setSecondsLeft(startData.remainingSeconds);
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    }

    begin();
    return () => { active = false; };
  }, [id, token]);

  const submitTest = useCallback(async () => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setSubmitting(true);
    setConfirming(false);

    try {
      const response = await fetch(`/api/tests/${id}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ answers }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to submit the test.");
      setResult(data.result);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }, [id, token, answers]);

  // Countdown based on the server start time; submits by itself at zero
  useEffect(() => {
    if (!deadline || result) return undefined;

    const timer = setInterval(() => {
      const left = Math.max(Math.round((deadline - Date.now()) / 1000), 0);
      setSecondsLeft(left);
      if (left === 0) {
        clearInterval(timer);
        submitTest();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [deadline, result, submitTest]);

  if (loading) return <p>Loading test...</p>;
  if (error && !result) {
    return (
      <main>
        <p role="alert">{error}</p>
        <Link to="/student/tests">Back to tests</Link>
      </main>
    );
  }

  if (result) {
    return (
      <main className="test-page">
        <div className="result-card">
          <p className="result-label">Test submitted</p>
          <div className="result-score">
            {result.score}
            <span> / {result.totalQuestions}</span>
          </div>
          <p className="result-percent">{result.percentage}%</p>
          <span className={`result-pill ${result.passed ? "pass" : "fail"}`}>
            {result.passed ? "Passed" : "Not passed"}
          </span>
        </div>

        {result.topicBreakdown?.length > 0 && (
          <div className="result-topics">
            <h2>By topic</h2>
            {result.topicBreakdown.map((item) => (
              <div key={item.topic} className="topic-row">
                <span>{item.topic}</span>
                <div className="topic-bar">
                  <span style={{ width: `${item.accuracy}%` }} />
                </div>
                <span>
                  {item.correctAnswers}/{item.totalQuestions}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="test-actions">
          <Link to="/student/analytics" className="btn">View my analytics</Link>
          <Link to="/student/tests" className="btn btn-secondary">Back to tests</Link>
        </div>
      </main>
    );
  }

  const questions = test?.questions || [];
  if (questions.length === 0) {
    return (
      <main>
        <p>This test has no questions yet.</p>
        <Link to="/student/tests">Back to tests</Link>
      </main>
    );
  }

  const question = questions[current];
  const locked = submitting || secondsLeft === 0;
  const answeredCount = Object.keys(answers).length;
  const isLast = current === questions.length - 1;

  return (
    <main className="test-page">
      <div className="test-head">
        <div>
          <h1>{test.title}</h1>
          <p>
            {answeredCount} of {questions.length} answered
          </p>
        </div>
        <div
          className={`test-timer${secondsLeft <= 60 ? " low" : ""}`}
          role="timer"
          aria-live="off"
        >
          {formatTime(secondsLeft)}
        </div>
      </div>

      <div className="test-progress" aria-hidden="true">
        <span style={{ width: `${(answeredCount / questions.length) * 100}%` }} />
      </div>

      {secondsLeft === 0 && <p role="alert">Time is up. Submitting your answers...</p>}

      <div className="test-palette" aria-label="Question palette">
        {questions.map((item, index) => (
          <button
            key={item._id}
            type="button"
            onClick={() => setCurrent(index)}
            disabled={submitting}
            className={`q-dot${index === current ? " current" : ""}${answers[item._id] ? " done" : ""}`}
            aria-current={index === current ? "true" : undefined}
            aria-label={`Question ${index + 1}${answers[item._id] ? ", answered" : ""}`}
          >
            {index + 1}
          </button>
        ))}
      </div>

      <div className="q-card">
        <p className="q-meta">
          Question {current + 1} of {questions.length}
          {question.category && <span className="test-tag">{question.category}</span>}
        </p>
        <h2 className="q-text">{question.question}</h2>

        <div className="q-options" role="radiogroup" aria-label="Answer options">
          {question.options.map((option) => (
            <label
              key={option}
              className={`option${answers[question._id] === option ? " selected" : ""}`}
            >
              <input
                type="radio"
                name={`question-${question._id}`}
                value={option}
                disabled={locked}
                checked={answers[question._id] === option}
                onChange={() => setAnswers({ ...answers, [question._id]: option })}
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="test-actions between">
        <button
          type="button"
          className="btn-secondary"
          onClick={() => setCurrent(current - 1)}
          disabled={current === 0 || submitting}
        >
          Previous
        </button>
        {isLast ? (
          <button type="button" onClick={() => setConfirming(true)} disabled={locked}>
            Submit test
          </button>
        ) : (
          <button type="button" onClick={() => setCurrent(current + 1)} disabled={submitting}>
            Next
          </button>
        )}
      </div>

      {confirming && (
        <div className="modal-backdrop">
          <div className="modal" role="alertdialog" aria-labelledby="confirm-title" aria-modal="true">
            <h2 id="confirm-title">Submit the test?</h2>
            <p>
              You answered {answeredCount} of {questions.length} questions. You cannot change
              your answers after submitting.
            </p>
            <div className="test-actions">
              <button type="button" onClick={submitTest}>Yes, submit</button>
              <button type="button" className="btn-secondary" onClick={() => setConfirming(false)}>
                Keep working
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
