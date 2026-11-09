import { useEffect, useState } from "react";
import { getToken } from "../utils/auth";

const API = import.meta.env.VITE_API_URL || "";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    students: 0,
    companies: 0,
    pendingApprovals: 0,
    applications: 0,
  });
  const [companies, setCompanies] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const headers = {
    Authorization: `Bearer ${getToken()}`,
    "Content-Type": "application/json",
  };

  async function loadDashboard() {
    try {
      setError("");

      const responses = await Promise.all([
        fetch(`${API}/api/admin/dashboard`, { headers }),
        fetch(`${API}/api/admin/companies/pending`, { headers }),
        fetch(`${API}/api/admin/users`, { headers }),
      ]);

      for (const response of responses) {
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || "Unable to load dashboard.");
        }
      }

      const [statsData, companiesData, usersData] = await Promise.all(
        responses.map((response) => response.json())
      );

      setStats(statsData);
      setCompanies(companiesData.companies || []);
      setUsers(usersData.users || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadDashboard();
  }, []);

  async function updateCompany(id, approved) {
    try {
      const response = await fetch(
        `${API}/api/admin/companies/${id}/approval`,
        {
          method: "PATCH",
          headers,
          body: JSON.stringify({ approved }),
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Update failed.");

      await loadDashboard();
    } catch (err) {
      setError(err.message);
    }
  }

  async function updateUser(id, isActive) {
    try {
      const response = await fetch(`${API}/api/admin/users/${id}/status`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ isActive }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Update failed.");

      await loadDashboard();
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) {
    return <main><p>Loading admin dashboard...</p></main>;
  }

  return (
    <main className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      <p>Manage users, company approvals and portal activity.</p>

      {error && <p role="alert">{error}</p>}

      <section>
        <h2>Platform Overview</h2>
        <div className="dashboard-cards">
          {[
            ["Students", stats.students],
            ["Companies", stats.companies],
            ["Pending Approvals", stats.pendingApprovals],
            ["Applications", stats.applications],
          ].map(([label, value]) => (
            <div className="dashboard-card" key={label}>
              <strong>{value}</strong>
              {label}
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2>Pending Company Approvals</h2>
        {companies.length === 0 ? (
          <p>No pending company approvals.</p>
        ) : (
          companies.map((company) => (
            <article className="admin-list-item" key={company._id}>
              <div>
                <strong>{company.companyName || company.name}</strong>
                <p>{company.email}</p>
                <p>{company.industry || "Industry not specified"}</p>
              </div>
              <div className="admin-actions">
                <button onClick={() => updateCompany(company._id, true)}>
                  Approve
                </button>
                <button onClick={() => updateCompany(company._id, false)}>
                  Reject
                </button>
              </div>
            </article>
          ))
        )}
      </section>

      <section>
        <h2>User Management</h2>
        {users.length === 0 ? (
          <p>No users found.</p>
        ) : (
          users.map((user) => (
            <article className="admin-list-item" key={user._id}>
              <div>
                <strong>{user.name || user.companyName}</strong>
                <p>{user.email} · {user.role}</p>
                <p>Status: {user.isActive ? "Active" : "Inactive"}</p>
              </div>
              <button onClick={() => updateUser(user._id, !user.isActive)}>
                {user.isActive ? "Deactivate" : "Activate"}
              </button>
            </article>
          ))
        )}
      </section>

      <button onClick={loadDashboard}>Refresh Dashboard</button>
    </main>
  );
}