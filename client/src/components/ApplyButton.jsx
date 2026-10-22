import { useState } from "react";

export default function ApplyButton({ internshipId, resumeUrl, token }) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function apply() {
    if (!resumeUrl) {
      setMessage("Upload your resume before applying.");
      return;
    }

    setBusy(true);
    setMessage("");

    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ internshipId, resumeUrl }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Application failed.");
      setMessage(data.message || "Application submitted successfully.");
    } catch (error) {
      setMessage(error.message || "Unable to submit application.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <button type="button" onClick={apply} disabled={busy}>
        {busy ? "Submitting..." : "Apply now"}
      </button>
      {message && <p role="status">{message}</p>}
    </div>
  );
}
