import { useEffect, useState } from "react";
import { getToken } from "../utils/auth";

export default function CompanyProfile({ token: propToken }) {
  const token = propToken || getToken();
  const [form, setForm] = useState({
    companyName: "",
    companyDescription: "",
    industry: "",
    location: "",
    website: "",
    logoUrl: "",
  });
  const [isApproved, setIsApproved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  useEffect(() => {
    let active = true;

    async function loadCompanyProfile() {
      try {
        const response = await fetch("/api/companies/me", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Unable to load company profile.");
        }
        if (active && data.profile) {
          setForm({
            companyName: data.profile.companyName || "",
            companyDescription: data.profile.companyDescription || "",
            industry: data.profile.industry || "",
            location: data.profile.location || "",
            website: data.profile.website || "",
            logoUrl: data.profile.logoUrl || "",
          });
          setIsApproved(Boolean(data.profile.companyApproved));
        }
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadCompanyProfile();
    return () => {
      active = false;
    };
  }, [token]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!form.companyName.trim()) {
      setError("Company name is required.");
      return;
    }

    try {
      const response = await fetch("/api/companies/me", {
        method: "PUT",
        headers,
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Unable to save company profile.");
      }
      setMessage(data.message || "Company profile saved successfully.");
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <p>Loading company profile...</p>;

  return (
    <main>
      <h1>Company Profile</h1>
      <p>
        Status:{" "}
        <strong style={{ color: isApproved ? "green" : "#d97706" }}>
          {isApproved ? "Approved" : "Pending Verification"}
        </strong>
      </p>

      {form.logoUrl && (
        <div style={{ marginBottom: "1rem" }}>
          <img
            src={form.logoUrl}
            alt={`${form.companyName || "Company"} Logo`}
            style={{ maxHeight: "80px", maxWidth: "200px", objectFit: "contain" }}
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <label htmlFor="companyName">Company Name *</label>
        <input
          id="companyName"
          name="companyName"
          value={form.companyName}
          onChange={handleChange}
          required
        />

        <label htmlFor="industry">Industry</label>
        <input
          id="industry"
          name="industry"
          placeholder="e.g. Information Technology, FinTech"
          value={form.industry}
          onChange={handleChange}
        />

        <label htmlFor="location">Headquarters Location</label>
        <input
          id="location"
          name="location"
          placeholder="e.g. Bengaluru, India"
          value={form.location}
          onChange={handleChange}
        />

        <label htmlFor="website">Website</label>
        <input
          id="website"
          name="website"
          type="url"
          placeholder="https://example.com"
          value={form.website}
          onChange={handleChange}
        />

        <label htmlFor="logoUrl">Logo Image URL</label>
        <input
          id="logoUrl"
          name="logoUrl"
          type="url"
          placeholder="https://example.com/logo.png"
          value={form.logoUrl}
          onChange={handleChange}
        />

        <label htmlFor="companyDescription">About Company</label>
        <textarea
          id="companyDescription"
          name="companyDescription"
          rows={4}
          placeholder="Brief description about the company, mission, and work culture..."
          value={form.companyDescription}
          onChange={handleChange}
        />

        <button type="submit">Save Company Profile</button>
      </form>

      {message && <p role="status" style={{ color: "green" }}>{message}</p>}
      {error && <p role="alert" style={{ color: "red" }}>{error}</p>}
    </main>
  );
}
