function normalizeSkills(skills) {
  if (!Array.isArray(skills)) return [];
  return skills
    .filter((skill) => typeof skill === "string")
    .map((skill) => skill.trim().toLowerCase())
    .filter(Boolean);
}

function checkEligibility(student, internship) {
  const studentCgpa = Number(student?.cgpa ?? 0);
  const minimumCgpa = Number(internship?.minCGPA ?? internship?.minimumCgpa ?? 0);
  const studentSkills = new Set(normalizeSkills(student?.skills));
  const requiredSkills = normalizeSkills(internship?.requiredSkills);

  const missingSkills = requiredSkills.filter((skill) => !studentSkills.has(skill));
  const cgpaEligible = studentCgpa >= minimumCgpa;

  return {
    eligible: cgpaEligible && missingSkills.length === 0,
    cgpa: {
      student: studentCgpa,
      minimum: minimumCgpa,
      eligible: cgpaEligible,
    },
    missingSkills,
    message: !cgpaEligible
      ? `Your CGPA (${studentCgpa}) is below the required CGPA (${minimumCgpa}).`
      : missingSkills.length
        ? `You are missing required skills: ${missingSkills.join(", ")}.`
        : "You meet the eligibility criteria for this internship.",
  };
}

module.exports = { checkEligibility };
