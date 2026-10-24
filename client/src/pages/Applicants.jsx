import { useEffect, useState } from "react";

export default function Applicants({ internshipId, token }) {
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState("");
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
        if (active) setApplications(data.applications || []);
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
      const response = await fetch(`/api/resumes/${applicationId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to open resume.");
      window.open(data.resumeUrl, "_blank", "noopener,noreferrer");
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <p>Loading applicants...</p>;

  return (
    <main>
      <h1>Applicants</h1>
      {error && <p role="alert">{error}</p>}
      {applications.length === 0 ? <p>No applications yet.</p> : (
        <table>
          <thead><tr><th>Applicant</th><th>Email</th><th>CGPA</th><th>Skills</th><th>Resume</th></tr></thead>
          <tbody>
            {applications.map((application) => (
              <tr key={application._id}>
                <td>{application.student?.name || "Student"}</td>
                <td>{application.student?.email || "—"}</td>
                <td>{application.student?.cgpa ?? "—"}</td>
                <td>{(application.student?.skills || []).join(", ") || "—"}</td>
                <td><button onClick={() => openResume(application._id)}>Open resume</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
