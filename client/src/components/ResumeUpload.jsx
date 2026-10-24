import { useState } from "react";

const MAX_SIZE = 5 * 1024 * 1024;
const RESUME_API = "/api/students/me/resume";

export default function ResumeUpload({ token, hasResume, onUploaded }) {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  function handleChoose(event) {
    const chosen = event.target.files[0] || null;
    setMessage("");
    setError("");

    if (chosen && chosen.type !== "application/pdf") {
      setFile(null);
      setError("Only PDF files are allowed.");
      return;
    }
    if (chosen && chosen.size > MAX_SIZE) {
      setFile(null);
      setError("Resume must be 5 MB or smaller.");
      return;
    }
    setFile(chosen);
  }

  async function handleUpload(event) {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!file) {
      setError("Please choose a PDF file first.");
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);

    setUploading(true);
    try {
      const response = await fetch(RESUME_API, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Upload failed.");
      setMessage(data.message);
      setFile(null);
      event.target.reset();
      if (onUploaded) onUploaded(data.resumeUrl);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  // The resume needs the login token, so it is fetched and opened as a blob.
  async function handleView() {
    setError("");
    try {
      const response = await fetch(RESUME_API, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) throw new Error("Unable to open your resume.");
      const blob = await response.blob();
      window.open(URL.createObjectURL(blob), "_blank");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section aria-labelledby="resume-heading">
      <h2 id="resume-heading">Resume</h2>
      <p>
        {hasResume
          ? "A resume is uploaded. Choose a new PDF to replace it."
          : "No resume uploaded yet. Upload a PDF (max 5 MB)."}
      </p>

      <form onSubmit={handleUpload}>
        <label htmlFor="resume">Resume (PDF, max 5 MB)</label>
        <input
          id="resume"
          type="file"
          accept="application/pdf,.pdf"
          onChange={handleChoose}
        />
        <button type="submit" disabled={uploading}>
          {uploading ? "Uploading..." : hasResume ? "Replace resume" : "Upload resume"}
        </button>
        {hasResume && (
          <button type="button" onClick={handleView}>
            View resume
          </button>
        )}
      </form>

      {message && <p role="status">{message}</p>}
      {error && <p role="alert">{error}</p>}
    </section>
  );
}
