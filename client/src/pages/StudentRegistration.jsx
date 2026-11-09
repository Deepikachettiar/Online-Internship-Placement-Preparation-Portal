import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import AuthCard from "../components/AuthCard";

export default function StudentRegistration() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL || ""}/api/auth/register/student`,
        form
      );
      navigate("/login", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Unable to register. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title="Create student account"
      subtitle="Register to browse internships and practise aptitude tests."
    >
      <form onSubmit={handleSubmit}>
        <label htmlFor="s-name">Full name</label>
        <input id="s-name" name="name" value={form.name} onChange={handleChange} autoComplete="name" required />

        <label htmlFor="s-email">Email</label>
        <input id="s-email" name="email" type="email" value={form.email} onChange={handleChange} autoComplete="email" required />

        <label htmlFor="s-password">Password (minimum 8 characters)</label>
        <input id="s-password" name="password" type="password" minLength={8} value={form.password} onChange={handleChange} autoComplete="new-password" required />

        {error && <p role="alert">{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Creating account..." : "Register"}
        </button>
      </form>
      <p style={{ marginTop: "1rem" }}>
        Already registered? <Link to="/login">Login</Link>
      </p>
    </AuthCard>
  );
}
