import { useState } from "react";

// Applies to an internship using the resume saved on the student's profile.
export default function ApplyButton({ internshipId, token, onApplied }) {
  const [message, setMessage] = useState("");
  const [ok, setOk] = useState(false);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function apply() {
    setBusy(true);
    setMessage("");
    setOk(false);

    const headers = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    try {
      const me = await fetch("/api/students/me", { headers }).then((r) => r.json());
      const resumeUrl = me.profile?.resumeUrl;

      if (!resumeUrl) {
        setMessage("Upload your resume on the My Profile page before applying.");
        return;
      }

      const response = await fetch("/api/applications", {
        method: "POST",
        headers,
        body: JSON.stringify({ internshipId, resumeUrl }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Application failed.");

      setOk(true);
      setDone(true);
      setMessage(data.message || "Application submitted successfully.");
      if (onApplied) onApplied();
    } catch (error) {
      setMessage(error.message || "Unable to submit application.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <button type="button" onClick={apply} disabled={busy || done}>
        {busy ? "Submitting..." : done ? "Applied ✓" : "Apply now"}
      </button>
      {message && (ok ? <p role="status">{message}</p> : <p role="alert">{message}</p>)}
    </div>
  );
}
