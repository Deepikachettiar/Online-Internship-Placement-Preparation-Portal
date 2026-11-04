const test = require("node:test");
const assert = require("node:assert/strict");
const { performance } = require("perf_hooks");
const { checkEligibility } = require("../utils/eligibility");
const { calculateTestScore } = require("../utils/scoring");

test("OIP-NF-001: Eligibility check algorithm executes within 100ms", () => {
  const student = {
    cgpa: 8.5,
    skills: ["javascript", "react", "node.js", "mongodb", "git", "express", "html", "css", "docker"],
  };

  const internship = {
    minCGPA: 7.5,
    requiredSkills: ["react", "node.js", "javascript"],
  };

  const start = performance.now();
  for (let i = 0; i < 1000; i++) {
    checkEligibility(student, internship);
  }
  const end = performance.now();
  const totalDuration = end - start;
  const avgDuration = totalDuration / 1000;

  // Average time per eligibility check should be well under 1ms, and 1000 checks under 100ms
  assert.ok(avgDuration < 1.0, `Average execution time ${avgDuration}ms exceeds 1.0ms`);
  assert.ok(totalDuration < 100, `Total 1000 runs duration ${totalDuration}ms exceeds 100ms`);
});

test("OIP-NF-001: Aptitude test scoring executes within 50ms for 50 questions", () => {
  const questions = Array.from({ length: 50 }, (_, i) => ({
    _id: `q_${i}`,
    category: i % 3 === 0 ? "Quant" : i % 3 === 1 ? "Logical" : "Verbal",
    answer: `Answer_${i}`,
  }));

  const answers = {};
  for (let i = 0; i < 50; i++) {
    answers[`q_${i}`] = i % 2 === 0 ? `Answer_${i}` : "Wrong";
  }

  const start = performance.now();
  const result = calculateTestScore(questions, answers);
  const end = performance.now();
  const duration = end - start;

  assert.equal(result.totalQuestions, 50);
  assert.equal(result.score, 25);
  assert.ok(duration < 50, `Scoring time ${duration}ms exceeds 50ms SLA`);
});
