import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function AptitudeTests({ token }) {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadTests() {
      try {
        const response = await fetch("/api/tests", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Unable to load tests.");
        if (active) setTests(data.tests || []);
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadTests();
    return () => { active = false; };
  }, [token]);

  if (loading) return <p>Loading aptitude tests...</p>;
  if (error) return <p role="alert">{error}</p>;

  return (
    <main>
      <h1>Aptitude Tests</h1>
      <p>Pick a test and answer all questions before the timer runs out.</p>

      {tests.length === 0 ? (
        <p>No tests are published yet.</p>
      ) : (
        <div className="test-grid">
          {tests.map((test) => (
            <article key={test._id} className="test-card">
              {test.category && <span className="test-tag">{test.category}</span>}
              <h2>{test.title}</h2>
              {test.description && <p>{test.description}</p>}
              <ul className="test-meta">
                <li>{test.questionCount} questions</li>
                <li>{test.durationMinutes} minutes</li>
              </ul>
              <Link to={`/student/tests/${test._id}`} className="btn">
                Start test
              </Link>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
