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
      {tests.length === 0 ? (
        <p>No tests are published yet.</p>
      ) : (
        <ul>
          {tests.map((test) => (
            <li key={test._id}>
              <h2>{test.title}</h2>
              {test.description && <p>{test.description}</p>}
              <p>Time limit: {test.durationMinutes} minutes</p>
              <Link to={`/student/tests/${test._id}`}>Take test</Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
