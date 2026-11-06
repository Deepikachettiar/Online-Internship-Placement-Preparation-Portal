import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getToken } from "../utils/auth";

export default function CompanyDashboard() {
  const [profile, setProfile] = useState(null);
  const [internships, setInternships] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const headers = { Authorization: `Bearer ${getToken()}` };
    Promise.all([
      fetch("/api/companies/me", { headers }).then((r) => r.json()),
      fetch("/api/internships/company/me", { headers }).then((r) => r.json()),
    ])
      .then(([p, i]) => {
        setProfile(p.profile || null);
        setInternships(i.internships || []);
      })
      .catch(() => setError("Unable to load your dashboard."));
  }, []);

  const active = internships.filter((i) => i.status === "Active").length;

  return (
    <main>
      <h1>Welcome, {profile?.companyName || profile?.name || "Recruiter"}</h1>
      <p>Post internships, review applicants and shortlist candidates.</p>
      {error && <p role="alert">{error}</p>}

      {profile && !profile.companyApproved && (
        <p role="alert">
          Your company is pending admin approval. Your listings become visible
          to students once approved.
        </p>
      )}

      <div className="dashboard-cards">
        <div className="dashboard-card"><strong>{internships.length}</strong>Total listings</div>
        <div className="dashboard-card"><strong>{active}</strong>Active listings</div>
        <div className="dashboard-card">
          <strong>{profile?.companyApproved ? "Approved" : "Pending"}</strong>Approval status
        </div>
      </div>

      <section>
        <h2>Quick links</h2>
        <div className="dashboard-links">
          <Link to="/company/post">Post a new internship</Link>
          <Link to="/company/internships">Manage listings and applicants</Link>
          <Link to="/company/profile">Edit company profile</Link>
        </div>
      </section>
    </main>
  );
}
