import { useState } from "react";
import { getToken } from "../utils/auth";

export default function PostInternship({ token: propToken, onCreated }) {
  const token = propToken || getToken();
  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "Bengaluru",
    workMode: "On-site",
    minCGPA: "",
    requiredSkills: "",
    stipend: "",
    duration: "3 months",
    deadline: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!form.title.trim()) {
      setError("Internship title is required.");
      return;
    }
    if (!form.description.trim()) {
      setError("Internship description is required.");
      return;
    }
    if (!form.deadline) {
      setError("Application deadline is required.");
      return;
    }

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      location: form.location.trim(),
      workMode: form.workMode,
      minCGPA: form.minCGPA === "" ? 0 : Number(form.minCGPA),
      stipend: form.stipend === "" ? 0 : Number(form.stipend),
      duration: form.duration.trim(),
      deadline: form.deadline,
      requiredSkills: form.requiredSkills
        ? form.requiredSkills
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
    };

    setLoading(true);
    try {
      const response = await fetch("/api/internships", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to post internship.");
      }

      setMessage("Internship posted successfully as Active!");
      setForm({
        title: "",
        description: "",
        location: "Bengaluru",
        workMode: "On-site",
        minCGPA: "",
        requiredSkills: "",
        stipend: "",
        duration: "3 months",
        deadline: "",
      });

      if (onCreated) onCreated(data.internship);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <h1>Post New Internship</h1>
      <p>Create and publish a new internship opening for eligible students.</p>

      <form onSubmit={handleSubmit}>
        <label htmlFor="title">Internship Title *</label>
        <input
          id="title"
          name="title"
          placeholder="e.g. Software Engineering Intern"
          value={form.title}
          onChange={handleChange}
          required
        />

        <label htmlFor="description">Job Description *</label>
        <textarea
          id="description"
          name="description"
          rows={5}
          placeholder="Roles, responsibilities, and qualifications..."
          value={form.description}
          onChange={handleChange}
          required
        />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div>
            <label htmlFor="workMode">Work Mode</label>
            <select id="workMode" name="workMode" value={form.workMode} onChange={handleChange}>
              <option value="On-site">On-site</option>
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </div>
          <div>
            <label htmlFor="location">Location</label>
            <input
              id="location"
              name="location"
              placeholder="e.g. Bengaluru, India"
              value={form.location}
              onChange={handleChange}
            />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div>
            <label htmlFor="minCGPA">Minimum CGPA (0 - 10)</label>
            <input
              id="minCGPA"
              name="minCGPA"
              type="number"
              step="0.01"
              min="0"
              max="10"
              placeholder="e.g. 7.5"
              value={form.minCGPA}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="stipend">Monthly Stipend (₹)</label>
            <input
              id="stipend"
              name="stipend"
              type="number"
              min="0"
              placeholder="e.g. 25000 (0 for unpaid)"
              value={form.stipend}
              onChange={handleChange}
            />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div>
            <label htmlFor="duration">Duration</label>
            <input
              id="duration"
              name="duration"
              placeholder="e.g. 3 months, 6 months"
              value={form.duration}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="deadline">Application Deadline *</label>
            <input
              id="deadline"
              name="deadline"
              type="date"
              value={form.deadline}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <label htmlFor="requiredSkills">Required Skills (comma-separated)</label>
        <input
          id="requiredSkills"
          name="requiredSkills"
          placeholder="e.g. React, Node.js, Python, MongoDB"
          value={form.requiredSkills}
          onChange={handleChange}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Posting..." : "Publish Internship Listing"}
        </button>
      </form>

      {message && <output style={{ color: "green", display: "block" }}>{message}</output>}
      {error && <p role="alert" style={{ color: "red" }}>{error}</p>}
    </main>
  );
}
