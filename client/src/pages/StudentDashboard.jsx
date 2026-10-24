import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getToken } from "../utils/auth";

const STATUSES = ["Applied", "Under Review", "Shortlisted", "Rejected", "Selected"];

function getStudentName() {
  try {
    return JSON.parse(localStorage.getItem("user"))?.name || "Student";
  } catch {
    return "Student";
  }
}

export default function StudentDashboard() {
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadApplications() {
      try {
        const token = getToken();
        const response = await fetch("/api/applications/me", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Unable to load applications.");
        if (active) setApplications(data.applications || []);
      } catch (err) {
        if (active) setError(err.message);
      }
    }

    loadApplications();
    return () => { active = false; };
  }, []);

  return (
    <main>
      <h1>Welcome, {getStudentName()}</h1>
      <p>Keep your profile and resume up to date, then browse and apply for internships.</p>

      <section aria-labelledby="status-heading">
        <h2 id="status-heading">My applications</h2>
        {error && <p role="alert">{error}</p>}
        <div className="dashboard-cards">
          {STATUSES.map((status) => (
            <div className="dashboard-card" key={status}>
              <strong>{applications.filter((app) => app.status === status).length}</strong>
              {status}
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="quick-heading">
        <h2 id="quick-heading">Quick links</h2>
        <div className="dashboard-links">
          <Link to="/student/profile">Update profile, skills and resume</Link>
          <Link to="/student/internships">Browse internships</Link>
          <Link to="/student/applications">Track applications</Link>
        </div>
      </section>
    </main>
  );
}
