import { useEffect, useState } from "react";
import SkillTags from "../components/SkillTags";

export default function StudentProfile({ token }) {
  const [form, setForm] = useState({ department: "", graduationYear: "", cgpa: "" });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        const response = await fetch("/api/students/me", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Unable to load profile.");
        if (active) {
          setForm({
            department: data.profile.department || "",
            graduationYear: data.profile.graduationYear ?? "",
            cgpa: data.profile.cgpa ?? "",
          });
        }
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProfile();
    return () => { active = false; };
  }, [token]);

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setError("");

    const cgpa = Number(form.cgpa);
    if (form.cgpa === "" || Number.isNaN(cgpa) || cgpa < 0 || cgpa > 10) {
      setError("CGPA must be between 0.00 and 10.00.");
      return;
    }

    try {
      const response = await fetch("/api/students/me", {
        method: "PUT",
        headers,
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to save profile.");
      setMessage(data.message || "Profile saved.");
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <p>Loading your profile...</p>;

  return (
    <main>
      <h1>My Academic Profile</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="department">Department</label>
        <input id="department" name="department" value={form.department} onChange={handleChange} />

        <label htmlFor="graduationYear">Graduation year</label>
        <input
          id="graduationYear"
          name="graduationYear"
          type="number"
          value={form.graduationYear}
          onChange={handleChange}
        />

        <label htmlFor="cgpa">CGPA (0.00 to 10.00)</label>
        <input
          id="cgpa"
          name="cgpa"
          type="number"
          step="0.01"
          min="0"
          max="10"
          value={form.cgpa}
          onChange={handleChange}
        />

        <button type="submit">Save profile</button>
      </form>
      {message && <p role="status">{message}</p>}
      {error && <p role="alert">{error}</p>}

      <SkillTags token={token} />
    </main>
  );
}
