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

  const limit = 6;

  async function fetchInternships(targetPage = 1) {
    try {
      setLoading(true);
      setError("");
      const response = await fetch(`/api/internships?page=${targetPage}&limit=${limit}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to load internships.");
      }
      setInternships(data.internships || []);
      setPage(data.page || 1);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchInternships(page);
  }, [page]);

  return (
    <main>
      <h1>Explore Internships</h1>
      <p>Discover active internship openings from verified partner companies.</p>

      {error && <p role="alert" style={{ color: "red" }}>{error}</p>}

      {loading ? (
        <p>Loading internships...</p>
      ) : internships.length === 0 ? (
        <p>No active internships available at this moment. Check back soon!</p>
      ) : (
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
                  alert("Application submitted successfully!");
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
      )}
    </main>
  );
}
