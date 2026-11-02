import { useState } from "react";

export default function CompanyRegistration() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    companyName: "",
    websiteDomain: "",
    contactDetails: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/register/company`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Company registration failed.");
      }

      setMessage(
        data.message || "Registration successful. Pending approval."
      );

      setForm({
        name: "",
        email: "",
        password: "",
        companyName: "",
        websiteDomain: "",
        contactDetails: "",
      });
    } catch (err) {
      setError(err.message || "Unable to register company.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="company-registration">
      <h1>Company Registration</h1>
      <p>Register your organisation to access the placement portal.</p>

      <form
        className="company-registration-form"
        onSubmit={handleSubmit}
      >
        <label htmlFor="name">Recruiter name</label>
        <input
          id="name"
          name="name"
          autoComplete="name"
          value={form.name}
          onChange={handleChange}
          required
        />

        <label htmlFor="email">Corporate email</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={handleChange}
          required
        />

        <label htmlFor="password">
          Password (minimum 8 characters)
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          value={form.password}
          onChange={handleChange}
          required
        />

        <label htmlFor="companyName">Company name</label>
        <input
          id="companyName"
          name="companyName"
          autoComplete="organization"
          value={form.companyName}
          onChange={handleChange}
          required
        />

        <label htmlFor="websiteDomain">
          Company website domain
        </label>
        <input
          id="websiteDomain"
          name="websiteDomain"
          type="text"
          placeholder="example.com"
          value={form.websiteDomain}
          onChange={handleChange}
          required
        />

        <label htmlFor="contactDetails">Contact details</label>
        <input
          id="contactDetails"
          name="contactDetails"
          value={form.contactDetails}
          onChange={handleChange}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Registering..." : "Register company"}
        </button>
      </form>

      {message && (
        <p className="registration-success" role="status">
          {message}
        </p>
      )}

      {error && (
        <p className="registration-error" role="alert">
          {error}
        </p>
      )}
    </main>
  );
}