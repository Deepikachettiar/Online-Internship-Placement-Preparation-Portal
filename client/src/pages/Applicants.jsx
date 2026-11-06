import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import StatusBadge from "../components/StatusBadge";
import { getToken } from "../utils/auth";

export default function Applicants({ internshipId: propId, token: propToken }) {
  const params = useParams();
  const internshipId = propId || params.id;
  const token = propToken || getToken();

  const [applications, setApplications] = useState([]);
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      if (!internshipId) {
        if (active) {
          setError("An internship ID is required.");
          setLoading(false);
        }
        return;
      }
      try {
        const response = await fetch(`/api/internships/${internshipId}/applications`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Unable to load applicants.");
        if (active) {
          setApplications(data.applications || []);
          setTitle(data.internship?.title || "");
        }
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();

    return () => { active = false; };
  }, [internshipId, token]);

  async function openResume(applicationId) {
    try {
      const response = await fetch(`/api/resumes/${applicationId}/file`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Unable to open resume.");
      }
      const blob = await response.blob();
      window.open(URL.createObjectURL(blob), "_blank", "noopener,noreferrer");
    } catch (err) {
      setError(err.message);
    }
  }

  async function setStatus(id, status) {
    setError("");
    setMessage("");
    try {
      const response = await fetch(`/api/applications/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to update status.");
      setApplications((prev) => prev.map((a) => (a._id === id ? { ...a, status } : a)));
      setMessage(`Application marked as ${status}. The student has been notified.`);
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <main><p>Loading applicants...</p></main>;

  return (
    <main>
      <p><Link to="/company/internships">← Back to listings</Link></p>
      <h1>Applicants{title ? ` – ${title}` : ""}</h1>
      {message && <output>{message}</output>}
      {error && <p role="alert">{error}</p>}
      {applications.length === 0 ? <p>No applications yet.</p> : (
        <table>
          <thead>
            <tr><th>Applicant</th><th>Email</th><th>CGPA</th><th>Skills</th><th>Status</th><th>Resume</th><th>Decision</th></tr>
          </thead>
          <tbody>
            {applications.map((application) => (
              <tr key={application._id}>
                <td>{application.student?.name || "Student"}</td>
                <td>{application.student?.email || "—"}</td>
                <td>{application.student?.cgpa ?? "—"}</td>
                <td>{(application.student?.skills || []).join(", ") || "—"}</td>
                <td><StatusBadge status={application.status} /></td>
                <td><button className="secondary" onClick={() => openResume(application._id)}>Open resume</button></td>
                <td>
                  <div className="admin-actions">
                    <button onClick={() => setStatus(application._id, "Shortlisted")}>Shortlist</button>
                    <button onClick={() => setStatus(application._id, "Selected")}>Select</button>
                    <button className="secondary" onClick={() => setStatus(application._id, "Rejected")}>Reject</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
