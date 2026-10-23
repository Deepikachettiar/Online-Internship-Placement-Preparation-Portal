const MAX_SKILLS = 30;
const MAX_SKILL_LENGTH = 30;

// Trim, lowercase and collapse extra spaces so "  React  JS" becomes "react js".
function normalizeSkill(skill) {
  if (typeof skill !== "string") return "";
  return skill.trim().toLowerCase().replace(/\s+/g, " ");
}

// Returns an error message, or null when the (normalised) skill is fine.
function validateSkill(skill) {
  if (!skill) return "Skill cannot be empty.";
  if (skill.length > MAX_SKILL_LENGTH) {
    return `Skill must be at most ${MAX_SKILL_LENGTH} characters.`;
  }
  if (!/^[a-z0-9+#. -]+$/.test(skill)) {
    return "Skill can only contain letters, numbers, spaces and + # . -";
  }
  return null;
}

module.exports = { MAX_SKILLS, MAX_SKILL_LENGTH, normalizeSkill, validateSkill };
