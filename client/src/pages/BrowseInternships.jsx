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

  const limit = 6;

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setError("");
        const response = await fetch(`/api/internships?page=${page}&limit=${limit}`);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Failed to load internships.");
        }
        if (active) {
          setInternships(data.internships || []);
          setPage(data.page || 1);
          setTotalPages(data.totalPages || 1);
          setTotal(data.total || 0);
        }
      } catch (err) {
        if (active) setError(err.message);
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
  }, [page]);

  let content;
  if (loading) {
    content = <p>Loading internships...</p>;
  } else if (internships.length === 0) {
    content = <p>No active internships available at this moment. Check back soon!</p>;
  } else {
    content = (
      <div>
        <p style={{ color: "#64748b", fontSize: "0.9rem" }}>
          Showing {internships.length} of {total} available openings (Page {page} of {totalPages})
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
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            Previous
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
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
      <h1>Explore Internships</h1>
      <p>Discover active internship openings from verified partner companies.</p>

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
