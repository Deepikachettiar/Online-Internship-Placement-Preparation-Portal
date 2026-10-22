const test = require("node:test");
const assert = require("node:assert/strict");
const { checkEligibility } = require("./eligibility");

test("marks a student eligible when CGPA and skills meet requirements", () => {
  const result = checkEligibility(
    { cgpa: 8.2, skills: ["React", "Node.js"] },
    { minCGPA: 7.5, requiredSkills: ["react", "node.js"] }
  );
  assert.equal(result.eligible, true);
  assert.deepEqual(result.missingSkills, []);
});

test("reports low CGPA and missing skills", () => {
  const result = checkEligibility(
    { cgpa: 6.1, skills: ["HTML"] },
    { minCGPA: 7, requiredSkills: ["HTML", "React"] }
  );
  assert.equal(result.eligible, false);
  assert.equal(result.cgpa.eligible, false);
  assert.deepEqual(result.missingSkills, ["react"]);
});
