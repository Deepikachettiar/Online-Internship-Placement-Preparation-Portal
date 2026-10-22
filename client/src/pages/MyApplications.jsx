import { useEffect, useState } from "react";
import StatusBadge from "../components/StatusBadge";

export default function MyApplications({ token }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadApplications() {
      try {
        const response = await fetch("/api/applications/me", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Unable to load applications.");
        if (active) setApplications(data.applications || []);
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadApplications();
    return () => { active = false; };
  }, [token]);

  if (loading) return <p>Loading your applications...</p>;
  if (error) return <p role="alert">{error}</p>;

  return (
    <main>
      <h1>My Applications</h1>
      {applications.length === 0 ? (
        <p>You have not applied to any internships yet.</p>
      ) : (
        <table>
          <thead>
            <tr><th>Internship</th><th>Company</th><th>Applied on</th><th>Status</th></tr>
          </thead>
          <tbody>
            {applications.map((application) => (
              <tr key={application._id}>
                <td>{application.internship?.title || "Internship"}</td>
                <td>{application.internship?.company || "—"}</td>
                <td>{application.createdAt ? new Date(application.createdAt).toLocaleDateString() : "—"}</td>
                <td><StatusBadge status={application.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
