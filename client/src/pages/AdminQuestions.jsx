import { useEffect, useState } from "react";
import { getToken } from "../utils/auth";

const API = import.meta.env.VITE_API_URL || "";

const emptyForm = {
  stem: "",
  options: ["", "", "", ""],
  correctIndex: 0,
  topic: "",
  difficulty: "medium",
  explanation: "",
};

export default function AdminQuestions() {
  const [questions, setQuestions] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const headers = {
    Authorization: `Bearer ${getToken()}`,
    "Content-Type": "application/json",
  };

  async function loadQuestions() {
    try {
      setError("");
      const response = await fetch(`${API}/api/admin/questions`, { headers });
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Unable to load questions.");

      setQuestions(data.questions || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadQuestions();
  }, []);

  function updateOption(index, value) {
    setForm((current) => {
      const options = [...current.options];
      options[index] = value;
      return { ...current, options };
    });
  }

  async function saveQuestion(event) {
    event.preventDefault();
    setError("");

    try {
      const url = editingId
        ? `${API}/api/admin/questions/${editingId}`
        : `${API}/api/admin/questions`;

      const response = await fetch(url, {
        method: editingId ? "PATCH" : "POST",
        headers,
        body: JSON.stringify(form),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to save question.");

      setForm(emptyForm);
      setEditingId(null);
      await loadQuestions();
    } catch (err) {
      setError(err.message);
    }
  }

  function editQuestion(question) {
    setEditingId(question._id);
    setForm({
      stem: question.stem || question.question || "",
      options: question.options || ["", "", "", ""],
      correctIndex: Number.isInteger(question.correctIndex)
        ? question.correctIndex
        : Math.max(
            0,
            (question.options || []).findIndex(
              (option) => option === question.answer
            )
          ),
      topic: question.topic || question.category || "",
      difficulty: question.difficulty || "medium",
      explanation: question.explanation || "",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deleteQuestion(id) {
    if (!window.confirm("Delete this question?")) return;

    try {
      const response = await fetch(`${API}/api/admin/questions/${id}`, {
        method: "DELETE",
        headers,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to delete question.");

      await loadQuestions();
    } catch (err) {
      setError(err.message);
    }
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
  }

  return (
    <main className="admin-dashboard">
      <h1>Question Bank</h1>
      <p>Create, edit and manage aptitude questions.</p>

      {error && <p role="alert">{error}</p>}

      <section>
        <h2>{editingId ? "Edit Question" : "Add New Question"}</h2>

        <form onSubmit={saveQuestion}>
          <label htmlFor="question-stem">Question</label>
          <textarea
            id="question-stem"
            required
            value={form.stem}
            onChange={(e) => setForm({ ...form, stem: e.target.value })}
          />

          {form.options.map((option, index) => (
            <div key={index}>
              <label htmlFor={`option-${index}`}>Option {index + 1}</label>
              <input
                id={`option-${index}`}
                required
                value={option}
                onChange={(e) => updateOption(index, e.target.value)}
              />
            </div>
          ))}

          <label htmlFor="correct-index">Correct Answer</label>
          <select
            id="correct-index"
            value={form.correctIndex}
            onChange={(e) =>
              setForm({ ...form, correctIndex: Number(e.target.value) })
            }
          >
            {form.options.map((option, index) => (
              <option key={index} value={index}>
                Option {index + 1}
              </option>
            ))}
          </select>

          <label htmlFor="topic">Topic</label>
          <input
            id="topic"
            required
            value={form.topic}
            onChange={(e) => setForm({ ...form, topic: e.target.value })}
          />

          <label htmlFor="difficulty">Difficulty</label>
          <select
            id="difficulty"
            value={form.difficulty}
            onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>

          <label htmlFor="explanation">Explanation</label>
          <textarea
            id="explanation"
            value={form.explanation}
            onChange={(e) => setForm({ ...form, explanation: e.target.value })}
          />

          <button type="submit">
            {editingId ? "Update Question" : "Add Question"}
          </button>

          {editingId && (
            <button type="button" onClick={cancelEdit}>
              Cancel
            </button>
          )}
        </form>
      </section>

      <section>
        <h2>Saved Questions ({questions.length})</h2>

        {loading ? (
          <p>Loading questions...</p>
        ) : questions.length === 0 ? (
          <p>No questions added yet.</p>
        ) : (
          questions.map((question) => (
            <article className="admin-list-item" key={question._id}>
              <div>
                <strong>{question.stem || question.question}</strong>
                <p>
                  {question.topic || question.category} · {question.difficulty || "medium"}
                </p>
                <p>
                  Correct answer: {question.options?.[question.correctIndex] || question.answer}
                </p>
              </div>

              <div className="admin-actions">
                <button type="button" onClick={() => editQuestion(question)}>
                  Edit
                </button>
                <button type="button" onClick={() => deleteQuestion(question._id)}>
                  Delete
                </button>
              </div>
            </article>
          ))
        )}
      </section>
    </main>
  );
}