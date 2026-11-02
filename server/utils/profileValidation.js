// Checks the academic profile fields sent by a student.
// Returns an error message, or null when everything is valid.
function validateProfile({ department, graduationYear, cgpa }) {
  if (department !== undefined && typeof department !== "string") {
    return "Department must be text.";
  }

  if (graduationYear !== undefined) {
    const year = Number(graduationYear);
    if (!Number.isInteger(year) || year < 2000 || year > 2100) {
      return "Graduation year must be a valid year.";
    }
  }

  if (cgpa !== undefined) {
    const value = Number(cgpa);
    if (cgpa === "" || Number.isNaN(value) || value < 0 || value > 10) {
      return "CGPA must be a number between 0.00 and 10.00.";
    }
  }

  return null;
}

module.exports = { validateProfile };
