const test = require("node:test");
const assert = require("node:assert/strict");
const { validateInternshipPayload } = require("./internshipValidation");

test("accepts a valid internship payload", () => {
  assert.equal(
    validateInternshipPayload({
      title: "Frontend Intern",
      description: "Build user interfaces using React and Vite",
      deadline: "2026-11-30",
      minCGPA: 7.5,
      stipend: 15000,
      workMode: "Remote",
      requiredSkills: ["React", "JavaScript", "CSS"],
    }),
    null
  );
});

test("rejects empty title or description", () => {
  assert.ok(validateInternshipPayload({ title: "" }));
  assert.ok(validateInternshipPayload({ description: "   " }));
});

test("rejects invalid minCGPA", () => {
  assert.ok(validateInternshipPayload({ minCGPA: -1 }));
  assert.ok(validateInternshipPayload({ minCGPA: 10.5 }));
  assert.ok(validateInternshipPayload({ minCGPA: "invalid" }));
});

test("rejects negative stipend", () => {
  assert.ok(validateInternshipPayload({ stipend: -500 }));
});

test("rejects invalid workMode", () => {
  assert.ok(validateInternshipPayload({ workMode: "Everywhere" }));
});

test("rejects invalid deadline", () => {
  assert.ok(validateInternshipPayload({ deadline: "not-a-date" }));
});
