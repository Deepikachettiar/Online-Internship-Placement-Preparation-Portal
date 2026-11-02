// Rules for the student resume upload (issue #10): PDF only, max 5 MB.
const MAX_RESUME_SIZE = 5 * 1024 * 1024;

function validateResumeFile(file) {
  if (!file) return "Please choose a PDF file to upload.";

  const name = String(file.originalname || "").toLowerCase();
  if (file.mimetype !== "application/pdf" || !name.endsWith(".pdf")) {
    return "Only PDF files are allowed.";
  }

  if (file.size > MAX_RESUME_SIZE) {
    return "Resume must be 5 MB or smaller.";
  }

  // Every real PDF starts with "%PDF-", so a renamed file is rejected.
  if (!file.buffer || file.buffer.subarray(0, 5).toString() !== "%PDF-") {
    return "The file is not a valid PDF.";
  }

  return null;
}

module.exports = { MAX_RESUME_SIZE, validateResumeFile };
