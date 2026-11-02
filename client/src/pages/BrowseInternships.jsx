import { useEffect, useState } from "react";
import InternshipCard from "../components/InternshipCard";
import { getToken } from "../utils/auth";

export default function BrowseInternships({ token: propToken }) {
  const token = propToken || getToken();
  const [internships, setInternships] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [appliedMessage, setAppliedMessage] = useState("");

  // Search and filter states (issue #17)
  const [search, setSearch] = useState("");
  const [skill, setSkill] = useState("");
  const [location, setLocation] = useState("");
  const [workMode, setWorkMode] = useState("");
  const [minStipend, setMinStipend] = useState("");
  const [activeFilters, setActiveFilters] = useState({
    search: "",
    skill: "",
    location: "",
    workMode: "",
    minStipend: "",
  });

  const limit = 6;

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setError("");
        const params = new URLSearchParams({
          page: String(page),
          limit: String(limit),
        });

        if (activeFilters.search.trim()) params.set("search", activeFilters.search.trim());
        if (activeFilters.skill.trim()) params.set("skill", activeFilters.skill.trim());
        if (activeFilters.location.trim()) params.set("location", activeFilters.location.trim());
        if (activeFilters.workMode) params.set("workMode", activeFilters.workMode);
        if (activeFilters.minStipend) params.set("minStipend", activeFilters.minStipend);

        const response = await fetch(`/api/internships?${params.toString()}`);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Failed to load internships.");
        }
        if (active) {
          setInternships(data.internships || []);
          setTotalPages(data.totalPages || 1);
          setTotal(data.total || 0);
        }
      } catch (err) {
        if (active) setError(err.message || "Failed to load internships.");
      } finally {
        if (active) setLoading(false);
      }
    }

    void load().catch((err) => {
      if (active) setError(err.message || "Failed to load internships.");
    });

    return () => {
      active = false;
    };
  }, [page, activeFilters]);

  function handleFilterSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setPage(1);
    setActiveFilters({
      search,
      skill,
      location,
      workMode,
      minStipend,
    });
  }

  function handleReset() {
    setSearch("");
    setSkill("");
    setLocation("");
    setWorkMode("");
    setMinStipend("");
    setLoading(true);
    setPage(1);
    setActiveFilters({
      search: "",
      skill: "",
      location: "",
      workMode: "",
      minStipend: "",
    });
  }

  let content;
  if (loading) {
    content = <p>Searching internships...</p>;
  } else if (internships.length === 0) {
    content = <p>No internships matched your search criteria. Try clearing some filters!</p>;
  } else {
    content = (
      <div>
        <p style={{ color: "#64748b", fontSize: "0.9rem" }}>
          Found {total} internship{total === 1 ? "" : "s"} (Page {page} of {totalPages})
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {internships.map((internship) => (
            <InternshipCard
              key={internship._id}
              internship={internship}
              studentToken={token}
              onApplied={() => {
                setAppliedMessage("Application submitted successfully!");
              }}
            />
          ))}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "1rem",
            marginTop: "2rem",
          }}
        >
          <button
            onClick={() => {
              setLoading(true);
              setPage((p) => Math.max(1, p - 1));
            }}
            disabled={page <= 1}
          >
            Previous
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => {
              setLoading(true);
              setPage((p) => Math.min(totalPages, p + 1));
            }}
            disabled={page >= totalPages}
          >
            Next
          </button>
        </div>
      </div>
    );
  }

  return (
    <main>
      <h1>Search & Browse Internships</h1>
      <p>Discover and filter active internship openings from verified partner companies.</p>

      {/* Search Bar & Filter Panel (Issue #17) */}
      <section
        style={{
          background: "#f8fafc",
          border: "1px solid #e2e8f0",
          borderRadius: "8px",
          padding: "1.25rem",
          marginBottom: "1.5rem",
        }}
      >
        <form onSubmit={handleFilterSubmit}>
          <div style={{ marginBottom: "0.75rem" }}>
            <label htmlFor="search-input" style={{ fontWeight: 600 }}>
              Keyword Search
            </label>
            <input
              id="search-input"
              type="search"
              placeholder="Search by job title, skill keywords, or company description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: "100%", padding: "0.5rem" }}
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "0.75rem",
              marginBottom: "1rem",
            }}
          >
            <div>
              <label htmlFor="skill-filter">Required Skill</label>
              <input
                id="skill-filter"
                placeholder="e.g. React, Python"
                value={skill}
                onChange={(e) => setSkill(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="location-filter">Location</label>
              <input
                id="location-filter"
                placeholder="e.g. Bengaluru, Remote"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="workmode-filter">Work Mode</label>
              <select
                id="workmode-filter"
                value={workMode}
                onChange={(e) => setWorkMode(e.target.value)}
              >
                <option value="">All Modes</option>
                <option value="On-site">On-site</option>
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
            <div>
              <label htmlFor="stipend-filter">Min Monthly Stipend (₹)</label>
              <input
                id="stipend-filter"
                type="number"
                placeholder="e.g. 10000"
                value={minStipend}
                onChange={(e) => setMinStipend(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button type="submit">Apply Search & Filters</button>
            <button type="button" onClick={handleReset} style={{ background: "#94a3b8" }}>
              Clear All
            </button>
          </div>
        </form>
      </section>

      {appliedMessage && (
        <output style={{ color: "green", display: "block", marginBottom: "1rem" }}>
          {appliedMessage}
        </output>
      )}
      {error && <p role="alert" style={{ color: "red" }}>{error}</p>}

      {content}
    </main>
  );
}
