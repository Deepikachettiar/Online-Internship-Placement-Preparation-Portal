// Validates payload for creating or updating an internship.
// Returns an error message or null if valid.
function validateInternshipPayload({
  title,
  description,
  deadline,
  minCGPA,
  stipend,
  workMode,
  requiredSkills,
}) {
  if (title !== undefined && (typeof title !== "string" || !title.trim())) {
    return "Title is required.";
  }

  if (description !== undefined && (typeof description !== "string" || !description.trim())) {
    return "Description is required.";
  }

  if (minCGPA !== undefined) {
    const cgpa = Number(minCGPA);
    if (minCGPA === "" || Number.isNaN(cgpa) || cgpa < 0 || cgpa > 10) {
      return "Minimum CGPA must be a number between 0.00 and 10.00.";
    }
  }

  if (stipend !== undefined) {
    const val = Number(stipend);
    if (stipend === "" || Number.isNaN(val) || val < 0) {
      return "Stipend must be a non-negative number.";
    }
  }

  if (workMode !== undefined && !["Remote", "On-site", "Hybrid"].includes(workMode)) {
    return "Work mode must be Remote, On-site, or Hybrid.";
  }

  if (deadline !== undefined) {
    const date = new Date(deadline);
    if (Number.isNaN(date.getTime())) {
      return "Deadline must be a valid date.";
    }
  }

  if (requiredSkills !== undefined && !Array.isArray(requiredSkills)) {
    return "Required skills must be an array of strings.";
  }

  return null;
}

module.exports = { validateInternshipPayload };
