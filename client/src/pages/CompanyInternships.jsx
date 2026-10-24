import { useEffect, useState } from "react";
import { getToken } from "../utils/auth";

export default function CompanyInternships({ token: propToken }) {
  const token = propToken || getToken();
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    location: "",
    workMode: "On-site",
    minCGPA: "",
    stipend: "",
    duration: "",
    deadline: "",
  });

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const res = await fetch("/api/internships/company/me", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load listings.");
        if (active) setInternships(data.internships || []);
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    }

    void load().catch((err) => {
      if (active) setError(err.message || "Failed to load listings.");
    });

    return () => {
      active = false;
    };
  }, [token]);

  async function handleDeactivate(id) {
    if (!window.confirm("Are you sure you want to deactivate this internship listing?")) {
      return;
    }

    setMessage("");
    setError("");
    try {
      const res = await fetch(`/api/internships/${id}/deactivate`, {
        method: "PATCH",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Unable to deactivate listing.");

      setMessage("Internship listing has been deactivated.");
      setInternships((prev) =>
        prev.map((item) => (item._id === id ? { ...item, status: "Inactive" } : item))
      );
    } catch (err) {
      setError(err.message);
    }
  }

  function startEdit(item) {
    setEditingId(item._id);
    setEditForm({
      title: item.title || "",
      description: item.description || "",
      location: item.location || "",
      workMode: item.workMode || "On-site",
      minCGPA: item.minCGPA ?? "",
      stipend: item.stipend ?? "",
      duration: item.duration || "",
      deadline: item.deadline ? item.deadline.slice(0, 10) : "",
    });
  }

  async function handleSaveEdit(e) {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const res = await fetch(`/api/internships/${editingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          ...editForm,
          minCGPA: editForm.minCGPA === "" ? 0 : Number(editForm.minCGPA),
          stipend: editForm.stipend === "" ? 0 : Number(editForm.stipend),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update internship.");

      setMessage("Internship updated successfully.");
      setEditingId(null);
      setInternships((prev) =>
        prev.map((item) => (item._id === editingId ? data.internship : item))
      );
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <p>Loading your company listings...</p>;

  return (
    <main>
      <h1>Manage Posted Internships</h1>
      <p>View, modify, or deactivate your active internship postings.</p>

      {message && <output style={{ color: "green", display: "block" }}>{message}</output>}
      {error && <p role="alert" style={{ color: "red" }}>{error}</p>}

      {editingId && (
        <section
          style={{
            border: "2px solid #3b82f6",
            padding: "1rem",
            borderRadius: "6px",
            marginBottom: "1.5rem",
          }}
        >
          <h3>Edit Internship Listing</h3>
          <form onSubmit={handleSaveEdit}>
            <label htmlFor="edit-title">Title</label>
            <input
              id="edit-title"
              value={editForm.title}
              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              required
            />

            <label htmlFor="edit-desc">Description</label>
            <textarea
              id="edit-desc"
              rows={3}
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              required
            />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label htmlFor="edit-location">Location</label>
                <input
                  id="edit-location"
                  value={editForm.location}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="edit-workMode">Work Mode</label>
                <select
                  id="edit-workMode"
                  value={editForm.workMode}
                  onChange={(e) => setEditForm({ ...editForm, workMode: e.target.value })}
                >
                  <option value="On-site">On-site</option>
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label htmlFor="edit-cgpa">Min CGPA</label>
                <input
                  id="edit-cgpa"
                  type="number"
                  step="0.01"
                  value={editForm.minCGPA}
                  onChange={(e) => setEditForm({ ...editForm, minCGPA: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="edit-stipend">Stipend (₹)</label>
                <input
                  id="edit-stipend"
                  type="number"
                  value={editForm.stipend}
                  onChange={(e) => setEditForm({ ...editForm, stipend: e.target.value })}
                />
              </div>
            </div>

            <label htmlFor="edit-deadline">Deadline</label>
            <input
              id="edit-deadline"
              type="date"
              value={editForm.deadline}
              onChange={(e) => setEditForm({ ...editForm, deadline: e.target.value })}
              required
            />

            <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem" }}>
              <button type="submit">Save Changes</button>
              <button type="button" onClick={() => setEditingId(null)}>
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      {internships.length === 0 ? (
        <p>No internships posted yet.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "1rem" }}>
          <thead>
            <tr style={{ background: "#f8fafc", textAlign: "left" }}>
              <th style={{ padding: "0.75rem", borderBottom: "2px solid #e2e8f0" }}>Title</th>
              <th style={{ padding: "0.75rem", borderBottom: "2px solid #e2e8f0" }}>Mode</th>
              <th style={{ padding: "0.75rem", borderBottom: "2px solid #e2e8f0" }}>Stipend</th>
              <th style={{ padding: "0.75rem", borderBottom: "2px solid #e2e8f0" }}>Deadline</th>
              <th style={{ padding: "0.75rem", borderBottom: "2px solid #e2e8f0" }}>Status</th>
              <th style={{ padding: "0.75rem", borderBottom: "2px solid #e2e8f0" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {internships.map((item) => (
              <tr key={item._id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                <td style={{ padding: "0.75rem" }}>
                  <strong>{item.title}</strong>
                  <div style={{ fontSize: "0.85rem", color: "#64748b" }}>{item.location}</div>
                </td>
                <td style={{ padding: "0.75rem" }}>{item.workMode || "On-site"}</td>
                <td style={{ padding: "0.75rem" }}>{item.stipend ? `₹${item.stipend}` : "Unpaid"}</td>
                <td style={{ padding: "0.75rem" }}>
                  {item.deadline ? new Date(item.deadline).toLocaleDateString() : "—"}
                </td>
                <td style={{ padding: "0.75rem" }}>
                  <span
                    style={{
                      padding: "0.2rem 0.5rem",
                      borderRadius: "4px",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      color: item.status === "Active" ? "#15803d" : "#b91c1c",
                      background: item.status === "Active" ? "#dcfce7" : "#fee2e2",
                    }}
                  >
                    {item.status || "Active"}
                  </span>
                </td>
                <td style={{ padding: "0.75rem" }}>
                  <button
                    onClick={() => startEdit(item)}
                    style={{ marginRight: "0.5rem" }}
                  >
                    Edit
                  </button>
                  {item.status === "Active" && (
                    <button
                      onClick={() => handleDeactivate(item._id)}
                      style={{ color: "#dc2626" }}
                    >
                      Deactivate
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
