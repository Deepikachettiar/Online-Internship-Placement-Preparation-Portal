import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

// Strong is 75% or more, weak is below 50% (same rule as the server)
function topicLabel(accuracy) {
  if (accuracy >= 75) return "Strong";
  if (accuracy < 50) return "Weak";
  return "Average";
}

export default function Analytics({ token }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadAnalytics() {
      try {
        const response = await fetch("/api/tests/analytics/me", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const body = await response.json();
        if (!response.ok) throw new Error(body.message || "Unable to load analytics.");
        if (active) setData(body);
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadAnalytics();
    return () => { active = false; };
  }, [token]);

  if (loading) return <p>Loading your analytics...</p>;
  if (error) return <p role="alert">{error}</p>;

  if (!data || data.totalAttempts === 0) {
    return (
      <main>
        <h1>My Preparation Analytics</h1>
        <p>You have not taken any aptitude tests yet.</p>
        <Link to="/student/tests">Take your first test</Link>
      </main>
    );
  }

  const topics = Object.entries(data.categoryBreakdown || {});

  return (
    <main>
      <h1>My Preparation Analytics</h1>
      <p>
        Tests taken: {data.totalAttempts} | Average score: {data.averageScore} | Overall
        accuracy: {data.overallAccuracy}%
      </p>

      <section aria-labelledby="history-heading">
        <h2 id="history-heading">Past scores</h2>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {data.scoreHistory.map((item, index) => (
            <li key={index} style={{ margin: "6px 0" }}>
              <span>
                {item.title} ({item.date ? new Date(item.date).toLocaleDateString() : "—"}):{" "}
                {item.score}/{item.totalQuestions} ({item.percentage}%)
              </span>
              <div
                role="img"
                aria-label={`${item.percentage} percent`}
                style={{ background: "#e5e7eb", height: 12, width: "100%", maxWidth: 400 }}
              >
                <div
                  style={{
                    background: "#2563eb",
                    height: "100%",
                    width: `${Math.min(item.percentage, 100)}%`,
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="topics-heading">
        <h2 id="topics-heading">Category breakdown</h2>
        <table>
          <thead>
            <tr>
              <th>Category</th>
              <th>Correct</th>
              <th>Accuracy</th>
              <th>Level</th>
            </tr>
          </thead>
          <tbody>
            {topics.map(([name, topic]) => (
              <tr key={name}>
                <td>{name}</td>
                <td>{topic.correct} / {topic.total}</td>
                <td>{topic.accuracy}%</td>
                <td>{topicLabel(topic.accuracy)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p>Strong topics: {data.strongTopics.length ? data.strongTopics.join(", ") : "None yet"}</p>
        <p>Weak topics: {data.weakTopics.length ? data.weakTopics.join(", ") : "None"}</p>
      </section>
    </main>
  );
}
