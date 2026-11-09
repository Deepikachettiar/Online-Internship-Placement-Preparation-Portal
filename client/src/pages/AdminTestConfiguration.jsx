
import { useEffect, useState } from "react";
import axios from "axios";
import { getToken } from "../utils/auth";

const API_URL = import.meta.env.VITE_API_URL || "";

function AdminTestConfiguration() {
  const [questions, setQuestions] = useState([]);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const emptyForm = {
    title: "",
    description: "",
    category: "General",
    durationMinutes: 30,
    questions: [],
  };

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const token = getToken();

  const api = axios.create({
    baseURL: API_URL,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  async function loadData() {
    setLoading(true);
    setMessage("");

    try {
      const [questionResponse, testResponse] = await Promise.all([
        api.get("/api/admin/questions"),
        api.get("/api/admin/tests"),
      ]);

      setQuestions(questionResponse.data.questions || []);
      setTests(testResponse.data.tests || []);
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Unable to load questions and tests."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
    // Load data when the page is opened.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function toggleQuestion(questionId) {
    setForm((previous) => ({
      ...previous,
      questions: previous.questions.includes(questionId)
        ? previous.questions.filter((id) => id !== questionId)
        : [...previous.questions, questionId],
    }));
  }

  function editTest(test) {
    setEditingId(test._id);

    setForm({
      title: test.title || "",
      description: test.description || "",
      category: test.category || "General",
      durationMinutes: test.durationMinutes || 30,
      questions: (test.questions || []).map((question) =>
        typeof question === "string" ? question : question._id
      ),
    });

    setMessage("Editing: " + test.title);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setMessage("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const payload = {
        ...form,
        durationMinutes: Number(form.durationMinutes),
      };

      if (editingId) {
        await api.patch(`/api/admin/tests/${editingId}`, payload);
        setMessage("Test configuration updated successfully.");
      } else {
        await api.post("/api/admin/tests", payload);
        setMessage("Test created successfully as a draft.");
      }

      resetForm();
      await loadData();
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Unable to save test."
      );
    } finally {
      setSaving(false);
    }
  }

  async function publishTest(testId) {
    if (!window.confirm("Are you sure you want to publish this test?")) {
      return;
    }

    try {
      await api.patch(`/api/admin/tests/${testId}/publish`);
      setMessage("Test published successfully.");
      await loadData();
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Unable to publish test."
      );
    }
  }

  async function deactivateTest(testId) {
    if (!window.confirm("Are you sure you want to deactivate this test?")) {
      return;
    }

    try {
      await api.patch(`/api/admin/tests/${testId}/deactivate`);
      setMessage("Test deactivated successfully.");
      await loadData();
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Unable to deactivate test."
      );
    }
  }

  if (loading) {
    return <main><p>Loading test configuration...</p></main>;
  }

  return (
    <main className="admin-dashboard">
      <h1>Admin Test Configuration</h1>
      <p>Create, configure and publish aptitude tests.</p>

      {message && <p role="status">{message}</p>}

      <section>
        <h2>{editingId ? "Edit Test" : "Create New Test"}</h2>

        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="title">Test Title</label>
            <input
              id="title"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Enter test title"
              required
            />
          </div>

          <div>
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Enter test description"
            />
          </div>

          <div>
            <label htmlFor="category">Category</label>
            <input
              id="category"
              name="category"
              value={form.category}
              onChange={handleChange}
              placeholder="e.g. Quantitative Aptitude"
              required
            />
          </div>

          <div>
            <label htmlFor="durationMinutes">
              Duration (minutes)
            </label>
            <input
              id="durationMinutes"
              name="durationMinutes"
              type="number"
              min="1"
              value={form.durationMinutes}
              onChange={handleChange}
              required
            />
          </div>

          <h3>Select Questions</h3>

          {questions.length === 0 ? (
            <p>No questions available. Add questions to the question bank first.</p>
          ) : (
            <div>
              {questions.map((question) => (
                <label
                  key={question._id}
                  style={{
                    display: "block",
                    padding: "8px",
                    marginBottom: "6px",
                    border: "1px solid #ccc",
                    borderRadius: "6px",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={form.questions.includes(question._id)}
                    onChange={() => toggleQuestion(question._id)}
                  />
                  {" "}
                  {question.stem || question.question}
                  {" — "}
                  {question.topic || question.category}
                  {" ("}
                  {question.difficulty || "medium"}
                  {")"}
                </label>
              ))}
            </div>
          )}

          <p>Selected questions: {form.questions.length}</p>

          <button type="submit" disabled={saving}>
            {saving
              ? "Saving..."
              : editingId
                ? "Update Test"
                : "Create Draft"}
          </button>

          {editingId && (
            <button type="button" onClick={resetForm}>
              Cancel Editing
            </button>
          )}
        </form>
      </section>

      <hr />

      <section>
        <h2>Existing Tests</h2>

        {tests.length === 0 ? (
          <p>No tests created yet.</p>
        ) : (
          tests.map((test) => (
            <article
              key={test._id}
              className="admin-list-item"
              style={{
                padding: "16px",
                marginBottom: "12px",
                border: "1px solid #ccc",
                borderRadius: "8px",
              }}
            >
              <h3>{test.title}</h3>
              <p>{test.description}</p>
              <p>Category: {test.category || "General"}</p>
              <p>Duration: {test.durationMinutes} minutes</p>
              <p>Questions: {test.questions?.length || 0}</p>
              <p>
                Status: <strong>{test.status}</strong>
              </p>

              <button onClick={() => editTest(test)}>
                Edit Configuration
              </button>

              {test.isPublished ? (
                <button onClick={() => deactivateTest(test._id)}>
                  Deactivate
                </button>
              ) : (
                <button onClick={() => publishTest(test._id)}>
                  Publish Test
                </button>
              )}
            </article>
          ))
        )}
      </section>
    </main>
  );
}

export default AdminTestConfiguration;
