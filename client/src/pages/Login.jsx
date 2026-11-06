import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import useAuth from "../context/useAuth";
import AuthCard from "../components/AuthCard";
import { homeFor } from "../utils/auth";

const DEMO = [
  ["Student", "aarav@example.com"],
  ["Company", "northstar@example.com"],
  ["Admin", "admin@example.com"],
];

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || ""}/api/auth/login`,
        { email, password }
      );

      login(response.data.token, response.data.user);
      navigate(homeFor(response.data.user.role), { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to log in. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard title="Welcome back" subtitle="Log in to continue to your dashboard.">
      <form onSubmit={handleSubmit}>
        <label htmlFor="login-email">Email</label>
        <input
          id="login-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          required
        />

        <label htmlFor="login-password">Password</label>
        <input
          id="login-password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          required
        />

        {error && <p role="alert">{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <p style={{ marginTop: "1rem" }}>
        New student? <Link to="/student-register">Register here</Link>
        <br />
        Company recruiter? <Link to="/company-register">Register your company</Link>
      </p>

      <div className="demo-box">
        <strong>Demo accounts</strong> (password: DemoPass123!)
        <div>
          {DEMO.map(([label, mail]) => (
            <button
              type="button"
              className="secondary"
              key={mail}
              onClick={() => {
                setEmail(mail);
                setPassword("DemoPass123!");
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </AuthCard>
  );
}
